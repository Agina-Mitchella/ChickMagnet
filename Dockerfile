# Multi-stage production build

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build application
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate || true
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Security hardening: create non-root group and user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S expressapp -u 1001

COPY --from=build --chown=expressapp:nodejs /app/package*.json ./
COPY --from=build --chown=expressapp:nodejs /app/dist ./dist
COPY --from=build --chown=expressapp:nodejs /app/prisma ./prisma

# Install strictly production dependencies
RUN npm ci --only=production && npm cache clean --force

USER expressapp

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

CMD ["npm", "run", "start"]
