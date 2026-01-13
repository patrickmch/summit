/**
 * Date formatting utilities using date-fns
 */

import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO } from 'date-fns';

/**
 * Format a date for display in headers
 * "Monday, January 13"
 */
export function formatDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE, MMMM d');
}

/**
 * Format a date as short day name
 * "Mon", "Tue", etc.
 */
export function formatDayShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEE');
}

/**
 * Format date as day number
 * "13", "14", etc.
 */
export function formatDayNumber(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd');
}

/**
 * Format date for API requests
 * "2025-01-13"
 */
export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get relative day label
 * "Today", "Tomorrow", "Yesterday", or the formatted date
 */
export function getRelativeDay(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE');
}

/**
 * Format relative time
 * "2 hours ago", "in 3 days"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Get the start of the week (Monday)
 */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Get the end of the week (Sunday)
 */
export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Navigate weeks
 */
export function navigateWeek(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
}

/**
 * Format duration in minutes to human readable
 * "45 min", "1 hr 30 min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}
