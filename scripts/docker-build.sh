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

# Public build arguments the Dockerfile expects. The Viewer token is not one of
# them. It is mounted as a BuildKit secret below when .env has it.
REQUIRED_ARGS=(
  "NEXT_PUBLIC_SANITY_PROJECT_ID"
  "NEXT_PUBLIC_SANITY_DATASET"
  "NEXT_PUBLIC_BASE_URL"
  "NEXT_PUBLIC_UMAMI_SCRIPT_URL"
  "NEXT_PUBLIC_UMAMI_WEBSITE_ID"
  "NEXT_PUBLIC_APP_ENV"
)

# Resolve outside Docker: .git is intentionally excluded from the build context.
# Archives/CI can provide NEXT_DEPLOYMENT_ID or GITHUB_SHA explicitly.
DEPLOYMENT_ID=$(node --input-type=module -e \
  "import { resolveDeploymentId } from './scripts/deployment-id.js'; process.stdout.write(resolveDeploymentId());") || exit 1
BUILD_ARGS=(--build-arg "NEXT_DEPLOYMENT_ID=$DEPLOYMENT_ID")
for ARG in "${REQUIRED_ARGS[@]}"; do
  # Extract value from .env if it exists
  VALUE=$(grep "^$ARG=" .env | cut -d'=' -f2- | sed 's/^"//;s/"$//;s/^\x27//;s/\x27$//')
  if [ ! -z "$VALUE" ]; then
    BUILD_ARGS+=(--build-arg "$ARG=$VALUE")
  fi
done

# Viewer token for prerender only. The value stays in a temp file passed via
# --secret, not in a --build-arg and not in the image.
SECRET_ARGS=(
  "SANITY_API_READ_TOKEN"
)
SECRET_DIR=$(mktemp -d)
trap 'rm -rf "$SECRET_DIR"' EXIT
for ARG in "${SECRET_ARGS[@]}"; do
  VALUE=$(grep "^$ARG=" .env 2>/dev/null | cut -d'=' -f2- | sed 's/^"//;s/"$//;s/^\x27//;s/\x27$//' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  if [ -n "$VALUE" ]; then
    SECRET_FILE="$SECRET_DIR/$ARG"
    printf '%s' "$VALUE" > "$SECRET_FILE"
    BUILD_ARGS+=(--secret "id=$ARG,src=$SECRET_FILE")
  fi
done

echo "🛠️  Build arguments prepared (filtered from .env)"

# Execute build
# Note: DOCKER_BUILDKIT=1 might be required for older docker versions
DOCKER_BUILDKIT=1 docker build "${BUILD_ARGS[@]}" -t "$IMAGE_NAME" .

if [ $? -eq 0 ]; then
  echo "✅ Build successful! Image created: $IMAGE_NAME"
else
  echo "❌ Build failed."
  exit 1
fi
