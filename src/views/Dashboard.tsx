import React, { useState, useMemo } from 'react';
import { Activity, Heart, Moon, TrendingUp, ChevronRight, Check, X, Clock, Dumbbell } from 'lucide-react';
import { WorkoutCard } from '../components/WorkoutCard';
import { MetricCard } from '../components/MetricCard';
import { useAuth } from '../contexts/AuthContext';
import { useTrainingLog } from '../contexts/TrainingLogContext';
import { WeeklyReviewBanner } from '../components/WeeklyReviewBanner';
import { WorkoutLogModal } from '../components/WorkoutLogModal';
import {
  getCurrentWeek,
  getTodayWorkout,
  getWeekProgress,
  getWeekDays,
  isWorkoutCompleted,
  isWorkoutSkipped,
  shouldShowWeeklyReview,
  isToday,
  canLogWorkout,
} from '../utils/planUtils';
import { PlannedWorkout, Workout } from '../types';
import { format } from 'date-fns';

// Convert PlannedWorkout to Workout for WorkoutCard compatibility
function toWorkout(planned: PlannedWorkout, weekNumber: number, phase: string): Workout {
  return {
    id: planned.id,
    title: planned.title,
    type: planned.type as Workout['type'],
    duration: planned.duration,
    phase,
    week: weekNumber,
    blocks: planned.blocks,
  };
}

