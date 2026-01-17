import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, StructuredPlan } from '../types';
import type { Profile, Plan } from '../lib/database.types';

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
  isLoading: boolean; // New: for async auth operations
  supabaseUser: User | null; // The raw Supabase auth user
}

interface AuthContextType extends AuthState {
  // Auth methods
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  // Legacy methods (localStorage fallback)
  signUp: (email: string) => void;
  signIn: (email: string) => void;
  // Profile & plan methods
  completeOnboarding: (profile: Partial<UserProfile>) => void;
  acceptPlan: (plan: TrainingPlan) => void;
  devLogin: () => void;
}

const AUTH_STORAGE_KEY = 'summit_auth';

const defaultState: AuthState = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  hasAcceptedPlan: false,
  user: null,
  currentPlan: null,
  isLoading: true,
  supabaseUser: null,
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

// Convert Supabase profile row to UserProfile
const profileRowToUserProfile = (row: Profile, email?: string): Partial<UserProfile> => ({
  email,
  primaryGoal: row.goal_text || undefined,
  athleticHistory: row.recent_activity || undefined,
  sports: row.disciplines as UserProfile['sports'],
  hoursPerWeek: row.hours_per_week || undefined,
  daysPerWeek: row.days_per_week || undefined,
  equipment: row.equipment,
  experienceLevel: row.fitness_level === 'beginner' ? 'Beginner'
    : row.fitness_level === 'intermediate' ? 'Intermediate'
    : row.fitness_level === 'advanced' ? 'Advanced'
    : row.fitness_level === 'elite' ? 'Elite'
    : undefined,
});

// Convert UserProfile to Supabase profile insert
const userProfileToInsert = (profile: Partial<UserProfile>, userId: string) => ({
  user_id: userId,
  disciplines: profile.sports || [],
  goal_text: profile.primaryGoal || null,
  goal_date: profile.targetDate || null,
  hours_per_week: profile.hoursPerWeek || null,
  days_per_week: profile.daysPerWeek || null,
  equipment: profile.equipment || [],
  fitness_level: profile.experienceLevel?.toLowerCase() as Profile['fitness_level'] || null,
  recent_activity: profile.athleticHistory || null,
  injuries: null,
  onboarding_completed_at: new Date().toISOString(),
});

// Convert UserProfile to Supabase profile update
const userProfileToUpdate = (profile: Partial<UserProfile>) => ({
  disciplines: profile.sports || [],
  goal_text: profile.primaryGoal || null,
  goal_date: profile.targetDate || null,
  hours_per_week: profile.hoursPerWeek || null,
  days_per_week: profile.daysPerWeek || null,
  equipment: profile.equipment || [],
  fitness_level: profile.experienceLevel?.toLowerCase() as Profile['fitness_level'] || null,
  recent_activity: profile.athleticHistory || null,
  onboarding_completed_at: new Date().toISOString(),
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    // Load from localStorage on init (for non-Supabase mode or cached state)
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...parsed, isLoading: isSupabaseConfigured(), supabaseUser: null };
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  // Load profile from Supabase
  const loadSupabaseProfile = useCallback(async (user: User) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Load active training plan
    const { data: planRow } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const userProfile = profile
      ? profileRowToUserProfile(profile, user.email)
      : { email: user.email };

    const hasProfile = profile && profile.onboarding_completed_at;

    let trainingPlan: TrainingPlan | null = null;
    if (planRow) {
      trainingPlan = {
        structured: planRow.blocks as unknown as StructuredPlan,
        generatedAt: new Date(planRow.created_at),
        planStartDate: new Date(planRow.started_at),
      };
    }

    setState({
      isAuthenticated: true,
      hasCompletedOnboarding: Boolean(hasProfile),
      hasAcceptedPlan: Boolean(planRow),
      user: userProfile,
      currentPlan: trainingPlan,
      isLoading: false,
      supabaseUser: user,
    });
  }, []);

  // Supabase auth listener
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadSupabaseProfile(session.user);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadSupabaseProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setState({
            ...defaultState,
            isLoading: false,
          });
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadSupabaseProfile]);

  // Persist to localStorage (for non-Supabase mode and cache)
  useEffect(() => {
    if (!state.isLoading) {
      const toStore = {
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasAcceptedPlan: state.hasAcceptedPlan,
        user: state.user,
        currentPlan: state.currentPlan,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toStore));
    }
  }, [state]);

  // ========== Auth Methods ==========

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using localStorage auth');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signInWithMagicLink = async (email: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured()) {
      // Fallback to localStorage mode
      signUp(email);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setState({ ...defaultState, isLoading: false });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Legacy localStorage auth (fallback when Supabase not configured)
  const signUp = (email: string) => {
    setState({
      isAuthenticated: true,
      hasCompletedOnboarding: false,
      hasAcceptedPlan: false,
      user: { email },
      currentPlan: null,
      isLoading: false,
      supabaseUser: null,
    });
  };

  const signIn = (email: string) => {
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      user: { ...prev.user, email },
      isLoading: false,
    }));
  };

  // ========== Profile & Plan Methods ==========

  const completeOnboarding = async (profile: Partial<UserProfile>) => {
    const newUser = { ...state.user, ...profile };

    // Save to Supabase if configured
    if (isSupabaseConfigured() && state.supabaseUser) {
      // Check if profile exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', state.supabaseUser.id)
        .single();

      if (existing) {
        // Update existing profile
        await supabase
          .from('profiles')
          .update(userProfileToUpdate(newUser))
          .eq('user_id', state.supabaseUser.id);
      } else {
        // Insert new profile
        await supabase
          .from('profiles')
          .insert(userProfileToInsert(newUser, state.supabaseUser.id));
      }
    }

    setState(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
      user: newUser,
    }));
  };

  const acceptPlan = async (plan: TrainingPlan) => {
    // Save to Supabase if configured
    if (isSupabaseConfigured() && state.supabaseUser) {
      // Mark any existing active plans as abandoned
      await supabase
        .from('plans')
        .update({ status: 'abandoned' })
        .eq('user_id', state.supabaseUser.id)
        .eq('status', 'active');

      // Infer discipline from sports
      const discipline = state.user?.sports?.[0] || 'General Fitness';

      // Insert new plan
      await supabase
        .from('plans')
        .insert({
          user_id: state.supabaseUser.id,
          name: `${discipline} Plan`,
          discipline,
          goal: state.user?.primaryGoal || 'Training Plan',
          target_date: state.user?.targetDate || null,
          blocks: plan.structured as any,
          duration_weeks: plan.structured.weeks.length,
          weekly_hours: state.user?.hoursPerWeek || null,
          periodization_type: 'block',
          status: 'active',
          started_at: plan.planStartDate.toISOString(),
        });
    }

    setState(prev => ({
      ...prev,
      hasAcceptedPlan: true,
      currentPlan: plan,
    }));
  };

  // Dev login: skip onboarding with pre-filled profile
  const devLogin = () => {
    setState({
      isAuthenticated: true,
      hasCompletedOnboarding: true,
      hasAcceptedPlan: false,
      user: DEV_PROFILE,
      currentPlan: null,
      isLoading: false,
      supabaseUser: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle,
        signInWithMagicLink,
        signOut,
        signUp,
        signIn,
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
