/**
 * Chat API
 *
 * POST /api/chat - Chat with your AI coach
 *
 * This is the conversational interface for:
 * - Asking training questions
 * - Requesting plan adjustments
 * - Reporting how you're feeling
 * - Getting motivation and advice
 *
 * The AI has full context of your profile, plan, and recent data.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createServerClient } from '@/lib/supabase/client';
import { generateCompletion, MODEL_CONFIG } from '@/lib/anthropic/client';
import { CHAT_PROMPT, buildUserContext } from '@/prompts/training-methodology';
import {
  requireAuth,
  AuthError,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/auth/middleware';
import type {
  ChatMessage,
  PlanChange,
  Profile,
  Plan,
  Workout,
  Metrics,
} from '@/types/database';
import { format, subDays } from 'date-fns';

// Validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
});

/**
 * POST /api/chat
 * Send a message to your AI coach
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    // Validate input
    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message);
    }

    const { message } = validationResult.data;
    const supabase = createServerClient();

    // Gather all context for Claude
    const context = await gatherContext(supabase, user.id);

    // Get recent chat history (last 10 messages for context)
    const { data: chatHistory } = await supabase
      .from('chat_history')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build conversation messages
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add previous messages in chronological order
    if (chatHistory && chatHistory.length > 0) {
      const reversedHistory = chatHistory.reverse();
      for (const msg of reversedHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          });
        }
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Build the system prompt with context
    const systemPrompt = `${CHAT_PROMPT}

${context.userContext}

## TODAY'S WORKOUT
${context.todayWorkout ? `
Title: ${context.todayWorkout.title}
Type: ${context.todayWorkout.workout_type}
Duration: ${context.todayWorkout.planned_duration} minutes
Description: ${context.todayWorkout.description}
Completed: ${context.todayWorkout.completed ? 'Yes' : 'No'}
` : 'No workout scheduled today'}

## CURRENT DATE
${format(new Date(), 'EEEE, MMMM d, yyyy')}
`;

    // Generate response from Claude
    const response = await generateCompletion(
      systemPrompt,
      messages.map((m) => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`).join('\n\n'),
      {
        maxTokens: MODEL_CONFIG.maxTokens.chat,
        temperature: 0.7,
      }
    );

    // Parse response for plan changes
    let coachMessage = response;
    let planChanges: PlanChange[] = [];

    // Check if response contains plan changes
    const changesMatch = response.match(/---CHANGES---([\s\S]*?)---END---/);
    if (changesMatch) {
      coachMessage = response.replace(/---CHANGES---[\s\S]*?---END---/, '').trim();

      try {
        const changesJson = JSON.parse(changesMatch[1].trim());
        if (changesJson.changes && Array.isArray(changesJson.changes)) {
          planChanges = changesJson.changes;

          // Apply the changes to the database
          await applyPlanChanges(supabase, user.id, planChanges);
        }
      } catch (parseErr) {
        console.error('Failed to parse plan changes:', parseErr);
        // Continue without applying changes
      }
    }

    // Store user message
    await supabase.from('chat_history').insert({
      user_id: user.id,
      role: 'user',
      content: message,
      context_snapshot: {
        date: format(new Date(), 'yyyy-MM-dd'),
        had_workout: !!context.todayWorkout,
      },
    });

    // Store assistant response
    await supabase.from('chat_history').insert({
      user_id: user.id,
      role: 'assistant',
      content: coachMessage,
      plan_changes: planChanges.length > 0 ? planChanges : null,
    });

    return Response.json({
      message: coachMessage,
      plan_changes: planChanges.length > 0 ? planChanges : undefined,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('POST /api/chat error:', err);
    return errorResponse(
      `Chat failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * GET /api/chat
 * Get chat history
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: messages, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return Response.json({
      messages: (messages || []).reverse() as ChatMessage[],
      count: messages?.length || 0,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('GET /api/chat error:', err);
    return errorResponse('Failed to fetch chat history', 500);
  }
}

/**
 * Gather all relevant context for the AI
 */
