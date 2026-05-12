# Stage 1: Build the React application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace config
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

# Install dependencies (npm workspaces)
RUN npm ci --workspaces --ignore-scripts

# Copy frontend source
COPY frontend/ ./frontend/

# Build the app
RUN npm run build -w frontend

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy pics into nginx html
COPY --from=builder /app/frontend/public/pics /usr/share/nginx/html/pics

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]