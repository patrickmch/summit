'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatDuration } from '@/lib/utils/date';
import type { WorkoutInstruction, Intensity } from '@/types/database';

interface WorkoutBlockProps {
  title: string;
  duration?: number;
  intensity?: Intensity;
  instructions?: WorkoutInstruction[];
  isExpandable?: boolean;
  defaultExpanded?: boolean;
}

export function WorkoutBlock({
  title,
  duration,
  intensity,
  instructions,
  isExpandable = true,
  defaultExpanded = false,
}: WorkoutBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const hasDetails = instructions && instructions.length > 0;
  const canExpand = isExpandable && hasDetails;

  return (
    <div
      className={cn(
        'bg-[var(--color-surface-secondary)] rounded-lg overflow-hidden',
        'border border-[var(--color-border-light)]',
        'transition-all duration-200'
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => canExpand && setIsExpanded(!isExpanded)}
        disabled={!canExpand}
        className={cn(
          'w-full flex items-center justify-between p-3',
          'text-left tap-highlight-none',
          canExpand && 'cursor-pointer hover:bg-[var(--color-border-light)]'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {canExpand && (
            <ChevronIcon
              className={cn(
                'w-4 h-4 text-[var(--color-text-muted)] transition-transform flex-shrink-0',
                isExpanded && 'rotate-90'
              )}
            />
          )}
          <span className="text-body font-medium text-[var(--color-text-primary)] truncate">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {intensity && (
            <IntensityBadge intensity={intensity} />
          )}
          {duration && (
            <span className="text-caption text-[var(--color-text-muted)]">
              {formatDuration(duration)}
            </span>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && hasDetails && (
        <div className="px-3 pb-3 pt-0 border-t border-[var(--color-border-light)]">
          <ul className="space-y-2 mt-3">
            {instructions.map((instruction, index) => (
              <InstructionItem key={index} instruction={instruction} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface InstructionItemProps {
  instruction: WorkoutInstruction;
}

function InstructionItem({ instruction }: InstructionItemProps) {
  const detailParts: string[] = [];

  if (instruction.sets && instruction.reps) {
    detailParts.push(`${instruction.sets}×${instruction.reps}`);
  } else if (instruction.duration) {
    detailParts.push(formatDuration(instruction.duration));
  }

  if (instruction.rest) {
    detailParts.push(`${instruction.rest}s rest`);
  }

  return (
    <li className="flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] mt-2 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-caption text-[var(--color-text-primary)]">
            {instruction.exercise}
          </span>
          {detailParts.length > 0 && (
            <span className="text-micro text-[var(--color-text-muted)] flex-shrink-0">
              {detailParts.join(' • ')}
            </span>
          )}
        </div>
        {instruction.notes && (
          <p className="text-micro text-[var(--color-text-muted)] mt-0.5">
            {instruction.notes}
          </p>
        )}
      </div>
    </li>
  );
}

interface IntensityBadgeProps {
  intensity: Intensity;
}

function IntensityBadge({ intensity }: IntensityBadgeProps) {
  const styles: Record<Intensity, string> = {
    easy: 'bg-[var(--color-intensity-easy)] text-emerald-800',
    moderate: 'bg-[var(--color-intensity-moderate)] text-amber-800',
    hard: 'bg-[var(--color-intensity-hard)] text-orange-800',
    max: 'bg-[var(--color-intensity-max)] text-red-800',
  };

  const labels: Record<Intensity, string> = {
    easy: 'Easy',
    moderate: 'Mod',
    hard: 'Hard',
    max: 'Max',
  };

  return (
    <span className={cn(
      'px-1.5 py-0.5 rounded text-micro font-medium',
      styles[intensity]
    )}>
      {labels[intensity]}
    </span>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default WorkoutBlock;
