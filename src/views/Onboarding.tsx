
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Mountain, Footprints, SkipForward, Snowflake } from 'lucide-react';
import { Button } from '../components/Button';
import { Sport, ExperienceLevel } from '../types';

const STEPS = [
  'Sports',
  'About You',
  'Experience',
  'Goals',
  'Schedule',
  'Building'
];

interface OnboardingData {
  sports: Sport[];
  heightCm: string;
  weightKg: string;
  age: string;
  experienceLevel: ExperienceLevel | null;
  yearsTraining: string;
  athleticHistory: string;
  primaryGoal: string;
  targetDate: string;
  daysPerWeek: number;
  hoursPerWeek: number;
}

const SPORTS_CONFIG: { name: Sport; icon: React.ReactNode; description: string }[] = [
  { name: 'Trail Running', icon: <Footprints size={28} />, description: 'Technical trails & mountain running' },
  { name: 'Ultra Running', icon: <SkipForward size={28} />, description: '50K+ endurance events' },
  { name: 'Alpine Climbing', icon: <Mountain size={28} />, description: 'Technical alpine routes & peaks' },
  { name: 'Ski Mountaineering', icon: <Snowflake size={28} />, description: 'Backcountry skiing & ski touring' },
];

const EXPERIENCE_LEVELS: { level: ExperienceLevel; description: string }[] = [
  { level: 'Beginner', description: 'New to structured training, building foundations' },
  { level: 'Intermediate', description: '1-3 years of consistent training' },
  { level: 'Advanced', description: '3+ years, completed major objectives' },
  { level: 'Elite', description: 'Competitive or professional level' },
];

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    sports: [],
    heightCm: '',
    weightKg: '',
    age: '',
    experienceLevel: null,
    yearsTraining: '',
    athleticHistory: '',
    primaryGoal: '',
    targetDate: '',
    daysPerWeek: 4,
    hoursPerWeek: 8,
  });
  const navigate = useNavigate();

  const updateData = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const toggleSport = (sport: Sport) => {
    setData(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return data.sports.length > 0;
      case 1: return data.heightCm !== '' && data.weightKg !== '' && data.age !== '';
      case 2: return data.experienceLevel !== null;
      case 3: return data.primaryGoal.trim() !== '';
      case 4: return data.daysPerWeek > 0 && data.hoursPerWeek > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(prev => prev - 1);
  };

  // Building step - redirect after animation
  useEffect(() => {
    if (step === 5) {
      const timer = setTimeout(() => {
        // In a real app, we'd save the data here
        console.log('Onboarding data:', data);
        navigate('/');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [step, navigate, data]);

  const renderStep = () => {
    switch (step) {
      // Step 0: Sports Selection
      case 0:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4">What do you train for?</h2>
              <p className="text-[#737373]">Select all that apply</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {SPORTS_CONFIG.map(sport => (
                <button
                  key={sport.name}
                  onClick={() => toggleSport(sport.name)}
                  className={`
                    p-6 rounded-2xl border-2 transition-all text-left
                    ${data.sports.includes(sport.name)
                      ? 'bg-amber-600/10 border-amber-600'
                      : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 ${data.sports.includes(sport.name) ? 'text-amber-500' : 'text-[#737373]'}`}>
                      {sport.icon}
                    </div>
                    <div>
                      <span className={`text-xl font-medium block ${data.sports.includes(sport.name) ? 'text-[#f5f2ed]' : 'text-[#a3a3a3]'}`}>
                        {sport.name}
                      </span>
                      <span className="text-sm text-[#737373]">{sport.description}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 1: Physical Info
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4">Tell us about yourself</h2>
              <p className="text-[#737373]">This helps us tailor training intensity</p>
            </div>
            <div className="space-y-6">
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
                />
              </div>
            </div>
          </div>
        );

      // Step 2: Experience
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4">What's your current level?</h2>
              <p className="text-[#737373]">Be honest – this shapes your starting point</p>
            </div>
            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map(({ level, description }) => (
                <button
                  key={level}
                  onClick={() => updateData('experienceLevel', level)}
                  className={`
                    w-full p-5 rounded-xl border-2 transition-all text-left flex items-center justify-between
                    ${data.experienceLevel === level
                      ? 'bg-amber-600/10 border-amber-600'
                      : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}
                  `}
                >
                  <div>
                    <span className={`text-lg font-medium block ${data.experienceLevel === level ? 'text-[#f5f2ed]' : 'text-[#a3a3a3]'}`}>
                      {level}
                    </span>
                    <span className="text-sm text-[#737373]">{description}</span>
                  </div>
                  {data.experienceLevel === level && (
                    <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#737373] block mb-2">
                  Years of Training
                </label>
                <input
                  type="number"
                  value={data.yearsTraining}
                  onChange={(e) => updateData('yearsTraining', e.target.value)}
                  placeholder="3"
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:outline-none focus:border-amber-600 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#737373] block mb-2">
                  Athletic Background (optional)
                </label>
                <textarea
                  value={data.athleticHistory}
                  onChange={(e) => updateData('athleticHistory', e.target.value)}
                  placeholder="e.g. Ran cross country in college, picked up climbing 2 years ago..."
                  rows={3}
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:outline-none focus:border-amber-600 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        );

      // Step 3: Goals
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4">What's the big objective?</h2>
              <p className="text-[#737373]">Be specific – peaks, events, or personal milestones</p>
            </div>
            <div className="space-y-6">
              <div>
                <textarea
                  value={data.primaryGoal}
                  onChange={(e) => updateData('primaryGoal', e.target.value)}
                  placeholder={
                    data.sports.includes('Ultra Running')
                      ? "e.g. Finish my first 100-miler at Western States"
                      : data.sports.includes('Alpine Climbing')
                      ? "e.g. Summit the Grand Teton via the Exum Ridge"
                      : data.sports.includes('Ski Mountaineering')
                      ? "e.g. Complete the Haute Route from Chamonix to Zermatt"
                      : "e.g. Run a sub-3 hour trail marathon"
                  }
                  rows={4}
                  className="w-full bg-white/5 border-2 border-white/10 p-4 text-xl rounded-xl focus:outline-none focus:border-amber-600 transition-colors resize-none placeholder:text-[#404040]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#737373] block mb-2">
                  Target Date
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

      // Step 4: Schedule
      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4">How much time can you commit?</h2>
              <p className="text-[#737373]">We'll build a plan that fits your life</p>
            </div>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-baseline mb-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#737373]">
                    Training Days Per Week
                  </label>
                  <span className="text-3xl font-serif text-amber-500">{data.daysPerWeek}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="7"
                  value={data.daysPerWeek}
                  onChange={(e) => updateData('daysPerWeek', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600 [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#737373] mt-2">
                  <span>2 days</span>
                  <span>7 days</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#737373]">
                    Hours Per Week
                  </label>
                  <span className="text-3xl font-serif text-amber-500">{data.hoursPerWeek}h</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="25"
                  value={data.hoursPerWeek}
                  onChange={(e) => updateData('hoursPerWeek', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600 [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#737373] mt-2">
                  <span>3 hours</span>
                  <span>25 hours</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                <p className="text-sm text-[#737373]">
                  <span className="text-amber-500 font-medium">Recommended:</span> For {data.sports.join(' & ')},
                  {data.experienceLevel === 'Beginner' && ' start with 4-6 hours across 3-4 days.'}
                  {data.experienceLevel === 'Intermediate' && ' aim for 6-10 hours across 4-5 days.'}
                  {data.experienceLevel === 'Advanced' && ' 10-15 hours across 5-6 days is optimal.'}
                  {data.experienceLevel === 'Elite' && ' 15-20+ hours across 6 days for peak performance.'}
                  {!data.experienceLevel && ' 6-10 hours across 4-5 days is a good starting point.'}
                </p>
              </div>
            </div>
          </div>
        );

      // Step 5: Building
      case 5:
        return (
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 border-4 border-amber-600/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <Mountain className="absolute inset-0 m-auto text-amber-500" size={64} />
            </div>
            <div className="text-center space-y-4 max-w-md">
              <h2 className="text-4xl font-serif italic">Building your plan...</h2>
              <p className="text-[#737373]">
                Crafting a {data.hoursPerWeek}-hour weekly program for{' '}
                <span className="text-amber-500">{data.sports.join(' & ')}</span>
              </p>
              <div className="pt-4 space-y-2 text-sm text-[#525252]">
                <p className="animate-pulse">Analyzing periodization needs...</p>
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
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-2 md:gap-4 mb-16 md:mb-20">
        {STEPS.map((s, idx) => (
          <div key={s} className="flex-1 flex flex-col gap-2">
            <div className={`h-1 rounded-full transition-colors ${idx <= step ? 'bg-amber-600' : 'bg-white/5'}`} />
            <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest ${idx === step ? 'text-amber-500' : 'text-[#525252]'}`}>
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
      {step < 5 && (
        <div className="max-w-4xl w-full mx-auto flex justify-between items-center mt-12 md:mt-20">
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
            {step === 4 ? 'Build My Plan' : 'Continue'}
            <ChevronRight size={20} className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
