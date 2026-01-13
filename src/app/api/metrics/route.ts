/**
 * Metrics API
 *
 * GET /api/metrics - Get user's health/fitness metrics
 * POST /api/metrics - Store metrics (from Terra webhook or manual entry)
 *
 * Metrics include HRV, sleep, resting HR, training load, etc.
 * Primarily populated by Terra (watch sync) but can be manual.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/client';
import {
  requireAuth,
  AuthError,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/auth/middleware';
import type { Metrics } from '@/types/database';
import { format, subDays } from 'date-fns';

// Validation schema for manual metric entry
const createMetricsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  hrv: z.number().optional(),
  resting_hr: z.number().optional(),
  sleep_score: z.number().min(0).max(100).optional(),
  sleep_duration: z.number().optional(), // minutes
  recovery_score: z.number().min(0).max(100).optional(),
  training_load: z.number().optional(),
  notes: z.string().optional(),
  source: z.enum(['manual', 'garmin', 'apple', 'whoop', 'coros']).optional(),
});

/**
 * GET /api/metrics
 * Get metrics for the authenticated user
 *
 * Query params:
 * - date: Get metrics for specific date (YYYY-MM-DD)
 * - start_date: Start of date range
 * - end_date: End of date range
 * - limit: Max results (default 30)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const date = searchParams.get('date');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '30');

    let query = supabase
      .from('metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(limit);

    if (date) {
      // Single date
      query = query.eq('date', date);
    } else if (startDate && endDate) {
      // Date range
      query = query.gte('date', startDate).lte('date', endDate);
    } else {
      // Default: last 30 days
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      query = query.gte('date', thirtyDaysAgo);
    }

    const { data: metrics, error } = await query;

    if (error) {
      throw error;
    }

    // If single date requested, return single object
    if (date) {
      return Response.json({
        metrics: metrics && metrics.length > 0 ? (metrics[0] as Metrics) : null,
      });
    }

    // Calculate trends for the period
    const typedMetrics = (metrics || []) as Metrics[];
    const trends = calculateTrends(typedMetrics);

    return Response.json({
      metrics: typedMetrics,
      count: typedMetrics.length,
      trends,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('GET /api/metrics error:', err);
    return errorResponse('Failed to fetch metrics', 500);
  }
}

/**
 * POST /api/metrics
 * Store metrics (manual entry or from webhook)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    // Validate input
    const validationResult = createMetricsSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message);
    }

    const input = validationResult.data;
    const supabase = createServerClient();

    // Upsert metrics (update if exists for date, insert if not)
    const { data: metrics, error } = await supabase
      .from('metrics')
      .upsert(
        {
          user_id: user.id,
          date: input.date,
          hrv: input.hrv,
          resting_hr: input.resting_hr,
          sleep_score: input.sleep_score,
          sleep_duration: input.sleep_duration,
          recovery_score: input.recovery_score,
          training_load: input.training_load,
          source: input.source || 'manual',
        },
        {
          onConflict: 'user_id,date',
        }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ metrics: metrics as Metrics }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('POST /api/metrics error:', err);
    return errorResponse('Failed to store metrics', 500);
  }
}

/**
 * Calculate trends from metrics data
 */
function calculateTrends(metrics: Metrics[]): {
  hrv_trend: 'up' | 'down' | 'stable' | 'insufficient_data';
  sleep_trend: 'up' | 'down' | 'stable' | 'insufficient_data';
  recovery_trend: 'up' | 'down' | 'stable' | 'insufficient_data';
  avg_hrv: number | null;
  avg_sleep_score: number | null;
  avg_recovery: number | null;
} {
  if (metrics.length < 3) {
    return {
      hrv_trend: 'insufficient_data',
      sleep_trend: 'insufficient_data',
      recovery_trend: 'insufficient_data',
      avg_hrv: null,
      avg_sleep_score: null,
      avg_recovery: null,
    };
  }

  // Calculate averages
  const hrvValues = metrics.filter((m) => m.hrv !== null).map((m) => m.hrv!);
  const sleepValues = metrics.filter((m) => m.sleep_score !== null).map((m) => m.sleep_score!);
  const recoveryValues = metrics
    .filter((m) => m.recovery_score !== null)
    .map((m) => m.recovery_score!);

  const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  // Calculate trends (compare first half to second half)
  const calculateTrend = (values: number[]): 'up' | 'down' | 'stable' => {
    if (values.length < 4) return 'stable';

    const midpoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(midpoint); // More recent (metrics are desc sorted)
    const secondHalf = values.slice(0, midpoint); // Older

    const firstAvg = avg(firstHalf) || 0;
    const secondAvg = avg(secondHalf) || 0;

    const change = ((firstAvg - secondAvg) / secondAvg) * 100;

    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  };

  return {
    hrv_trend: hrvValues.length >= 4 ? calculateTrend(hrvValues) : 'insufficient_data',
    sleep_trend: sleepValues.length >= 4 ? calculateTrend(sleepValues) : 'insufficient_data',
    recovery_trend:
      recoveryValues.length >= 4 ? calculateTrend(recoveryValues) : 'insufficient_data',
    avg_hrv: avg(hrvValues),
    avg_sleep_score: avg(sleepValues),
    avg_recovery: avg(recoveryValues),
  };
}
