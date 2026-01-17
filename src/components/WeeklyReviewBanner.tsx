import React, { useState } from 'react';
import { ClipboardCheck, ChevronRight, X } from 'lucide-react';
import { WeeklyReviewModal } from './WeeklyReviewModal';

interface WeeklyReviewBannerProps {
  weekNumber: number;
}

export const WeeklyReviewBanner: React.FC<WeeklyReviewBannerProps> = ({ weekNumber }) => {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-600/10 to-transparent border border-amber-600/30 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
            <ClipboardCheck className="text-amber-500" size={20} />
          </div>
          <div>
            <h3 className="font-medium text-[#f5f2ed]">Week {weekNumber} Review</h3>
            <p className="text-sm text-[#a3a3a3]">
              Share how your week went so we can adjust next week's training.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X size={18} className="text-[#737373]" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            Start Review
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {showModal && (
        <WeeklyReviewModal
          weekNumber={weekNumber}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
