// src/app.ts
import express, { Request, Response } from "express";
import multer from "multer";
import { TikaService } from "./services/tika.service";
import path from "path";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });
const tikaService = new TikaService(process.env.TIKA_URL || "http://localhost:9998");

// Middleware
app.use(express.json());

/**
 * Upload and extract text from document
 */
app.post(
  "/extract-text",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const text = await tikaService.extractText(req.file.path);

      // Cleanup
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        filename: req.file.originalname,
        text: text,
        length: text.length,
      });
    } catch (error) {
      res.status(500).json({
        error: "Text extraction failed",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * Extract metadata from document
 */
app.post(
  "/extract-metadata",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const metadata = await tikaService.extractMetadata(req.file.path);

      // Cleanup
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        filename: req.file.originalname,
        metadata: metadata,
      });
    } catch (error) {
      res.status(500).json({
        error: "Metadata extraction failed",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * Extract everything (text + metadata)
 */
app.post(
  "/extract-all",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await tikaService.extractAll(req.file.path);

      // Cleanup
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        filename: req.file.originalname,
        text: result.text,
        metadata: result.metadata,
        stats: {
          textLength: result.text.length,
          wordCount: result.text.split(/\s+/).length,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Extraction failed",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * Detect file type
 */
app.post(
  "/detect-type",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const mimeType = await tikaService.detectMimeType(req.file.path);

      // Cleanup
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        filename: req.file.originalname,
        mimeType: mimeType,
      });
    } catch (error) {
      res.status(500).json({
        error: "Type detection failed",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * Health check
 */
app.get("/health", async (req: Request, res: Response) => {
  const tikaHealthy = await tikaService.healthCheck();

  res.json({
    status: tikaHealthy ? "healthy" : "unhealthy",
    tika: tikaHealthy,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Make sure Tika server is running on http://localhost:9998`);
});

export default app;
