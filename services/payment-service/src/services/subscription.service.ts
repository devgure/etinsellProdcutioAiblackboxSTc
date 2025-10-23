import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  async createSubscription(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
    const { planType, paymentMethodId } = createSubscriptionDto;

    try {
      // Get or create Stripe customer
      let customer = await this.prisma.stripeCustomer.findUnique({
        where: { userId },
      });

      if (!customer) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        const stripeCustomer = await this.stripe.customers.create({
          email: user?.email,
          name: user?.name,
          metadata: { userId },
        });

        customer = await this.prisma.stripeCustomer.create({
          data: {
            userId,
            stripeCustomerId: stripeCustomer.id,
          },
        });
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.stripeCustomerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customer.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Get price ID for the plan
      const priceId = this.getPriceIdForPlan(planType);

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.stripeCustomerId,
        items: [{ price: priceId }],
        metadata: { userId, planType },
      });

      // Update user plan in database
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          planType,
          subscriptionStatus: 'ACTIVE',
          subscriptionId: subscription.id,
        },
      });

      // Record subscription transaction
      await this.prisma.transaction.create({
        data: {
          userId,
          type: 'SUBSCRIPTION',
          amount: this.getPlanPrice(planType),
          currency: 'usd',
          status: 'COMPLETED',
          stripeSubscriptionId: subscription.id,
          metadata: { planType },
        },
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        status: subscription.status,
      };
    } catch (error) {
      throw new BadRequestException('Failed to create subscription');
    }
  }

  async cancelSubscription(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { stripeCustomer: true },
      });

      if (!user?.subscriptionId) {
        throw new BadRequestException('No active subscription found');
      }

      // Cancel subscription in Stripe
      await this.stripe.subscriptions.update(user.subscriptionId, {
        cancel_at_period_end: true,
      });

      // Update user status
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'CANCELING',
        },
      });

      return { message: 'Subscription will be canceled at the end of the billing period' };
    } catch (error) {
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        planType: true,
        subscriptionStatus: true,
        subscriptionId: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      planType: user.planType,
      status: user.subscriptionStatus,
      subscriptionId: user.subscriptionId,
    };
  }

  private getPriceIdForPlan(planType: string): string {
    const priceIds = {
      PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID!,
      GOLD: process.env.STRIPE_GOLD_PRICE_ID!,
    };

    if (!priceIds[planType]) {
      throw new BadRequestException('Invalid plan type');
    }

    return priceIds[planType];
  }

  private getPlanPrice(planType: string): number {
    const prices = {
      PREMIUM: 9.99,
      GOLD: 19.99,
    };

    return prices[planType] || 0;
  }

  // Webhook handlers
  async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const { userId, planType } = subscription.metadata;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        planType,
        subscriptionStatus: 'ACTIVE',
        subscriptionId: subscription.id,
      },
    });
  }

  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const { userId } = subscription.metadata;

    const status = subscription.status === 'active' ? 'ACTIVE' :
                   subscription.status === 'canceled' ? 'CANCELED' :
                   subscription.status === 'past_due' ? 'PAST_DUE' : 'INACTIVE';

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: status,
      },
    });
  }

  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const { userId } = subscription.metadata;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        planType: 'FREE',
        subscriptionStatus: 'INACTIVE',
        subscriptionId: null,
      },
    });
  }

  async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    // Handle successful subscription payment
    console.log('Invoice payment succeeded:', invoice.id);
  }

  async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    // Handle failed subscription payment
    console.log('Invoice payment failed:', invoice.id);
  }
}
