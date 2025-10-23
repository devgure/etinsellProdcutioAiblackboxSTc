import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from '../dtos/create-payment-intent.dto';
import { PurchaseItemDto } from '../dtos/purchase-item.dto';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(
    userId: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const { amount, currency = 'usd', itemType, itemId } = createPaymentIntentDto;

    try {
      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          userId,
          itemType,
          itemId,
        },
      });

      // Record transaction in database
      await this.prisma.transaction.create({
        data: {
          userId,
          type: 'PAYMENT_INTENT',
          amount,
          currency,
          status: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
          metadata: {
            itemType,
            itemId,
          },
        },
      });

      return paymentIntent;
    } catch (error) {
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async purchaseItem(userId: string, purchaseItemDto: PurchaseItemDto) {
    const { itemType, itemId, paymentMethodId } = purchaseItemDto;

    try {
      // Get item price and details
      const itemDetails = await this.getItemDetails(itemType, itemId);
      const { amount, currency, description } = itemDetails;

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method: paymentMethodId,
        confirm: true,
        metadata: {
          userId,
          itemType,
          itemId,
        },
      });

      if (paymentIntent.status === 'succeeded') {
        // Process the purchase
        await this.processPurchase(userId, itemType, itemId, amount, currency);

        // Record successful transaction
        await this.prisma.transaction.create({
          data: {
            userId,
            type: 'PURCHASE',
            amount,
            currency,
            status: 'COMPLETED',
            stripePaymentIntentId: paymentIntent.id,
            metadata: {
              itemType,
              itemId,
              description,
            },
          },
        });

        return {
          success: true,
          message: 'Purchase completed successfully',
          itemType,
          itemId,
        };
      } else {
        throw new BadRequestException('Payment failed');
      }
    } catch (error) {
      throw new BadRequestException('Purchase failed');
    }
  }

  private async getItemDetails(itemType: string, itemId: string) {
    const itemPrices = {
      UNDO_SWIPE: { amount: 0.99, currency: 'usd', description: 'Undo Last Swipe' },
      VERIFIED_BADGE: { amount: 2.99, currency: 'usd', description: 'Verified Badge' },
      INCOGNITO_MODE: { amount: 2.99, currency: 'usd', description: 'Incognito Mode (Monthly)' },
      SUPER_LIKE: { amount: 0.49, currency: 'usd', description: 'Super Like' },
      ROSE_GIFT: { amount: 1.99, currency: 'usd', description: 'Rose Gift' },
      DIAMOND_GIFT: { amount: 4.99, currency: 'usd', description: 'Diamond Gift' },
      BOOST: { amount: 3.99, currency: 'usd', description: 'Profile Boost' },
      GEOFILTER: { amount: 1.99, currency: 'usd', description: 'Geofilter' },
    };

    if (!itemPrices[itemType]) {
      throw new BadRequestException('Invalid item type');
    }

    return itemPrices[itemType];
  }

  private async processPurchase(
    userId: string,
    itemType: string,
    itemId: string,
    amount: number,
    currency: string,
  ) {
    switch (itemType) {
      case 'UNDO_SWIPE':
        await this.processUndoSwipe(userId);
        break;
      case 'VERIFIED_BADGE':
        await this.processVerifiedBadge(userId);
        break;
      case 'INCOGNITO_MODE':
        await this.processIncognitoMode(userId);
        break;
      case 'SUPER_LIKE':
        await this.processSuperLike(userId, itemId);
        break;
      case 'ROSE_GIFT':
      case 'DIAMOND_GIFT':
        await this.processGift(userId, itemId, itemType);
        break;
      case 'BOOST':
        await this.processBoost(userId);
        break;
      case 'GEOFILTER':
        await this.processGeofilter(userId, itemId);
        break;
      default:
        throw new BadRequestException('Unknown item type');
    }
  }

  private async processUndoSwipe(userId: string) {
    // Logic to enable undo swipe feature
    await this.prisma.user.update({
      where: { id: userId },
      data: { canUndoSwipe: true },
    });
  }

  private async processVerifiedBadge(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }

  private async processIncognitoMode(userId: string) {
    const incognitoUntil = new Date();
    incognitoUntil.setMonth(incognitoUntil.getMonth() + 1);

    await this.prisma.user.update({
      where: { id: userId },
      data: { incognitoUntil },
    });
  }

  private async processSuperLike(userId: string, targetUserId: string) {
    // Logic to send super like
    await this.prisma.superLike.create({
      data: {
        fromUserId: userId,
        toUserId: targetUserId,
      },
    });
  }

  private async processGift(userId: string, receiverId: string, giftType: string) {
    await this.prisma.gift.create({
      data: {
        fromUserId: userId,
        toUserId: receiverId,
        type: giftType,
      },
    });
  }

  private async processBoost(userId: string) {
    const boostUntil = new Date();
    boostUntil.setHours(boostUntil.getHours() + 24);

    await this.prisma.user.update({
      where: { id: userId },
      data: { boostUntil },
    });
  }

  private async processGeofilter(userId: string, locationId: string) {
    // Logic to apply geofilter
    await this.prisma.user.update({
      where: { id: userId },
      data: { geofilterLocationId: locationId },
    });
  }

  async verifyWebhookSignature(rawBody: Buffer, signature: string) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    } catch (error) {
      throw new BadRequestException('Webhook signature verification failed');
    }
  }

  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const { userId, itemType, itemId } = paymentIntent.metadata;

    // Update transaction status
    await this.prisma.transaction.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: 'COMPLETED' },
    });

    // Process the purchase if not already processed
    if (itemType && itemId) {
      const amount = paymentIntent.amount / 100;
      await this.processPurchase(userId, itemType, itemId, amount, paymentIntent.currency);
    }
  }

  async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    // Update transaction status
    await this.prisma.transaction.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: 'FAILED' },
    });
  }

  async getTransactionHistory(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
