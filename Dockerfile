# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client then compile TypeScript
RUN npx prisma generate
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Install tsx globally for seeding (not in production deps)
RUN npm install -g tsx

# Copy generated Prisma client and compiled output from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY prisma.config.ts ./

EXPOSE 5000

# Run migrations, seed (non-fatal), then start server
# Using ; instead of && so server starts even if seed fails
CMD ["sh", "-c", "npx prisma migrate deploy && (npx prisma db seed || echo 'Seed skipped or failed') && node dist/server.js"]
