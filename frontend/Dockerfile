# =============================================================
# Frontend Dockerfile - React Production Build with Nginx
# Two-stage: Build React app → Serve with lightweight Nginx
# =============================================================

# ---- Stage 1: Build React Application ----
FROM node:20-alpine AS build
LABEL stage="builder"

WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build optimized production bundle
RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:alpine AS production
LABEL maintainer="DevOps Engineer"
LABEL description="MERN Task Manager Frontend"

# Copy built React assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Nginx config to support React Router (SPA routing)
RUN echo 'server { \
  listen 80; \
  server_name _; \
  root /usr/share/nginx/html; \
  index index.html; \
  # Gzip compression \
  gzip on; \
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
  location /static { \
    expires 1y; \
    add_header Cache-Control "public, immutable"; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