export const Dashboard: React.FC = () => {
  const { currentPlan, user } = useAuth();
  const { logs, getWeekLogs } = useTrainingLog();

  const [selectedWorkout, setSelectedWorkout] = useState<PlannedWorkout | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Calculate current week and plan state
  const planState = useMemo(() => {
    if (!currentPlan?.structured || !currentPlan.planStartDate) {
      return null;
    }

    const planStartDate = new Date(currentPlan.planStartDate);
    const rawCurrentWeek = getCurrentWeek(planStartDate);

    // If plan hasn't started yet (week 0), show Week 1 as preview
    const isPlanPreview = rawCurrentWeek === 0;
    const currentWeek = isPlanPreview ? 1 : rawCurrentWeek;

    const weekPlan = currentPlan.structured.weeks.find(w => w.weekNumber === currentWeek);
    const todayWorkout = isPlanPreview ? null : (weekPlan ? getTodayWorkout(weekPlan) : null);
    const weekLogs = getWeekLogs(currentWeek);
    const progress = weekPlan ? getWeekProgress(weekPlan, logs) : { completed: 0, total: 0, percentage: 0 };
    const showReview = shouldShowWeeklyReview(
      planStartDate,
      currentWeek,
      currentPlan.structured.totalWeeks
    );

    return {
      currentWeek,
      weekPlan,
      todayWorkout,
      weekLogs,
      progress,
      showReview,
      planStartDate,
      totalWeeks: currentPlan.structured.totalWeeks,
      isPlanPreview, // New: indicates plan hasn't started yet
    };
  }, [currentPlan, logs, getWeekLogs]);

  // Fallback UI if no plan (shouldn't happen due to route protection)
  if (!planState || !planState.weekPlan) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <section>
          <h1 className="text-4xl md:text-5xl font-serif mb-2">Welcome, {user?.name || 'Athlete'}.</h1>
          <p className="text-lg text-[#737373]">Your training plan is being prepared...</p>
        </section>
        <div className="bg-[#262626] p-20 rounded-2xl border border-white/5 text-center">
          <p className="text-[#737373] italic">No active training plan found.</p>
        </div>
      </div>
    );
  }

  const { currentWeek, weekPlan, todayWorkout, progress, showReview, planStartDate, isPlanPreview } = planState;
  const weekDays = getWeekDays(planStartDate, currentWeek);

  const handleWorkoutClick = (workout: PlannedWorkout, canLog: boolean) => {
    if (canLog) {
      setSelectedWorkout(workout);
      setShowLogModal(true);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Weekly Review Banner */}
      {showReview && (
        <WeeklyReviewBanner weekNumber={currentWeek} />
      )}

      {/* Welcome Header */}
      <section>
        <h1 className="text-4xl md:text-5xl font-serif mb-2">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Athlete'}.
        </h1>
        <p className="text-lg text-[#737373]">
          {isPlanPreview ? (
            <>Your plan starts {format(planStartDate, 'EEEE, MMM d')} &middot; Here's Week 1 preview</>
          ) : (
            <>
              Week {currentWeek} of {planState.totalWeeks} &middot; {weekPlan.phase} Phase
              {progress.completed > 0 && ` · ${progress.completed}/${progress.total} complete`}
            </>
          )}
        </p>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Week Progress"
          value={progress.percentage}
          unit="%"
          icon={<TrendingUp size={16} />}
        />
        <MetricCard
          label="Workouts"
          value={`${progress.completed}/${progress.total}`}
          icon={<Dumbbell size={16} />}
        />
        <MetricCard
          label="Week"
          value={currentWeek}
          unit={`of ${planState.totalWeeks}`}
          icon={<Clock size={16} />}
        />
        <MetricCard
          label="Phase"
          value={weekPlan.phase.split(' ')[0]}
          icon={<Activity size={16} />}
        />
      </section>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main: Today's Workout */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#737373]">Today's Session</h3>
          </div>

          {isPlanPreview ? (
            <div className="bg-gradient-to-br from-amber-600/10 to-amber-900/10 border border-amber-600/20 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-600/10 flex items-center justify-center">
                <Clock className="text-amber-500" size={32} />
              </div>
              <h3 className="text-xl font-serif italic mb-2">Training Starts Soon</h3>
              <p className="text-[#737373]">
                Your plan begins {format(planStartDate, 'EEEE, MMMM d')}. Take a look at Week 1 on the right.
              </p>
            </div>
          ) : todayWorkout ? (
            <div className="space-y-4">
              <WorkoutCard workout={toWorkout(todayWorkout, currentWeek, weekPlan.phase)} />

              {/* Workout action buttons */}
              {canLogWorkout(planStartDate, currentWeek, todayWorkout.dayOfWeek) && (
                <div className="flex gap-3">
                  {!isWorkoutCompleted(todayWorkout.id, logs) && !isWorkoutSkipped(todayWorkout.id, logs) ? (
                    <>
                      <button
                        onClick={() => handleWorkoutClick(todayWorkout, true)}
                        className="flex-1 py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={20} />
                        Log Workout
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 py-3 px-6 bg-green-600/20 text-green-500 font-medium rounded-xl flex items-center justify-center gap-2">
                      <Check size={20} />
                      {isWorkoutSkipped(todayWorkout.id, logs) ? 'Skipped' : 'Completed'}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#262626] border border-white/5 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/10 flex items-center justify-center">
                <Moon className="text-green-500" size={32} />
              </div>
              <h3 className="text-xl font-serif italic mb-2">Rest Day</h3>
              <p className="text-[#737373]">
                Recovery is when adaptation happens. Focus on sleep, nutrition, and mobility.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar: Weekly Outlook */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#737373]">This Week</h3>
            <button className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors">
              Full Plan <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-[#262626] border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden">
            {weekDays.map(({ dayOfWeek, date, dayName }) => {
              const workout = weekPlan.workouts.find(w => w.dayOfWeek === dayOfWeek);
              const completed = workout ? isWorkoutCompleted(workout.id, logs) : false;
              const skipped = workout ? isWorkoutSkipped(workout.id, logs) : false;
              const isTodayDate = isToday(date);
              const canLog = workout ? canLogWorkout(planStartDate, currentWeek, dayOfWeek) : false;

              return (
                <div
                  key={dayOfWeek}
                  className={`p-4 flex items-center justify-between group ${canLog && workout ? 'cursor-pointer hover:bg-white/5' : ''} transition-colors`}
                  onClick={() => workout && canLog && handleWorkoutClick(workout, true)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 text-center">
                      <span className={`text-xs font-bold uppercase tracking-widest ${isTodayDate ? 'text-amber-500' : 'text-[#737373]'}`}>
                        {dayName}
                      </span>
                      <div className="text-[10px] text-[#525252]">
                        {format(date, 'd')}
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {workout ? workout.title : 'Rest'}
                    </span>
                    {workout && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        workout.intensity === 'High' || workout.intensity === 'Max'
                          ? 'bg-red-600/20 text-red-400'
                          : workout.intensity === 'Moderate'
                            ? 'bg-amber-600/20 text-amber-400'
                            : 'bg-green-600/20 text-green-400'
                      }`}>
                        {workout.intensity}
                      </span>
                    )}
                  </div>

                  {workout ? (
                    completed ? (
                      <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                        <Check size={14} />
                      </div>
                    ) : skipped ? (
                      <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                        <X size={14} />
                      </div>
                    ) : (
                      <div className={`w-6 h-6 rounded-full border ${isTodayDate ? 'border-amber-500/50' : 'border-white/10'}`} />
                    )
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                      <Moon size={12} className="text-[#525252]" />
                    </div>
                  )}
                </div>
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
        </div>
      </div>

      {/* Workout Log Modal */}
      {showLogModal && selectedWorkout && (
        <WorkoutLogModal
          workout={selectedWorkout}
          weekNumber={currentWeek}
          onClose={() => {
            setShowLogModal(false);
            setSelectedWorkout(null);
          }}
        />
      )}
    </div>
  );
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}
