/**
 * Today API
 *
 * GET /api/today - Get today's workout and context
 *
 * This is the primary endpoint for the "Today" screen.
 * Returns the workout for today plus relevant context (metrics, streak, etc.)
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import {
  requireAuth,
  AuthError,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/auth/middleware';
import type { Workout, Metrics, TodayResponse } from '@/types/database';
import { format, subDays } from 'date-fns';

/**
 * GET /api/today
 * Get everything needed for the Today view
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerClient();

    const today = format(new Date(), 'yyyy-MM-dd');

    // Fetch today's workout
    const { data: workouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('scheduled_date', today)
      .order('created_at', { ascending: true });

    // Fetch today's metrics (from watch sync)
    const { data: metricsData } = await supabase
      .from('metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    // Calculate workout streak (consecutive days with completed workouts)
    const streak = await calculateStreak(supabase, user.id);

    // Get recent metrics trend for context
    const { data: recentMetrics } = await supabase
      .from('metrics')
      .select('date, hrv, sleep_score, recovery_score')
      .eq('user_id', user.id)
      .gte('date', format(subDays(new Date(), 7), 'yyyy-MM-dd'))
      .order('date', { ascending: false });

    // Generate a motivational message based on context
    const hasWorkout = !!(workouts && workouts.length > 0);
    const isRestDay = workouts?.[0]?.workout_type === 'rest';
    const message = generateMotivationalMessage({
      hasWorkout,
      isRestDay: isRestDay ?? false,
      metrics: metricsData as Metrics | null,
      streak,
    });

    const response: TodayResponse = {
      date: today,
      workout: workouts && workouts.length > 0 ? (workouts[0] as Workout) : null,
      metrics: metricsData as Metrics | null,
      streak,
      message,
    };

    // Include all workouts if multiple are scheduled today
    if (workouts && workouts.length > 1) {
      (response as TodayResponse & { all_workouts: Workout[] }).all_workouts =
        workouts as Workout[];
    }

    // Include recent metrics trend
    if (recentMetrics && recentMetrics.length > 0) {
      (response as TodayResponse & { metrics_trend: typeof recentMetrics }).metrics_trend =
        recentMetrics;
    }

    return Response.json(response);
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('GET /api/today error:', err);
    return errorResponse('Failed to fetch today data', 500);
  }
}

/**
 * Calculate consecutive days with completed non-rest workouts
 */
async function calculateStreak(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<number> {
  // Get last 90 days of workouts
  const ninetyDaysAgo = format(subDays(new Date(), 90), 'yyyy-MM-dd');

  const { data: workouts } = await supabase
    .from('workouts')
    .select('scheduled_date, completed, workout_type')
    .eq('user_id', userId)
    .gte('scheduled_date', ninetyDaysAgo)
    .order('scheduled_date', { ascending: false });

  if (!workouts || workouts.length === 0) {
    return 0;
  }

  // Group by date
  const workoutsByDate = new Map<string, { completed: boolean; isRest: boolean }>();

  for (const workout of workouts) {
    const existing = workoutsByDate.get(workout.scheduled_date);
    const isRest = workout.workout_type === 'rest';

    if (!existing) {
      workoutsByDate.set(workout.scheduled_date, {
        completed: workout.completed || false,
        isRest,
      });
    } else {
      // If any non-rest workout exists and is completed, count the day
      if (!isRest && workout.completed) {
        existing.completed = true;
      }
      if (!isRest) {
        existing.isRest = false;
      }
    }
  }

  // Count streak (rest days count as maintaining streak)
  let streak = 0;
  let currentDate = new Date();

  // Start from yesterday (today might not be complete yet)
  currentDate = subDays(currentDate, 1);

  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayData = workoutsByDate.get(dateStr);

    if (!dayData) {
      // No workout scheduled, streak continues (unscheduled day)
      // But limit how far back we go without data
      if (streak > 0) break;
      currentDate = subDays(currentDate, 1);
      if (format(currentDate, 'yyyy-MM-dd') < ninetyDaysAgo) break;
      continue;
    }

    if (dayData.isRest) {
      // Rest day maintains streak
      streak++;
    } else if (dayData.completed) {
      // Completed workout
      streak++;
    } else {
      // Incomplete non-rest workout breaks streak
      break;
    }

    currentDate = subDays(currentDate, 1);
  }

  return streak;
}

/**
 * Generate a contextual motivational message
 */
function generateMotivationalMessage(context: {
  hasWorkout: boolean;
  isRestDay: boolean;
  metrics: Metrics | null;
  streak: number;
}): string {
  const { hasWorkout, isRestDay, metrics, streak } = context;

  // Check for fatigue signals
  if (metrics) {
    if (metrics.sleep_score && metrics.sleep_score < 60) {
      return "Sleep was rough last night. Listen to your body and consider going easier today. Recovery is training too.";
    }
    if (metrics.recovery_score && metrics.recovery_score < 50) {
      return "Your recovery metrics are low. Consider modifying today's intensity or taking extra rest.";
    }
    if (metrics.hrv && metrics.resting_hr) {
      // This would need baseline comparison in production
      // For now, just a placeholder
    }
  }

  if (!hasWorkout) {
    return "No workout scheduled for today. Enjoy your rest or get outside and move!";
  }

  if (isRestDay) {
    return "Rest day. Recovery is when adaptation happens. Sleep well, eat well, move gently.";
  }

  // Streak-based messages
  if (streak >= 30) {
    return `🔥 ${streak} day streak! You're building something real. One more day.`;
  }
  if (streak >= 14) {
    return `${streak} days in a row. The consistency is paying off. Trust the process.`;
  }
  if (streak >= 7) {
    return `Week ${Math.floor(streak / 7)} complete. You're in the rhythm now.`;
  }
  if (streak > 0) {
    return `${streak} day streak. Keep showing up. The work compounds.`;
  }

  // Default motivational messages
  const defaults = [
    "Today's session awaits. You know what to do.",
    "Show up. Do the work. Get better.",
    "Another chance to invest in your goal.",
    "The summit is built one session at a time.",
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
}
