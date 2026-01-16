import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  user: Partial<UserProfile> | null;
}

interface AuthContextType extends AuthState {
  signUp: (email: string) => void;
  signIn: (email: string) => void;
  signOut: () => void;
  completeOnboarding: (profile: Partial<UserProfile>) => void;
}

const AUTH_STORAGE_KEY = 'summit_auth';

const defaultState: AuthState = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  user: null,
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
      user: { email },
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

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        completeOnboarding,
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
