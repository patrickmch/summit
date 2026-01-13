/**
 * Summit Database Types
 * These types mirror the Supabase schema and provide type safety across the app
 */

// ============================================
// ENUMS
// ============================================

export type Discipline = 'climbing' | 'ultra' | 'skimo' | 'mountaineering' | 'trail_running' | 'alpinism';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export type PlanStatus = 'active' | 'completed' | 'abandoned' | 'paused';

export type WorkoutType = 'strength' | 'endurance' | 'power' | 'technique' | 'recovery' | 'rest' | 'climbing' | 'running' | 'hiking' | 'cross_training';

export type Intensity = 'easy' | 'moderate' | 'hard' | 'max';

export type SubscriptionStatus = 'trial' | 'active' | 'canceled' | 'past_due';

export type MetricSource = 'garmin' | 'apple' | 'whoop' | 'coros' | 'manual';

export type MessageRole = 'user' | 'assistant' | 'system';

// ============================================
// PROFILE
// ============================================

export interface Profile {
  id: string;
  user_id: string;

  // Core training info
  disciplines: Discipline[];
  goal_text: string | null;
  goal_date: string | null; // ISO date string
  hours_per_week: number | null;
  days_per_week: number | null;
  equipment: string[];

  // Fitness baseline
  fitness_level: FitnessLevel | null;
  recent_activity: string | null;
  injuries: string | null;

  // Terra integration
  terra_user_id: string | null;
  terra_provider: string | null;

  // Subscription
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  onboarding_completed_at: string | null;
}

export interface ProfileInput {
  disciplines: Discipline[];
  goal_text: string;
  goal_date?: string;
  hours_per_week: number;
  days_per_week: number;
  equipment: string[];
  fitness_level: FitnessLevel;
  recent_activity?: string;
  injuries?: string;
}

// ============================================
// PLAN STRUCTURES
// ============================================

export interface WorkoutInstruction {
  exercise: string;
  sets?: number;
  reps?: string; // Can be "5" or "5-8" or "AMRAP"
  duration?: number; // minutes
  rest?: number; // seconds
  notes?: string;
  intensity?: Intensity;
}

export interface PlannedWorkout {
  id: string;
  day_of_week: number; // 0-6, Sunday = 0
  workout_type: WorkoutType;
  title: string;
  description: string;
  instructions: WorkoutInstruction[];
  duration: number; // minutes
  intensity: Intensity;
  focus?: string; // e.g., "finger strength", "aerobic base"
}

export interface TrainingDay {
  date: string; // ISO date
  day_of_week: number;
  workouts: PlannedWorkout[];
  is_rest_day: boolean;
  notes?: string;
}

export interface TrainingWeek {
  week_number: number;
  phase: string; // e.g., "Base", "Build", "Peak", "Taper"
  focus: string;
  volume_target: number; // hours
  intensity_distribution: {
    easy: number; // percentage
    moderate: number;
    hard: number;
  };
  days: TrainingDay[];
  notes?: string;
}

export interface TrainingBlock {
  name: string;
  weeks: TrainingWeek[];
  total_weeks: number;
  periodization_type: 'linear' | 'block' | 'undulating';
  goal_summary: string;
}

// ============================================
// PLAN
// ============================================

export interface Plan {
  id: string;
  user_id: string;

  // Plan metadata
  name: string;
  discipline: Discipline;
  goal: string;
  target_date: string | null;

  // Status
  status: PlanStatus;

  // The full plan structure
  blocks: TrainingBlock;

  // Duration
  duration_weeks: number;
  current_week: number;

  // Parameters
  weekly_hours: number | null;
  periodization_type: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface PlanGenerationRequest {
  discipline: Discipline;
  goal_text: string;
  goal_date?: string;
  hours_per_week: number;
  days_per_week: number;
  equipment: string[];
  fitness_level: FitnessLevel;
  recent_activity?: string;
  injuries?: string;
}

// ============================================
// WORKOUT
// ============================================

export interface Workout {
  id: string;
  plan_id: string | null;
  user_id: string;

  // Scheduling
  scheduled_date: string;
  week_number: number | null;
  day_of_week: number | null;

  // Details
  workout_type: WorkoutType;
  title: string;
  description: string | null;
  instructions: WorkoutInstruction[] | null;

  // Targets
  planned_duration: number | null;
  target_intensity: Intensity | null;
  target_zones: Record<string, unknown> | null;

  // Completion
  completed: boolean;
  completed_at: string | null;
  actual_duration: number | null;
  rpe: number | null;
  notes: string | null;

  // Watch data
  watch_data: Record<string, unknown> | null;

  // Adaptation
  was_adapted: boolean;
  adaptation_reason: string | null;
  original_workout: PlannedWorkout | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface WorkoutLogInput {
  completed: boolean;
  actual_duration?: number;
  rpe?: number;
  notes?: string;
}

// ============================================
// METRICS
// ============================================

export interface Metrics {
  id: string;
  user_id: string;
  date: string;

  // Recovery
  hrv: number | null;
  resting_hr: number | null;
  sleep_score: number | null;
  sleep_duration: number | null;
  sleep_efficiency: number | null;

  // Training load
  training_load: number | null;
  acute_load: number | null;
  chronic_load: number | null;
  load_ratio: number | null;

  // Readiness
  recovery_score: number | null;
  strain_score: number | null;

  // Activity
  steps: number | null;
  active_calories: number | null;

  // Source
  source: MetricSource | null;
  raw_data: Record<string, unknown> | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================
// CHAT
// ============================================

export interface ChatMessage {
  id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  context_snapshot: Record<string, unknown> | null;
  plan_changes: PlanChange[] | null;
  created_at: string;
}

export interface PlanChange {
  type: 'workout_modified' | 'workout_added' | 'workout_removed' | 'plan_adjusted';
  workout_id?: string;
  description: string;
  before?: Partial<Workout>;
  after?: Partial<Workout>;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
  plan_changes?: PlanChange[];
}

// ============================================
// API RESPONSES
// ============================================

export interface TodayResponse {
  date: string;
  workout: Workout | null;
  metrics: Metrics | null;
  streak: number;
  message?: string; // AI-generated motivation or advice
}

export interface WeekResponse {
  week_number: number;
  phase: string;
  workouts: Workout[];
  planned_hours: number;
  completed_hours: number;
  completion_rate: number;
}
