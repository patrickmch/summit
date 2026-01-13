/**
 * Stripe Checkout API
 *
 * POST /api/stripe/checkout - Create a checkout session for subscription
 *
 * Redirects user to Stripe's hosted checkout page for payment.
 * Includes 14-day free trial.
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { createCheckoutSession, stripe } from '@/lib/stripe/client';
import {
  requireAuth,
  AuthError,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/auth/middleware';
import type { Profile } from '@/types/database';

/**
 * POST /api/stripe/checkout
 * Create a Stripe checkout session
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerClient();
    const body = await request.json().catch(() => ({}));

    // Get base URL for redirects
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const successUrl = body.success_url || `${origin}/settings?checkout=success`;
    const cancelUrl = body.cancel_url || `${origin}/settings?checkout=canceled`;

    // Get user's profile for existing Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('user_id', user.id)
      .single();

    const typedProfile = profile as Pick<
      Profile,
      'stripe_customer_id' | 'subscription_status'
    > | null;

    // Check if already subscribed
    if (typedProfile?.subscription_status === 'active') {
      return errorResponse('Already subscribed. Use the customer portal to manage subscription.');
    }

    let customerId = typedProfile?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Store customer ID in profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    // Create checkout session
    const session = await createCheckoutSession({
      customerId,
      userId: user.id,
      successUrl,
      cancelUrl,
    });

    return Response.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('POST /api/stripe/checkout error:', err);
    return errorResponse(
      `Failed to create checkout session: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500
    );
  }
}
