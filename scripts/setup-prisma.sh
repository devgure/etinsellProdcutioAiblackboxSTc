#!/bin/bash

set -e

echo "🔧 Setting up Prisma schemas for all services..."

SERVICES=(
  "auth-service"
  "profile-service"
  "match-service"
  "chat-service"
  "payment-service"
  "analytics-service"
  "notification-service"
  "blockchain-service"
)

# Create prisma directories
for service in "${SERVICES[@]}"; do
  mkdir -p "services/$service/prisma"
  echo "✓ Created prisma directory for $service"
done

echo ""
echo "📋 Generating Prisma clients..."

for service in "${SERVICES[@]}"; do
  echo ""
  echo "→ Generating client for $service..."
  cd "services/$service"
  
  if [ -f "package.json" ]; then
    npx prisma generate
    echo "✓ Generated Prisma client for $service"
  else
    echo "⚠ Skipping $service (no package.json)"
  fi
  
  cd ../..
done

echo ""
echo "✅ All Prisma schemas set up successfully!"