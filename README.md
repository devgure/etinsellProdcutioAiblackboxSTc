# Etinsell - Dating App MVP

A modern, microservices-based dating application built with NestJS, React Native, and PostgreSQL.

## 🏗️ Architecture

This project follows a microservices architecture with the following services:

### Backend Services
- **Auth Service** (Port 3001): User authentication, registration, and JWT token management
- **Profile Service** (Port 3002): User profiles, photos, and preferences management
- **Match Service** (Port 3003): Swipe mechanics, matching logic, and match management

### Frontend Clients
- **Mobile Native**: React Native app for iOS and Android
- **Mobile Web**: Responsive web app for mobile browsers
- **Desktop Web**: Full-featured web application

### Infrastructure
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **MinIO**: File storage for photos
- **Docker**: Containerization for all services

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd etinsell-dating-app
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**
   ```bash
   # For each service
   cd services/auth-service && npx prisma migrate dev
   cd ../profile-service && npx prisma migrate dev
   cd ../match-service && npx prisma migrate dev
   ```

4. **Start individual services (alternative to Docker)**
   ```bash
   # Auth Service
   cd services/auth-service && npm install && npm run start:dev

   # Profile Service
   cd services/profile-service && npm install && npm run start:dev

   # Match Service
   cd services/match-service && npm install && npm run start:dev
   ```

### Client Development

#### Mobile Native (React Native)
```bash
cd client/mobile-native
npm install
npm start
# Then run on iOS/Android simulator or device
```

#### Mobile Web (React)
```bash
cd client/mobile-web
npm install
npm start
```

#### Desktop Web (Next.js)
```bash
cd client/desktop-web
npm install
npm run dev
```

## 📱 Features

### Core Features
- ✅ User registration and authentication
- ✅ Profile creation and management
- ✅ Photo upload and management
- ✅ Swipe-based matching system
- ✅ Real-time chat (planned)
- ✅ Premium features (planned)

### Technical Features
- 🔐 JWT-based authentication
- 📱 Cross-platform mobile support
- 🗄️ Microservices architecture
- 🐳 Docker containerization
- 📊 PostgreSQL with Prisma ORM
- 🔄 Redux state management
- 🎨 Modern UI with responsive design

## 🧪 Testing

### Backend Testing
```bash
# Run tests for each service
cd services/match-service
npm run test
npm run test:e2e
```

### Frontend Testing
```bash
# Mobile Native
cd client/mobile-native
npm test

# Mobile Web
cd client/mobile-web
npm test

# Desktop Web
cd client/desktop-web
npm test
```

## 🔧 API Documentation

### Auth Service (Port 3001)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/apple` - Apple OAuth login

### Profile Service (Port 3002)
- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update user profile
- `POST /api/v1/profile/photos` - Upload photos
- `DELETE /api/v1/profile/photos/:id` - Delete photo

### Match Service (Port 3003)
- `POST /api/v1/matches/swipe` - Swipe action (like/pass)
- `GET /api/v1/matches` - Get user matches
- `GET /api/v1/matches/potential` - Get potential matches

## 🗂️ Project Structure

```
etinsell-dating-app/
├── services/
│   ├── auth-service/          # Authentication microservice
│   ├── profile-service/       # Profile management microservice
│   └── match-service/         # Matching logic microservice
├── client/
│   ├── mobile-native/         # React Native app
│   ├── mobile-web/            # React web app
│   └── desktop-web/           # Next.js web app
├── docker-compose.yml         # Docker orchestration
└── README.md
```

## 🔒 Environment Variables

Create `.env` files in each service directory with the following variables:

### Auth Service
```
DATABASE_URL=postgresql://user:password@localhost:5432/etinsell_auth
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
```

### Profile Service
```
DATABASE_URL=postgresql://user:password@localhost:5432/etinsell_profile
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### Match Service
```
DATABASE_URL=postgresql://user:password@localhost:5432/etinsell_match
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@etinsell.com or join our Discord community.

---

Made with ❤️ for finding love in the digital age.
