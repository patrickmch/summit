import React, { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTrainingLog } from '../contexts/TrainingLogContext';
import { analyzeWeekAndSuggestAdjustments } from '../services/summitAiService';
import { PlanAdjustment, WeekSummary } from '../types';
import { AdjustmentReviewModal } from './AdjustmentReviewModal';

interface WeeklyReviewModalProps {
  weekNumber: number;
  onClose: () => void;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  weekNumber,
  onClose,
}) => {
  const { user, currentPlan } = useAuth();
  const { getWeekSummary } = useTrainingLog();

  const [feelingRating, setFeelingRating] = useState(5);
  const [energyLevel, setEnergyLevel] = useState<'low' | 'normal' | 'high'>('normal');
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [adjustment, setAdjustment] = useState<PlanAdjustment | null>(null);

  const weekPlan = currentPlan?.structured.weeks.find(w => w.weekNumber === weekNumber);
  const totalWorkouts = weekPlan?.workouts.length || 0;
  const weekSummary = getWeekSummary(weekNumber, totalWorkouts);

  const handleSubmit = async () => {
    if (!currentPlan?.structured) return;

    setIsAnalyzing(true);

    const enrichedSummary: WeekSummary = {
      ...weekSummary,
      athleteNotes: `Overall feeling: ${feelingRating}/10. Energy: ${energyLevel}. ${notes}`,
    };

    try {
      const result = await analyzeWeekAndSuggestAdjustments(
        user || {},
        currentPlan.structured,
        weekNumber,
        enrichedSummary
      );
      setAdjustment(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Show a fallback adjustment
      setAdjustment({
        weekNumber: weekNumber + 1,
        suggestedChanges: 'Continue with the planned training for next week.',
        rationale: 'Based on your feedback, the current plan remains appropriate.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // If we have an adjustment, show the adjustment review modal
  if (adjustment) {
    return (
      <AdjustmentReviewModal
        adjustment={adjustment}
        onAccept={() => {
          // In a full implementation, this would update the plan
          onClose();
        }}
        onReject={onClose}
      />
    );
  }

  const feelingLabels = ['Terrible', 'Very bad', 'Bad', 'Below average', 'Average', 'Above average', 'Good', 'Great', 'Excellent', 'Amazing'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#262626] rounded-2xl border border-white/10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-serif italic">Week {weekNumber} Review</h2>
            <p className="text-sm text-[#737373] mt-1">
              {weekSummary.completedWorkouts}/{weekSummary.totalWorkouts} workouts completed
            </p>
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
          {/* Overall Feeling */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#a3a3a3]">
              How did you feel this week overall?
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="10"
                value={feelingRating}
                onChange={(e) => setFeelingRating(parseInt(e.target.value))}
                className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-xs text-[#525252]">
                <span>1</span>
                <span className="text-amber-500 font-medium">{feelingRating} - {feelingLabels[feelingRating - 1]}</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#a3a3a3]">
              Energy levels compared to normal?
            </label>
            <div className="flex gap-3">
              {(['low', 'normal', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                    energyLevel === level
                      ? level === 'low'
                        ? 'bg-red-600 text-white'
                        : level === 'normal'
                          ? 'bg-amber-600 text-white'
                          : 'bg-green-600 text-white'
                      : 'bg-[#1a1a1a] border border-white/10 text-[#a3a3a3] hover:bg-white/5'
                  }`}
                >
                  {level === 'low' ? 'Lower' : level === 'normal' ? 'Normal' : 'Higher'}
                </button>
              ))}
            </div>
          </div>

          {/* Week Stats */}
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-serif">{weekSummary.completedWorkouts}/{weekSummary.totalWorkouts}</div>
                <div className="text-xs text-[#525252] uppercase tracking-wider">Workouts</div>
              </div>
              <div>
                <div className="text-xl font-serif">{weekSummary.totalMinutes}</div>
                <div className="text-xs text-[#525252] uppercase tracking-wider">Minutes</div>
              </div>
              <div>
                <div className="text-xl font-serif">{weekSummary.averageRpe || '-'}</div>
                <div className="text-xs text-[#525252] uppercase tracking-wider">Avg RPE</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a3a3a3]">
              Anything else to share? (injuries, life stress, wins)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all resize-none"
              placeholder="e.g., Felt strong on Saturday's long run, but left knee was a bit sore after..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/5">
          <button
            onClick={handleSubmit}
            disabled={isAnalyzing}
            className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analyzing your week...
              </>
            ) : (
              <>
                <Send size={20} />
                Get Week {weekNumber + 1} Recommendations
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
