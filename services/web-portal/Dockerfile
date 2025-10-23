FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.25-alpine

# Copy custom nginx config and built assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/public /usr/share/nginx/html

# Ensure logs directory exists for volume mounts
RUN mkdir -p /var/log/nginx

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget --no-verbose --spider http://localhost/health || exit 1
