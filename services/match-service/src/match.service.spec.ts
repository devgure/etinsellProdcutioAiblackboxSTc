import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from './match.service';
import { PrismaService } from './prisma/prisma.service';

describe('MatchService', () => {
  let service: MatchService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    match: {
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('swipe', () => {
    it('should create a match and return mutual false', async () => {
      const userId = 'user1';
      const createMatchDto = { targetUserId: 'user2', action: 'like' as const };

      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: userId });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: 'user2' });
      mockPrismaService.match.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.match.create.mockResolvedValueOnce({
        id: 'match1',
        user1Id: userId,
        user2Id: 'user2',
        status: 'pending',
        createdAt: new Date(),
      });

      const result = await service.swipe(userId, createMatchDto);

      expect(result).toEqual({
        match: expect.objectContaining({
          id: 'match1',
          user1Id: userId,
          user2Id: 'user2',
          status: 'pending',
        }),
        mutual: false,
      });
    });

    it('should detect mutual match', async () => {
      const userId = 'user1';
      const createMatchDto = { targetUserId: 'user2', action: 'like' as const };

      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: userId });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: 'user2' });
      mockPrismaService.match.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.match.create.mockResolvedValueOnce({
        id: 'match1',
        user1Id: userId,
        user2Id: 'user2',
        status: 'pending',
        createdAt: new Date(),
      });
      mockPrismaService.match.findFirst.mockResolvedValueOnce({
        id: 'match2',
        user1Id: 'user2',
        user2Id: userId,
        status: 'pending',
      });
      mockPrismaService.match.updateMany.mockResolvedValueOnce({ count: 2 });

      const result = await service.swipe(userId, createMatchDto);

      expect(result.mutual).toBe(true);
      expect(mockPrismaService.match.updateMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { id: 'match1' },
            { id: 'match2' },
          ],
        },
        data: { status: 'matched' },
      });
    });
  });

  describe('getMatches', () => {
    it('should return user matches', async () => {
      const userId = 'user1';
      const mockMatches = [
        {
          id: 'match1',
          user1Id: userId,
          user2Id: 'user2',
          status: 'matched',
          createdAt: new Date(),
          user1: { id: 'user1', name: 'User1' },
          user2: { id: 'user2', name: 'User2' },
        },
      ];

      mockPrismaService.match.findMany.mockResolvedValueOnce(mockMatches);

      const result = await service.getMatches(userId);

      expect(result).toHaveLength(1);
      expect(result[0].user.name).toBe('User2');
    });
  });

  describe('getPotentialMatches', () => {
    it('should return potential matches', async () => {
      const userId = 'user1';
      const mockProfile = {
        id: 'profile1',
        userId,
        preferredGender: 'FEMALE',
        minAge: 18,
        maxAge: 30,
      };
      const mockUsers = [
        {
          id: 'user2',
          name: 'User2',
          birthDate: new Date('1995-01-01'),
          gender: 'FEMALE',
          photos: [{ isPrimary: true, url: 'photo.jpg' }],
          profile: mockProfile,
        },
      ];

      mockPrismaService.profile.findUnique.mockResolvedValueOnce(mockProfile);
      mockPrismaService.match.findMany.mockResolvedValueOnce([]);
      mockPrismaService.user.findMany.mockResolvedValueOnce(mockUsers);

      const result = await service.getPotentialMatches(userId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('User2');
    });
  });
});
