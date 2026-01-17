/**
 * Supabase Database Types
 *
 * These types match the schema in supabase/migrations/20240101000000_initial_schema.sql
 *
 * To regenerate from your actual schema:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          disciplines: string[];
          goal_text: string | null;
          goal_date: string | null;
          hours_per_week: number | null;
          days_per_week: number | null;
          equipment: string[];
          fitness_level: 'beginner' | 'intermediate' | 'advanced' | 'elite' | null;
          recent_activity: string | null;
          injuries: string | null;
          terra_user_id: string | null;
          terra_provider: string | null;
          subscription_status: 'trial' | 'active' | 'canceled' | 'past_due';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
          onboarding_completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          disciplines?: string[];
          goal_text?: string | null;
          goal_date?: string | null;
          hours_per_week?: number | null;
          days_per_week?: number | null;
          equipment?: string[];
          fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite' | null;
          recent_activity?: string | null;
          injuries?: string | null;
          terra_user_id?: string | null;
          terra_provider?: string | null;
          subscription_status?: 'trial' | 'active' | 'canceled' | 'past_due';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
          onboarding_completed_at?: string | null;
        };
        Update: {
          disciplines?: string[];
          goal_text?: string | null;
          goal_date?: string | null;
          hours_per_week?: number | null;
          days_per_week?: number | null;
          equipment?: string[];
          fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite' | null;
          recent_activity?: string | null;
          injuries?: string | null;
          terra_user_id?: string | null;
          terra_provider?: string | null;
          subscription_status?: 'trial' | 'active' | 'canceled' | 'past_due';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_ends_at?: string | null;
          onboarding_completed_at?: string | null;
        };
      };
      plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          discipline: string;
          goal: string;
          target_date: string | null;
          status: 'active' | 'completed' | 'abandoned' | 'paused';
          blocks: Json; // Full plan structure
          duration_weeks: number;
          current_week: number;
          weekly_hours: number | null;
          periodization_type: string | null;
          created_at: string;
          updated_at: string;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          discipline: string;
          goal: string;
          target_date?: string | null;
          status?: 'active' | 'completed' | 'abandoned' | 'paused';
          blocks: Json;
          duration_weeks: number;
          current_week?: number;
          weekly_hours?: number | null;
          periodization_type?: string | null;
          created_at?: string;
          updated_at?: string;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          name?: string;
          discipline?: string;
          goal?: string;
          target_date?: string | null;
          status?: 'active' | 'completed' | 'abandoned' | 'paused';
          blocks?: Json;
          duration_weeks?: number;
          current_week?: number;
          weekly_hours?: number | null;
          periodization_type?: string | null;
          completed_at?: string | null;
        };
      };
      workouts: {
        Row: {
          id: string;
          plan_id: string | null;
          user_id: string;
          scheduled_date: string;
          week_number: number | null;
          day_of_week: number | null;
          workout_type: string;
          title: string;
          description: string | null;
          instructions: Json | null;
          planned_duration: number | null;
          target_intensity: string | null;
          target_zones: Json | null;
          completed: boolean;
          completed_at: string | null;
          actual_duration: number | null;
          rpe: number | null;
          notes: string | null;
          watch_data: Json | null;
          was_adapted: boolean;
          adaptation_reason: string | null;
          original_workout: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id?: string | null;
          user_id: string;
          scheduled_date: string;
          week_number?: number | null;
          day_of_week?: number | null;
          workout_type: string;
          title: string;
          description?: string | null;
          instructions?: Json | null;
          planned_duration?: number | null;
          target_intensity?: string | null;
          target_zones?: Json | null;
          completed?: boolean;
          completed_at?: string | null;
          actual_duration?: number | null;
          rpe?: number | null;
          notes?: string | null;
          watch_data?: Json | null;
          was_adapted?: boolean;
          adaptation_reason?: string | null;
          original_workout?: Json | null;
        };
        Update: {
          scheduled_date?: string;
          week_number?: number | null;
          day_of_week?: number | null;
          workout_type?: string;
          title?: string;
          description?: string | null;
          instructions?: Json | null;
          planned_duration?: number | null;
          target_intensity?: string | null;
          target_zones?: Json | null;
          completed?: boolean;
          completed_at?: string | null;
          actual_duration?: number | null;
          rpe?: number | null;
          notes?: string | null;
          watch_data?: Json | null;
          was_adapted?: boolean;
          adaptation_reason?: string | null;
          original_workout?: Json | null;
        };
      };
      metrics: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          hrv: number | null;
          resting_hr: number | null;
          sleep_score: number | null;
          sleep_duration: number | null;
          sleep_efficiency: number | null;
          training_load: number | null;
          acute_load: number | null;
          chronic_load: number | null;
          load_ratio: number | null;
          recovery_score: number | null;
          strain_score: number | null;
          steps: number | null;
          active_calories: number | null;
          source: string | null;
          raw_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          hrv?: number | null;
          resting_hr?: number | null;
          sleep_score?: number | null;
          sleep_duration?: number | null;
          sleep_efficiency?: number | null;
          training_load?: number | null;
          acute_load?: number | null;
          chronic_load?: number | null;
          load_ratio?: number | null;
          recovery_score?: number | null;
          strain_score?: number | null;
          steps?: number | null;
          active_calories?: number | null;
          source?: string | null;
          raw_data?: Json | null;
        };
        Update: {
          date?: string;
          hrv?: number | null;
          resting_hr?: number | null;
          sleep_score?: number | null;
          sleep_duration?: number | null;
          sleep_efficiency?: number | null;
          training_load?: number | null;
          acute_load?: number | null;
          chronic_load?: number | null;
          load_ratio?: number | null;
          recovery_score?: number | null;
          strain_score?: number | null;
          steps?: number | null;
          active_calories?: number | null;
          source?: string | null;
          raw_data?: Json | null;
        };
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          context_snapshot: Json | null;
          plan_changes: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          context_snapshot?: Json | null;
          plan_changes?: Json | null;
        };
        Update: {
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          context_snapshot?: Json | null;
          plan_changes?: Json | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Plan = Database['public']['Tables']['plans']['Row'];
export type Workout = Database['public']['Tables']['workouts']['Row'];
export type Metric = Database['public']['Tables']['metrics']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_history']['Row'];
