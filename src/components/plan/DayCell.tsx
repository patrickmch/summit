'use client';

import { cn } from '@/lib/utils/cn';
import { formatDayShort, formatDayNumber } from '@/lib/utils/date';
import type { Workout } from '@/types/database';

type DayStatus = 'completed' | 'today' | 'scheduled' | 'rest' | 'future';

interface DayCellProps {
  date: Date;
  workout: Workout | null;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}

export function DayCell({ date, workout, isSelected, isToday, onClick }: DayCellProps) {
  const status = getDayStatus(workout, isToday);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center',
        'w-12 h-16 rounded-xl',
        'tap-highlight-none transition-all duration-150',
        // Selected state
        isSelected
          ? 'bg-[var(--color-accent)] text-white shadow-lg scale-105'
          : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-secondary)]',
        // Today indicator ring
        isToday && !isSelected && 'ring-2 ring-[var(--color-accent)]'
      )}
    >
      {/* Day name */}
      <span className={cn(
        'text-micro uppercase',
        isSelected ? 'text-white/80' : 'text-[var(--color-text-muted)]'
      )}>
        {formatDayShort(date)}
      </span>

      {/* Day number */}
      <span className={cn(
        'text-lg font-semibold mt-0.5',
        isSelected
          ? 'text-white'
          : isToday
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-text-primary)]'
      )}>
        {formatDayNumber(date)}
      </span>

      {/* Status indicator */}
      <StatusIndicator status={status} isSelected={isSelected} />
    </button>
  );
}

interface StatusIndicatorProps {
  status: DayStatus;
  isSelected: boolean;
}

function StatusIndicator({ status, isSelected }: StatusIndicatorProps) {
  const baseClasses = 'w-1.5 h-1.5 rounded-full mt-1';

  switch (status) {
    case 'completed':
      return (
        <div className={cn(
          baseClasses,
          isSelected ? 'bg-white' : 'bg-[var(--color-success)]'
        )} />
      );
    case 'today':
      return (
        <div className={cn(
          baseClasses,
          isSelected ? 'bg-white' : 'bg-[var(--color-accent)]'
        )} />
      );
    case 'scheduled':
      return (
        <div className={cn(
          baseClasses,
          'border-2',
          isSelected ? 'border-white bg-transparent' : 'border-slate-400 bg-transparent'
        )} />
      );
    case 'rest':
      return (
        <div className={cn(
          'w-3 h-0.5 rounded-full mt-1.5',
          isSelected ? 'bg-white/60' : 'bg-[var(--color-text-muted)]'
        )} />
      );
    case 'future':
      return (
        <div className={cn(
          baseClasses,
          isSelected ? 'bg-white/40' : 'bg-[var(--color-border)]'
        )} />
      );
  }
}

function getDayStatus(workout: Workout | null, isToday: boolean): DayStatus {
  if (!workout) {
    return isToday ? 'today' : 'future';
  }

  if (workout.completed) {
    return 'completed';
  }

  if (workout.workout_type === 'rest') {
    return 'rest';
  }

  if (isToday) {
    return 'today';
  }

  return 'scheduled';
}

export default DayCell;
