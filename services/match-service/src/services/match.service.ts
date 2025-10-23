import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto, UpdateMatchDto } from '../dtos/match.dto';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  async swipe(userId: string, createMatchDto: CreateMatchDto) {
    const { targetUserId, action } = createMatchDto;

    // Check if users exist
    const [user, targetUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.user.findUnique({ where: { id: targetUserId } }),
    ]);

    if (!user || !targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if match already exists
    const existingMatch = await this.prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId },
        ],
      },
    });

    if (existingMatch) {
      throw new BadRequestException('Match already exists');
    }

    // Create match
    const match = await this.prisma.match.create({
      data: {
        user1Id: userId,
        user2Id: targetUserId,
        status: action === 'like' ? 'pending' : 'rejected',
      },
    });

    // Check for mutual like
    if (action === 'like') {
      const mutualMatch = await this.prisma.match.findFirst({
        where: {
          user1Id: targetUserId,
          user2Id: userId,
          status: 'pending',
        },
      });

      if (mutualMatch) {
        // Update both matches to matched
        await this.prisma.match.updateMany({
          where: {
            OR: [
              { id: match.id },
              { id: mutualMatch.id },
            ],
          },
          data: { status: 'matched' },
        });

        return { match: { ...match, status: 'matched' }, mutual: true };
      }
    }

    return { match, mutual: false };
  }

  async getMatches(userId: string, status?: string) {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
        ...(status && { status }),
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            photos: { where: { isPrimary: true }, take: 1 },
            profile: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            photos: { where: { isPrimary: true }, take: 1 },
            profile: true,
          },
        },
      },
    });

    return matches.map(match => ({
      id: match.id,
      status: match.status,
      createdAt: match.createdAt,
      user: match.user1Id === userId ? match.user2 : match.user1,
    }));
  }

  async getPotentialMatches(userId: string) {
    // Get user's preferences
    const userProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    // Get users who haven't been swiped on
    const swipedUserIds = await this.prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      select: {
        user1Id: true,
        user2Id: true,
      },
    });

    const swipedIds = new Set(
      swipedUserIds.flatMap(m => [m.user1Id, m.user2Id]).filter(id => id !== userId)
    );

    // Basic filtering (expand with AI matching later)
    const potentialMatches = await this.prisma.user.findMany({
      where: {
        id: { notIn: Array.from(swipedIds) },
        gender: userProfile.preferredGender || undefined,
        birthDate: {
          gte: new Date(Date.now() - (userProfile.maxAge || 100) * 365 * 24 * 60 * 60 * 1000),
          lte: new Date(Date.now() - (userProfile.minAge || 18) * 365 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
        gender: true,
        photos: { where: { isPrimary: true }, take: 1 },
        profile: true,
      },
      take: 20, // Limit for performance
    });

    return potentialMatches;
  }

  async updateMatch(id: string, updateMatchDto: UpdateMatchDto) {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return this.prisma.match.update({
      where: { id },
      data: updateMatchDto,
    });
  }

  async deleteMatch(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return this.prisma.match.delete({
      where: { id },
    });
  }

  async likeMatch(id: string, userId: string) {
    return this.updateMatch(id, { status: 'matched' });
  }

  async passMatch(id: string, userId: string) {
    return this.updateMatch(id, { status: 'rejected' });
  }
}
