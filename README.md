# Node.js + Apache Tika API

A Node.js application built with TypeScript and Express that provides a REST API for document processing using Apache Tika.

## Features

- Extract text from various document formats (PDF, DOCX, XLSX, etc.)
- Extract metadata from documents
- Detect MIME types
- OCR support for images and scanned PDFs
- Dockerized setup with docker-compose

## Prerequisites

- Node.js 24.11.0 (see [.nvmrc](.nvmrc))
- npm 11.6.1 or higher
- Docker and Docker Compose (for containerized deployment)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` if you need to customize:
- `PORT`: API server port (default: 3000)
- `TIKA_URL`: Tika server URL (default: http://localhost:9998)
- `NODE_ENV`: Environment mode (development/production)

### 3. Build the Project

```bash
npm run build
```

This will compile TypeScript to JavaScript in the `dist/` directory.

## Running the Application

### Option 1: Using Docker Compose (Recommended)

Start both Tika server and the API:

```bash
npm run docker:up
```

View logs:

```bash
npm run docker:logs
```

Stop services:

```bash
npm run docker:down
```

### Option 2: Local Development

First, start Tika server (in a separate terminal):

```bash
docker run -p 9998:9998 apache/tika:latest-full
```

Then start the development server:

```bash
npm run dev
```

Or build and run in production mode:

```bash
npm run build
npm start
```

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the production build
- `npm run dev` - Run development server with ts-node
- `npm run watch` - Watch mode for TypeScript compilation
- `npm run clean` - Remove the dist directory
- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start services with docker-compose
- `npm run docker:down` - Stop services
- `npm run docker:logs` - View container logs

## API Endpoints

### Health Check
```
GET /health
```

### Extract Text
```
POST /extract-text
Content-Type: multipart/form-data
Body: file (document file)
```

### Extract Metadata
```
POST /extract-metadata
Content-Type: multipart/form-data
Body: file (document file)
```

### Extract Everything (Text + Metadata)
```
POST /extract-all
Content-Type: multipart/form-data
Body: file (document file)
```

### Detect File Type
```
POST /detect-type
Content-Type: multipart/form-data
Body: file (document file)
```

## Example Usage

```bash
# Upload a document and extract text
curl -X POST http://localhost:3000/extract-text \
  -F "file=@/path/to/document.pdf"

# Extract metadata
curl -X POST http://localhost:3000/extract-metadata \
  -F "file=@/path/to/document.pdf"

# Extract everything
curl -X POST http://localhost:3000/extract-all \
  -F "file=@/path/to/document.pdf"

# Detect file type
curl -X POST http://localhost:3000/detect-type \
  -F "file=@/path/to/document.pdf"

# Health check
curl http://localhost:3000/health
```

## Project Structure

```
.
├── src/
│   ├── app.ts                 # Express application and routes
│   └── services/
│       └── tika.service.ts    # Tika API client service
├── dist/                      # Compiled JavaScript (generated)
├── uploads/                   # Temporary upload directory
├── docker-compose.yml         # Docker services configuration
├── Dockerfile                 # Application container definition
├── tsconfig.json             # TypeScript configuration
├── package.json              # Project dependencies and scripts
└── .nvmrc                    # Node.js version specification
```

## Supported File Types

Apache Tika supports over 1000 file formats including:

- Documents: PDF, DOCX, DOC, ODT, RTF
- Spreadsheets: XLSX, XLS, ODS, CSV
- Presentations: PPTX, PPT, ODP
- Images: JPG, PNG, GIF, TIFF (with OCR)
- Archives: ZIP, TAR, RAR
- And many more...

## Development

### TypeScript Configuration

The project uses strict TypeScript settings. See [tsconfig.json](tsconfig.json) for details.

### Adding New Features

1. Add your TypeScript code in `src/`
2. Build the project: `npm run build`
3. Test your changes: `npm run dev`

## Docker

### Building the Image

```bash
npm run docker:build
```

### Manual Docker Commands

```bash
# Build
docker build -t node-tika .

# Run
docker run -p 3000:3000 -e TIKA_URL=http://tika:9998 node-tika
```

## Troubleshooting

### Tika server not responding
- Ensure Tika server is running: `curl http://localhost:9998/tika`
- Check Docker logs: `npm run docker:logs`

### TypeScript compilation errors
- Clean and rebuild: `npm run clean && npm run build`
- Check Node.js version: `node --version` (should be 24.11.0)

### Upload issues
- Ensure the `uploads/` directory exists and has proper permissions
- Check available disk space

## License

ISC
