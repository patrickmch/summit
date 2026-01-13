'use client';

import { cn } from '@/lib/utils/cn';
import { formatDuration } from '@/lib/utils/date';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WorkoutBlock } from './WorkoutBlock';
import type { Workout, WorkoutType, Intensity } from '@/types/database';

interface WorkoutCardProps {
  workout: Workout | null;
  onStartWorkout?: () => void;
  onLogWorkout?: () => void;
  onModifyWorkout?: () => void;
}

export function WorkoutCard({
  workout,
  onStartWorkout,
  onLogWorkout,
  onModifyWorkout,
}: WorkoutCardProps) {
  // Rest day
  if (!workout || workout.workout_type === 'rest') {
    return <RestDayCard />;
  }

  // Already completed
  if (workout.completed) {
    return (
      <CompletedWorkoutCard
        workout={workout}
        onModifyWorkout={onModifyWorkout}
      />
    );
  }

  const { title, description, workout_type, planned_duration, target_intensity, instructions } = workout;

  // Group instructions into blocks based on focus/section
  // For now, treat all instructions as one block
  const hasInstructions = instructions && instructions.length > 0;

  return (
    <div className="px-4">
      <Card padding="none" className="overflow-hidden">
        {/* Header with workout type color bar */}
        <div className={cn(
          'h-1',
          getWorkoutTypeColor(workout_type)
        )} />

        <div className="p-4">
          <CardHeader className="mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <WorkoutTypeIcon type={workout_type} className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span className="text-caption text-[var(--color-text-muted)] capitalize">
                  {formatWorkoutType(workout_type)}
                </span>
              </div>
              <CardTitle>{title}</CardTitle>
            </div>
            <div className="text-right">
              {planned_duration && (
                <span className="text-caption font-medium text-[var(--color-text-secondary)]">
                  {formatDuration(planned_duration)}
                </span>
              )}
            </div>
          </CardHeader>

          {description && (
            <p className="text-caption text-[var(--color-text-secondary)] mb-4">
              {description}
            </p>
          )}

          {/* Workout blocks */}
          {hasInstructions && (
            <div className="space-y-2 mb-4">
              <WorkoutBlock
                title="Exercises"
                duration={planned_duration ?? undefined}
                intensity={target_intensity ?? undefined}
                instructions={instructions}
                defaultExpanded={false}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={onStartWorkout}
            >
              Start Workout
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onLogWorkout}
            >
              Log Manually
            </Button>
          </div>

          {/* Modify link */}
          {onModifyWorkout && (
            <button
              type="button"
              onClick={onModifyWorkout}
              className="w-full mt-3 text-center text-caption text-[var(--color-accent)] tap-highlight-none"
            >
              Modify today
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

function RestDayCard() {
  return (
    <div className="px-4">
      <Card className="text-center">
        <div className="py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center">
            <RestIcon className="w-6 h-6 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-title text-[var(--color-text-primary)] mb-2">Rest Day</h3>
          <p className="text-caption text-[var(--color-text-secondary)] max-w-xs mx-auto">
            Recovery is training. Stay off the wall, do some mobility if you want.
          </p>
        </div>
      </Card>
    </div>
  );
}

interface CompletedWorkoutCardProps {
  workout: Workout;
  onModifyWorkout?: () => void;
}

function CompletedWorkoutCard({ workout, onModifyWorkout }: CompletedWorkoutCardProps) {
  return (
    <div className="px-4">
      <Card className="relative overflow-hidden">
        {/* Completed badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-success-light)] text-emerald-700 text-micro font-medium">
            <CheckIcon className="w-3 h-3" />
            Done
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <WorkoutTypeIcon type={workout.workout_type} className="w-5 h-5 text-[var(--color-text-muted)]" />
          <div>
            <h3 className="text-title text-[var(--color-text-primary)]">{workout.title}</h3>
            <p className="text-caption text-[var(--color-text-muted)]">
              {workout.actual_duration ? formatDuration(workout.actual_duration) : 'Completed'}
              {workout.rpe && ` • RPE ${workout.rpe}`}
            </p>
          </div>
        </div>

        {workout.notes && (
          <p className="text-caption text-[var(--color-text-secondary)] italic">
            &quot;{workout.notes}&quot;
          </p>
        )}

        {onModifyWorkout && (
          <button
            type="button"
            onClick={onModifyWorkout}
            className="mt-3 text-caption text-[var(--color-accent)] tap-highlight-none"
          >
            Edit log
          </button>
        )}
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
  // Different icons based on workout type
  switch (type) {
    case 'strength':
    case 'power':
      return <DumbbellIcon className={className} />;
    case 'endurance':
    case 'running':
      return <RunIcon className={className} />;
    case 'climbing':
      return <MountainIcon className={className} />;
    case 'hiking':
      return <HikeIcon className={className} />;
    case 'recovery':
    case 'rest':
      return <RestIcon className={className} />;
    default:
      return <ActivityIcon className={className} />;
  }
}

// Icons
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

function HikeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function RestIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

export default WorkoutCard;
