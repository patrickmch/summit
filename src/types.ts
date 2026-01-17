
export type Sport = 'Trail Running' | 'Ultra Running' | 'Alpine Climbing' | 'Ski Mountaineering';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';

export interface UserProfile {
  name: string;
  email: string;
  // Physical
  heightCm: number;
  weightKg: number;
  age: number;
  // Sports & Experience
  sports: Sport[];
  experienceLevel: ExperienceLevel;
  athleticHistory: string;
  yearsTraining: number;
  // Goals
  primaryGoal: string;
  targetDate: string;
  // Schedule
  daysPerWeek: number;
  hoursPerWeek: number;
  // Equipment & Integrations
  equipment: string[];
  watchConnected: boolean;
}

// Keep Discipline as alias for backwards compatibility
export type Discipline = Sport;

export interface WorkoutBlock {
  title: string;
  duration: string;
  instructions: string;
  details?: string[];
}

export interface Workout {
  id: string;
  title: string;
  type: 'Strength' | 'Endurance' | 'Mobility' | 'Rest' | 'Technical';
  duration: string;
  phase: string;
  week: number;
  blocks: WorkoutBlock[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface MetricData {
  date: string;
  load: number;
  hrv: number;
  sleep: number;
  completed: boolean;
}

// ============================================
// Structured Training Plan Types
// ============================================

export type WorkoutType = 'Strength' | 'Endurance' | 'Mobility' | 'Rest' | 'Technical' | 'Recovery' | 'Tempo' | 'Intervals';
export type Intensity = 'Low' | 'Moderate' | 'High' | 'Max';

export interface PlannedWorkout {
  id: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  title: string;
  type: WorkoutType;
  duration: string;
  durationMinutes: number;
  intensity: Intensity;
  blocks: WorkoutBlock[];
}

export interface WeekPlan {
  weekNumber: number;
  phase: string;
  theme: string;
  workouts: PlannedWorkout[];
  coachNote?: string;
}

export interface Phase {
  name: string;
  weekStart: number;
  weekEnd: number;
  focus: string;
}

export interface StructuredPlan {
  overview: string;
  totalWeeks: number;
  phases: Phase[];
  weeks: WeekPlan[];
  markdownSummary: string;
}

// ============================================
// Workout Logging Types
// ============================================

export interface WorkoutLog {
  id: string;
  plannedWorkoutId: string;
  weekNumber: number;
  completedAt: Date;
  actualDurationMinutes: number;
  rpe: number; // Rate of Perceived Exertion 1-10
  notes: string;
  skipped: boolean;
}

export interface WeekSummary {
  weekNumber: number;
  completedWorkouts: number;
  totalWorkouts: number;
  totalMinutes: number;
  averageRpe: number;
  athleteNotes: string;
}

// ============================================
// Weekly Review Types
// ============================================

export interface PlanAdjustment {
  weekNumber: number;
  suggestedChanges: string;
  adjustedWeek?: WeekPlan;
  rationale: string;
}
