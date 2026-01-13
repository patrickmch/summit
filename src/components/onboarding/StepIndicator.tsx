'use client';

import { cn } from '@/lib/utils/cn';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div
            key={index}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              isCurrent ? 'w-8 bg-[var(--color-accent)]' : 'w-1.5',
              isCompleted ? 'bg-[var(--color-success)]' : !isCurrent && 'bg-[var(--color-border)]'
            )}
          />
        );
      })}
    </div>
  );
}

export default StepIndicator;
