# Life OS Backend - Docker Image v12
# Build: Node.js 18 + TypeScript + Prisma
# FORCE_REBUILD_20260301_v12_USE_DB_PUSH
FROM node:18-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Install ALL dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm install

# Copy Prisma schema and generate client ONLY
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Apply migrations at runtime when DATABASE_URL is available
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
