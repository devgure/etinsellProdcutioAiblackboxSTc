#!/usr/bin/env bash
#
# generate-sparkly-dating-app.sh
# Creates the complete empty folder & file tree for sparkly-dating-app/
# Run from repo root.

REPO="sparkly-dating-app"

# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------
mk_dirs() {
  for d in "$@"; do
    mkdir -p "${REPO}/${d}"
  done
}

touch_file() {
  f="${REPO}/$1"
  mkdir -p "$(dirname "$f")"
  [ ! -f "$f" ] && touch "$f"
}

# ------------------------------------------------------------
# 1. client/mobile-native
# ------------------------------------------------------------
mk_dirs \
  client/mobile-native/assets \
  client/mobile-native/components \
  client/mobile-native/screens \
  client/mobile-native/navigation \
  client/mobile-native/hooks \
  client/mobile-native/services \
  client/mobile-native/i18n

touch_file "client/mobile-native/App.tsx"
touch_file "client/mobile-native/services/apiClient.ts"
touch_file "client/mobile-native/services/authService.ts"
touch_file "client/mobile-native/i18n/en.json"
touch_file "client/mobile-native/i18n/es.json"
touch_file "client/mobile-native/i18n/i18n.ts"
touch_file "client/mobile-native/app.config.ts"
touch_file "client/mobile-native/babel.config.js"
touch_file "client/mobile-native/app.json"
touch_file "client/mobile-native/package.json"
# placeholders
touch_file "client/mobile-native/assets/.gitkeep"
touch_file "client/mobile-native/components/.gitkeep"
touch_file "client/mobile-native/navigation/.gitkeep"
touch_file "client/mobile-native/hooks/.gitkeep"
touch_file "client/mobile-native/screens/OnboardingScreen.tsx"
touch_file "client/mobile-native/screens/SwipeScreen.tsx"
touch_file "client/mobile-native/screens/ChatScreen.tsx"
touch_file "client/mobile-native/screens/ProfileScreen.tsx"
touch_file "client/mobile-native/screens/LoginScreen.tsx"
touch_file "client/mobile-native/screens/MatchScreen.tsx"



# ------------------------------------------------------------
# 2. client/mobile-web
# ------------------------------------------------------------
mk_dirs \
  client/mobile-web/public \
  client/mobile-web/src/pages \
  client/mobile-web/src/components \
  client/mobile-web/src/services \
  client/mobile-web/src/i18n

touch_file "client/mobile-web/public/index.html"
touch_file "client/mobile-web/src/App.tsx"
touch_file "client/mobile-web/src/services/api.ts"
touch_file "client/mobile-web/vite.config.ts"
touch_file "client/mobile-web/package.json"
# placeholders
touch_file "client/mobile-web/src/pages/.gitkeep"
touch_file "client/mobile-web/src/components/.gitkeep"
touch_file "client/mobile-web/src/i18n/.gitkeep"

# ------------------------------------------------------------
# 3. client/desktop-web
# ------------------------------------------------------------
mk_dirs \
  client/desktop-web/pages \
  client/desktop-web/pages/api \
  client/desktop-web/public \
  client/desktop-web/styles \
  client/desktop-web/components \
  client/desktop-web/lib \
  client/desktop-web/src/i18n

touch_file "client/desktop-web/pages/index.tsx"
touch_file "client/desktop-web/pages/swipe.tsx"
touch_file "client/desktop-web/pages/chat.tsx"
touch_file "client/desktop-web/pages/api/proxy/[...proxy].ts"
touch_file "client/desktop-web/lib/auth.ts"
touch_file "client/desktop-web/lib/i18n.ts"
touch_file "client/desktop-web/src/i18n/.gitkeep"
touch_file "client/desktop-web/next.config.js"
# placeholders
touch_file "client/desktop-web/public/.gitkeep"
touch_file "client/desktop-web/styles/.gitkeep"
touch_file "client/desktop-web/components/.gitkeep"

# ------------------------------------------------------------
# 4. gateway
# ------------------------------------------------------------
mk_dirs \
  gateway/kong/plugins \
  gateway/bff-web/src/controllers \
  gateway/bff-web/src/services \
  gateway/graphql

