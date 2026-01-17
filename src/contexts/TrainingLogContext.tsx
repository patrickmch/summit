import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkoutLog, WeekSummary } from '../types';

interface TrainingLogState {
  logs: WorkoutLog[];
}

interface TrainingLogContextType extends TrainingLogState {
  logWorkout: (log: Omit<WorkoutLog, 'id'>) => void;
  skipWorkout: (plannedWorkoutId: string, weekNumber: number) => void;
  getWeekLogs: (weekNumber: number) => WorkoutLog[];
  getWorkoutLog: (plannedWorkoutId: string) => WorkoutLog | undefined;
  getWeekSummary: (weekNumber: number, totalWorkouts: number) => WeekSummary;
  clearLogs: () => void;
}

const STORAGE_KEY = 'summit_training_logs';

const TrainingLogContext = createContext<TrainingLogContextType | undefined>(undefined);

export const TrainingLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<WorkoutLog[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Rehydrate Date objects
        return parsed.map((log: WorkoutLog) => ({
          ...log,
          completedAt: new Date(log.completedAt),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const logWorkout = (logData: Omit<WorkoutLog, 'id'>) => {
    const newLog: WorkoutLog = {
      ...logData,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Replace existing log for same workout if exists
    setLogs(prev => {
      const filtered = prev.filter(l => l.plannedWorkoutId !== logData.plannedWorkoutId);
      return [...filtered, newLog];
    });
  };

  const skipWorkout = (plannedWorkoutId: string, weekNumber: number) => {
    const skipLog: WorkoutLog = {
      id: `skip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plannedWorkoutId,
      weekNumber,
      completedAt: new Date(),
      actualDurationMinutes: 0,
      rpe: 0,
      notes: '',
      skipped: true,
    };

    setLogs(prev => {
      const filtered = prev.filter(l => l.plannedWorkoutId !== plannedWorkoutId);
      return [...filtered, skipLog];
    });
  };

  const getWeekLogs = (weekNumber: number): WorkoutLog[] => {
    return logs.filter(l => l.weekNumber === weekNumber);
  };

  const getWorkoutLog = (plannedWorkoutId: string): WorkoutLog | undefined => {
    return logs.find(l => l.plannedWorkoutId === plannedWorkoutId);
  };

  const getWeekSummary = (weekNumber: number, totalWorkouts: number): WeekSummary => {
    const weekLogs = getWeekLogs(weekNumber);
    const completedLogs = weekLogs.filter(l => !l.skipped);

    const totalMinutes = completedLogs.reduce((sum, l) => sum + l.actualDurationMinutes, 0);
    const totalRpe = completedLogs.reduce((sum, l) => sum + l.rpe, 0);
    const averageRpe = completedLogs.length > 0 ? totalRpe / completedLogs.length : 0;

    return {
      weekNumber,
      completedWorkouts: completedLogs.length,
      totalWorkouts,
      totalMinutes,
      averageRpe: Math.round(averageRpe * 10) / 10,
      athleteNotes: '', // Will be filled in by weekly review modal
    };
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <TrainingLogContext.Provider
      value={{
        logs,
        logWorkout,
        skipWorkout,
        getWeekLogs,
        getWorkoutLog,
        getWeekSummary,
        clearLogs,
      }}
    >
      {children}
    </TrainingLogContext.Provider>
  );
};

export const useTrainingLog = (): TrainingLogContextType => {
  const context = useContext(TrainingLogContext);
  if (!context) {
    throw new Error('useTrainingLog must be used within a TrainingLogProvider');
  }
  return context;
};
