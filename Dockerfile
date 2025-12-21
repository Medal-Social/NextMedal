# --- Base image ---
FROM node:lts-alpine AS base

# --- Dependencies stage ---
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# Copy only dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (including devDependencies for the build)
RUN pnpm install --frozen-lockfile

# --- Build stage ---
FROM base AS builder
WORKDIR /app

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ARG NEXT_PUBLIC_BASE_URL
ARG SANITY_API_READ_TOKEN

# Set environment variables for build stage
ENV NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID \
    NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    SANITY_API_READ_TOKEN=$SANITY_API_READ_TOKEN \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Build the Next.js app
RUN pnpm build

# --- Production image ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built assets from standalone output for minimum image size
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use server.js created by standalone output
CMD ["node", "server.js"]
