#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/telecom-copilot"
IMAGE_NAME="telecom-complaint-copilot:test"
CONTAINER_NAME="telecom-copilot"

cd "$APP_DIR"

test -f .env || { echo "Missing $APP_DIR/.env"; exit 1; }

docker build -t "$IMAGE_NAME" .
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --env-file "$APP_DIR/.env" \
  -p 3000:3000 \
  "$IMAGE_NAME"

echo "Application started. Open http://YOUR_EC2_PUBLIC_IP:3000"
docker ps --filter "name=$CONTAINER_NAME"