async function gatherContext(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

  // Fetch all context in parallel
  const [profileResult, planResult, todayWorkoutResult, recentWorkoutsResult, recentMetricsResult] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('plans').select('*').eq('user_id', userId).eq('status', 'active').single(),
      supabase.from('workouts').select('*').eq('user_id', userId).eq('scheduled_date', today),
      supabase
        .from('workouts')
        .select('scheduled_date, title, completed, rpe, notes')
        .eq('user_id', userId)
        .gte('scheduled_date', sevenDaysAgo)
        .lt('scheduled_date', today)
        .order('scheduled_date', { ascending: false }),
      supabase
        .from('metrics')
        .select('hrv, sleep_score, training_load, resting_hr')
        .eq('user_id', userId)
        .eq('date', today)
        .single(),
    ]);

  const profile = profileResult.data as Profile | null;
  const plan = planResult.data as Plan | null;
  const todayWorkout =
    todayWorkoutResult.data && todayWorkoutResult.data.length > 0
      ? (todayWorkoutResult.data[0] as Workout)
      : null;
  const recentWorkouts = (recentWorkoutsResult.data || []) as Array<{
    scheduled_date: string;
    title: string;
    completed: boolean;
    rpe: number | null;
    notes: string | null;
  }>;
  const recentMetrics = recentMetricsResult.data as {
    hrv: number | null;
    sleep_score: number | null;
    training_load: number | null;
    resting_hr: number | null;
  } | null;

  // Build user context string
  const userContext = buildUserContext({
    profile: profile
      ? {
          disciplines: profile.disciplines,
          goal_text: profile.goal_text,
          goal_date: profile.goal_date,
          hours_per_week: profile.hours_per_week,
          days_per_week: profile.days_per_week,
          equipment: profile.equipment,
          fitness_level: profile.fitness_level,
          recent_activity: profile.recent_activity,
          injuries: profile.injuries,
        }
      : {
          disciplines: [],
          goal_text: null,
          goal_date: null,
          hours_per_week: null,
          days_per_week: null,
          equipment: [],
          fitness_level: null,
          recent_activity: null,
          injuries: null,
        },
    currentPlan: plan
      ? {
          name: plan.name,
          current_week: plan.current_week,
          total_weeks: plan.duration_weeks,
          phase:
            (plan.blocks as { weeks?: Array<{ week_number: number; phase: string }> })?.weeks?.find(
              (w) => w.week_number === plan.current_week
            )?.phase || undefined,
        }
      : undefined,
    recentWorkouts: recentWorkouts.map((w) => ({
      date: w.scheduled_date,
      title: w.title,
      completed: w.completed,
      rpe: w.rpe,
      notes: w.notes,
    })),
    recentMetrics: recentMetrics || undefined,
  });

  return {
    profile,
    plan,
    todayWorkout,
    recentWorkouts,
    recentMetrics,
    userContext,
  };
}

/**
 * Apply plan changes to the database
 */
async function applyPlanChanges(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  changes: PlanChange[]
) {
  for (const change of changes) {
    try {
      switch (change.type) {
        case 'workout_modified':
          if (change.workout_id && change.after) {
            await supabase
              .from('workouts')
              .update({
                ...change.after,
                was_adapted: true,
                adaptation_reason: change.description,
                original_workout: change.before || null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', change.workout_id)
              .eq('user_id', userId);
          }
          break;

        case 'workout_removed':
          if (change.workout_id) {
            // Don't actually delete - mark as removed/skipped
            await supabase
              .from('workouts')
              .update({
                workout_type: 'rest',
                title: 'Adapted: Rest Day',
                description: change.description,
                was_adapted: true,
                adaptation_reason: change.description,
              })
              .eq('id', change.workout_id)
              .eq('user_id', userId);
          }
          break;

        case 'workout_added':
          if (change.after) {
            const newWorkout = change.after as Partial<Workout>;
            await supabase.from('workouts').insert({
              id: uuidv4(),
              user_id: userId,
              ...newWorkout,
              was_adapted: true,
              adaptation_reason: change.description,
            });
          }
          break;

        case 'plan_adjusted':
          // Log the adjustment but don't make structural changes
          console.log('Plan adjustment:', change.description);
          break;
      }
    } catch (err) {
      console.error(`Failed to apply change ${change.type}:`, err);
    }
  }
}
