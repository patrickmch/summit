/**
 * Plans API Routes
 *
 * GET /api/plans - Get all plans for user (or active plan)
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import {
  requireAuth,
  AuthError,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/auth/middleware';
import type { Plan } from '@/types/database';

/**
 * GET /api/plans
 * Get user's plans
 *
 * Query params:
 * - active=true: Get only the active plan
 * - status=active|completed|abandoned: Filter by status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const activeOnly = searchParams.get('active') === 'true';
    const status = searchParams.get('status');

    let query = supabase
      .from('plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('status', 'active').limit(1);
    } else if (status) {
      query = query.eq('status', status);
    }

    const { data: plans, error } = await query;

    if (error) {
      throw error;
    }

    if (activeOnly) {
      // Return single plan or null
      return Response.json({
        plan: plans.length > 0 ? (plans[0] as Plan) : null,
      });
    }

    return Response.json({ plans: plans as Plan[] });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('GET /api/plans error:', err);
    return errorResponse('Failed to fetch plans', 500);
  }
}
