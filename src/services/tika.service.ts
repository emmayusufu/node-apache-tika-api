// src/services/tika.service.ts
import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";
import * as fs from "fs";

export interface TikaMetadata {
  "Content-Type": string;
  "X-TIKA:content": string;
  [key: string]: any;
}

export class TikaService {
  private tikaUrl: string;

  constructor(tikaUrl: string = "http://localhost:9998") {
    this.tikaUrl = tikaUrl;
  }

  /**
   * Extract text from a file
   */
  async extractText(filePath: string): Promise<string> {
    try {
      const fileStream = fs.createReadStream(filePath);

      const response = await axios.put(`${this.tikaUrl}/tika`, fileStream, {
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/octet-stream",
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      return response.data;
    } catch (error) {
      throw new Error(`Tika extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract text from buffer (uploaded file)
   */
  async extractTextFromBuffer(
    buffer: Buffer,
    contentType?: string
  ): Promise<string> {
    try {
      const response = await axios.put(`${this.tikaUrl}/tika`, buffer, {
        headers: {
          Accept: "text/plain",
          "Content-Type": contentType || "application/octet-stream",
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      return response.data;
    } catch (error) {
      throw new Error(`Tika extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract metadata from a file
   */
  async extractMetadata(filePath: string): Promise<TikaMetadata> {
    try {
      const fileStream = fs.createReadStream(filePath);

      const response = await axios.put(`${this.tikaUrl}/meta`, fileStream, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/octet-stream",
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Tika metadata extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract both text and metadata
   */
  async extractAll(filePath: string): Promise<{
    text: string;
    metadata: TikaMetadata;
  }> {
    try {
      const fileStream = fs.createReadStream(filePath);

      const response = await axios.put(
        `${this.tikaUrl}/rmeta/text`,
        fileStream,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/octet-stream",
          },
        }
      );

      // Tika returns an array, first element contains metadata and text
      const result = response.data[0];

      return {
        text: result["X-TIKA:content"] || "",
        metadata: result,
      };
    } catch (error) {
      throw new Error(`Tika full extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Detect MIME type of a file
   */
  async detectMimeType(filePath: string): Promise<string> {
    try {
      const fileStream = fs.createReadStream(filePath);

      const response = await axios.put(
        `${this.tikaUrl}/detect/stream`,
        fileStream,
        {
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`MIME detection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract text with OCR for images and scanned PDFs
   */
  async extractTextWithOCR(filePath: string): Promise<string> {
    try {
      const fileStream = fs.createReadStream(filePath);

      const response = await axios.put(`${this.tikaUrl}/tika`, fileStream, {
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/octet-stream",
          "X-Tika-OCRLanguage": "eng", // English OCR
          "X-Tika-PDFOcrStrategy": "ocr_and_text", // OCR + text extraction
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Tika OCR extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if Tika server is running
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.tikaUrl}/tika`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
