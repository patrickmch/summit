import React, { useState } from 'react';
import { X, Clock, Zap, ChevronDown, ChevronUp, Target, Check, Calendar } from 'lucide-react';
import { PlannedWorkout } from '../types';
import { format } from 'date-fns';

interface WorkoutDetailModalProps {
  workout: PlannedWorkout;
  date: Date;
  weekNumber: number;
  phaseName: string;
  isCompleted: boolean;
  isSkipped: boolean;
  canLog: boolean;
  isPast: boolean;
  onClose: () => void;
  onLogWorkout: () => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout,
  date,
  weekNumber,
  phaseName,
  isCompleted,
  isSkipped,
  canLog,
  isPast,
  onClose,
  onLogWorkout,
}) => {
  const [expandedBlock, setExpandedBlock] = useState<number | null>(0);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#262626] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 bg-amber-600/20 text-amber-500 text-xs font-bold uppercase tracking-widest rounded-full">
                  {workout.type}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getIntensityColor(workout.intensity)}`}>
                  {workout.intensity}
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 bg-green-600/20 text-green-500 text-xs font-bold rounded-full flex items-center gap-1">
                    <Check size={12} />
                    Completed
                  </span>
                )}
                {isSkipped && (
                  <span className="px-3 py-1 bg-red-600/20 text-red-400 text-xs font-bold rounded-full">
                    Skipped
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#f5f2ed]">{workout.title}</h2>
              <p className="text-sm text-[#737373] mt-1 flex items-center gap-2">
                <Calendar size={14} />
                {format(date, 'EEEE, MMM d')} &middot; Week {weekNumber} &middot; {phaseName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors shrink-0"
            >
              <X size={20} className="text-[#737373]" />
            </button>
          </div>

          {/* Duration and intensity */}
          <div className="flex items-center gap-6 mt-4 text-[#f5f2ed]/60">
            <div className="flex items-center gap-1.5">
              <Clock size={18} className="text-amber-500" />
              <span className="text-sm font-medium">{workout.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={18} className="text-amber-500" />
              <span className="text-sm font-medium">{workout.intensity} Intensity</span>
            </div>
          </div>
        </div>

        {/* Workout blocks - scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#737373] mb-4">Workout Blocks</h3>
          <div className="space-y-3">
            {workout.blocks.map((block, idx) => (
              <div
                key={idx}
                className="group bg-[#1a1a1a]/50 border border-white/5 rounded-lg overflow-hidden transition-colors hover:bg-[#1a1a1a]"
              >
                <button
                  onClick={() => setExpandedBlock(expandedBlock === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div>
                    <h4 className="text-lg font-semibold text-[#f5f2ed] group-hover:text-amber-500 transition-colors">
                      {block.title}
                    </h4>
                    <p className="text-sm text-[#737373]">{block.duration}</p>
                  </div>
                  {expandedBlock === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedBlock === idx && (
                  <div className="px-4 pb-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="mt-4 text-[#f5f2ed]/80 leading-relaxed mb-4">
                      {block.instructions}
                    </p>
                    {block.details && block.details.length > 0 && (
                      <ul className="space-y-2">
                        {block.details.map((detail, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2 text-sm text-[#737373]">
                            <Target size={14} className="mt-1 text-amber-600/40 shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/5 shrink-0">
          {canLog && !isCompleted && !isSkipped ? (
            <button
              onClick={onLogWorkout}
              className="w-full py-3 px-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Log Workout
            </button>
          ) : isCompleted || isSkipped ? (
            <div className={`w-full py-3 px-4 rounded-xl text-center font-medium ${
              isCompleted ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-400'
            }`}>
              {isCompleted ? 'Workout Completed' : 'Workout Skipped'}
            </div>
          ) : !isPast ? (
            <div className="w-full py-3 px-4 bg-[#1a1a1a] text-[#737373] rounded-xl text-center font-medium">
              Coming Up
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-white/5 text-[#f5f2ed] rounded-xl hover:bg-white/10 transition-colors font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
