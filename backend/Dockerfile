# Life OS Backend - Docker Image v3
# Build: Node.js 18 + TypeScript + Prisma
FROM node:18-alpine

WORKDIR /app

# Install ALL dependencies (dev + prod for build)
COPY package.json ./
COPY package-lock.json* ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy all source files
COPY . .

# Compile TypeScript using new script name
RUN npm run compile

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start production server
CMD ["node", "dist/index.js"]
