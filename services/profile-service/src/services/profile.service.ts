import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from '../dtos/profile.dto';
import * as sharp from 'sharp';
import { Client as MinioClient } from 'minio';

@Injectable()
export class ProfileService {
  private minioClient: MinioClient;

  constructor(private prisma: PrismaService) {
    this.minioClient = new MinioClient({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    });
  }

  async createProfile(userId: string, createProfileDto: CreateProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Profile already exists');
    }

    return this.prisma.profile.create({
      data: {
        userId,
        ...createProfileDto,
      },
    });
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        photos: true,
        preferences: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async getProfileById(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        photos: true,
        user: {
          select: {
            id: true,
            name: true,
            isVerified: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
    });
  }

  async uploadPhotos(userId: string, files: Express.Multer.File[]) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const photoPromises = files.map(async (file, index) => {
      // Process image with Sharp
      const processedBuffer = await sharp(file.buffer)
        .resize(800, 800, { fit: 'inside' })
        .jpeg({ quality: 85 })
        .toBuffer();

      const fileName = `photos/${userId}/${Date.now()}-${index}.jpg`;

      // Upload to MinIO
      await this.minioClient.putObject(
        process.env.MINIO_BUCKET || 'etincel-photos',
        fileName,
        processedBuffer,
        processedBuffer.length,
        { 'Content-Type': 'image/jpeg' }
      );

      // Save to database
      return this.prisma.photo.create({
        data: {
          userId,
          url: `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${process.env.MINIO_BUCKET || 'etincel-photos'}/${fileName}`,
          isPrimary: index === 0 && profile.photos.length === 0,
        },
      });
    });

    return Promise.all(photoPromises);
  }

  async deletePhoto(userId: string, photoId: string) {
    const photo = await this.prisma.photo.findFirst({
      where: { id: photoId, userId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Delete from MinIO
    const urlParts = photo.url.split('/');
    const objectName = urlParts.slice(-2).join('/'); // Get bucket/filename
    await this.minioClient.removeObject(process.env.MINIO_BUCKET || 'etincel-photos', objectName);

    // Delete from database
    return this.prisma.photo.delete({
      where: { id: photoId },
    });
  }

  async verifyFace(userId: string, faceFile: Express.Multer.File) {
    // Placeholder for facial recognition integration
    // In production, this would call AI service for face verification
    const isVerified = Math.random() > 0.5; // Mock verification

    await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified },
    });

    return { verified: isVerified, message: isVerified ? 'Face verified successfully' : 'Face verification failed' };
  }

  async searchProfiles(userId: string, query: any) {
    const { gender, minAge, maxAge, location, limit = 20, offset = 0 } = query;

    const where: any = {
      userId: { not: userId }, // Exclude own profile
      user: { isVerified: true },
    };

    if (gender) where.gender = gender;
    if (minAge || maxAge) {
      where.user = {
        ...where.user,
        birthDate: {
          ...(minAge && { lte: new Date(Date.now() - minAge * 365 * 24 * 60 * 60 * 1000) }),
          ...(maxAge && { gte: new Date(Date.now() - maxAge * 365 * 24 * 60 * 60 * 1000) }),
        },
      };
    }

    return this.prisma.profile.findMany({
      where,
      include: {
        photos: { where: { isPrimary: true } },
        user: { select: { name: true, isVerified: true } },
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });
  }
}
