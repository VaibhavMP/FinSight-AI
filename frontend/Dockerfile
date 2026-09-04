# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/package.json frontend/pnpm-lock.yaml* ./
# Use npm ci for reproducible builds (pnpm-lock not present, fall back)
RUN npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps

COPY frontend/ .

RUN npm run build

# Production stage
FROM nginx:stable-alpine AS runner

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
