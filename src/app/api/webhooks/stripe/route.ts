/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 *
 * Events handled:
 * - checkout.session.completed: New subscription
 * - customer.subscription.updated: Status change
 * - customer.subscription.deleted: Cancellation
 * - invoice.payment_failed: Payment failure
 */

import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase/client';
import { verifyWebhookSignature, mapSubscriptionStatus } from '@/lib/stripe/client';

/**
 * POST /api/webhooks/stripe
 * Handle incoming Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response('Missing signature', { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    const supabase = createServerClient();

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(supabase, session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Webhook handler failed', { status: 500 });
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutComplete(
  supabase: ReturnType<typeof createServerClient>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error('Checkout session missing user_id in metadata');
    return;
  }

  console.log(`Checkout complete for user ${userId}, subscription ${subscriptionId}`);

  // Update user's profile with subscription info
  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'trial', // Starts in trial
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to update profile after checkout:', error);
  }
}

/**
 * Handle subscription updates (status changes, renewals, etc.)
 */
async function handleSubscriptionUpdate(
  supabase: ReturnType<typeof createServerClient>,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const status = mapSubscriptionStatus(subscription.status);

  console.log(`Subscription ${subscription.id} updated: ${subscription.status} -> ${status}`);

  // Find user by customer ID and update
  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: status,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to update subscription status:', error);
  }
}

/**
 * Handle subscription deletion (cancellation)
 */
async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createServerClient>,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  console.log(`Subscription ${subscription.id} deleted for customer ${customerId}`);

  // Update user's subscription status to canceled
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to mark subscription as canceled:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(
  supabase: ReturnType<typeof createServerClient>,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string;

  console.log(`Payment failed for customer ${customerId}`);

  // Update subscription status to past_due
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to update status after payment failure:', error);
  }

  // TODO: Send email notification about payment failure
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(
  supabase: ReturnType<typeof createServerClient>,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string;

  console.log(`Invoice paid for customer ${customerId}`);

  // Ensure subscription status is active after successful payment
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
    })
    .eq('stripe_customer_id', customerId)
    .eq('subscription_status', 'past_due'); // Only update if was past_due

  if (error) {
    // This is fine if no rows matched (wasn't past_due)
    console.log('No past_due subscription to update');
  }
}
