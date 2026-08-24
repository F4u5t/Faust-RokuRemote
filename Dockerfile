# ==========================================
# Stage 1: Build Frontend (Vite + React)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client

# Install frontend dependencies
COPY client/package*.json ./
RUN npm install

# Copy frontend source and build static bundle
COPY client/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Backend Server
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install root/backend dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend server code
COPY server/ ./server/

# Copy built frontend static assets from builder stage
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose server port
EXPOSE 4000

# Start Express server
CMD ["node", "server/index.js"]
