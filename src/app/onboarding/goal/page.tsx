'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { StepIndicator } from '@/components/onboarding';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

export default function GoalPage() {
  const router = useRouter();
  const { data, updateData, getStepNumber, totalSteps, loaded } = useOnboarding();
  const [goalText, setGoalText] = useState(data.goal_text);
  const [goalDate, setGoalDate] = useState(data.goal_date || '');

  const handleContinue = () => {
    updateData({
      goal_text: goalText,
      goal_date: goalDate || undefined,
    });
    router.push('/onboarding/schedule');
  };

  const handleBack = () => {
    router.push('/onboarding/discipline');
  };

  if (!loaded) return null;

  return (
    <div className="flex flex-col flex-1">
      <StepIndicator currentStep={getStepNumber('goal')} totalSteps={totalSteps} />

      <div className="flex-1 px-6">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          What&apos;s your main goal?
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Be specific — we&apos;ll build your plan around this
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your goal
            </label>
            <Textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g., Send my first V10, finish Leadville 100, summit Denali"
              rows={3}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Target date (optional)
            </label>
            <Input
              type="date"
              value={goalDate}
              onChange={(e) => setGoalDate(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Goal suggestions */}
        <div className="mt-6">
          <p className="text-micro text-slate-500 uppercase tracking-wide mb-2">
            Examples
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'Send a V8 boulder',
              'Complete a 50-mile ultra',
              'Ski the Haute Route',
              'Summit a 14er',
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setGoalText(suggestion)}
                className="px-3 py-1.5 bg-slate-800 text-slate-400 text-sm rounded-full hover:bg-slate-700 tap-highlight-none"
              >
                {suggestion}
              </button>
            ))}
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
          disabled={!goalText.trim()}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
