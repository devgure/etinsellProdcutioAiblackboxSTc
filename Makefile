.PHONY: help install setup dev prod build test clean

GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
BLUE := \033[0;34m
NC := \033[0m

help:
	@echo "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
	@echo "${GREEN}║          ETINCEL - COMMAND REFERENCE             ║${NC}"
	@echo "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
	@echo ""
	@echo "${YELLOW}📦 SETUP & INSTALLATION${NC}"
	@echo "  ${BLUE}make install${NC}          Install all dependencies"
	@echo "  ${BLUE}make setup${NC}            Complete initial setup"
	@echo "  ${BLUE}make setup-env${NC}        Copy .env.example to .env"
	@echo "  ${BLUE}make setup-prisma${NC}     Setup all Prisma schemas"
	@echo ""
	@echo "${YELLOW}🚀 DEVELOPMENT${NC}"
	@echo "  ${BLUE}make dev${NC}              Start development environment"
	@echo "  ${BLUE}make dev-services${NC}     Start only backend services"
	@echo "  ${BLUE}make dev-logs${NC}         View development logs"
	@echo ""
	@echo "${YELLOW}🏭 PRODUCTION${NC}"
	@echo "  ${BLUE}make prod${NC}             Start production environment"
	@echo "  ${BLUE}make build${NC}            Build all Docker images"
	@echo "  ${BLUE}make deploy${NC}           Deploy to production server"
	@echo ""
	@echo "${YELLOW}🗄️  DATABASE${NC}"
	@echo "  ${BLUE}make db-init${NC}          Initialize MongoDB"
	@echo "  ${BLUE}make db-migrate${NC}       Run database migrations"
	@echo "  ${BLUE}make db-seed${NC}          Seed database with test data"
	@echo "  ${BLUE}make db-shell${NC}         Open MongoDB shell"
	@echo "  ${BLUE}make db-backup${NC}        Backup database"
	@echo "  ${BLUE}make db-restore${NC}       Restore database"
	@echo ""
	@echo "${YELLOW}🔍 PRISMA${NC}"
	@echo "  ${BLUE}make prisma-generate${NC}  Generate Prisma clients"
	@echo "  ${BLUE}make prisma-push${NC}      Push schemas to MongoDB"
	@echo "  ${BLUE}make prisma-studio${NC}    Open Prisma Studio (SERVICE=name)"
	@echo "  ${BLUE}make check-prisma${NC}     Verify Prisma setup"
	@echo ""
	@echo "${YELLOW}🧪 TESTING${NC}"
	@echo "  ${BLUE}make test${NC}             Run all tests"
	@echo "  ${BLUE}make test-unit${NC}        Run unit tests"
	@echo "  ${BLUE}make test-e2e${NC}         Run E2E tests"
	@echo ""
	@echo "${YELLOW}🔧 MAINTENANCE${NC}"
	@echo "  ${BLUE}make logs${NC}             View all service logs"
	@echo "  ${BLUE}make status${NC}           Check service status"
	@echo "  ${BLUE}make health${NC}           Run health checks"
	@echo "  ${BLUE}make restart${NC}          Restart all services"
	@echo "  ${BLUE}make stop${NC}             Stop all services"
	@echo "  ${BLUE}make clean${NC}            Clean containers & volumes"
	@echo ""

# ===========================
# SETUP & INSTALLATION
# ===========================

setup-env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "${GREEN}✓ Created .env file${NC}"; \
		echo "${YELLOW}⚠  Please edit .env with your credentials${NC}"; \
	else \
		echo "${YELLOW}⚠  .env already exists${NC}"; \
	fi

install: setup-env
	@echo "${GREEN}📦 Installing all dependencies...${NC}"
	@npm install
	@echo "${GREEN}Installing Node.js services...${NC}"
	@for service in auth-service profile-service match-service chat-service payment-service notification-service media-service analytics-service blockchain-service webrtc-service; do \
		echo "  → Installing $$service..."; \
		cd services/$$service && npm install && npx prisma generate && cd ../..; \
	done
	@echo "${GREEN}Installing Go service (location-service)...${NC}"
	@cd services/location-service && go mod download
	@echo "${GREEN}Installing Python service (ai-service)...${NC}"
	@cd services/ai-service && pip install -q -r requirements.txt
	@echo "${GREEN}Installing frontend apps...${NC}"
	@cd client/mobile-native && npm install && cd ../..
	@cd client/mobile-web && npm install && cd ../..
	@cd client/desktop-web && npm install && cd ../..
	@cd admin-dashboard && npm install && cd ..
	@echo "${GREEN}✅ All dependencies installed successfully!${NC}"

setup: install setup-prisma
	@echo "${GREEN}🎯 Running initial setup...${NC}"
	@docker-compose up -d mongodb redis
	@sleep 10
	@$(MAKE) db-init
	@$(MAKE) prisma-push
	@echo "${GREEN}✅ Setup complete!${NC}"
	@echo "${YELLOW}📝 Next steps:${NC}"
	@echo "  1. Edit .env with your API keys"
	@echo "  2. Run 'make db-seed' to add test data"
	@echo "  3. Run 'make dev' to start development"

# ===========================
# PRISMA
# ===========================

setup-prisma:
	@echo "${GREEN}🔧 Setting up Prisma schemas...${NC}"
	@bash scripts/setup-prisma.sh

prisma-generate:
	@echo "${GREEN}⚙️  Generating Prisma clients...${NC}"
	@npm run prisma:generate

prisma-push:
	@echo "${GREEN}📤 Pushing Prisma schemas to MongoDB...${NC}"
	@bash scripts/migrate-all.sh

prisma-studio:
	@if [ -z "$(SERVICE)" ]; then \
		echo "${RED}❌ Error: Please specify SERVICE${NC}"; \
		echo "${YELLOW}Usage: make prisma-studio SERVICE=auth-service${NC}"; \
		exit 1; \
	fi
	@echo "${GREEN}🎨 Opening Prisma Studio for $(SERVICE)...${NC}"
	@cd services/$(SERVICE) && npx prisma studio

check-prisma:
	@bash scripts/check-prisma.sh

# ===========================
# DATABASE
# ===========================

db-init:
	@echo "${GREEN}🗄️  Initializing MongoDB...${NC}"
	@bash scripts/init-mongodb.sh

db-migrate: db-init
	@echo "${GREEN}🔄 Running database migrations...${NC}"
	@bash scripts/migrate-all.sh

db-seed:
	@echo "${GREEN}🌱 Seeding database...${NC}"
	@npm run seed

db-shell:
	@echo "${GREEN}💻 Opening MongoDB shell...${NC}"
	@docker-compose exec mongodb mongosh -u admin -p $(MONGO_PASSWORD) --authenticationDatabase admin etincel

db-backup:
	@echo "${GREEN}💾 Creating database backup...${NC}"
	@bash scripts/backup.sh

db-restore:
	@if [ -z "$(FILE)" ]; then \
		echo "${RED}❌ Error: Please specify backup FILE${NC}"; \
		echo "${YELLOW}Usage: make db-restore FILE=backup_20240101.tar.gz${NC}"; \
		exit 1; \
	fi
	@echo "${GREEN}📥 Restoring database from $(FILE)...${NC}"
	@bash scripts/restore.sh $(FILE)

# ===========================
# DEVELOPMENT
# ===========================

dev:
	@echo "${GREEN}🚀 Starting development environment...${NC}"
	@docker-compose -f docker-compose.dev.yml up --build

dev-services:
	@echo "${GREEN}🔧 Starting backend services only...${NC}"
	@docker-compose -f docker-compose.dev.yml up mongodb redis elasticsearch minio \
		auth-service profile-service match-service chat-service payment-service \
		location-service ai-service blockchain-service notification-service \
		media-service analytics-service webrtc-service

dev-logs:
	@docker-compose -f docker-compose.dev.yml logs -f --tail=100

# ===========================
# PRODUCTION
# ===========================

prod:
	@echo "${GREEN}🏭 Starting production environment...${NC}"
	@docker-compose up -d --build
	@echo "${YELLOW}⏳ Waiting for services to start...${NC}"
	@sleep 30
	@$(MAKE) health
	@echo "${GREEN}✅ Production environment is running!${NC}"

build:
	@echo "${GREEN}🔨 Building all Docker images...${NC}"
	@docker-compose build
	@echo "${GREEN}✅ Build complete${NC}"

deploy:
	@echo "${GREEN}🚀 Deploying to production...${NC}"
	@bash scripts/deploy.sh

# ===========================
# TESTING
# ===========================

test:
	@echo "${GREEN}🧪 Running all tests...${NC}"
	@npm test

test-unit:
	@echo "${GREEN}🧪 Running unit tests...${NC}"
	@npm run test:unit

test-e2e:
	@echo "${GREEN}🧪 Running E2E tests...${NC}"
	@npm run test:e2e

# ===========================
# MAINTENANCE
# ===========================

logs:
	@docker-compose logs -f --tail=100

logs-service:
	@if [ -z "$(SERVICE)" ]; then \
		echo "${RED}❌ Error: Please specify SERVICE${NC}"; \
		echo "${YELLOW}Usage: make logs-service SERVICE=auth-service${NC}"; \
		exit 1; \
	fi
	@docker-compose logs -f --tail=100 $(SERVICE)

status:
	@echo "${BLUE}📊 Service Status:${NC}"
	@docker-compose ps

health:
	@echo "${GREEN}🏥 Running health checks...${NC}"
	@bash scripts/health-check.sh

restart:
	@echo "${YELLOW}🔄 Restarting all services...${NC}"
	@docker-compose restart
	@echo "${GREEN}✅ Services restarted${NC}"

restart-service:
	@if [ -z "$(SERVICE)" ]; then \
		echo "${RED}❌ Error: Please specify SERVICE${NC}"; \
		echo "${YELLOW}Usage: make restart-service SERVICE=auth-service${NC}"; \
		exit 1; \
	fi
	@docker-compose restart $(SERVICE)

stop:
	@echo "${YELLOW}⏸️  Stopping all services...${NC}"
	@docker-compose stop

down:
	@echo "${YELLOW}⏹️  Stopping and removing containers...${NC}"
	@docker-compose down

clean:
	@echo "${RED}🧹 This will delete all containers, volumes, and data!${NC}"
	@read -p "Are you sure? (yes/NO) " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker-compose down -v; \
		docker system prune -af; \
		rm -rf node_modules services/*/node_modules client/*/node_modules admin-dashboard/node_modules; \
		echo "${GREEN}✅ Cleanup complete${NC}"; \
	else \
		echo "${YELLOW}❌ Cancelled${NC}"; \
	fi

# ===========================
# UTILITIES
# ===========================

ps:
	@docker-compose ps

exec:
	@if [ -z "$(SERVICE)" ]; then \
		echo "${RED}❌ Error: Please specify SERVICE${NC}"; \
		echo "${YELLOW}Usage: make exec SERVICE=auth-service${NC}"; \
		exit 1; \
	fi
	@docker-compose exec $(SERVICE) sh

redis-cli:
	@docker-compose exec redis redis-cli -a $(REDIS_PASSWORD)

# Shortcuts
up: prod