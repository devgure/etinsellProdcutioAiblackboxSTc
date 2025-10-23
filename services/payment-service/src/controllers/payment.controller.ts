import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { SubscriptionService } from '../services/subscription.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreatePaymentIntentDto } from '../dtos/create-payment-intent.dto';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { PurchaseItemDto } from '../dtos/purchase-item.dto';

@Controller('api/v1/payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Request() req,
  ) {
    try {
      const paymentIntent = await this.paymentService.createPaymentIntent(
        req.user.id,
        createPaymentIntentDto,
      );
      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('create-subscription')
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req,
  ) {
    try {
      const subscription = await this.subscriptionService.createSubscription(
        req.user.id,
        createSubscriptionDto,
      );
      return subscription;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('purchase-item')
  async purchaseItem(
    @Body() purchaseItemDto: PurchaseItemDto,
    @Request() req,
  ) {
    try {
      const result = await this.paymentService.purchaseItem(
        req.user.id,
        purchaseItemDto,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('subscription-status')
  async getSubscriptionStatus(@Request() req) {
    try {
      const status = await this.subscriptionService.getSubscriptionStatus(
        req.user.id,
      );
      return status;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('cancel-subscription')
  async cancelSubscription(@Request() req) {
    try {
      const result = await this.subscriptionService.cancelSubscription(
        req.user.id,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('transaction-history')
  async getTransactionHistory(@Request() req) {
    try {
      const transactions = await this.paymentService.getTransactionHistory(
        req.user.id,
      );
      return transactions;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
