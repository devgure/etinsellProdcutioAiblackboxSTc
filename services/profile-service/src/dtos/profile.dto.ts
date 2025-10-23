import { IsString, IsOptional, IsArray, IsEnum, IsBoolean, IsNumber, Min, Max, IsDateString } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  OTHER = 'OTHER',
}

export enum RelationshipType {
  FRIENDSHIP = 'FRIENDSHIP',
  RELATIONSHIP = 'RELATIONSHIP',
  CASUAL = 'CASUAL',
}

export class CreateProfileDto {
  @IsString()
  bio?: string;

  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsEnum(Gender)
  preferredGender?: Gender;

  @IsNumber()
  @Min(18)
  @Max(100)
  maxDistance?: number;

  @IsNumber()
  @Min(18)
  @Max(100)
  minAge?: number;

  @IsNumber()
  @Min(18)
  @Max(100)
  maxAge?: number;

  @IsBoolean()
  showLocation?: boolean;

  @IsBoolean()
  showAge?: boolean;

  @IsEnum(RelationshipType)
  relationshipType?: RelationshipType;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsEnum(Gender)
  preferredGender?: Gender;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(100)
  maxDistance?: number;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(100)
  minAge?: number;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(100)
  maxAge?: number;

  @IsOptional()
  @IsBoolean()
  showLocation?: boolean;

  @IsOptional()
  @IsBoolean()
  showAge?: boolean;

  @IsOptional()
  @IsEnum(RelationshipType)
  relationshipType?: RelationshipType;
}

export class ProfileResponseDto {
  id: string;
  userId: string;
  bio?: string;
  interests?: string[];
  preferredGender?: Gender;
  maxDistance?: number;
  minAge?: number;
  maxAge?: number;
  showLocation?: boolean;
  showAge?: boolean;
  relationshipType?: RelationshipType;
  photos?: PhotoDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class PhotoDto {
  id: string;
  url: string;
  isPrimary: boolean;
  createdAt: Date;
}
