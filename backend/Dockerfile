# Life OS Backend - Node.js + Express + Prisma
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Install production dependencies only
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]
