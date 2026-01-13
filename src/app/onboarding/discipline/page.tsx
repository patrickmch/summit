'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { StepIndicator } from '@/components/onboarding';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { Discipline } from '@/types/database';

const DISCIPLINES: { value: Discipline; label: string; icon: string }[] = [
  { value: 'climbing', label: 'Climbing', icon: '🧗' },
  { value: 'ultra', label: 'Ultra Running', icon: '🏃' },
  { value: 'skimo', label: 'Ski Mountaineering', icon: '⛷️' },
  { value: 'mountaineering', label: 'Mountaineering', icon: '🏔️' },
  { value: 'trail_running', label: 'Trail Running', icon: '🥾' },
  { value: 'alpinism', label: 'Alpinism', icon: '🗻' },
];

export default function DisciplinePage() {
  const router = useRouter();
  const { data, updateData, getStepNumber, totalSteps, loaded } = useOnboarding();

  const toggleDiscipline = (discipline: Discipline) => {
    const current = data.disciplines;
    const updated = current.includes(discipline)
      ? current.filter((d) => d !== discipline)
      : [...current, discipline];
    updateData({ disciplines: updated });
  };

  const handleContinue = () => {
    router.push('/onboarding/goal');
  };

  if (!loaded) return null;

  return (
    <div className="flex flex-col flex-1">
      <StepIndicator currentStep={getStepNumber('discipline')} totalSteps={totalSteps} />

      <div className="flex-1 px-6">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          What do you train for?
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Select all that apply
        </p>

        <div className="grid grid-cols-2 gap-3">
          {DISCIPLINES.map(({ value, label, icon }) => {
            const isSelected = data.disciplines.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleDiscipline(value)}
                className={cn(
                  'flex flex-col items-center justify-center',
                  'p-4 rounded-2xl',
                  'transition-all duration-200',
                  'tap-highlight-none',
                  isSelected
                    ? 'bg-[var(--color-accent)] text-white scale-[1.02]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                )}
              >
                <span className="text-3xl mb-2">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        <Button
          className="w-full"
          onClick={handleContinue}
          disabled={data.disciplines.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
