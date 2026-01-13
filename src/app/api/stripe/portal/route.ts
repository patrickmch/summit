/**
 * Stripe Customer Portal API
 *
 * POST /api/stripe/portal - Create a customer portal session
 *
 * Allows users to manage their subscription, update payment method,
 * view invoices, and cancel.
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { createPortalSession } from '@/lib/stripe/client';
import {
  requireAuth,
  AuthError,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/auth/middleware';
import type { Profile } from '@/types/database';

/**
 * POST /api/stripe/portal
 * Create a Stripe customer portal session
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerClient();
    const body = await request.json().catch(() => ({}));

    // Get base URL for redirect
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const returnUrl = body.return_url || `${origin}/settings`;

    // Get user's Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse('Profile not found', 404);
    }

    const typedProfile = profile as Pick<Profile, 'stripe_customer_id'>;

    if (!typedProfile.stripe_customer_id) {
      return errorResponse('No subscription found. Subscribe first.', 400);
    }

    // Create portal session
    const session = await createPortalSession({
      customerId: typedProfile.stripe_customer_id,
      returnUrl,
    });

    return Response.json({
      portal_url: session.url,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('POST /api/stripe/portal error:', err);
    return errorResponse(
      `Failed to create portal session: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500
    );
  }
}
