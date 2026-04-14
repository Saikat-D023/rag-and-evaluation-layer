# Base stage for shared configuration
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Prune stage to isolate the target application dependencies
FROM base AS pruner
RUN pnpm add -g turbo
COPY . .
RUN turbo prune web --docker

# Installer stage: Build the dependency tree and install packages
FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Builder stage: Build the application
FROM base AS builder
COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/ .
COPY turbo.json turbo.json

# Environment variables needed for the build (if any)
# ARG NEXT_PUBLIC_SUPABASE_URL
# ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
# ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
# ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN pnpm run build --filter=web

# Runner stage: The actual image that will run the production build
FROM base AS runner
ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/web/next.config.js .
COPY --from=builder /app/apps/web/package.json .

# Leverage output tracing to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000
ENV PORT=3000

# Next.js standalone server
CMD ["node", "apps/web/server.js"]
