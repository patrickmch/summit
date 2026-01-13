/**
 * Workouts API Routes
 *
 * GET /api/workouts - Get workouts with filters
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import {
  requireAuth,
  AuthError,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/auth/middleware';
import type { Workout } from '@/types/database';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';

/**
 * GET /api/workouts
 * Get workouts for the authenticated user
 *
 * Query params:
 * - date: Get workout for specific date (YYYY-MM-DD)
 * - week: Get workouts for week containing this date (YYYY-MM-DD)
 * - plan_id: Filter by plan
 * - completed: Filter by completion status (true/false)
 * - limit: Max results (default 50)
 * - offset: Pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const date = searchParams.get('date');
    const week = searchParams.get('week');
    const planId = searchParams.get('plan_id');
    const completed = searchParams.get('completed');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true })
      .limit(limit)
      .range(offset, offset + limit - 1);

    // Filter by specific date
    if (date) {
      query = query.eq('scheduled_date', date);
    }

    // Filter by week
    if (week) {
      const weekDate = new Date(week);
      const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 }); // Sunday

      query = query
        .gte('scheduled_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(weekEnd, 'yyyy-MM-dd'));
    }

    // Filter by plan
    if (planId) {
      query = query.eq('plan_id', planId);
    }

    // Filter by completion status
    if (completed !== null) {
      query = query.eq('completed', completed === 'true');
    }

    const { data: workouts, error } = await query;

    if (error) {
      throw error;
    }

    // If querying by date and no workouts found, it might be a rest day
    // Return an empty array - the frontend can interpret this
    return Response.json({
      workouts: (workouts || []) as Workout[],
      count: workouts?.length || 0,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('GET /api/workouts error:', err);
    return errorResponse('Failed to fetch workouts', 500);
  }
}
