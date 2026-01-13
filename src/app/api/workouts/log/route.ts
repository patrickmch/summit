/**
 * Workout Logging API
 *
 * POST /api/workouts/log - Log a completed workout
 *
 * This is the primary way users record their training.
 * Can be done manually or synced from watch data.
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
import type { Workout } from '@/types/database';

// Validation schema
const logWorkoutSchema = z.object({
  workout_id: z.string().uuid(),
  completed: z.boolean(),
  actual_duration: z.number().optional(), // minutes
  rpe: z.number().min(1).max(10).optional(), // Rate of Perceived Exertion
  notes: z.string().max(1000).optional(),
  watch_data: z.record(z.string(), z.unknown()).optional(), // Raw data from wearable
});

/**
 * POST /api/workouts/log
 * Log workout completion/details
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    // Validate input
    const validationResult = logWorkoutSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message);
    }

    const input = validationResult.data;
    const supabase = createServerClient();

    // Verify workout belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from('workouts')
      .select('id, user_id, completed')
      .eq('id', input.workout_id)
      .single();

    if (fetchError || !existing) {
      return errorResponse('Workout not found', 404);
    }

    if (existing.user_id !== user.id) {
      return unauthorizedResponse('Not your workout');
    }

    // Update workout with log data
    const updateData: Partial<Workout> = {
      completed: input.completed,
      completed_at: input.completed ? new Date().toISOString() : null,
    };

    if (input.actual_duration !== undefined) {
      updateData.actual_duration = input.actual_duration;
    }

    if (input.rpe !== undefined) {
      updateData.rpe = input.rpe;
    }

    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    if (input.watch_data) {
      updateData.watch_data = input.watch_data;
    }

    const { data: workout, error: updateError } = await supabase
      .from('workouts')
      .update(updateData)
      .eq('id', input.workout_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Calculate training load contribution if we have RPE and duration
    // Training Load = Duration × RPE (simplified TRIMP-like calculation)
    let trainingLoadContribution: number | null = null;
    if (input.completed && input.actual_duration && input.rpe) {
      trainingLoadContribution = Math.round(input.actual_duration * input.rpe);
    }

    return Response.json({
      workout: workout as Workout,
      training_load_contribution: trainingLoadContribution,
      message: input.completed
        ? 'Workout logged! Great work 💪'
        : 'Workout marked as incomplete',
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('POST /api/workouts/log error:', err);
    return errorResponse('Failed to log workout', 500);
  }
}

/**
 * PATCH /api/workouts/log
 * Update an existing workout log (same functionality, different method)
 */
export async function PATCH(request: NextRequest) {
  return POST(request);
}
