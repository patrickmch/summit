'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { StepIndicator } from '@/components/onboarding';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { FitnessLevel } from '@/types/database';

const EQUIPMENT_OPTIONS = [
  { value: 'hangboard', label: 'Hangboard', icon: '🪨' },
  { value: 'home_gym', label: 'Home Gym', icon: '🏠' },
  { value: 'climbing_gym', label: 'Climbing Gym', icon: '🧗' },
  { value: 'full_gym', label: 'Full Gym', icon: '🏋️' },
  { value: 'outdoor', label: 'Just Outdoors', icon: '🌲' },
];

const FITNESS_LEVELS: { value: FitnessLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to structured training' },
  { value: 'intermediate', label: 'Intermediate', description: '1-3 years of training' },
  { value: 'advanced', label: 'Advanced', description: '3+ years, solid base' },
  { value: 'elite', label: 'Elite', description: 'Competitive level' },
];

export default function EquipmentPage() {
  const router = useRouter();
  const { data, updateData, getStepNumber, totalSteps, loaded } = useOnboarding();

  const toggleEquipment = (equipment: string) => {
    const current = data.equipment;
    const updated = current.includes(equipment)
      ? current.filter((e) => e !== equipment)
      : [...current, equipment];
    updateData({ equipment: updated });
  };

  const handleContinue = () => {
    router.push('/onboarding/generating');
  };

  const handleBack = () => {
    router.push('/onboarding/schedule');
  };

  if (!loaded) return null;

  return (
    <div className="flex flex-col flex-1">
      <StepIndicator currentStep={getStepNumber('equipment')} totalSteps={totalSteps} />

      <div className="flex-1 px-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          What do you have access to?
        </h1>
        <p className="text-slate-400 text-center mb-6">
          We&apos;ll tailor workouts to your equipment
        </p>

        {/* Equipment */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Equipment & facilities
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT_OPTIONS.map(({ value, label, icon }) => {
              const isSelected = data.equipment.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleEquipment(value)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl transition-all',
                    'tap-highlight-none text-left',
                    isSelected
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  )}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fitness Level */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Current fitness level
          </label>
          <div className="space-y-2">
            {FITNESS_LEVELS.map(({ value, label, description }) => {
              const isSelected = data.fitness_level === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateData({ fitness_level: value })}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-xl transition-all',
                    'tap-highlight-none text-left',
                    isSelected
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  )}
                >
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className={cn(
                      'text-sm',
                      isSelected ? 'text-white/70' : 'text-slate-500'
                    )}>
                      {description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckIcon className="w-5 h-5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6 flex gap-3">
        <Button variant="ghost" onClick={handleBack} className="text-slate-300">
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={handleContinue}
          disabled={data.equipment.length === 0}
        >
          Generate Plan
        </Button>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
