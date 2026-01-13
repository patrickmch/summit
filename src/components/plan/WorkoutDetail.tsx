'use client';

import { cn } from '@/lib/utils/cn';
import { formatDateFull, formatDuration, getRelativeDay } from '@/lib/utils/date';
import { Card, CardTitle } from '@/components/ui/Card';
import { WorkoutBlock } from '@/components/today/WorkoutBlock';
import type { Workout, WorkoutType } from '@/types/database';

interface WorkoutDetailProps {
  date: Date;
  workout: Workout | null;
  className?: string;
}

export function WorkoutDetail({ date, workout, className }: WorkoutDetailProps) {
  const relativeDay = getRelativeDay(date);
  const fullDate = formatDateFull(date);

  // Rest day or no workout
  if (!workout || workout.workout_type === 'rest') {
    return (
      <div className={cn('px-4', className)}>
        <Card>
          <div className="mb-4">
            <p className="text-caption text-[var(--color-accent)]">{relativeDay}</p>
            <h2 className="text-title text-[var(--color-text-primary)]">{fullDate}</h2>
          </div>

          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center">
              <RestIcon className="w-6 h-6 text-[var(--color-text-muted)]" />
            </div>
            <p className="text-body font-medium text-[var(--color-text-primary)]">
              Rest Day
            </p>
            <p className="text-caption text-[var(--color-text-secondary)] mt-1">
              Recovery is part of the plan
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const {
    title,
    description,
    workout_type,
    planned_duration,
    target_intensity,
    instructions,
    completed,
    actual_duration,
    rpe,
    notes,
  } = workout;

  return (
    <div className={cn('px-4', className)}>
      <Card padding="none">
        {/* Color bar based on workout type */}
        <div className={cn('h-1', getWorkoutTypeColor(workout_type))} />

        <div className="p-4">
          {/* Date header */}
          <div className="mb-4">
            <p className="text-caption text-[var(--color-accent)]">{relativeDay}</p>
            <h2 className="text-title text-[var(--color-text-primary)]">{fullDate}</h2>
          </div>

          {/* Workout info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <WorkoutTypeIcon type={workout_type} className="w-5 h-5 text-[var(--color-text-muted)]" />
              <div>
                <CardTitle>{title}</CardTitle>
                <p className="text-caption text-[var(--color-text-muted)] capitalize">
                  {formatWorkoutType(workout_type)}
                </p>
              </div>
            </div>
            <div className="text-right">
              {completed ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-success-light)] text-emerald-700 text-micro font-medium">
                  <CheckIcon className="w-3 h-3" />
                  Done
                </span>
              ) : (
                planned_duration && (
                  <span className="text-caption font-medium text-[var(--color-text-secondary)]">
                    {formatDuration(planned_duration)}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-caption text-[var(--color-text-secondary)] mb-4">
              {description}
            </p>
          )}

          {/* Completion details */}
          {completed && (actual_duration || rpe || notes) && (
            <div className="mb-4 p-3 bg-[var(--color-surface-secondary)] rounded-lg">
              <div className="flex gap-4 text-sm">
                {actual_duration && (
                  <div>
                    <span className="text-[var(--color-text-muted)]">Duration: </span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {formatDuration(actual_duration)}
                    </span>
                  </div>
                )}
                {rpe && (
                  <div>
                    <span className="text-[var(--color-text-muted)]">RPE: </span>
                    <span className="font-medium text-[var(--color-text-primary)]">{rpe}/10</span>
                  </div>
                )}
              </div>
              {notes && (
                <p className="text-caption text-[var(--color-text-secondary)] italic mt-2">
                  &quot;{notes}&quot;
                </p>
              )}
            </div>
          )}

          {/* Instructions/Blocks */}
          {instructions && instructions.length > 0 && (
            <div className="space-y-2">
              <WorkoutBlock
                title="Exercises"
                duration={planned_duration ?? undefined}
                intensity={target_intensity ?? undefined}
                instructions={instructions}
                defaultExpanded={true}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Helpers
function formatWorkoutType(type: WorkoutType): string {
  const labels: Record<WorkoutType, string> = {
    strength: 'Strength',
    endurance: 'Endurance',
    power: 'Power',
    technique: 'Technique',
    recovery: 'Recovery',
    rest: 'Rest',
    climbing: 'Climbing',
    running: 'Running',
    hiking: 'Hiking',
    cross_training: 'Cross Training',
  };
  return labels[type] || type;
}

function getWorkoutTypeColor(type: WorkoutType): string {
  const colors: Record<WorkoutType, string> = {
    strength: 'bg-indigo-400',
    endurance: 'bg-cyan-400',
    power: 'bg-orange-400',
    technique: 'bg-purple-400',
    recovery: 'bg-emerald-400',
    rest: 'bg-gray-300',
    climbing: 'bg-pink-400',
    running: 'bg-blue-400',
    hiking: 'bg-green-400',
    cross_training: 'bg-amber-400',
  };
  return colors[type] || 'bg-gray-400';
}

function WorkoutTypeIcon({ type, className }: { type: WorkoutType; className?: string }) {
  switch (type) {
    case 'strength':
    case 'power':
      return <DumbbellIcon className={className} />;
    case 'endurance':
    case 'running':
      return <RunIcon className={className} />;
    case 'climbing':
      return <MountainIcon className={className} />;
    default:
      return <ActivityIcon className={className} />;
  }
}

// Icons
function RestIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function DumbbellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  );
}

function RunIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

export default WorkoutDetail;
