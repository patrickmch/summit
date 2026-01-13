'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Root page - handles initial routing based on auth state
 * - Authenticated users with completed onboarding → /today
 * - Authenticated users without profile → /onboarding
 * - Unauthenticated users → /auth/login
 */
export default function RootPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/auth/login');
    } else if (!profile || !profile.onboarding_completed_at) {
      router.replace('/onboarding');
    } else {
      router.replace('/today');
    }
  }, [user, profile, loading, router]);

  // Loading state while determining where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-header-bg)]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
          <MountainIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-white">Summit</h1>
        <p className="text-sm text-slate-400 mt-1">Loading...</p>
      </div>
    </div>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
