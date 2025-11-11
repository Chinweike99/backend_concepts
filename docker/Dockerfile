# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Production image
FROM node:18-alpine
WORKDIR /app

# copy only node_modules and src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
