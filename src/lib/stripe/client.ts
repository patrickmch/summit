/**
 * Stripe Client Configuration
 *
 * Handles subscription management for Summit.
 * MVP: Simple $15/mo subscription with 14-day free trial
 */

import Stripe from 'stripe';

// Environment validation
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Payment features will not work.');
}

/**
 * Stripe client instance
 */
export const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

/**
 * Price configuration
 * TODO: Move these to Stripe dashboard and fetch dynamically in production
 */
export const PRICE_CONFIG = {
  // Monthly subscription price ID from Stripe
  monthlyPriceId: process.env.STRIPE_MONTHLY_PRICE_ID || '',

  // Trial period in days
  trialDays: 14,

  // Price display
  monthlyPrice: 15,
  currency: 'usd',
};

/**
 * Create a Stripe checkout session for new subscriptions
 */
export async function createCheckoutSession(params: {
  customerId?: string;
  customerEmail?: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.customerEmail,
    line_items: [
      {
        price: PRICE_CONFIG.monthlyPriceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: PRICE_CONFIG.trialDays,
      metadata: {
        user_id: params.userId,
      },
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      user_id: params.userId,
    },
  });

  return session;
}

/**
 * Create a Stripe customer portal session
 * Allows users to manage their subscription
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session;
}

/**
 * Get a Stripe customer by ID
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return null;
    }
    return customer as Stripe.Customer;
  } catch {
    return null;
  }
}

/**
 * Get active subscription for a customer
 */
export async function getActiveSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  });

  return subscriptions.data[0] || null;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  if (cancelAtPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripeWebhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
}

/**
 * Map Stripe subscription status to our status
 */
export function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'canceled' | 'past_due' | 'trial' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trial';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
    default:
      return 'canceled';
  }
}
