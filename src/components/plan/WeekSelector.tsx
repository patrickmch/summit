import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekSelectorProps {
  currentWeek: number;
  totalWeeks: number;
  phaseName: string;
  isCurrentWeek: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  currentWeek,
  totalWeeks,
  phaseName,
  isCurrentWeek,
  onPreviousWeek,
  onNextWeek,
}) => {
  const canGoPrevious = currentWeek > 1;
  const canGoNext = currentWeek < totalWeeks;

  return (
    <div className="flex items-center justify-between bg-[#262626] border border-white/5 rounded-xl p-4">
      <button
        onClick={onPreviousWeek}
        disabled={!canGoPrevious}
        className={`
          p-2 rounded-lg transition-colors
          ${canGoPrevious
            ? 'hover:bg-white/5 text-[#f5f2ed]'
            : 'text-[#525252] cursor-not-allowed'
          }
        `}
        aria-label="Previous week"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl font-bold text-[#f5f2ed]">
            Week {currentWeek}
          </span>
          <span className="text-[#737373]">of {totalWeeks}</span>
          {isCurrentWeek && (
            <span className="px-2 py-0.5 bg-amber-600/20 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-full">
              Current
            </span>
          )}
        </div>
        <div className="text-sm text-[#737373] mt-1">
          {phaseName} Phase
        </div>
      </div>

      <button
        onClick={onNextWeek}
        disabled={!canGoNext}
        className={`
          p-2 rounded-lg transition-colors
          ${canGoNext
            ? 'hover:bg-white/5 text-[#f5f2ed]'
            : 'text-[#525252] cursor-not-allowed'
          }
        `}
        aria-label="Next week"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
