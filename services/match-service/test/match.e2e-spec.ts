import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MatchModule } from '../src/match.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('MatchController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MatchModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    // Create test users and get auth token
    // This would normally be done through auth-service
    authToken = 'Bearer test-jwt-token';
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.match.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('/matches/swipe (POST)', () => {
    it('should create a match', () => {
      return request(app.getHttpServer())
        .post('/api/v1/matches/swipe')
        .set('Authorization', authToken)
        .send({
          targetUserId: 'user2',
          action: 'like',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('match');
          expect(res.body).toHaveProperty('mutual');
        });
    });

    it('should return 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/api/v1/matches/swipe')
        .send({
          targetUserId: 'user2',
          action: 'like',
        })
        .expect(401);
    });
  });

  describe('/matches (GET)', () => {
    it('should get user matches', () => {
      return request(app.getHttpServer())
        .get('/api/v1/matches')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/matches/potential (GET)', () => {
    it('should get potential matches', () => {
      return request(app.getHttpServer())
        .get('/api/v1/matches/potential')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
