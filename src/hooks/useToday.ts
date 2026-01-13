'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '@/lib/api/client';
import type { TodayResponse } from '@/types/database';

interface UseTodayReturn {
  data: TodayResponse | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useToday(): UseTodayReturn {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet<TodayResponse>('/today');
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch today data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export default useToday;
