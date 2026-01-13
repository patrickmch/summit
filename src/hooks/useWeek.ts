'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '@/lib/api/client';
import { formatDateISO, getWeekStart, navigateWeek } from '@/lib/utils/date';
import type { WeekResponse } from '@/types/database';

interface UseWeekReturn {
  data: WeekResponse | null;
  loading: boolean;
  error: Error | null;
  weekStart: Date;
  goToPrevWeek: () => void;
  goToNextWeek: () => void;
  refresh: () => Promise<void>;
}

export function useWeek(initialDate?: Date): UseWeekReturn {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(initialDate || new Date()));
  const [data, setData] = useState<WeekResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWeek = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);

    try {
      const dateStr = formatDateISO(date);
      const response = await apiGet<WeekResponse>(`/week?date=${dateStr}`);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch week data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeek(weekStart);
  }, [weekStart, fetchWeek]);

  const goToPrevWeek = useCallback(() => {
    setWeekStart((prev) => navigateWeek(prev, 'prev'));
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekStart((prev) => navigateWeek(prev, 'next'));
  }, []);

  const refresh = useCallback(async () => {
    await fetchWeek(weekStart);
  }, [weekStart, fetchWeek]);

  return {
    data,
    loading,
    error,
    weekStart,
    goToPrevWeek,
    goToNextWeek,
    refresh,
  };
}

export default useWeek;
