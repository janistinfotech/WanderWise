# Multi-stage / Production Dockerfile for WanderWise Backend API
FROM node:20-alpine AS runner

WORKDIR /app

# Install security updates & curl for healthcheck
RUN apk --no-cache add curl

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy application source
COPY src ./src

# Expose backend port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start server
CMD ["node", "src/index.js"]
