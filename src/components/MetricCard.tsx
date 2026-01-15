
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, trend, icon }) => {
  return (
    <div className="bg-[#262626] p-4 rounded-xl border border-white/5 flex flex-col justify-between hover:border-amber-600/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#737373]">{label}</span>
        <div className="text-amber-500/80">{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[#f5f2ed]">{value}</span>
        {unit && <span className="text-xs text-[#737373] font-medium">{unit}</span>}
      </div>
      <div className={`mt-2 h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden`}>
        <div 
          className="h-full bg-amber-600/50 rounded-full" 
          style={{ width: `${Math.min(100, Number(value) / 100 * 100)}%` }} 
        />
      </div>
    </div>
  );
};
