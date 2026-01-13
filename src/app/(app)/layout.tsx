'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Layout for authenticated app routes (today, plan, chat, profile)
 * Handles auth checks and redirects unauthenticated users
 */
export default function AppLayout({
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

    // Redirect to onboarding if profile not complete
    if (!profile || !profile.onboarding_completed_at) {
      router.replace('/onboarding');
      return;
    }
  }, [user, profile, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-secondary)]">
        <div className="animate-pulse-subtle">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]" />
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (redirect will happen)
  if (!user || !profile || !profile.onboarding_completed_at) {
    return null;
  }

  return <>{children}</>;
}
