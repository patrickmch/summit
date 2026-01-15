
export type Discipline = 'Climbing' | 'Ultra' | 'Skimo' | 'Mountaineering';

export interface UserProfile {
  name: string;
  email: string;
  discipline: Discipline[];
  goal: string;
  targetDate: string;
  daysPerWeek: number;
  hoursPerWeek: number;
  equipment: string[];
  watchConnected: boolean;
}

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
