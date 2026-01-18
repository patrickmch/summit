import { differenceInDays, startOfDay, getDay, nextMonday, addDays, isBefore, isAfter, isSameDay } from 'date-fns';
import { WeekPlan, PlannedWorkout, WorkoutLog, Phase, StructuredPlan } from '../types';

/**
 * Calculate the current week number based on plan start date.
 * Week 1 starts on planStartDate (should be a Monday).
 * Returns 0 if before plan start.
 */
export function getCurrentWeek(planStartDate: Date): number {
  const today = startOfDay(new Date());
  const start = startOfDay(new Date(planStartDate));

  if (isBefore(today, start)) {
    return 0; // Plan hasn't started yet
  }

  const daysDiff = differenceInDays(today, start);
  return Math.floor(daysDiff / 7) + 1;
}

/**
 * Get today's scheduled workout from a week plan.
 * Returns null if no workout scheduled for today.
 */
export function getTodayWorkout(weekPlan: WeekPlan): PlannedWorkout | null {
  const today = getDay(new Date()); // 0=Sun, 1=Mon, ..., 6=Sat

  return weekPlan.workouts.find(w => w.dayOfWeek === today) || null;
}

/**
 * Get workout scheduled for a specific day of the week.
 */
export function getWorkoutForDay(weekPlan: WeekPlan, dayOfWeek: number): PlannedWorkout | null {
  return weekPlan.workouts.find(w => w.dayOfWeek === dayOfWeek) || null;
}

/**
 * Calculate week progress (completed vs total workouts).
 */
export function getWeekProgress(
  weekPlan: WeekPlan,
  logs: WorkoutLog[]
): { completed: number; total: number; percentage: number } {
  const weekLogs = logs.filter(l => l.weekNumber === weekPlan.weekNumber);
  const completedLogs = weekLogs.filter(l => !l.skipped);

  const total = weekPlan.workouts.length;
  const completed = completedLogs.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

/**
 * Check if a workout has been completed.
 */
export function isWorkoutCompleted(workoutId: string, logs: WorkoutLog[]): boolean {
  const log = logs.find(l => l.plannedWorkoutId === workoutId);
  return log ? !log.skipped : false;
}

/**
 * Check if a workout was skipped.
 */
export function isWorkoutSkipped(workoutId: string, logs: WorkoutLog[]): boolean {
  const log = logs.find(l => l.plannedWorkoutId === workoutId);
  return log?.skipped || false;
}

/**
 * Get the next Monday (for setting plan start date).
 */
export function getNextMonday(): Date {
  const today = new Date();
  const todayDow = getDay(today);

  // If today is Monday, return today
  if (todayDow === 1) {
    return startOfDay(today);
  }

  return startOfDay(nextMonday(today));
}

/**
 * Get all days of the current week with their dates.
 * Starts from Monday.
 */
export function getWeekDays(planStartDate: Date, weekNumber: number): { dayOfWeek: number; date: Date; dayName: string }[] {
  const start = startOfDay(new Date(planStartDate));
  const weekStart = addDays(start, (weekNumber - 1) * 7);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return dayNames.map((dayName, index) => ({
    dayOfWeek: index === 6 ? 0 : index + 1, // Convert to JS day (0=Sun, 1=Mon...)
    date: addDays(weekStart, index),
    dayName,
  }));
}

/**
 * Check if we should show the weekly review prompt.
 * Shows 24 hours before the next week starts (i.e., Sunday evening).
 */
export function shouldShowWeeklyReview(planStartDate: Date, currentWeek: number, totalWeeks: number): boolean {
  if (currentWeek >= totalWeeks) {
    return false; // Plan is finished
  }

  const today = new Date();
  const start = startOfDay(new Date(planStartDate));
  const nextWeekStart = addDays(start, currentWeek * 7); // Monday of next week
  const reviewWindowStart = addDays(nextWeekStart, -1); // Sunday before

  // Show review from Sunday 00:00 until Monday 00:00
  return isAfter(today, reviewWindowStart) && isBefore(today, nextWeekStart);
}

/**
 * Get date for a specific day within a week.
 */
export function getDateForDay(planStartDate: Date, weekNumber: number, dayOfWeek: number): Date {
  const start = startOfDay(new Date(planStartDate));
  const weekStart = addDays(start, (weekNumber - 1) * 7);

  // Convert dayOfWeek (0=Sun) to offset from Monday
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return addDays(weekStart, offset);
}

/**
 * Check if a specific date is today.
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a workout date is in the past (and thus can be logged).
 */
export function canLogWorkout(planStartDate: Date, weekNumber: number, dayOfWeek: number): boolean {
  const workoutDate = getDateForDay(planStartDate, weekNumber, dayOfWeek);
  const today = startOfDay(new Date());

  // Can log if the workout date is today or in the past
  return !isAfter(workoutDate, today);
}

/**
 * Get the phase info for a specific week number.
 */
export function getPhaseForWeek(plan: StructuredPlan, weekNumber: number): Phase | null {
  return plan.phases.find(p => weekNumber >= p.weekStart && weekNumber <= p.weekEnd) || null;
}

/**
 * Check if the given week number is the current week.
 */
export function isCurrentWeek(planStartDate: Date, weekNumber: number): boolean {
  const currentWeek = getCurrentWeek(planStartDate);
  return currentWeek === weekNumber;
}

/**
 * Check if the given week number is in the past.
 */
export function isPastWeek(planStartDate: Date, weekNumber: number): boolean {
  const currentWeek = getCurrentWeek(planStartDate);
  return weekNumber < currentWeek;
}

/**
 * Check if the given week number is in the future.
 */
export function isFutureWeek(planStartDate: Date, weekNumber: number): boolean {
  const currentWeek = getCurrentWeek(planStartDate);
  return weekNumber > currentWeek;
}
