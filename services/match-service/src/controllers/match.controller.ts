import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { MatchService } from '../services/match.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateMatchDto, UpdateMatchDto } from '../dtos/match.dto';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post('swipe')
  async swipe(@Request() req, @Body() createMatchDto: CreateMatchDto) {
    return this.matchService.swipe(req.user.id, createMatchDto);
  }

  @Get()
  async getMatches(@Request() req, @Query('status') status?: string) {
    return this.matchService.getMatches(req.user.id, status);
  }

  @Get('potential')
  async getPotentialMatches(@Request() req) {
    return this.matchService.getPotentialMatches(req.user.id);
  }

  @Put(':id')
  async updateMatch(
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ) {
    return this.matchService.updateMatch(id, updateMatchDto);
  }

  @Delete(':id')
  async deleteMatch(@Param('id') id: string) {
    return this.matchService.deleteMatch(id);
  }

  @Post(':id/like')
  async likeMatch(@Param('id') id: string, @Request() req) {
    return this.matchService.likeMatch(id, req.user.id);
  }

  @Post(':id/pass')
  async passMatch(@Param('id') id: string, @Request() req) {
    return this.matchService.passMatch(id, req.user.id);
  }
}
