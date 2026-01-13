'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Onboarding layout - no bottom nav, handles auth check
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Redirect to login if not authenticated
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // Redirect to app if already onboarded
    if (profile?.onboarding_completed_at) {
      router.replace('/today');
      return;
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-header-bg)]">
        <div className="animate-pulse-subtle">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-header-bg)] flex flex-col safe-top safe-bottom">
      {children}
    </div>
  );
}
