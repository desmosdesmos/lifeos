FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (используем npm install вместо npm ci)
RUN npm install --production

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["node", "dist/index.js"]
