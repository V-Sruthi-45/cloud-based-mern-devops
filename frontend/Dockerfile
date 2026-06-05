# =============================================================
# Frontend Dockerfile - React Production Build with Nginx
# =============================================================

# ---- Stage 1: Build React Application ----
FROM node:20-alpine AS build
LABEL stage="builder"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# IMPORTANT: Inject API URL at build time
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build React app
RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:alpine AS production

LABEL maintainer="DevOps Engineer"
LABEL description="MERN Task Manager Frontend"

# Copy React build
COPY --from=build /app/build /usr/share/nginx/html

# Nginx configuration
RUN echo 'server { \
  listen 80; \
  server_name _; \
  root /usr/share/nginx/html; \
  index index.html; \
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

# Fixed healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]