# === Stage 1: Build Client ===
FROM node:20-alpine AS client-builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm i

COPY client/ ./
RUN npm run build

# === Stage 2: Server (Debian-slim for native sqlite3) ===
FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm i

# Copy server source
COPY server/ ./server/

# Copy built client from stage 1
COPY --from=client-builder /app/client/dist ./server/public

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 15526

ENV NODE_ENV=production
ENV PORT=15526

ENTRYPOINT ["/docker-entrypoint.sh"]