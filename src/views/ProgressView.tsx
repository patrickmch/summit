
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Trophy, Clock, Target, Calendar } from 'lucide-react';

const LOAD_DATA = [
  { name: 'Week 1', load: 350, hrv: 62 },
  { name: 'Week 2', load: 480, hrv: 60 },
  { name: 'Week 3', load: 520, hrv: 58 },
  { name: 'Week 4', load: 220, hrv: 68 },
  { name: 'Week 5', load: 450, hrv: 64 },
  { name: 'Week 6', load: 590, hrv: 55 },
  { name: 'Week 7', load: 680, hrv: 52 },
  { name: 'Week 8', load: 300, hrv: 70 },
];

const VOLUME_DATA = [
  { type: 'Strength', hours: 12 },
  { type: 'Endurance', hours: 45 },
  { type: 'Tech', hours: 28 },
  { type: 'Mobility', hours: 8 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 p-4 rounded-lg shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-[#737373] mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-sm font-medium text-[#f5f2ed]">{p.name}: {p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ProgressView: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <section>
        <h1 className="text-4xl md:text-5xl font-serif mb-2">Progress</h1>
        <p className="text-lg text-[#737373]">Tracking toward: <span className="text-[#f5f2ed] italic">The Nose, El Capitan</span></p>
      </section>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Hours', value: '93', unit: 'hrs', icon: <Clock /> },
          { label: 'Completion', value: '88', unit: '%', icon: <Target /> },
          { label: 'Milestones', value: '4', icon: <Trophy /> }
        ].map(s => (
          <div key={s.label} className="bg-[#262626] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#737373] mb-1">{s.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{s.value}</span>
                {s.unit && <span className="text-sm text-[#737373]">{s.unit}</span>}
              </div>
            </div>
            <div className="text-amber-500/30">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Training Load Chart */}
        <div className="bg-[#262626] p-8 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#737373]">Training Load over Time</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LOAD_DATA}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="load" 
                  stroke="#d97706" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorLoad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Distribution Chart */}
        <div className="bg-[#262626] p-8 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#737373]">Volume by Discipline</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VOLUME_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="type" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {VOLUME_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? '#d97706' : '#404040'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Milestones Vertical List */}
      <section className="bg-[#262626] p-8 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#737373] mb-8">Recent Milestones</h3>
        <div className="space-y-8">
          {[
            { title: 'Base Phase Completed', date: 'March 14', desc: 'Successfully hit 4 weeks of aerobic base building.' },
            { title: 'Finger Strength PR', date: 'March 02', desc: 'Completed a 10s hang at +20% bodyweight on 20mm edge.' },
            { title: 'HRV Stabilization', date: 'Feb 15', desc: '7-day rolling average HRV improved by 12%.' }
          ].map((m, idx) => (
            <div key={idx} className="flex gap-6 relative">
              {idx !== 2 && <div className="absolute left-3 top-8 bottom-[-2rem] w-px bg-white/5" />}
              <div className="w-6 h-6 rounded-full bg-amber-600/20 flex items-center justify-center shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-amber-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-[#f5f2ed]">{m.title}</h4>
                  <span className="text-xs text-[#737373]">{m.date}</span>
                </div>
                <p className="text-sm text-[#737373] leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