touch_file "gateway/kong/kong.yml"
touch_file "gateway/kong/plugins/rate-limiting.conf"
touch_file "gateway/kong/plugins/jwt-auth.conf"
touch_file "gateway/bff-web/src/main.ts"
touch_file "gateway/bff-web/nest-cli.json"
touch_file "gateway/graphql/gateway.ts"
touch_file "gateway/bff-web/Dockerfile"

# ------------------------------------------------------------
# 5. services/auth-service
# ------------------------------------------------------------
mk_dirs \
  services/auth-service/src/auth \
  services/auth-service/src/user \
  services/auth-service/src/dto

touch_file "services/auth-service/src/main.ts"
touch_file "services/auth-service/package.json"
touch_file "services/auth-service/Dockerfile"

# ------------------------------------------------------------
# 6. services/profile-service
# ------------------------------------------------------------
mk_dirs services/profile-service/src
touch_file "services/profile-service/src/profile.controller.ts"
touch_file "services/profile-service/src/profile.service.ts"
touch_file "services/profile-service/src/preferences.module.ts"
touch_file "services/profile-service/Dockerfile"

# ------------------------------------------------------------
# 7. services/match-service
# ------------------------------------------------------------
mk_dirs services/match-service/src
touch_file "services/match-service/src/swipe.gateway.ts"
touch_file "services/match-service/src/match.controller.ts"
touch_file "services/match-service/src/match.engine.ts"
touch_file "services/match-service/Dockerfile"

# ------------------------------------------------------------
# 8. services/chat-service
# ------------------------------------------------------------
mk_dirs services/chat-service/src
touch_file "services/chat-service/src/chat.gateway.ts"
touch_file "services/chat-service/src/message.schema.ts"
touch_file "services/chat-service/src/chat.service.ts"
touch_file "services/chat-service/Dockerfile"

# ------------------------------------------------------------
# 9. services/discovery-service
# ------------------------------------------------------------
mk_dirs services/discovery-service/src
touch_file "services/discovery-service/src/location.service.ts"
touch_file "services/discovery-service/src/search.controller.ts"
touch_file "services/discovery-service/Dockerfile"

# ------------------------------------------------------------
# 10. services/media-service
# ------------------------------------------------------------
mk_dirs services/media-service/src
touch_file "services/media-service/src/upload.controller.ts"
touch_file "services/media-service/src/moderation.service.ts"
touch_file "services/media-service/Dockerfile"

# ------------------------------------------------------------
# 11. services/notification-service
# ------------------------------------------------------------
mk_dirs services/notification-service/src
touch_file "services/notification-service/src/fcm.service.ts"
touch_file "services/notification-service/src/email.service.ts"
touch_file "services/notification-service/Dockerfile"

# ------------------------------------------------------------
# 12. services/analytics-service
# ------------------------------------------------------------
mk_dirs services/analytics-service/src
touch_file "services/analytics-service/src/event.tracker.ts"
touch_file "services/analytics-service/src/dashboard.controller.ts"
touch_file "services/analytics-service/Dockerfile"

# ------------------------------------------------------------
# 13. services/payment-service
# ------------------------------------------------------------
mk_dirs services/payment-service/src/{controllers,utils}
touch_file "services/payment-service/src/server.ts"
touch_file "services/payment-service/Dockerfile"

# ------------------------------------------------------------
# 14. services/ai-service
# ------------------------------------------------------------
mk_dirs services/ai-service/app services/ai-service/model
touch_file "services/ai-service/app/recommend.py"
touch_file "services/ai-service/app/nlp.py"
touch_file "services/ai-service/app/face_verify.py"
touch_file "services/ai-service/app/moderation.py"
touch_file "services/ai-service/main.py"
touch_file "services/ai-service/requirements.txt"
touch_file "services/ai-service/Dockerfile"
touch_file "services/ai-service/model/.gitkeep"

# ------------------------------------------------------------
# 15. data
# ------------------------------------------------------------
mk_dirs \
  data/schemas \
  data/migrations \
  data/config

