import { IsString, IsIn } from 'class-validator';

export class PurchaseItemDto {
  @IsString()
  @IsIn([
    'UNDO_SWIPE',
    'VERIFIED_BADGE',
    'INCOGNITO_MODE',
    'SUPER_LIKE',
    'ROSE_GIFT',
    'DIAMOND_GIFT',
    'BOOST',
    'GEOFILTER',
  ])
  itemType: string;

  @IsString()
  itemId: string; // target user ID for gifts, location ID for geofilters, etc.

  @IsString()
  paymentMethodId: string;
}
