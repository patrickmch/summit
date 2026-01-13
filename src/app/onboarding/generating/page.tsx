'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';
import type { ProfileInput, PlanGenerationRequest } from '@/types/database';

const LOADING_MESSAGES = [
  'Analyzing your goals...',
  'Building your periodization...',
  'Optimizing training load...',
  'Balancing intensity zones...',
  'Customizing workouts...',
  'Finalizing your plan...',
];

export default function GeneratingPage() {
  const router = useRouter();
  const { data, clearData, loaded } = useOnboarding();
  const { refreshProfile } = useAuth();
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Generate plan on mount
  useEffect(() => {
    if (!loaded || isGenerating) return;

    const generatePlan = async () => {
      setIsGenerating(true);
      setError(null);

      try {
        // First, create/update the profile
        const profileData: ProfileInput = {
          disciplines: data.disciplines,
          goal_text: data.goal_text,
          goal_date: data.goal_date,
          hours_per_week: data.hours_per_week,
          days_per_week: data.days_per_week,
          equipment: data.equipment,
          fitness_level: data.fitness_level,
        };

        await apiPost('/profiles', profileData);

        // Then, generate the training plan
        const planRequest: PlanGenerationRequest = {
          discipline: data.disciplines[0], // Primary discipline
          goal_text: data.goal_text,
          goal_date: data.goal_date,
          hours_per_week: data.hours_per_week,
          days_per_week: data.days_per_week,
          equipment: data.equipment,
          fitness_level: data.fitness_level,
        };

        await apiPost('/plans/generate', planRequest);

        // Refresh profile to get onboarding_completed_at
        await refreshProfile();

        // Clear onboarding data
        clearData();

        // Navigate to the app
        router.replace('/today');
      } catch (err) {
        console.error('Failed to generate plan:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate your plan. Please try again.');
        setIsGenerating(false);
      }
    };

    generatePlan();
  }, [loaded, isGenerating, data, router, clearData, refreshProfile]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
          <ExclamationIcon className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-white text-center mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-400 text-center mb-8">
          {error}
        </p>
        <button
          onClick={() => {
            setError(null);
            setIsGenerating(false);
          }}
          className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-xl font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* Animated logo */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-[var(--color-accent)]/20 flex items-center justify-center">
          <MountainIcon className="w-12 h-12 text-[var(--color-accent)]" />
        </div>
        {/* Spinning ring */}
        <div className="absolute inset-0 -m-2">
          <div className="w-[calc(100%+16px)] h-[calc(100%+16px)] rounded-[28px] border-2 border-transparent border-t-[var(--color-accent)] animate-spin" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white text-center mb-2">
        Building your plan
      </h1>

      {/* Animated message */}
      <p
        key={messageIndex}
        className={cn(
          'text-slate-400 text-center animate-fade-in'
        )}
      >
        {LOADING_MESSAGES[messageIndex]}
      </p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

function ExclamationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
  );
}
