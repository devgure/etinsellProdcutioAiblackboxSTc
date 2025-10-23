#!/bin/bash

set -e

echo "🔄 Pushing Prisma schemas to MongoDB..."

SERVICES=(
  "auth-service"
  "profile-service"
  "match-service"
  "chat-service"
  "payment-service"
  "analytics-service"
)

for service in "${SERVICES[@]}"; do
  echo ""
  echo "→ Pushing schema for $service..."
  
  cd "services/$service"
  npx prisma db push --skip-generate
  
  if [ $? -eq 0 ]; then
    echo "✓ Successfully pushed schema for $service"
  else
    echo "❌ Failed to push schema for $service"
    exit 1
  fi
  
  cd ../..
done

echo ""
echo "✅ All schemas pushed successfully!"