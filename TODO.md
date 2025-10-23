# Etinsell Dating App MVP - TODO List

## Phase 1: Core Backend & Database (Priority: High)
- [x] Set up master Prisma schema (prisma/schema.prisma) with models for User, Profile, Match, Chat, Payment, etc.
- [x] Implement auth-service:
  - [x] main.ts (NestJS app setup)
  - [x] auth.module.ts (module configuration)
  - [x] controllers/auth.controller.ts (signup, login, OAuth)
  - [x] services/auth.service.ts (JWT, Passport, biometrics)
  - [x] guards (jwt, local, google, apple strategies)
  - [x] middleware/auth.middleware.ts, errorHandler.ts
  - [x] dtos/auth.dto.ts
  - [x] prisma/prisma.module.ts, prisma.service.ts
  - [x] package.json, Dockerfile, nest-cli.json
  - [x] prisma/schema.prisma (service-specific)
- [x] Implement profile-service:
  - [x] main.ts
  - [x] profile.module.ts (module configuration)
  - [x] controllers/profile.controller.ts (CRUD, photo upload, facial verification)
  - [x] services/profile.service.ts (facial recognition integration, MinIO storage)
  - [x] dtos/profile.dto.ts (validation DTOs)
  - [x] prisma/prisma.module.ts, prisma.service.ts
  - [x] guards/jwt.strategy.ts, jwt-auth.guard.ts
  - [x] package.json, Dockerfile, nest-cli.json
  - [x] prisma/schema.prisma (service-specific)
- [x] Implement match-service:
  - [x] main.ts
  - [x] match.module.ts (module configuration)
  - [x] controllers/match.controller.ts (swipe, matches, potential matches)
  - [x] services/match.service.ts (swipe logic, mutual matching, potential matches)
  - [x] dtos/match.dto.ts (validation DTOs)
  - [x] prisma/prisma.module.ts, prisma.service.ts
  - [x] guards/jwt.strategy.ts, jwt-auth.guard.ts
  - [x] package.json, Dockerfile, nest-cli.json
  - [x] prisma/schema.prisma (service-specific)
- [ ] Update docker-compose.yml for services
- [ ] Test Phase 1 with basic endpoints

## Phase 2: Clients (Priority: High)
- [ ] Mobile-Native (React Native/Expo):
  - [ ] App.tsx (main app)
  - [ ] screens: LoginScreen, SignupScreen, SwipeScreen, ProfileScreen, ChatScreen
  - [ ] navigation (React Navigation)
  - [ ] components: Card, Button, etc.
  - [ ] hooks, i18n
  - [ ] package.json, app.config.ts
- [ ] Mobile-Web (React/PWA):
  - [ ] index.html, vite.config.ts
  - [ ] src/App.tsx, screens, components, navigation
  - [ ] Redux for state, Tailwind CSS
  - [ ] package.json
- [ ] Desktop-Web (React):
  - [ ] app/layout.tsx, pages: chat, profile, swipe
  - [ ] lib/auth.ts, i18n.ts, theme.ts
  - [ ] styles/globals.css
  - [ ] package.json, next.config.js
- [ ] Integrate clients with backend APIs

## Phase 3: Advanced Features (Priority: Medium)
- [ ] Chat-service (Elixir/Phoenix or Node.js/Socket.IO):
  - [ ] Real-time messaging, read receipts
  - [ ] main.go or main.ts, controllers, services
  - [ ] Dockerfile
- [ ] Location-service (Go):
  - [ ] main.go (geo queries, Redis Geo)
  - [ ] Dockerfile
- [ ] AI-service (Python/FastAPI):
  - [ ] main.py (matching, facial recognition with OpenCV/TensorFlow)
  - [ ] requirements.txt, Dockerfile
- [ ] Blockchain-service (Node.js/Web3.js):
  - [ ] contracts/IdentityVerifier.sol, EtiToken.sol
  - [ ] sdk/web3.ts
  - [ ] package.json, Dockerfile
- [ ] Payment-service (Node.js/Stripe):
  - [ ] subscriptions, ETI tokens
  - [ ] package.json, Dockerfile
- [ ] Notification-service, Media-service (MinIO), Video-service (WebRTC), Analytics-service

## Phase 4: Infra & Extras (Priority: Low)
- [ ] API Gateway/BFF (Kong/GraphQL):
  - [ ] kong.yml, plugins
  - [ ] bff-web (NestJS), graphql/gateway.ts
- [ ] Monitoring: Prometheus, Grafana, ELK
- [ ] Tests: Cypress e2e, unit tests
- [ ] I18n: Language support
- [ ] Admin Dashboard (React):
  - [ ] pages: UsersPage, AnalyticsPage, RevenuePage
  - [ ] components, services
  - [ ] package.json, Dockerfile
- [ ] Scripts: deploy.sh, backup.sh, etc.
- [ ] Docs: API.md, ARCHITECTURE.md, DEPLOYMENT.md
- [ ] Final integration, security (encryption, 2FA), deployment

## General Tasks
- [ ] Update README.md with setup instructions
- [ ] Ensure all Dockerfiles and docker-compose.yml are complete
- [ ] Run health checks and tests after each phase
- [ ] Optimize for scalability and performance
