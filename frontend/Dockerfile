# ==============================================================================
# StudyPulse Frontend Static SPA Dockerfile (Nginx Production Server)
# ==============================================================================
# Stage 1: Build React Vite Frontend (Debian glibc runtime with expanded stack)
FROM node:20-slim AS builder

WORKDIR /app

# Expand V8 call stack and memory to prevent deep AST parser recursion in Rollup
ENV NODE_OPTIONS="--max-old-space-size=4096 --stack-size=65536"

COPY package*.json ./
RUN npm ci || npm install
COPY . ./

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with ultra-lightweight Nginx Alpine
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Clean SPA fallback routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
