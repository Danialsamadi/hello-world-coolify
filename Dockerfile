```dockerfile
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci


FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


FROM node:20-alpine AS runner

RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./

RUN npm ci --omit=dev && \
    npm cache clean --force

COPY --from=builder --chown=appuser:appuser /app ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + process.env.PORT, (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1))"

CMD ["npm", "start"]
```
