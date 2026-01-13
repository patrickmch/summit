/**
 * Plan Generation API
 *
 * POST /api/plans/generate - Generate a new training plan using Claude AI
 *
 * This is the core AI feature of Summit. It takes the user's profile and goals,
 * then generates a periodized training plan based on proven methodology.
 */

import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createServerClient } from '@/lib/supabase/client';
import { generateStructuredResponse, MODEL_CONFIG } from '@/lib/anthropic/client';
import {
  PLAN_GENERATION_PROMPT,
  buildUserContext,
} from '@/prompts/training-methodology';
import {
  requireAuth,
  AuthError,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/auth/middleware';
import type { Profile, TrainingBlock, Plan, Workout } from '@/types/database';
import { addDays, nextMonday, format, parseISO, differenceInWeeks } from 'date-fns';

/**
 * POST /api/plans/generate
 * Generate a new AI-powered training plan
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse('Profile not found. Complete onboarding first.', 404);
    }

    const typedProfile = profile as Profile;

    // Validate profile has required fields
    if (!typedProfile.disciplines || typedProfile.disciplines.length === 0) {
      return errorResponse('Profile missing discipline. Update profile first.');
    }

    if (!typedProfile.goal_text) {
      return errorResponse('Profile missing goal. Update profile first.');
    }

    // Calculate plan duration
    const startDate = nextMonday(new Date());
    let durationWeeks = 8; // Default 8 weeks

    if (typedProfile.goal_date) {
      const goalDate = parseISO(typedProfile.goal_date);
      const weeksUntilGoal = differenceInWeeks(goalDate, startDate);
      // Clamp between 4 and 24 weeks
      durationWeeks = Math.max(4, Math.min(24, weeksUntilGoal));
    }

    // Build user context for Claude
    const userContext = buildUserContext({
      profile: {
        disciplines: typedProfile.disciplines,
        goal_text: typedProfile.goal_text,
        goal_date: typedProfile.goal_date,
        hours_per_week: typedProfile.hours_per_week,
        days_per_week: typedProfile.days_per_week,
        equipment: typedProfile.equipment,
        fitness_level: typedProfile.fitness_level,
        recent_activity: typedProfile.recent_activity,
        injuries: typedProfile.injuries,
      },
    });

    // Build the generation prompt
    const taskPrompt = `
${userContext}

## TASK

Generate a ${durationWeeks}-week training plan starting from ${format(startDate, 'yyyy-MM-dd')}.

Primary discipline: ${typedProfile.disciplines[0]}
Target: ${typedProfile.goal_text}
${typedProfile.goal_date ? `Goal date: ${typedProfile.goal_date}` : 'No specific goal date - focus on general progression'}

Generate the complete plan with all weeks and daily workouts. Use UUIDs for workout IDs.
Ensure dates are properly calculated starting from ${format(startDate, 'yyyy-MM-dd')}.
`;

    console.log('Generating training plan for user:', user.id);

    // Generate plan with Claude
    const trainingBlock = await generateStructuredResponse<TrainingBlock>(
      PLAN_GENERATION_PROMPT,
      taskPrompt,
      {
        maxTokens: MODEL_CONFIG.maxTokens.planGeneration,
        temperature: 0.7,
      }
    );

    // Validate the generated plan
    if (!trainingBlock.weeks || trainingBlock.weeks.length === 0) {
      throw new Error('Generated plan has no weeks');
    }

    // Ensure all workouts have UUIDs
    trainingBlock.weeks.forEach((week) => {
      week.days.forEach((day) => {
        day.workouts.forEach((workout) => {
          if (!workout.id) {
            workout.id = uuidv4();
          }
        });
      });
    });

    // Deactivate any existing active plans
    await supabase
      .from('plans')
      .update({ status: 'abandoned' })
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Create the plan record
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .insert({
        user_id: user.id,
        name: trainingBlock.name || `${typedProfile.disciplines[0]} Training Plan`,
        discipline: typedProfile.disciplines[0],
        goal: typedProfile.goal_text,
        target_date: typedProfile.goal_date,
        status: 'active',
        blocks: trainingBlock,
        duration_weeks: trainingBlock.total_weeks || durationWeeks,
        current_week: 1,
        weekly_hours: typedProfile.hours_per_week,
        periodization_type: trainingBlock.periodization_type,
        started_at: startDate.toISOString(),
      })
      .select()
      .single();

    if (planError) {
      console.error('Plan creation error:', planError);
      throw planError;
    }

    // Extract workouts and insert them into the workouts table
    // This makes querying individual workouts much easier
    const workoutsToInsert: Partial<Workout>[] = [];

    trainingBlock.weeks.forEach((week) => {
      week.days.forEach((day) => {
        day.workouts.forEach((plannedWorkout) => {
          workoutsToInsert.push({
            id: plannedWorkout.id,
            plan_id: plan.id,
            user_id: user.id,
            scheduled_date: day.date,
            week_number: week.week_number,
            day_of_week: day.day_of_week,
            workout_type: plannedWorkout.workout_type,
            title: plannedWorkout.title,
            description: plannedWorkout.description,
            instructions: plannedWorkout.instructions,
            planned_duration: plannedWorkout.duration,
            target_intensity: plannedWorkout.intensity,
            completed: false,
          });
        });

        // Also insert rest days as workouts for completeness
        if (day.is_rest_day && day.workouts.length === 0) {
          workoutsToInsert.push({
            id: uuidv4(),
            plan_id: plan.id,
            user_id: user.id,
            scheduled_date: day.date,
            week_number: week.week_number,
            day_of_week: day.day_of_week,
            workout_type: 'rest',
            title: 'Rest Day',
            description: day.notes || 'Recovery and regeneration',
            instructions: null,
            planned_duration: 0,
            target_intensity: 'easy',
            completed: false,
          });
        }
      });
    });

    // Batch insert workouts
    if (workoutsToInsert.length > 0) {
      const { error: workoutsError } = await supabase
        .from('workouts')
        .insert(workoutsToInsert);

      if (workoutsError) {
        console.error('Workouts insertion error:', workoutsError);
        // Don't fail the whole request - plan is still created
      }
    }

    console.log(
      `Generated plan ${plan.id} with ${workoutsToInsert.length} workouts for user ${user.id}`
    );

    return Response.json(
      {
        plan: plan as Plan,
        workouts_created: workoutsToInsert.length,
        message: `Your ${durationWeeks}-week ${trainingBlock.periodization_type} periodization plan is ready!`,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('POST /api/plans/generate error:', err);
    return errorResponse(
      `Failed to generate plan: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500
    );
  }
}
