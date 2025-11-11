# Use Node.js 24.11.0 LTS
FROM node:24.11.0-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy TypeScript source code
COPY tsconfig.json ./
COPY src ./src

# Install TypeScript and build dependencies
RUN npm install -D typescript @types/node && \
    npm run build && \
    npm prune --production

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/app.js"]
