'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Discipline, FitnessLevel } from '@/types/database';

const STORAGE_KEY = 'summit_onboarding';

export interface OnboardingData {
  disciplines: Discipline[];
  goal_text: string;
  goal_date?: string;
  hours_per_week: number;
  days_per_week: number;
  equipment: string[];
  fitness_level: FitnessLevel;
}

const DEFAULT_DATA: OnboardingData = {
  disciplines: [],
  goal_text: '',
  hours_per_week: 8,
  days_per_week: 4,
  equipment: [],
  fitness_level: 'intermediate',
};

export const ONBOARDING_STEPS = ['discipline', 'goal', 'schedule', 'equipment', 'generating'] as const;
export type OnboardingStep = typeof ONBOARDING_STEPS[number];

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setData({ ...DEFAULT_DATA, ...parsed });
        } catch {
          // Invalid data, use defaults
        }
      }
      setLoaded(true);
    }
  }, []);

  // Save to sessionStorage whenever data changes
  useEffect(() => {
    if (loaded && typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, loaded]);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearData = useCallback(() => {
    setData(DEFAULT_DATA);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const getStepNumber = (step: OnboardingStep): number => {
    return ONBOARDING_STEPS.indexOf(step) + 1;
  };

  const getNextStep = (currentStep: OnboardingStep): OnboardingStep | null => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      return ONBOARDING_STEPS[currentIndex + 1];
    }
    return null;
  };

  const getPrevStep = (currentStep: OnboardingStep): OnboardingStep | null => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      return ONBOARDING_STEPS[currentIndex - 1];
    }
    return null;
  };

  return {
    data,
    loaded,
    updateData,
    clearData,
    getStepNumber,
    getNextStep,
    getPrevStep,
    totalSteps: ONBOARDING_STEPS.length,
  };
}

export default useOnboarding;
