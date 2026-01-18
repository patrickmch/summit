import React from 'react';
import { Moon, Check, X, Clock } from 'lucide-react';
import { PlannedWorkout } from '../../types';
import { format } from 'date-fns';

interface DayCardProps {
  date: Date;
  dayName: string;
  workout: PlannedWorkout | null;
  isToday: boolean;
  isPast: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
  canLog: boolean;
  onClick: () => void;
}

export const DayCard: React.FC<DayCardProps> = ({
  date,
  dayName,
  workout,
  isToday,
  isPast,
  isCompleted,
  isSkipped,
  canLog,
  onClick,
}) => {
  const isRestDay = !workout;
  const isClickable = workout && (canLog || !isPast);

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'High':
      case 'Max':
        return 'bg-red-600/20 text-red-400';
      case 'Moderate':
        return 'bg-amber-600/20 text-amber-400';
      default:
        return 'bg-green-600/20 text-green-400';
    }
  };

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`
        relative p-4 rounded-xl border transition-all
        ${isToday
          ? 'border-amber-500/50 bg-amber-600/5'
          : 'border-white/5 bg-[#262626]'
        }
        ${isClickable ? 'cursor-pointer hover:border-amber-600/30 hover:bg-[#2a2a2a]' : ''}
        ${isPast && !isToday ? 'opacity-80' : ''}
      `}
    >
      {/* Date header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-amber-500' : 'text-[#737373]'}`}>
            {dayName}
          </span>
          <div className="text-lg font-medium text-[#f5f2ed]">
            {format(date, 'd')}
          </div>
        </div>

        {/* Status indicator */}
        {workout ? (
          isCompleted ? (
            <div className="w-7 h-7 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
              <Check size={16} />
            </div>
          ) : isSkipped ? (
            <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
              <X size={16} />
            </div>
          ) : (
            <div className={`w-7 h-7 rounded-full border-2 ${isToday ? 'border-amber-500/50' : 'border-white/10'}`} />
          )
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <Moon size={14} className="text-[#525252]" />
          </div>
        )}
      </div>

      {/* Workout content */}
      {workout ? (
        <div className="space-y-2">
          <h4 className="font-medium text-[#f5f2ed] leading-tight line-clamp-2">
            {workout.title}
          </h4>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#737373] flex items-center gap-1">
              <Clock size={12} />
              {workout.duration}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getIntensityColor(workout.intensity)}`}>
              {workout.intensity}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <h4 className="font-medium text-[#525252] italic">Rest Day</h4>
          <p className="text-xs text-[#525252]">Recovery & adaptation</p>
        </div>
      )}

      {/* Today indicator bar */}
      {isToday && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0" />
      )}
    </div>
  );
};
