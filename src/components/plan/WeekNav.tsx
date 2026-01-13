'use client';

import { cn } from '@/lib/utils/cn';

interface WeekNavProps {
  weekNumber: number;
  totalWeeks: number;
  phase: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export function WeekNav({
  weekNumber,
  totalWeeks,
  phase,
  onPrevWeek,
  onNextWeek,
  canGoPrev,
  canGoNext,
}: WeekNavProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <button
        type="button"
        onClick={onPrevWeek}
        disabled={!canGoPrev}
        className={cn(
          'p-2 -ml-2 rounded-lg tap-highlight-none transition-colors',
          canGoPrev
            ? 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
            : 'text-[var(--color-text-muted)] cursor-not-allowed'
        )}
        aria-label="Previous week"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      <div className="text-center">
        <p className="text-body font-semibold text-[var(--color-text-primary)]">
          Week {weekNumber} of {totalWeeks}
        </p>
        <p className="text-caption text-[var(--color-accent)]">
          {phase}
        </p>
      </div>

      <button
        type="button"
        onClick={onNextWeek}
        disabled={!canGoNext}
        className={cn(
          'p-2 -mr-2 rounded-lg tap-highlight-none transition-colors',
          canGoNext
            ? 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
            : 'text-[var(--color-text-muted)] cursor-not-allowed'
        )}
        aria-label="Next week"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default WeekNav;
