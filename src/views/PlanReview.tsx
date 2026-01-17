import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Send, Mountain, CheckCircle2, Sparkles, RefreshCw, X } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth, TrainingPlan } from '../contexts/AuthContext';
import { generateStructuredPlan, chatAboutPlanStream, regeneratePlanWithChanges } from '../services/summitAiService';
import { ChatMessage, StructuredPlan } from '../types';
import { getNextMonday } from '../utils/planUtils';

export const PlanReview: React.FC = () => {
  const navigate = useNavigate();
  const { user, acceptPlan } = useAuth();

  const [structuredPlan, setStructuredPlan] = useState<StructuredPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Streaming state
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Plan update confirmation state
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingChangeDescription, setPendingChangeDescription] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Generate structured plan on mount
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const plan = await generateStructuredPlan(user || {});
        setStructuredPlan(plan);

        // Add initial coach message with plan summary
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `I've built a ${plan.totalWeeks}-week training plan based on your goals and availability. The plan has ${plan.phases.length} phases: ${plan.phases.map(p => p.name).join(', ')}. Take a look and let me know if you'd like any adjustments.`,
          timestamp: new Date()
        }]);
      } catch (err) {
        setError('Failed to generate plan. Make sure summit-ai is running.');
        console.error('Plan generation error:', err);
      } finally {
        setIsGenerating(false);
      }
    };

    fetchPlan();
  }, [user]);

  // Auto-scroll chat (including during streaming)
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isSending, streamingContent]);

  // Heuristic patterns for detecting change requests
  const CHANGE_PATTERNS = [
    /add more/i, /reduce/i, /increase/i, /remove/i,
    /change.*to/i, /adjust/i, /modify/i, /less.*more/i,
    /fewer/i, /more rest/i, /less intensity/i, /more intensity/i,
    /swap/i, /replace/i, /include/i, /drop/i, /cut/i,
    /longer/i, /shorter/i, /easier/i, /harder/i
  ];

  /**
   * Check if the user's message or AI response suggests plan changes
   */
  const checkForPlanChanges = (response: string, userMessage: string): boolean => {
    const userWantsChange = CHANGE_PATTERNS.some(p => p.test(userMessage));
    const aiSuggestsChange = CHANGE_PATTERNS.some(p => p.test(response));

    return userWantsChange || aiSuggestsChange;
  };

  /**
   * Apply pending changes to the plan
   */
  const applyPlanChanges = async () => {
    if (!structuredPlan) return;

    setIsRegenerating(true);

    try {
      const updatedPlan = await regeneratePlanWithChanges(
        structuredPlan,
        pendingChangeDescription
      );

      setStructuredPlan(updatedPlan);
      setShowUpdateConfirm(false);
      setPendingChangeDescription('');

      // Add system message about the update
      const updateMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '✓ Plan updated based on your feedback. Take a look at the changes on the left.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, updateMsg]);
    } catch (err) {
      console.error('Failed to apply plan changes:', err);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I couldn't apply those changes automatically. Let's discuss what you'd like to adjust.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsRegenerating(false);
    }
  };

  /**
   * Dismiss the update confirmation without applying changes
   */
  const dismissUpdateConfirm = () => {
    setShowUpdateConfirm(false);
    setPendingChangeDescription('');
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !structuredPlan) return;

    const userMessage = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');
    setIsSending(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      let fullResponse = '';

      // Stream the response
      for await (const chunk of chatAboutPlanStream(userMessage, structuredPlan.markdownSummary, history)) {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }

      // Finalize the assistant message
      const coachMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, coachMsg]);
      setStreamingContent('');

      // Check if this conversation suggests plan changes
      if (checkForPlanChanges(fullResponse, userMessage)) {
        setPendingChangeDescription(fullResponse);
        setShowUpdateConfirm(true);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting. Make sure summit-ai is running on localhost:8000.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      setStreamingContent('');
    } finally {
      setIsStreaming(false);
      setIsSending(false);
    }
  };

  const handleAccept = () => {
    if (!structuredPlan) return;

    const plan: TrainingPlan = {
      structured: structuredPlan,
      generatedAt: new Date(),
      planStartDate: getNextMonday(), // Plan starts next Monday
    };
    acceptPlan(plan);
    navigate('/');
  };

  // Loading state
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-1000">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 border-4 border-amber-600/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <Mountain className="absolute inset-0 m-auto text-amber-500" size={64} />
          </div>
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-4xl font-serif italic text-[#f5f2ed]">Crafting your plan...</h2>
            <p className="text-[#737373]">
              Analyzing training science and building a periodized program for{' '}
              <span className="text-amber-500">{user?.sports?.join(' & ') || 'your goals'}</span>
            </p>
            <div className="pt-4 space-y-2 text-sm text-[#525252]">
              <p className="animate-pulse">Consulting the knowledge base...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-600/10 flex items-center justify-center">
            <Mountain className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-serif italic text-[#f5f2ed]">Connection Error</h2>
          <p className="text-[#737373]">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#1a1a1a]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mountain className="text-amber-500" size={28} />
            <span className="font-serif italic text-xl text-[#f5f2ed]">Summit</span>
          </div>
          <Button onClick={handleAccept} size="lg">
            <CheckCircle2 size={20} className="mr-2" />
            Accept Plan & Start Training
          </Button>
        </div>
      </header>

      {/* Main content - two column layout */}
      <div className="flex-1 flex">
        {/* Left: Plan Display */}
        <div className="flex-1 overflow-y-auto p-8 border-r border-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-serif italic text-[#f5f2ed] mb-2">Your Training Plan</h1>
              <p className="text-[#737373]">
                Review the plan below. Use the chat to discuss modifications.
              </p>
            </div>

            {/* Markdown content with custom styling */}
            <div className="prose prose-invert prose-amber max-w-none
              prose-headings:font-serif prose-headings:italic prose-headings:text-[#f5f2ed]
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-amber-500
              prose-p:text-[#a3a3a3] prose-p:leading-relaxed
              prose-strong:text-[#f5f2ed] prose-strong:font-semibold
              prose-ul:text-[#a3a3a3]
              prose-li:text-[#a3a3a3] prose-li:marker:text-amber-600
              prose-hr:border-white/10
            ">
              <ReactMarkdown>{structuredPlan?.markdownSummary || ''}</ReactMarkdown>
            </div>

            {/* Plan Stats Summary */}
            {structuredPlan && (
              <div className="mt-8 p-6 bg-[#262626] rounded-xl border border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-amber-500 mb-4">Plan Overview</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-serif">{structuredPlan.totalWeeks}</div>
                    <div className="text-xs text-[#737373] uppercase tracking-wider">Weeks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-serif">{structuredPlan.phases.length}</div>
                    <div className="text-xs text-[#737373] uppercase tracking-wider">Phases</div>
                  </div>
                  <div>
                    <div className="text-2xl font-serif">{structuredPlan.weeks[0]?.workouts.length || 0}</div>
                    <div className="text-xs text-[#737373] uppercase tracking-wider">Days/Week</div>
                  </div>
                </div>
              </div>
            )}

            {/* Hour Progression Chart */}
            {structuredPlan && (
              <div className="mt-6 p-6 bg-[#262626] rounded-xl border border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-amber-500 mb-4">Volume Progression</h3>
                <div className="space-y-3">
                  {/* Find max hours for scaling */}
                  {(() => {
                    const maxHours = Math.max(...structuredPlan.weeks.map(w => w.targetHours || 0));
                    const phases = structuredPlan.phases;

                    return structuredPlan.weeks.map((week) => {
                      const phase = phases.find(p => week.weekNumber >= p.weekStart && week.weekNumber <= p.weekEnd);
                      const widthPercent = maxHours > 0 ? (week.targetHours / maxHours) * 100 : 0;
                      const isPhaseStart = phase?.weekStart === week.weekNumber;

                      return (
                        <div key={week.weekNumber} className="flex items-center gap-3">
                          <div className="w-8 text-xs text-[#525252] text-right">{week.weekNumber}</div>
                          <div className="flex-1 h-6 bg-[#1a1a1a] rounded overflow-hidden relative">
                            <div
                              className={`h-full rounded transition-all ${
                                phase?.name === 'Base Building' ? 'bg-green-600/60' :
                                phase?.name === 'Build' ? 'bg-amber-600/60' :
                                'bg-red-600/60'
                              }`}
                              style={{ width: `${widthPercent}%` }}
                            />
                            {isPhaseStart && (
                              <div className="absolute inset-y-0 left-2 flex items-center">
                                <span className="text-[10px] font-bold text-white/80">
                                  {phase?.name === 'Base Building' ? 'BASE' : phase?.name === 'Build' ? 'BUILD' : 'PEAK'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="w-12 text-xs text-[#737373] text-right">
                            {week.targetHours}h
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-[#525252]">
                    <div className="w-3 h-3 rounded bg-green-600/60" /> Base
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#525252]">
                    <div className="w-3 h-3 rounded bg-amber-600/60" /> Build
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#525252]">
                    <div className="w-3 h-3 rounded bg-red-600/60" /> Peak/Taper
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat Panel */}
        <div className="w-[400px] flex flex-col bg-[#262626]">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-600/10 flex items-center justify-center text-amber-500">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-serif italic text-lg text-[#f5f2ed]">Plan Review</h3>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#737373]">
                Ask questions or request changes
              </p>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`
                  max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                  ${m.role === 'user'
                    ? 'bg-amber-600 text-white rounded-br-none'
                    : 'bg-[#1a1a1a] border border-white/5 text-[#f5f2ed] rounded-bl-none'}
                `}>
                  {m.content}
                </div>
              </div>
            ))}
            {/* Streaming message with cursor */}
            {isStreaming && streamingContent && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="max-w-[85%] p-3 rounded-2xl rounded-bl-none text-sm leading-relaxed bg-[#1a1a1a] border border-white/5 text-[#f5f2ed]">
                  {streamingContent}
                  <span className="inline-block w-2 h-4 bg-amber-500 ml-1 animate-pulse" />
                </div>
              </div>
            )}
            {/* Loading dots (only shown before streaming starts) */}
            {isSending && !streamingContent && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a1a] border border-white/5 p-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#737373] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#737373] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#737373] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestion chips */}
          {messages.length === 1 && !showUpdateConfirm && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {["Add more recovery", "Increase intensity", "Explain the phases"].map(p => (
                  <button
                    key={p}
                    onClick={() => setInput(p)}
                    className="px-3 py-1.5 rounded-full border border-white/10 text-xs text-[#a3a3a3] hover:bg-white/5 hover:text-[#f5f2ed] transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Update confirmation banner */}
          {showUpdateConfirm && (
            <div className="px-4 pb-2 animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-amber-600/10 border border-amber-600/30 rounded-xl p-4">
                <p className="text-sm text-[#f5f2ed] mb-3">
                  Apply these changes to your plan?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={applyPlanChanges}
                    disabled={isRegenerating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {isRegenerating ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        Yes, update plan
                      </>
                    )}
                  </button>
                  <button
                    onClick={dismissUpdateConfirm}
                    disabled={isRegenerating}
                    className="px-4 py-2 border border-white/10 text-[#a3a3a3] rounded-lg hover:bg-white/5 hover:text-[#f5f2ed] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about the plan..."
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all text-[#f5f2ed] text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-[#333] disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
