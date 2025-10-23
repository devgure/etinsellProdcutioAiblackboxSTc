##health-check.sh#!/bin/bash

echo "🏥 Running health checks for all services...\n"

services=(
  "http://localhost:3001/health:Auth Service"
  "http://localhost:3002/health:Profile Service"
  "http://localhost:3003/health:Match Service"
  "http://localhost:3004/health:Chat Service"
  "http://localhost:3005/health:Payment Service"
  "http://localhost:3006/health:Notification Service"
  "http://localhost:3007/health:Media Service"
  "http://localhost:3008/health:Analytics Service"
  "http://localhost:3009/health:WebRTC Service"
  "http://localhost:3010/health:Blockchain Service"
  "http://localhost:9000/health:Location Service"
  "http://localhost:8000/health:AI Service"
)

failed=0
passed=0

for service in "${services[@]}"; do
  IFS=':' read -r url name <<< "$service"
  
  if curl -f -s --max-time 5 "$url" > /dev/null 2>&1; then
    echo "✅ $name is healthy"
    ((passed++))
  else
    echo "❌ $name is unhealthy"
    ((failed++))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Health Check Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Healthy:   $passed"
echo "❌ Unhealthy: $failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $failed -eq 0 ]; then
  echo ""
  echo "🎉 All services are healthy!"
  exit 0
else
  echo ""
  echo "⚠️  Some services are unhealthy!"
  exit 1
fi