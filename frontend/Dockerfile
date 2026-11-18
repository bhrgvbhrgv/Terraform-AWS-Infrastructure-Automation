# Multi-stage build for CloudOps Frontend with Nginx
FROM node:22-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./
COPY frontend/tsconfig.json ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./
COPY frontend/vite.config.js ./
COPY frontend/index.html ./

RUN npm ci

COPY frontend/src ./src

RUN npm run build

# Production web server
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
