import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, StructuredPlan } from '../types';

export interface TrainingPlan {
  structured: StructuredPlan;
  generatedAt: Date;
  planStartDate: Date; // Monday of Week 1
}

interface AuthState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  hasAcceptedPlan: boolean;
  user: Partial<UserProfile> | null;
  currentPlan: TrainingPlan | null;
}

interface AuthContextType extends AuthState {
  signUp: (email: string) => void;
  signIn: (email: string) => void;
  signOut: () => void;
  completeOnboarding: (profile: Partial<UserProfile>) => void;
  acceptPlan: (plan: TrainingPlan) => void;
  devLogin: () => void; // Skip straight to plan review with test profile
}

const AUTH_STORAGE_KEY = 'summit_auth';

const defaultState: AuthState = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  hasAcceptedPlan: false,
  user: null,
  currentPlan: null,
};

// Dev seed profile for rapid testing
const DEV_PROFILE: Partial<UserProfile> = {
  name: 'Dev User',
  email: 'dev@summit.coach',
  // Physical - 6'7", 230 lbs
  heightCm: 201,
  weightKg: 104,
  age: 32,
  // Sports & Experience
  sports: ['Alpine Climbing'],
  experienceLevel: 'Advanced',
  athleticHistory: '3-4 years of formal athletic training with a long history of climbing and mountaineering. Looking to lose some weight to make climbing easier while maintaining overall fitness.',
  yearsTraining: 4,
  // Goals
  primaryGoal: 'Solo aid climb of El Capitan in November 2026. Secondary goals: improve general climbing fitness, backcountry skiing this spring, and summer alpine objectives.',
  targetDate: '2026-11-01',
  // Schedule
  daysPerWeek: 5,
  hoursPerWeek: 12,
  // Equipment
  equipment: ['Home gym', 'Climbing gear', 'Ski touring setup'],
  watchConnected: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  // Persist to localStorage on changes
  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const signUp = (email: string) => {
    setState({
      isAuthenticated: true,
      hasCompletedOnboarding: false,
      hasAcceptedPlan: false,
      user: { email },
      currentPlan: null,
    });
  };

  const signIn = (email: string) => {
    // For demo, just set authenticated
    // In real app, would validate credentials
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      user: { ...prev.user, email },
    }));
  };

  const signOut = () => {
    setState(defaultState);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const completeOnboarding = (profile: Partial<UserProfile>) => {
    setState(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
      user: { ...prev.user, ...profile },
    }));
  };

  const acceptPlan = (plan: TrainingPlan) => {
    setState(prev => ({
      ...prev,
      hasAcceptedPlan: true,
      currentPlan: plan,
    }));
  };

  // Dev login: skip onboarding with pre-filled profile, go to plan review
  const devLogin = () => {
    setState({
      isAuthenticated: true,
      hasCompletedOnboarding: true,
      hasAcceptedPlan: false, // Go to plan review, not dashboard
      user: DEV_PROFILE,
      currentPlan: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        completeOnboarding,
        acceptPlan,
        devLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