touch_file "data/schemas/user.schema.json"
touch_file "data/schemas/match.schema.json"
touch_file "data/schemas/chat.schema.json"
touch_file "data/migrations/001_create_users.sql"
touch_file "data/config/redis.config.ts"
touch_file "data/config/mongo.config.ts"
touch_file "data/config/elasticsearch.config.ts"

# ------------------------------------------------------------
# 16. ai-engine
# ------------------------------------------------------------
mk_dirs \
  ai-engine/notebooks \
  ai-engine/models \
  ai-engine/scripts

touch_file "ai-engine/notebooks/recommendation_model.ipynb"
touch_file "ai-engine/notebooks/facial_embedding_train.py"
touch_file "ai-engine/models/face-recognition-v1.pkl"
touch_file "ai-engine/scripts/retrain_matcher.py"
touch_file "ai-engine/scripts/detect_toxicity.py"
touch_file "ai-engine/README.md"

# ------------------------------------------------------------
# 17. infra
# ------------------------------------------------------------
mk_dirs \
  infra/k8s/deployments \
  infra/k8s/services \
  infra/k8s/ingress \
  infra/terraform \
  infra/docker

touch_file "infra/k8s/deployments/auth-deployment.yaml"
touch_file "infra/k8s/deployments/chat-deployment.yaml"
touch_file "infra/k8s/deployments/ai-deployment.yaml"
touch_file "infra/k8s/services/.gitkeep"
touch_file "infra/k8s/ingress/kong-ingress.yaml"
touch_file "infra/terraform/main.tf"
touch_file "infra/terraform/variables.tf"
touch_file "infra/terraform/outputs.tf"
touch_file "infra/docker/docker-compose.yml"

# ------------------------------------------------------------
# 18. monitoring
# ------------------------------------------------------------
mk_dirs \
  monitoring/grafana/dashboards \
  monitoring/logging \
  monitoring/prometheus \
  monitoring/sentry

touch_file "monitoring/prometheus/prometheus.yml"
touch_file "monitoring/grafana/dashboards/.gitkeep"
touch_file "monitoring/logging/filebeat.yml"
touch_file "monitoring/sentry/sentry.properties"

# ------------------------------------------------------------
# 19. tests
# ------------------------------------------------------------
mk_dirs \
  tests/unit \
  tests/integration \
  tests/e2e/cypress/fixtures \
  tests/e2e/cypress/integration \
  tests/e2e/playwright

touch_file "tests/unit/auth.service.spec.ts"
touch_file "tests/unit/match.engine.spec.ts"
touch_file "tests/integration/chat.gateway.spec.ts"
touch_file "tests/e2e/cypress/integration/login.spec.ts"
touch_file "tests/e2e/cypress/integration/swipe-flow.spec.ts"
touch_file "tests/e2e/cypress/cypress.json"
touch_file "tests/e2e/playwright/.gitkeep"

# ------------------------------------------------------------
# 20. admin-dashboard
# ------------------------------------------------------------
mk_dirs \
  admin-dashboard/src/pages \
  admin-dashboard/src/components \
  admin-dashboard/src/services

touch_file "admin-dashboard/src/pages/UsersPage.tsx"
touch_file "admin-dashboard/src/pages/ReportsPage.tsx"
touch_file "admin-dashboard/src/pages/AnalyticsPage.tsx"
touch_file "admin-dashboard/src/services/adminApi.ts"
touch_file "admin-dashboard/package.json"

# ------------------------------------------------------------
# 21. scripts
# ------------------------------------------------------------
touch_file "scripts/seed-db.ts"
touch_file "scripts/backup-media.sh"

# ------------------------------------------------------------
# 22. docs
# ------------------------------------------------------------
touch_file "docs/ARCHITECTURE.md"
touch_file "docs/API_SPECS.yaml"
touch_file "docs/ROADMAP.md"

# ------------------------------------------------------------
# 23. Root-level files
# ------------------------------------------------------------
touch_file ".gitignore"
touch_file "docker-compose.yml"
touch_file "Makefile"
touch_file "README.md"

echo "✅  sparkly-dating-app/ directory & file structure generated."
