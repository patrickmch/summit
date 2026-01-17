import React from 'react';
import { Check, X, Sparkles, RefreshCw } from 'lucide-react';
import { PlanAdjustment } from '../types';

interface AdjustmentReviewModalProps {
  adjustment: PlanAdjustment;
  onAccept: () => void;
  onReject: () => void;
}

export const AdjustmentReviewModal: React.FC<AdjustmentReviewModalProps> = ({
  adjustment,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-[#262626] rounded-2xl border border-white/10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
              <Sparkles className="text-amber-500" size={20} />
            </div>
            <h2 className="text-xl font-serif italic">Week {adjustment.weekNumber} Suggestions</h2>
          </div>
          <p className="text-sm text-[#737373]">
            Based on your week review, here's what I recommend:
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Suggested Changes */}
          <div className="bg-gradient-to-br from-amber-600/10 to-amber-900/10 p-5 rounded-xl border border-amber-600/20">
            <div className="flex items-start gap-3">
              <RefreshCw className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-medium text-[#f5f2ed] mb-2">Suggested Adjustments</h3>
                <p className="text-sm text-[#a3a3a3] leading-relaxed">
                  {adjustment.suggestedChanges}
                </p>
              </div>
            </div>
          </div>

          {/* Rationale */}
          <div className="bg-[#1a1a1a] p-5 rounded-xl border border-white/5">
            <h3 className="font-medium text-[#f5f2ed] mb-2">Why?</h3>
            <p className="text-sm text-[#a3a3a3] leading-relaxed italic">
              "{adjustment.rationale}"
            </p>
          </div>

          {/* Specific changes if available */}
          {adjustment.adjustedWeek && (
            <div className="bg-[#1a1a1a] p-5 rounded-xl border border-white/5">
              <h3 className="font-medium text-[#f5f2ed] mb-3">Updated Schedule</h3>
              <div className="space-y-2">
                {adjustment.adjustedWeek.workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#525252] w-8">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][workout.dayOfWeek]}
                      </span>
                      <span className="text-sm">{workout.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      workout.intensity === 'High' || workout.intensity === 'Max'
                        ? 'bg-red-600/20 text-red-400'
                        : workout.intensity === 'Moderate'
                          ? 'bg-amber-600/20 text-amber-400'
                          : 'bg-green-600/20 text-green-400'
                    }`}>
                      {workout.intensity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-white/5">
          <button
            onClick={onReject}
            className="flex-1 py-3 px-4 bg-[#1a1a1a] border border-white/10 text-[#a3a3a3] rounded-xl hover:bg-white/5 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <X size={18} />
            Keep Original Plan
          </button>
          <button
            onClick={onAccept}
            className="flex-[2] py-3 px-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Accept Changes
          </button>
        </div>
      </div>
    </div>
  );
};
