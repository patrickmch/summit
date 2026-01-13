'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Onboarding index - redirects to first step
 */
export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/discipline');
  }, [router]);

  return null;
}
