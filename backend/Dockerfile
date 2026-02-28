# Life OS Backend - Docker Image v7
# Build: Node.js 18 + TypeScript + Prisma
# Using Debian instead of Alpine for SSL compatibility
FROM node:18-slim

WORKDIR /app

# Install OpenSSL dependency
RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Install ALL dependencies (dev + prod for build)
COPY package.json ./
COPY package-lock.json* ./
RUN npm install

# Copy Prisma schema and generate client + apply migrations
COPY prisma/ ./prisma/
RUN npx prisma generate
RUN npx prisma migrate deploy

# Copy all source files
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start production server
CMD ["node", "dist/index.js"]
