import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ProfileService } from '../services/profile.service';
import { CreateProfileDto, UpdateProfileDto } from '../dtos/profile.dto';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  async createProfile(@Body() createProfileDto: CreateProfileDto, @Request() req) {
    return this.profileService.createProfile(req.user.id, createProfileDto);
  }

  @Get('me')
  async getMyProfile(@Request() req) {
    return this.profileService.getProfileByUserId(req.user.id);
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.profileService.getProfileById(id);
  }

  @Put('me')
  async updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Request() req) {
    return this.profileService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('me/photos')
  @UseInterceptors(FilesInterceptor('photos', 6))
  async uploadPhotos(@UploadedFiles() files: Express.Multer.File[], @Request() req) {
    return this.profileService.uploadPhotos(req.user.id, files);
  }

  @Delete('me/photos/:photoId')
  async deletePhoto(@Param('photoId') photoId: string, @Request() req) {
    return this.profileService.deletePhoto(req.user.id, photoId);
  }

  @Post('me/verify-face')
  @UseInterceptors(FilesInterceptor('face'))
  async verifyFace(@UploadedFiles() files: Express.Multer.File[], @Request() req) {
    return this.profileService.verifyFace(req.user.id, files[0]);
  }

  @Get('search')
  async searchProfiles(@Request() req) {
    return this.profileService.searchProfiles(req.user.id, req.query);
  }
}
