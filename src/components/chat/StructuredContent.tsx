'use client';

import { cn } from '@/lib/utils/cn';
import type { PlanChange } from '@/types/database';

interface StructuredContentProps {
  planChanges: PlanChange[];
}

export function StructuredContent({ planChanges }: StructuredContentProps) {
  return (
    <div className="space-y-2">
      {planChanges.map((change, index) => (
        <PlanChangeCard key={index} change={change} />
      ))}
    </div>
  );
}

interface PlanChangeCardProps {
  change: PlanChange;
}

function PlanChangeCard({ change }: PlanChangeCardProps) {
  const { type, description } = change;

  const typeConfig = getTypeConfig(type);

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg',
      'bg-[var(--color-surface-secondary)]'
    )}>
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
        typeConfig.bgColor
      )}>
        {typeConfig.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-micro font-medium',
          typeConfig.textColor
        )}>
          {typeConfig.label}
        </p>
        <p className="text-caption text-[var(--color-text-primary)] mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

function getTypeConfig(type: PlanChange['type']) {
  switch (type) {
    case 'workout_modified':
      return {
        label: 'Workout Modified',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        icon: <EditIcon className="w-4 h-4 text-blue-600" />,
      };
    case 'workout_added':
      return {
        label: 'Workout Added',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-700',
        icon: <PlusIcon className="w-4 h-4 text-emerald-600" />,
      };
    case 'workout_removed':
      return {
        label: 'Workout Removed',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
        icon: <MinusIcon className="w-4 h-4 text-amber-600" />,
      };
    case 'plan_adjusted':
      return {
        label: 'Plan Adjusted',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        icon: <AdjustIcon className="w-4 h-4 text-purple-600" />,
      };
    default:
      return {
        label: 'Change',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        icon: <InfoIcon className="w-4 h-4 text-gray-600" />,
      };
  }
}

// Icons
function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

function AdjustIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}

export default StructuredContent;
