import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'usd';

  @IsString()
  itemType: string;

  @IsString()
  @IsOptional()
  itemId?: string;
}
