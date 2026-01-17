import React, { useState } from 'react';
import { X, Check, SkipForward } from 'lucide-react';
import { PlannedWorkout } from '../types';
import { useTrainingLog } from '../contexts/TrainingLogContext';
import { Button } from './Button';

interface WorkoutLogModalProps {
  workout: PlannedWorkout;
  weekNumber: number;
  onClose: () => void;
}

export const WorkoutLogModal: React.FC<WorkoutLogModalProps> = ({
  workout,
  weekNumber,
  onClose,
}) => {
  const { logWorkout, skipWorkout, getWorkoutLog } = useTrainingLog();

  const existingLog = getWorkoutLog(workout.id);

  const [duration, setDuration] = useState(
    existingLog?.actualDurationMinutes?.toString() || workout.durationMinutes.toString()
  );
  const [rpe, setRpe] = useState(existingLog?.rpe?.toString() || '5');
  const [notes, setNotes] = useState(existingLog?.notes || '');

  const handleComplete = () => {
    logWorkout({
      plannedWorkoutId: workout.id,
      weekNumber,
      completedAt: new Date(),
      actualDurationMinutes: parseInt(duration) || workout.durationMinutes,
      rpe: parseInt(rpe) || 5,
      notes,
      skipped: false,
    });
    onClose();
  };

  const handleSkip = () => {
    skipWorkout(workout.id, weekNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#262626] rounded-2xl border border-white/10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-serif italic">Log Workout</h2>
            <p className="text-sm text-[#737373] mt-1">{workout.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} className="text-[#737373]" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a3a3a3]">
              Actual Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all"
              placeholder={workout.durationMinutes.toString()}
            />
          </div>

          {/* RPE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a3a3a3]">
              Rate of Perceived Exertion (1-10)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => setRpe(value.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    parseInt(rpe) === value
                      ? value <= 3
                        ? 'bg-green-600 text-white'
                        : value <= 6
                          ? 'bg-amber-600 text-white'
                          : 'bg-red-600 text-white'
                      : 'bg-[#1a1a1a] border border-white/10 hover:bg-white/5'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#525252]">
              {parseInt(rpe) <= 3 ? 'Easy - could do much more' :
               parseInt(rpe) <= 5 ? 'Moderate - comfortable effort' :
               parseInt(rpe) <= 7 ? 'Hard - challenging but sustainable' :
               parseInt(rpe) <= 9 ? 'Very hard - approaching limits' :
               'Maximum effort'}
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a3a3a3]">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all resize-none"
              placeholder="How did it feel? Any issues?"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-white/5">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 px-4 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600/20 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <SkipForward size={18} />
            Skip
          </button>
          <button
            onClick={handleComplete}
            className="flex-[2] py-3 px-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Complete
          </button>
        </div>
      </div>
    </div>
  );
};
