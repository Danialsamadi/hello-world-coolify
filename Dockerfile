```dockerfile
# ==========================================
# Production Dockerfile for Coolify
# ==========================================

# ------------------------------------------
# Stage 1: Dependencies
# ------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies, including devDependencies,
# because they may be required during the build.
RUN npm ci


# ------------------------------------------
# Stage 2: Build
# ------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application.
# If your package.json does not have "build",
# remove this line.
RUN npm run build


# ------------------------------------------
# Stage 3: Production
# ------------------------------------------
FROM node:20-alpine AS runner

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built application
COPY --from=builder --chown=appuser:appuser /app ./

# Switch to non-root user
USER appuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + process.env.PORT + '/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1))"

CMD ["npm", "start"]
```
