import React, { useState, useMemo } from 'react';
import { Clock, Calendar, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTrainingLog } from '../contexts/TrainingLogContext';
import { WeekSelector } from '../components/plan/WeekSelector';
import { DayCard } from '../components/plan/DayCard';
import { WorkoutDetailModal } from '../components/WorkoutDetailModal';
import { WorkoutLogModal } from '../components/WorkoutLogModal';
import {
  getCurrentWeek,
  getWeekDays,
  getPhaseForWeek,
  isCurrentWeek as checkIsCurrentWeek,
  isPastWeek,
  isWorkoutCompleted,
  isWorkoutSkipped,
  canLogWorkout,
  isToday,
} from '../utils/planUtils';
import { PlannedWorkout, WeekPlan } from '../types';

export const PlanView: React.FC = () => {
  const { currentPlan } = useAuth();
  const { logs } = useTrainingLog();

  // Selected week (defaults to current week)
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null);

  // Modal state
  const [selectedWorkout, setSelectedWorkout] = useState<PlannedWorkout | null>(null);
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState<Date | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  // Calculate plan state
  const planState = useMemo(() => {
    if (!currentPlan?.structured || !currentPlan.planStartDate) {
      return null;
    }

    const planStartDate = new Date(currentPlan.planStartDate);
    const rawCurrentWeek = getCurrentWeek(planStartDate);
    const actualCurrentWeek = rawCurrentWeek === 0 ? 1 : rawCurrentWeek;

    return {
      planStartDate,
      actualCurrentWeek,
      totalWeeks: currentPlan.structured.totalWeeks,
      plan: currentPlan.structured,
    };
  }, [currentPlan]);

  // Determine which week to display
  const displayWeekNumber = selectedWeekNumber ?? planState?.actualCurrentWeek ?? 1;

  // Get the week plan for display
  const weekPlan = useMemo(() => {
    if (!planState) return null;
    return planState.plan.weeks.find(w => w.weekNumber === displayWeekNumber) || null;
  }, [planState, displayWeekNumber]);

  // Get phase info for the displayed week
  const phaseInfo = useMemo(() => {
    if (!planState) return null;
    return getPhaseForWeek(planState.plan, displayWeekNumber);
  }, [planState, displayWeekNumber]);

  // Get week days with dates
  const weekDays = useMemo(() => {
    if (!planState) return [];
    return getWeekDays(planState.planStartDate, displayWeekNumber);
  }, [planState, displayWeekNumber]);

  // Handlers
  const handlePreviousWeek = () => {
    if (displayWeekNumber > 1) {
      setSelectedWeekNumber(displayWeekNumber - 1);
    }
  };

  const handleNextWeek = () => {
    if (planState && displayWeekNumber < planState.totalWeeks) {
      setSelectedWeekNumber(displayWeekNumber + 1);
    }
  };

  const handleDayClick = (workout: PlannedWorkout, date: Date) => {
    setSelectedWorkout(workout);
    setSelectedWorkoutDate(date);
    setShowDetailModal(true);
  };

  const handleLogWorkout = () => {
    setShowDetailModal(false);
    setShowLogModal(true);
  };

  const handleCloseModals = () => {
    setShowDetailModal(false);
    setShowLogModal(false);
    setSelectedWorkout(null);
    setSelectedWorkoutDate(null);
  };

  // Fallback if no plan
  if (!planState || !weekPlan) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <section>
          <h1 className="text-4xl md:text-5xl font-serif mb-2">Training Plan</h1>
          <p className="text-lg text-[#737373]">Your comprehensive training schedule</p>
        </section>
        <div className="bg-[#262626] p-20 rounded-2xl border border-white/5 text-center">
          <p className="text-[#737373] italic">No active training plan found.</p>
        </div>
      </div>
    );
  }

  const isDisplayedWeekCurrent = checkIsCurrentWeek(planState.planStartDate, displayWeekNumber);
  const isDisplayedWeekPast = isPastWeek(planState.planStartDate, displayWeekNumber);

  // Calculate week statistics
  const totalMinutes = weekPlan.workouts.reduce((sum, w) => sum + w.durationMinutes, 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
  const workoutCount = weekPlan.workouts.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <section>
        <h1 className="text-4xl md:text-5xl font-serif mb-2">Training Plan</h1>
        <p className="text-lg text-[#737373]">
          {planState.plan.overview.split('.')[0]}.
        </p>
      </section>

      {/* Phase Progress Bar */}
      {planState.plan.phases.length > 0 && (
        <div className="bg-[#262626] border border-white/5 rounded-xl p-4">
          <div className="flex gap-1">
            {planState.plan.phases.map((phase, idx) => {
              const phaseWeeks = phase.weekEnd - phase.weekStart + 1;
              const widthPercent = (phaseWeeks / planState.totalWeeks) * 100;
              const isCurrentPhase = displayWeekNumber >= phase.weekStart && displayWeekNumber <= phase.weekEnd;

              return (
                <div
                  key={idx}
                  className="relative"
                  style={{ width: `${widthPercent}%` }}
                >
                  <div
                    className={`h-2 rounded-full transition-colors ${
                      isCurrentPhase ? 'bg-amber-500' : 'bg-[#1a1a1a]'
                    }`}
                  />
                  <span className={`text-xs mt-1 block truncate ${isCurrentPhase ? 'text-amber-500' : 'text-[#525252]'}`}>
                    {phase.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week Selector */}
      <WeekSelector
        currentWeek={displayWeekNumber}
        totalWeeks={planState.totalWeeks}
        phaseName={phaseInfo?.name || weekPlan.phase}
        isCurrentWeek={isDisplayedWeekCurrent}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
      />

      {/* Week Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#262626] border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-600/10 flex items-center justify-center">
            <Clock size={20} className="text-amber-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#f5f2ed]">{totalHours}h</div>
            <div className="text-xs text-[#737373]">Planned</div>
          </div>
        </div>
        <div className="bg-[#262626] border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-600/10 flex items-center justify-center">
            <Calendar size={20} className="text-amber-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#f5f2ed]">{workoutCount}</div>
            <div className="text-xs text-[#737373]">Workouts</div>
          </div>
        </div>
        <div className="bg-[#262626] border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-600/10 flex items-center justify-center">
            <Target size={20} className="text-amber-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#f5f2ed] truncate">{weekPlan.theme.split(' ')[0]}</div>
            <div className="text-xs text-[#737373]">Focus</div>
          </div>
        </div>
      </div>

      {/* Day Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {weekDays.map(({ dayOfWeek, date, dayName }) => {
          const workout = weekPlan.workouts.find(w => w.dayOfWeek === dayOfWeek) || null;
          const isTodayDate = isToday(date);
          const dayIsPast = isPastWeek(planState.planStartDate, displayWeekNumber) ||
            (isDisplayedWeekCurrent && date < new Date() && !isTodayDate);
          const completed = workout ? isWorkoutCompleted(workout.id, logs) : false;
          const skipped = workout ? isWorkoutSkipped(workout.id, logs) : false;
          const canLog = workout ? canLogWorkout(planState.planStartDate, displayWeekNumber, dayOfWeek) : false;

          return (
            <DayCard
              key={dayOfWeek}
              date={date}
              dayName={dayName}
              workout={workout}
              isToday={isTodayDate}
              isPast={dayIsPast}
              isCompleted={completed}
              isSkipped={skipped}
              canLog={canLog}
              onClick={() => workout && handleDayClick(workout, date)}
            />
          );
        })}
      </div>

      {/* Coach's Note */}
      {weekPlan.coachNote && (
        <div className="bg-gradient-to-br from-amber-600/10 to-amber-900/10 p-6 rounded-xl border border-amber-600/20">
          <h4 className="font-serif italic text-amber-500 mb-2">Coach's Note</h4>
          <p className="text-sm text-[#f5f2ed]/70 leading-relaxed italic">
            "{weekPlan.coachNote}"
          </p>
        </div>
      )}

      {/* Workout Detail Modal */}
      {showDetailModal && selectedWorkout && selectedWorkoutDate && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          date={selectedWorkoutDate}
          weekNumber={displayWeekNumber}
          phaseName={phaseInfo?.name || weekPlan.phase}
          isCompleted={isWorkoutCompleted(selectedWorkout.id, logs)}
          isSkipped={isWorkoutSkipped(selectedWorkout.id, logs)}
          canLog={canLogWorkout(planState.planStartDate, displayWeekNumber, selectedWorkout.dayOfWeek)}
          isPast={isPastWeek(planState.planStartDate, displayWeekNumber)}
          onClose={handleCloseModals}
          onLogWorkout={handleLogWorkout}
        />
      )}

      {/* Workout Log Modal */}
      {showLogModal && selectedWorkout && (
        <WorkoutLogModal
          workout={selectedWorkout}
          weekNumber={displayWeekNumber}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
};
