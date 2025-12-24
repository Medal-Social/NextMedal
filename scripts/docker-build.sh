#!/bin/bash

# NextMedal Docker Build Script
# Automatically injects .env variables as build arguments

IMAGE_NAME=${1:-nextmedal}

echo "🚀 Starting Docker build for $IMAGE_NAME..."

# Build the argument list from .env
# 1. Read .env file
# 2. Remove comments and empty lines
# 3. Format as --build-arg KEY=VALUE
BUILD_ARGS=$(grep -v '^#' .env | grep -v '^$' | xargs -I {} echo "--build-arg {}" | xargs)

echo "🛠️ Build arguments detected: $BUILD_ARGS"

# Execute build
docker build $BUILD_ARGS -t "$IMAGE_NAME" .

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed."
  exit 1
fi

