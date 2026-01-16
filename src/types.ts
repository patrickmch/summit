
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
