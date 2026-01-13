/**
 * Profile API Routes
 *
 * GET /api/profiles - Get current user's profile
 * POST /api/profiles - Create profile (onboarding)
 * PUT /api/profiles - Update profile
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
import type { Profile, ProfileInput, Discipline, FitnessLevel } from '@/types/database';

// Validation schemas
const disciplineSchema = z.enum([
  'climbing',
  'ultra',
  'skimo',
  'mountaineering',
  'trail_running',
  'alpinism',
]);

const fitnessLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'elite']);

const createProfileSchema = z.object({
  disciplines: z.array(disciplineSchema).min(1, 'Select at least one discipline'),
  goal_text: z.string().min(1, 'Goal is required'),
  goal_date: z.string().optional(),
  hours_per_week: z.number().min(1).max(40),
  days_per_week: z.number().min(1).max(7),
  equipment: z.array(z.string()),
  fitness_level: fitnessLevelSchema,
  recent_activity: z.string().optional(),
  injuries: z.string().optional(),
});

const updateProfileSchema = createProfileSchema.partial();

/**
 * GET /api/profiles
 * Get the current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const supabase = createServerClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return Response.json({ profile: null });
      }
      throw error;
    }

    return Response.json({ profile: profile as Profile });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('GET /api/profiles error:', err);
    return errorResponse('Failed to fetch profile', 500);
  }
}

/**
 * POST /api/profiles
 * Create a new profile (onboarding)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    // Validate input
    const validationResult = createProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message);
    }

    const input = validationResult.data as ProfileInput;
    const supabase = createServerClient();

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return errorResponse('Profile already exists. Use PUT to update.', 409);
    }

    // Create profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        disciplines: input.disciplines as Discipline[],
        goal_text: input.goal_text,
        goal_date: input.goal_date || null,
        hours_per_week: input.hours_per_week,
        days_per_week: input.days_per_week,
        equipment: input.equipment,
        fitness_level: input.fitness_level as FitnessLevel,
        recent_activity: input.recent_activity || null,
        injuries: input.injuries || null,
        onboarding_completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      throw error;
    }

    return Response.json({ profile: profile as Profile }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('POST /api/profiles error:', err);
    return errorResponse('Failed to create profile', 500);
  }
}

/**
 * PUT /api/profiles
 * Update existing profile
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message);
    }

    const input = validationResult.data;
    const supabase = createServerClient();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (input.disciplines) updateData.disciplines = input.disciplines;
    if (input.goal_text) updateData.goal_text = input.goal_text;
    if (input.goal_date !== undefined) updateData.goal_date = input.goal_date || null;
    if (input.hours_per_week) updateData.hours_per_week = input.hours_per_week;
    if (input.days_per_week) updateData.days_per_week = input.days_per_week;
    if (input.equipment) updateData.equipment = input.equipment;
    if (input.fitness_level) updateData.fitness_level = input.fitness_level;
    if (input.recent_activity !== undefined)
      updateData.recent_activity = input.recent_activity || null;
    if (input.injuries !== undefined) updateData.injuries = input.injuries || null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Profile not found', 404);
      }
      throw error;
    }

    return Response.json({ profile: profile as Profile });
  } catch (err) {
    if (err instanceof AuthError) {
      return unauthorizedResponse(err.message);
    }
    console.error('PUT /api/profiles error:', err);
    return errorResponse('Failed to update profile', 500);
  }
}
