import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Mountain } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

const STEPS = ['Objective', 'Background', 'Stats', 'Availability'];

interface OnboardingData {
  // Screen 1: Mountain Objective
  mountainObjective: string;
  targetDate: string;

  // Screen 2: Background
  athleticBackground: string;
  healthConditions: string;

  // Screen 3: Physical Stats
  age: string;
  heightCm: string;
  weightKg: string;

  // Screen 4: Availability
  maxHoursPerWeek: number;
  daysPerWeek: number;
}

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    mountainObjective: '',
    targetDate: '',
    athleticBackground: '',
    healthConditions: '',
    age: '',
    heightCm: '',
    weightKg: '',
    maxHoursPerWeek: 10,
    daysPerWeek: 4,
  });
  const [isBuilding, setIsBuilding] = useState(false);
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();

  const updateData = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return data.mountainObjective.trim().length > 10; // Need a real objective
      case 1: return data.athleticBackground.trim().length > 0;
      case 2: return data.age !== '' && data.heightCm !== '' && data.weightKg !== '';
      case 3: return data.maxHoursPerWeek > 0 && data.daysPerWeek > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(prev => prev + 1);
    } else {
      // Final step - submit
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    setIsBuilding(true);
  };

  // Building state - save data and redirect
  useEffect(() => {
    if (isBuilding) {
      const timer = setTimeout(() => {
        // Infer sport from objective (simple heuristic)
        const objective = data.mountainObjective.toLowerCase();
        let inferredSport: 'Alpine Climbing' | 'Trail Running' | 'Ultra Running' | 'Ski Mountaineering' = 'Alpine Climbing';
        if (objective.includes('run') || objective.includes('trail') || objective.includes('marathon')) {
          inferredSport = objective.includes('ultra') || objective.includes('100') || objective.includes('50k') ? 'Ultra Running' : 'Trail Running';
        } else if (objective.includes('ski') || objective.includes('backcountry')) {
          inferredSport = 'Ski Mountaineering';
        }

        // Save onboarding data
        completeOnboarding({
          sports: [inferredSport],
          heightCm: parseInt(data.heightCm) || 175,
          weightKg: parseInt(data.weightKg) || 70,
          age: parseInt(data.age) || 30,
          experienceLevel: 'Intermediate', // Will be inferred from background by AI
          athleticHistory: `${data.athleticBackground}${data.healthConditions ? `\n\nHealth/Injuries: ${data.healthConditions}` : ''}`,
          primaryGoal: data.mountainObjective,
          targetDate: data.targetDate,
          daysPerWeek: data.daysPerWeek,
          hoursPerWeek: data.maxHoursPerWeek, // This is now MAX, not constant
        });

        navigate('/plan-review');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isBuilding, navigate, data, completeOnboarding]);

  // Building screen
  if (isBuilding) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-1000">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 border-4 border-amber-600/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <Mountain className="absolute inset-0 m-auto text-amber-500" size={64} />
          </div>
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-4xl font-serif italic">Building your plan...</h2>
            <p className="text-[#737373]">
              Creating a periodized program for your objective
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      // Screen 1: Mountain Objective
      case 0:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4">What's your mountain objective?</h2>
              <p className="text-[#737373]">Tell us what you're training for. Be specific.</p>
            </div>
            <div className="space-y-6">
              <div>
                <textarea
                  value={data.mountainObjective}
                  onChange={(e) => updateData('mountainObjective', e.target.value)}
                  placeholder="e.g. Solo aid climb of El Capitan in November. Also want to improve general climbing fitness, do some backcountry skiing this spring, and have summer alpine objectives."
                  rows={5}
                  className="w-full bg-white/5 border-2 border-white/10 p-4 text-lg rounded-xl focus:outline-none focus:border-amber-600 transition-colors resize-none placeholder:text-[#404040]"
                  autoFocus
                />
                <p className="text-xs text-[#525252] mt-2">
                  Include your main goal, timeline, and any secondary objectives.
                </p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#737373] block mb-2">
                  Target Date (optional)
                </label>
                <input
                  type="date"
                  value={data.targetDate}
                  onChange={(e) => updateData('targetDate', e.target.value)}
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:outline-none focus:border-amber-600 transition-colors"
                />
              </div>
            </div>
          </div>
        );

      // Screen 2: Athletic Background
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4">Tell us about your background</h2>
              <p className="text-[#737373]">This helps us calibrate your starting point.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#737373] block mb-2">
                  Athletic Background
                </label>
                <textarea
                  value={data.athleticBackground}
                  onChange={(e) => updateData('athleticBackground', e.target.value)}
                  placeholder="e.g. 3-4 years of formal athletic training with a long history of climbing and mountaineering. Currently climbing 3x/week and running 2x/week."
                  rows={4}
                  className="w-full bg-white/5 border-2 border-white/10 p-4 text-lg rounded-xl focus:outline-none focus:border-amber-600 transition-colors resize-none placeholder:text-[#404040]"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#737373] block mb-2">
                  Health Conditions or Injuries (optional)
                </label>
                <textarea
                  value={data.healthConditions}
                  onChange={(e) => updateData('healthConditions', e.target.value)}
                  placeholder="e.g. Previous ACL surgery (2020), mild shoulder impingement when climbing overhead"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-amber-600 transition-colors resize-none placeholder:text-[#404040]"
                />
              </div>
            </div>
          </div>
        );

      // Screen 3: Physical Stats
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4">Physical stats</h2>
              <p className="text-[#737373]">Used for training load calculations.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#737373] block mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={data.age}
                  onChange={(e) => updateData('age', e.target.value)}
                  placeholder="32"
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:outline-none focus:border-amber-600 transition-colors text-xl"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[#737373] block mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={data.heightCm}
                    onChange={(e) => updateData('heightCm', e.target.value)}
                    placeholder="175"
                    className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:outline-none focus:border-amber-600 transition-colors text-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[#737373] block mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={data.weightKg}
                    onChange={(e) => updateData('weightKg', e.target.value)}
                    placeholder="70"
                    className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:outline-none focus:border-amber-600 transition-colors text-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      // Screen 4: Availability
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4">Training availability</h2>
              <p className="text-[#737373]">We'll build a plan that ramps up to your max capacity.</p>
            </div>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-baseline mb-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#737373]">
                    Max Hours Per Week
                  </label>
                  <span className="text-3xl font-serif text-amber-500">{data.maxHoursPerWeek}h</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="25"
                  value={data.maxHoursPerWeek}
                  onChange={(e) => updateData('maxHoursPerWeek', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600 [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#737373] mt-2">
                  <span>4 hours</span>
                  <span>25 hours</span>
                </div>
                <p className="text-xs text-[#525252] mt-3">
                  This is your maximum. The plan starts at ~50% and builds up progressively.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#737373]">
                    Training Days Per Week
                  </label>
                  <span className="text-3xl font-serif text-amber-500">{data.daysPerWeek}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="6"
                  value={data.daysPerWeek}
                  onChange={(e) => updateData('daysPerWeek', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600 [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#737373] mt-2">
                  <span>3 days</span>
                  <span>6 days</span>
                </div>
              </div>

              <div className="bg-amber-600/10 border border-amber-600/30 rounded-xl p-4">
                <p className="text-sm text-[#a3a3a3]">
                  <span className="text-amber-500 font-medium">Your plan will start at ~{Math.round(data.maxHoursPerWeek * 0.5)} hours/week</span> and progressively build to {data.maxHoursPerWeek} hours as you approach your goal.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col p-6 md:p-12">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4 mb-16 md:mb-20">
        {STEPS.map((s, idx) => (
          <div key={s} className="flex-1 flex flex-col gap-2">
            <div className={`h-1 rounded-full transition-colors ${idx <= step ? 'bg-amber-600' : 'bg-white/5'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${idx === step ? 'text-amber-500' : 'text-[#525252]'}`}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col justify-center">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="max-w-2xl w-full mx-auto flex justify-between items-center mt-12 md:mt-20">
        <Button variant="ghost" onClick={handleBack} className={step === 0 ? 'invisible' : ''}>
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!canProceed()}
          className={!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {step === STEPS.length - 1 ? 'Build My Plan' : 'Continue'}
          <ChevronRight size={20} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
