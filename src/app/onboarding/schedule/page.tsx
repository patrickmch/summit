'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { StepIndicator } from '@/components/onboarding';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

const DAYS_OPTIONS = [3, 4, 5, 6];
const HOURS_OPTIONS = [5, 8, 10, 12, 15];

export default function SchedulePage() {
  const router = useRouter();
  const { data, updateData, getStepNumber, totalSteps, loaded } = useOnboarding();

  const handleContinue = () => {
    router.push('/onboarding/equipment');
  };

  const handleBack = () => {
    router.push('/onboarding/goal');
  };

  if (!loaded) return null;

  return (
    <div className="flex flex-col flex-1">
      <StepIndicator currentStep={getStepNumber('schedule')} totalSteps={totalSteps} />

      <div className="flex-1 px-6">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          What&apos;s your schedule?
        </h1>
        <p className="text-slate-400 text-center mb-8">
          We&apos;ll fit your training into your life
        </p>

        {/* Days per week */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Training days per week
          </label>
          <div className="flex gap-2">
            {DAYS_OPTIONS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => updateData({ days_per_week: days })}
                className={cn(
                  'flex-1 py-3 rounded-xl font-medium transition-all',
                  'tap-highlight-none',
                  data.days_per_week === days
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                )}
              >
                {days}
              </button>
            ))}
          </div>
        </div>

        {/* Hours per week */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Hours per week available
          </label>
          <div className="flex gap-2 flex-wrap">
            {HOURS_OPTIONS.map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => updateData({ hours_per_week: hours })}
                className={cn(
                  'px-4 py-3 rounded-xl font-medium transition-all',
                  'tap-highlight-none',
                  data.hours_per_week === hours
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                )}
              >
                {hours} hrs
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-slate-800/50 rounded-xl">
          <p className="text-sm text-slate-400 text-center">
            Your plan will include <span className="text-white font-semibold">{data.days_per_week} training days</span>{' '}
            with roughly <span className="text-white font-semibold">{Math.round(data.hours_per_week / data.days_per_week * 10) / 10} hours</span> per session.
          </p>
        </div>
      </div>

      <div className="p-6 flex gap-3">
        <Button variant="ghost" onClick={handleBack} className="text-slate-300">
          Back
        </Button>
        <Button className="flex-1" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
