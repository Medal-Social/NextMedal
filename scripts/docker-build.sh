#!/bin/bash

# NextMedal Docker Build Script
# ----------------------------
# Usage:
#   ./scripts/docker-build.sh [image-name]
#
# Examples:
#   ./scripts/docker-build.sh              # Builds with default name 'nextmedal'
#   ./scripts/docker-build.sh my-app       # Builds with name 'my-app'
#
# Requirements:
#   - Docker installed and running
#   - A .env file in the root directory with required variables

IMAGE_NAME=${1:-nextmedal}

echo "🚀 Starting Docker build for $IMAGE_NAME..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  Warning: .env file not found. Build may fail if required arguments are missing."
fi

# Build arguments for Next.js (only those needed at build time)
# We specifically pick only the variables the Dockerfile expects to avoid leaking other secrets
REQUIRED_ARGS=(
  "NEXT_PUBLIC_SANITY_PROJECT_ID"
  "NEXT_PUBLIC_SANITY_DATASET"
  "NEXT_PUBLIC_BASE_URL"
  "SANITY_API_READ_TOKEN"
  "NEXT_PUBLIC_UMAMI_SCRIPT_URL"
  "NEXT_PUBLIC_UMAMI_WEBSITE_ID"
  "NEXT_PUBLIC_APP_ENV"
)

BUILD_ARGS=""
for ARG in "${REQUIRED_ARGS[@]}"; do
  # Extract value from .env if it exists
  VALUE=$(grep "^$ARG=" .env | cut -d'=' -f2- | sed 's/^"//;s/"$//;s/^\x27//;s/\x27$//')
  if [ ! -z "$VALUE" ]; then
    BUILD_ARGS="$BUILD_ARGS --build-arg $ARG=$VALUE"
  fi
done

echo "🛠️  Build arguments prepared (filtered from .env)"

# Execute build
docker build $BUILD_ARGS -t "$IMAGE_NAME" .

if [ $? -eq 0 ]; then
  echo "✅ Build successful! Image created: $IMAGE_NAME"
else
  echo "❌ Build failed."
  exit 1
fi

