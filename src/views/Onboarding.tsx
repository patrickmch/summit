
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Watch, Check, Mountain, Wind, Flame, Dumbbell } from 'lucide-react';
import { Button } from '../components/Button';
import { Discipline } from '../types';

const STEPS = [
  'Discipline',
  'Goal',
  'Schedule',
  'Equipment',
  'Connect',
  'Building'
];

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(prev => prev + 1);
    } else {
      navigate('/');
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(prev => prev - 1);
  };

  const toggleDiscipline = (d: Discipline) => {
    setDisciplines(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-5xl font-serif text-center mb-12 italic">What's your primary discipline?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {[
                { name: 'Climbing', icon: <Mountain size={24} /> },
                { name: 'Ultra', icon: <Wind size={24} /> },
                { name: 'Skimo', icon: <Flame size={24} /> },
                { name: 'Mountaineering', icon: <Mountain size={24} /> }
              ].map(d => (
                <button
                  key={d.name}
                  onClick={() => toggleDiscipline(d.name as Discipline)}
                  className={`
                    p-8 rounded-2xl border-2 transition-all flex flex-col items-center gap-4
                    ${disciplines.includes(d.name as Discipline) 
                      ? 'bg-amber-600/10 border-amber-600 text-[#f5f2ed]' 
                      : 'bg-white/5 border-white/5 text-[#737373] hover:border-white/10 hover:bg-white/10'}
                  `}
                >
                  <div className={disciplines.includes(d.name as Discipline) ? 'text-amber-500' : ''}>
                    {d.icon}
                  </div>
                  <span className="text-xl font-medium">{d.name}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto text-center">
            <h2 className="text-5xl font-serif mb-4 italic">What's the big objective?</h2>
            <p className="text-[#737373] mb-8">Be specific. Grades, peaks, or events.</p>
            <input 
              type="text" 
              placeholder="e.g. Lead my first 5.12a, UTMB Mont-Blanc..."
              className="w-full bg-white/5 border-b-2 border-amber-600/30 p-4 text-3xl font-serif focus:outline-none focus:border-amber-600 transition-colors placeholder:text-[#262626]"
            />
            <div className="mt-12 text-left">
              <label className="text-xs font-bold uppercase tracking-widest text-[#737373]">Target Date</label>
              <input type="date" className="w-full mt-2 bg-white/5 p-4 rounded-xl border border-white/5 focus:outline-none" />
            </div>
          </div>
        );
      case 5:
        // Simulation of plan building
        setTimeout(() => navigate('/'), 3000);
        return (
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 border-4 border-amber-600/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <Mountain className="absolute inset-0 m-auto text-amber-500" size={64} />
            </div>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-serif italic">Building your plan...</h2>
              <p className="text-[#737373] animate-pulse">Analyzing physiological needs for {disciplines.join(', ')}</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-4xl font-serif italic mb-8">Coming soon...</h2>
            <p className="text-[#737373]">We're dialing in the final details of this step.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col p-6 md:p-12">
      {/* Progress */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4 mb-20">
        {STEPS.map((s, idx) => (
          <div key={s} className="flex-1 flex flex-col gap-2">
            <div className={`h-1 rounded-full transition-colors ${idx <= step ? 'bg-amber-600' : 'bg-white/5'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${idx === step ? 'text-amber-500' : 'text-[#737373]'}`}>
              {s}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {renderStep()}
      </div>

      {step < 5 && (
        <div className="max-w-4xl w-full mx-auto flex justify-between items-center mt-20">
          <Button variant="ghost" onClick={handleBack} className={step === 0 ? 'invisible' : ''}>
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <Button size="lg" onClick={handleNext}>
            {step === 4 ? 'Build Plan' : 'Continue'}
            <ChevronRight size={20} className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
