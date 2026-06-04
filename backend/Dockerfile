# =============================================================
# Backend Dockerfile - Production-Ready Node.js Image
# Multi-stage build to minimize final image size
# =============================================================

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
LABEL maintainer="DevOps Engineer"
LABEL description="MERN Task Manager Backend"

WORKDIR /app

# Copy package files only (Docker layer caching optimization)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# ---- Stage 2: Production Image ----
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY --chown=nodeuser:nodejs . .

# Switch to non-root user
USER nodeuser

# Expose the application port
EXPOSE 5000

# Health check for Docker and orchestration platforms
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start with dumb-init for proper PID 1 signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
