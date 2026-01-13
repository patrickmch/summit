'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { DayCell } from './DayCell';
import type { Workout } from '@/types/database';
import { isToday as checkIsToday } from 'date-fns';

interface DayData {
  date: Date;
  workout: Workout | null;
}

interface DayStripProps {
  days: DayData[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  className?: string;
}

export function DayStrip({ days, selectedDate, onSelectDate, className }: DayStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to selected day on mount and when selection changes
  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = days.findIndex(
        (d) => d.date.toDateString() === selectedDate.toDateString()
      );
      if (selectedIndex !== -1) {
        const cellWidth = 48 + 8; // w-12 + gap-2
        const containerWidth = scrollRef.current.offsetWidth;
        const scrollPosition = selectedIndex * cellWidth - containerWidth / 2 + cellWidth / 2;
        scrollRef.current.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth',
        });
      }
    }
  }, [selectedDate, days]);

  return (
    <div className={cn('bg-[var(--color-surface-secondary)] py-3', className)}>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4"
      >
        {days.map((day) => {
          const isSelected = day.date.toDateString() === selectedDate.toDateString();
          const isToday = checkIsToday(day.date);

          return (
            <DayCell
              key={day.date.toISOString()}
              date={day.date}
              workout={day.workout}
              isSelected={isSelected}
              isToday={isToday}
              onClick={() => onSelectDate(day.date)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default DayStrip;
