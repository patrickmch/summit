'use client';

import { useState, useMemo } from 'react';
import { useWeek } from '@/hooks/useWeek';
import { PageShell } from '@/components/layout';
import { WeekNav, DayStrip, WorkoutDetail } from '@/components/plan';
import { Skeleton } from '@/components/ui/Skeleton';
import { addDays, isToday } from 'date-fns';
import type { Workout } from '@/types/database';

export default function PlanPage() {
  const { data, loading, weekStart, goToPrevWeek, goToNextWeek } = useWeek();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Generate days for the week
  const days = useMemo(() => {
    const result: { date: Date; workout: Workout | null }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const workout = data?.workouts.find((w) => {
        const workoutDate = new Date(w.scheduled_date);
        return workoutDate.toDateString() === date.toDateString();
      }) || null;

      result.push({ date, workout });
    }

    return result;
  }, [weekStart, data?.workouts]);

  // Get selected day's workout
  const selectedDayData = useMemo(() => {
    return days.find((d) => d.date.toDateString() === selectedDate.toDateString());
  }, [days, selectedDate]);

  // Calculate week info
  const weekNumber = data?.week_number || 1;
  const totalWeeks = 12; // TODO: Get from plan data
  const phase = data?.phase || 'Loading...';

  // Determine if we can navigate (basic bounds check)
  const canGoPrev = weekNumber > 1;
  const canGoNext = weekNumber < totalWeeks;

  return (
    <PageShell
      header={
        loading ? (
          <div className="px-4 py-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            <Skeleton variant="text" height={24} width="60%" className="mx-auto" />
            <Skeleton variant="text" height={16} width="40%" className="mx-auto mt-2" />
          </div>
        ) : (
          <WeekNav
            weekNumber={weekNumber}
            totalWeeks={totalWeeks}
            phase={phase}
            onPrevWeek={goToPrevWeek}
            onNextWeek={goToNextWeek}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
          />
        )
      }
    >
      {/* Day strip */}
      {loading ? (
        <div className="bg-[var(--color-surface-secondary)] py-3 px-4">
          <div className="flex gap-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={48} height={64} />
            ))}
          </div>
        </div>
      ) : (
        <DayStrip
          days={days}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      )}

      {/* Selected day detail */}
      <div className="py-4">
        {loading ? (
          <div className="px-4">
            <Skeleton variant="rectangular" height={200} />
          </div>
        ) : (
          <WorkoutDetail
            date={selectedDate}
            workout={selectedDayData?.workout || null}
          />
        )}
      </div>

      {/* Week summary stats */}
      {data && !loading && (
        <WeekSummary
          plannedHours={data.planned_hours}
          completedHours={data.completed_hours}
          completionRate={data.completion_rate}
        />
      )}
    </PageShell>
  );
}

interface WeekSummaryProps {
  plannedHours: number;
  completedHours: number;
  completionRate: number;
}

function WeekSummary({ plannedHours, completedHours, completionRate }: WeekSummaryProps) {
  return (
    <div className="px-4 pb-4">
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
        <h3 className="text-caption font-medium text-[var(--color-text-muted)] mb-3">
          Week Summary
        </h3>
        <div className="flex justify-between">
          <div>
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
              {completedHours.toFixed(1)} / {plannedHours.toFixed(1)} hrs
            </p>
            <p className="text-caption text-[var(--color-text-muted)]">
              Training volume
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-[var(--color-success)]">
              {Math.round(completionRate * 100)}%
            </p>
            <p className="text-caption text-[var(--color-text-muted)]">
              Completion
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-[var(--color-surface-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-success)] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(completionRate * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
