import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { SubscriptionService } from '../services/subscription.service';

@Controller('api/v1/payments/webhook')
export class WebhookController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post()
  async handleWebhook(
    @Body() event: any,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      // Verify webhook signature
      const verifiedEvent = await this.paymentService.verifyWebhookSignature(
        event,
        signature,
      );

      switch (verifiedEvent.type) {
        case 'payment_intent.succeeded':
          await this.paymentService.handlePaymentIntentSucceeded(verifiedEvent.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.paymentService.handlePaymentIntentFailed(verifiedEvent.data.object);
          break;

        case 'customer.subscription.created':
          await this.subscriptionService.handleSubscriptionCreated(verifiedEvent.data.object);
          break;

        case 'customer.subscription.updated':
          await this.subscriptionService.handleSubscriptionUpdated(verifiedEvent.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.subscriptionService.handleSubscriptionDeleted(verifiedEvent.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.subscriptionService.handleInvoicePaymentSucceeded(verifiedEvent.data.object);
          break;

        case 'invoice.payment_failed':
          await this.subscriptionService.handleInvoicePaymentFailed(verifiedEvent.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${verifiedEvent.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw new BadRequestException('Webhook signature verification failed');
    }
  }
}
