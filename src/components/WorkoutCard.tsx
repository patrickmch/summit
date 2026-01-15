
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Zap, Target } from 'lucide-react';
import { Workout } from '../types';
import { Button } from './Button';

export const WorkoutCard: React.FC<{ workout: Workout }> = ({ workout }) => {
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);

  return (
    <div className="bg-[#262626] border border-white/5 rounded-xl shadow-2xl overflow-hidden transition-all hover:border-amber-600/20">
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-600/20 text-amber-500 text-xs font-bold uppercase tracking-widest rounded-full">
                {workout.type}
              </span>
              <span className="text-[#737373] text-sm font-medium">
                {workout.phase} • Week {workout.week}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#f5f2ed]">{workout.title}</h2>
          </div>
          <div className="flex items-center gap-4 text-[#f5f2ed]/60">
            <div className="flex items-center gap-1.5">
              <Clock size={18} className="text-amber-500" />
              <span className="text-sm font-medium">{workout.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={18} className="text-amber-500" />
              <span className="text-sm font-medium">Intensity: High</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
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
                  <h3 className="text-lg font-semibold text-[#f5f2ed] group-hover:text-amber-500 transition-colors">
                    {block.title}
                  </h3>
                  <p className="text-sm text-[#737373]">{block.duration}</p>
                </div>
                {expandedBlock === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {expandedBlock === idx && (
                <div className="px-4 pb-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="mt-4 text-[#f5f2ed]/80 leading-relaxed mb-4">
                    {block.instructions}
                  </p>
                  {block.details && (
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

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" fullWidth className="group">
            Start Workout 
            <Zap size={18} className="ml-2 group-hover:animate-pulse" />
          </Button>
          <Button variant="outline" fullWidth>Log Manually</Button>
        </div>
      </div>
    </div>
  );
};
