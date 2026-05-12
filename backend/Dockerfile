FROM node:22-alpine

WORKDIR /app

# Copy root workspace config
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

# Install dependencies (npm workspaces)
RUN npm ci --workspaces --ignore-scripts

# Copy backend source
COPY backend/ ./backend/

# Build TypeScript
RUN npm run build -w backend

# Copy media assets
COPY backend/public/ ./backend/public/

EXPOSE 3001

CMD ["node", "backend/dist/index.js"]