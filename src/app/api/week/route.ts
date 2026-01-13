/**
 * Week API
 *
 * GET /api/week - Get this week's training at a glance
 *
 * Returns all workouts for the current week with summary statistics.
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import {
  requireAuth,
  AuthError,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/auth/middleware';
import type { Workout, WeekResponse } from '@/types/database';
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns';

/**
 * GET /api/week
 * Get all workouts for the current week (or specified week)
 *
 * Query params:
 * - date: Any date in the week you want (defaults to current week)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    // Determine which week to fetch
    const dateParam = searchParams.get('date');
    const referenceDate = dateParam ? parseISO(dateParam) : new Date();

    // Week runs Monday to Sunday
    const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });

    // Fetch all workouts for the week
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('scheduled_date', format(weekStart, 'yyyy-MM-dd'))
      .lte('scheduled_date', format(weekEnd, 'yyyy-MM-dd'))
      .order('scheduled_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const typedWorkouts = (workouts || []) as Workout[];

    // Calculate statistics
    let plannedMinutes = 0;
    let completedMinutes = 0;
    let completedCount = 0;
    let totalNonRestWorkouts = 0;

    for (const workout of typedWorkouts) {
      if (workout.workout_type !== 'rest') {
        totalNonRestWorkouts++;
        plannedMinutes += workout.planned_duration || 0;

        if (workout.completed) {
          completedCount++;
          completedMinutes += workout.actual_duration || workout.planned_duration || 0;
        }
      }
    }

    // Get the current plan to determine week number and phase
    const { data: activePlan } = await supabase
      .from('plans')
      .select('current_week, blocks')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    let weekNumber = 1;
    let phase = 'Training';

    if (activePlan && activePlan.blocks) {
      weekNumber = activePlan.current_week || 1;

      // Extract phase from plan blocks
      const blocks = activePlan.blocks as {
        weeks?: Array<{ week_number: number; phase: string }>;
      };
      if (blocks.weeks) {
        const currentWeekData = blocks.weeks.find(
          (w) => w.week_number === weekNumber
        );
        if (currentWeekData) {
          phase = currentWeekData.phase;
        }
      }
    }

    const response: WeekResponse = {
      week_number: weekNumber,
      phase,
      workouts: typedWorkouts,
      planned_hours: Math.round((plannedMinutes / 60) * 10) / 10,
      completed_hours: Math.round((completedMinutes / 60) * 10) / 10,
      completion_rate:
        totalNonRestWorkouts > 0
          ? Math.round((completedCount / totalNonRestWorkouts) * 100)
          : 0,
    };

    // Add additional context
    const extendedResponse = {
      ...response,
      week_start: format(weekStart, 'yyyy-MM-dd'),
      week_end: format(weekEnd, 'yyyy-MM-dd'),
      total_workouts: totalNonRestWorkouts,
      completed_workouts: completedCount,
      remaining_workouts: totalNonRestWorkouts - completedCount,
    };

    return Response.json(extendedResponse);
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('GET /api/week error:', err);
    return errorResponse('Failed to fetch week data', 500);
  }
}
