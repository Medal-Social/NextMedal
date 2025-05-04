# --- Base image ---
FROM node:lts-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

# --- Dependencies & Build ---
FROM base AS builder

# Build arguments for environment variables
ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ARG NEXT_PUBLIC_BASE_URL

# Set environment variables for build stage
ENV NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID \
    NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Copy only package manager files first for better caching
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install dependencies (production only for smaller image)
RUN pnpm install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Build the Next.js app (includes Sanity Studio at /admin)
RUN pnpm build

# --- Production image ---
FROM base AS runner

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy built app and node_modules from builder
COPY --from=builder /app .

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose Next.js default port
EXPOSE 3000

# Start the app
CMD ["pnpm", "start"]