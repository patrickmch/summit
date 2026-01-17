
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mountain, Wind, Flame, CheckCircle2, X, Mail, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export const LandingPage: React.FC = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, signInWithGoogle, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    if (isSupabaseConfigured()) {
      // Use magic link
      const { error } = await signInWithMagicLink(email.trim());
      if (error) {
        setError(error.message);
      } else {
        setMagicLinkSent(true);
      }
    } else {
      // Fallback to localStorage auth
      signUp(email.trim());
      navigate('/onboarding');
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // OAuth redirects, so we don't navigate here
    } catch (err) {
      setError('Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const openSignup = () => {
    setShowSignupModal(true);
    setMagicLinkSent(false);
    setError(null);
    setEmail('');
  };

  const closeSignup = () => setShowSignupModal(false);

  return (
    <div className="bg-[#1a1a1a] selection:bg-amber-600/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-24 bg-gradient-to-b from-[#1a1a1a] to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d97706] rounded flex items-center justify-center font-bold text-black italic">S</div>
          <span className="text-xl font-bold tracking-tighter">SUMMIT</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <a href="#how" className="text-sm font-medium text-[#737373] hover:text-[#f5f2ed] transition-colors">How it works</a>
          <a href="#pricing" className="text-sm font-medium text-[#737373] hover:text-[#f5f2ed] transition-colors">Pricing</a>
          <Button variant="ghost" size="sm" onClick={openSignup}>Log In</Button>
          <Button size="sm" onClick={openSignup}>Start Free</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80&w=2000"
            alt="Alpinist on a ridge"
            className="w-full h-full object-cover opacity-40 animate-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/20 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-serif mb-6 leading-[1.1]">
            Train with <span className="italic text-amber-500">intention</span>.<br />
            Climb with confidence.
          </h1>
          <p className="text-lg md:text-xl text-[#f5f2ed]/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered training plans for mountain athletes.
            Adapts to your life, your data, and your wildest objectives.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto" onClick={openSignup}>
              Start Free Trial
            </Button>
            <a href="#how">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto border border-white/10">
                See How It Works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y border-white/5 bg-[#1a1a1a]">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#737373] mb-12">Trusted by athletes from</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/The_North_Face_logo.svg" alt="TNF" className="h-8 invert" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Patagonia_logo.svg" alt="Patagonia" className="h-10 invert" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c2/Arc%27teryx_Logo.svg" alt="Arcteryx" className="h-6 invert" />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-32 container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-amber-600/10 rounded-xl flex items-center justify-center text-amber-500">
              <Mountain size={24} />
            </div>
            <h3 className="text-2xl font-serif">Define the Objective</h3>
            <p className="text-[#737373] leading-relaxed">
              Tell us what you're training for — a grade, a peak, or a time. We build a custom periodized plan based on your unique physiology.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-amber-600/10 rounded-xl flex items-center justify-center text-amber-500">
              <Wind size={24} />
            </div>
            <h3 className="text-2xl font-serif">Sync Your Gear</h3>
            <p className="text-[#737373] leading-relaxed">
              Connect Garmin, Coros, or Apple Watch. Summit tracks your HRV and sleep to adjust your intensity in real-time.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-amber-600/10 rounded-xl flex items-center justify-center text-amber-500">
              <Flame size={24} />
            </div>
            <h3 className="text-2xl font-serif">Execute with a Coach</h3>
            <p className="text-[#737373] leading-relaxed">
              Confused by a workout? Feeling a tweak? Talk to our AI coach 24/7 to get professional guidance on your training.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-[#262626]/30 border-y border-white/5">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-4xl font-serif mb-6 text-amber-500 italic">One simple plan.</h2>
          <p className="text-lg text-[#737373] mb-12">A elite-level coach in your pocket for less than a gym day pass.</p>

          <div className="bg-[#1a1a1a] p-10 rounded-2xl border border-amber-600/20 shadow-2xl">
            <div className="text-6xl font-serif mb-2">$10<span className="text-xl text-[#737373] font-sans">/mo</span></div>
            <p className="text-sm font-bold tracking-widest text-[#737373] mb-8 uppercase">Cancel Anytime</p>
            <ul className="space-y-4 mb-10 text-left max-w-xs mx-auto">
              {['Full AI Coaching', 'Unlimited Custom Plans', 'Wearable Integration', 'Progress Visualization'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={18} className="text-amber-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Button fullWidth size="lg" onClick={openSignup}>
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#d97706] rounded flex items-center justify-center font-bold text-black italic text-xs">S</div>
            <span className="text-sm font-bold tracking-tighter">SUMMIT</span>
          </div>
          <div className="flex gap-8 text-xs font-medium text-[#737373]">
            <a href="#" className="hover:text-[#f5f2ed]">Terms</a>
            <a href="#" className="hover:text-[#f5f2ed]">Privacy</a>
            <a href="#" className="hover:text-[#f5f2ed]">Support</a>
          </div>
          <p className="text-xs text-[#737373]">© 2024 Summit Training. For those who go high.</p>
        </div>
      </footer>

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeSignup} />
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeSignup}
              className="absolute top-4 right-4 text-[#737373] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-[#d97706] rounded-xl flex items-center justify-center font-bold text-black italic text-xl mx-auto mb-4">
                S
              </div>
              <h2 className="text-2xl font-serif italic">Start your journey</h2>
              <p className="text-sm text-[#737373] mt-2">14-day free trial. No credit card required.</p>
            </div>

            {magicLinkSent ? (
              // Magic link sent confirmation
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-amber-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail size={32} className="text-amber-500" />
                </div>
                <h3 className="text-xl font-serif mb-2">Check your email</h3>
                <p className="text-sm text-[#737373] mb-6">
                  We sent a login link to <span className="text-white">{email}</span>
                </p>
                <button
                  onClick={() => setMagicLinkSent(false)}
                  className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                {/* Google Sign In (only when Supabase is configured) */}
                {isSupabaseConfigured() && (
                  <>
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 p-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      )}
                      Continue with Google
                    </button>

                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs text-[#737373] uppercase tracking-widest">or</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                  </>
                )}

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-[#737373] block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="athlete@example.com"
                      required
                      disabled={isLoading}
                      className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:outline-none focus:border-amber-600 transition-colors disabled:opacity-50"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}

                  <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : isSupabaseConfigured() ? (
                      'Send Magic Link'
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </form>

                <p className="text-xs text-[#525252] text-center mt-6">
                  By continuing, you agree to our Terms and Privacy Policy.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
