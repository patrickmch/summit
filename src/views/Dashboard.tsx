
import React from 'react';
import { Activity, Heart, Moon, TrendingUp, ChevronRight } from 'lucide-react';
import { WorkoutCard } from '../components/WorkoutCard';
import { MetricCard } from '../components/MetricCard';
import { MOCK_WORKOUT, MOCK_METRICS } from '../constants';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <section>
        <h1 className="text-4xl md:text-5xl font-serif mb-2">Morning, Jane.</h1>
        <p className="text-lg text-[#737373]">Your recovery looks solid. High capacity for today's technical session.</p>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="HRV" value={65} unit="ms" icon={<Heart size={16} />} />
        <MetricCard label="Sleep" value={8.2} unit="hrs" icon={<Moon size={16} />} />
        <MetricCard label="Recovery" value={92} unit="%" icon={<TrendingUp size={16} />} />
        <MetricCard label="Load" value={145} icon={<Activity size={16} />} />
      </section>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main: Workout */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#737373]">Today's Session</h3>
          </div>
          <WorkoutCard workout={MOCK_WORKOUT} />
        </div>

        {/* Sidebar: Weekly Outlook */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#737373]">This Week</h3>
            <button className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors">
              Full Plan <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="bg-[#262626] border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden">
            {MOCK_METRICS.map((day, idx) => (
              <div key={day.date} className="p-4 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`w-8 text-xs font-bold uppercase tracking-widest ${idx === 4 ? 'text-amber-500' : 'text-[#737373]'}`}>
                    {day.date}
                  </span>
                  <span className="text-sm font-medium">
                    {idx === 0 ? 'Strength' : idx === 1 ? 'Endurance' : idx === 2 ? 'Mobility' : idx === 4 ? 'Tech Session' : 'Base Endurance'}
                  </span>
                </div>
                {day.completed ? (
                  <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                    <TrendingUp size={14} />
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-full border border-white/10 ${idx === 4 ? 'border-amber-500/50' : ''}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-amber-600/10 to-amber-900/10 p-6 rounded-xl border border-amber-600/20">
            <h4 className="font-serif italic text-amber-500 mb-2">Coach's Note</h4>
            <p className="text-sm text-[#f5f2ed]/70 leading-relaxed italic">
              "We're entering a peak load block. Focus on quality of movement over total volume this week. Your fingers are primed."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
