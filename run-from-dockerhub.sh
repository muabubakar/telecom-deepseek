#!/usr/bin/env bash
set -euo pipefail

# CHANGE THIS to your real Docker Hub repository.
IMAGE_REPO="YOUR_DOCKERHUB_USERNAME/telecom-complaint-copilot"
APP_DIR="/opt/telecom-copilot"
CONTAINER_NAME="telecom-copilot"

test -f "$APP_DIR/.env" || { echo "Missing $APP_DIR/.env"; exit 1; }

docker pull "$IMAGE_REPO:latest"
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --env-file "$APP_DIR/.env" \
  -p 3000:3000 \
  "$IMAGE_REPO:latest"

echo "Application started from Docker Hub. Open http://YOUR_EC2_PUBLIC_IP:3000"
docker ps --filter "name=$CONTAINER_NAME"
