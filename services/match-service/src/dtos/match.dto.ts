import { IsString, IsIn, IsOptional } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  targetUserId: string;

  @IsIn(['like', 'pass'])
  action: 'like' | 'pass';
}

export class UpdateMatchDto {
  @IsOptional()
  @IsIn(['pending', 'matched', 'rejected'])
  status?: 'pending' | 'matched' | 'rejected';
}
