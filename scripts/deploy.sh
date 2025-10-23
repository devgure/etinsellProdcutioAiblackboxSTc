set -e

echo "🚀 Deploying Etincel to Production..."
echo ""

# Pull latest code
echo "📥 Pulling latest code from Git..."
git pull origin main

# Build Docker images
echo ""
echo "🔨 Building Docker images..."
docker-compose build --parallel

# Stop old containers
echo ""
echo "🛑 Stopping old containers..."
docker-compose down

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
docker-compose run --rm auth-service npx prisma db push --skip-generate

# Start services
echo ""
echo "🔄 Starting services..."
docker-compose up -d

# Wait for services
echo ""
echo "⏳ Waiting for services to start..."
sleep 45

# Health check
echo ""
bash scripts/health-check.sh

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║        ✅ DEPLOYMENT COMPLETED SUCCESSFULLY!        ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Application URLs:"
echo "   - Frontend:  https://etincel.app"
echo "   - Admin:     https://admin.etincel.app"
echo "   - API:       https://api.etincel.app"
echo ""