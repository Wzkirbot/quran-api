# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source code, scripts, and local datasets
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY data/ ./data/

# Compile TypeScript to JavaScript in /app/dist
RUN npm run build

# ==========================================
# 2. Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled files and required assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY src/docs/ ./dist/docs/
COPY src/database/schema.sql ./dist/database/schema.sql

# Set non-root user for security
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/src/server.js"]
