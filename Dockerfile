# Fullstack Production Dockerfile for WanderWise (Unified Container)
# Builds Vite client and serves via Express Backend with PostgreSQL support

FROM node:22-alpine AS builder

WORKDIR /app

# Build Client
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app
RUN apk --no-cache add curl

ENV NODE_ENV=production
ENV PORT=5000

# Install Server Dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev --ignore-scripts

# Copy Server Source Code & Schema
COPY server/src ./server/src

# Copy Built Client Static Assets
COPY --from=builder /app/client/dist ./client/dist

WORKDIR /app/server

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "src/index.js"]
