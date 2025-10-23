import { IsString, IsIn } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsIn(['PREMIUM', 'GOLD'])
  planType: string;

  @IsString()
  paymentMethodId: string;
}
