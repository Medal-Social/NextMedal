#!/bin/bash

# NextMedal Docker Build Script
# Automatically injects .env variables as build arguments

IMAGE_NAME=${1:-nextmedal}

echo "🚀 Starting Docker build for $IMAGE_NAME..."

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

echo "🛠️ Build arguments prepared (filtered from .env)"

# Execute build
docker build $BUILD_ARGS -t "$IMAGE_NAME" .

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed."
  exit 1
fi

