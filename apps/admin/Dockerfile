FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/core/package.json ./packages/core/
COPY packages/ui/package.json ./packages/ui/
COPY apps/admin/package.json ./apps/admin/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/apps/admin/node_modules ./apps/admin/node_modules
COPY . .

# Generate Prisma client
RUN pnpm --filter @angulacms/core db:generate

# Build packages and admin app
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo build --filter=@angulacms/admin

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static

# Copy Prisma schema and client for runtime
COPY --from=builder /app/packages/core/src/db/prisma/schema.prisma ./packages/core/src/db/prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Upload directory
RUN mkdir -p uploads && chown nextjs:nodejs uploads
VOLUME ["/app/uploads"]

USER nextjs
EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/admin/server.js"]
