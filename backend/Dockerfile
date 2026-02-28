# Life OS Backend - Docker Image v18 FINAL
# FORCE_REBUILD_20260301_v18_FINAL
FROM node:18-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates bash && rm -rf /var/lib/apt/lists/*

# Install ALL dependencies including prisma
COPY package.json ./
COPY package-lock.json* ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Copy entrypoint script and make executable
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
