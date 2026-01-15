
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Info } from 'lucide-react';
import { ChatMessage } from '../types';
import { getCoachResponse } from '../services/geminiService';

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'm your coach. Ask me anything about your training, recovery, or upcoming objectives.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const coachText = await getCoachResponse(input, history);

    const coachMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: coachText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, coachMsg]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-[#262626] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1a1a1a]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-600/10 flex items-center justify-center text-amber-500">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-serif italic text-lg">Summit Coach</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#737373]">Knowledge Base: Elite</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-[#737373] hover:text-[#f5f2ed] transition-colors">
          <Info size={18} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
      >
        {messages.length === 1 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40">
            <MessageSquare size={48} className="text-[#737373]" />
            <div className="space-y-2">
              <p className="text-lg italic font-serif">Awaiting your lead.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Why am I doing this phase?", "I'm feeling tired", "Move my long run"].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setInput(p)}
                    className="px-3 py-1.5 rounded-full border border-white/10 text-xs hover:bg-white/5 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`
              max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed
              ${m.role === 'user' 
                ? 'bg-[#d97706] text-white rounded-br-none' 
                : 'bg-[#1a1a1a] border border-white/5 text-[#f5f2ed] rounded-bl-none'}
            `}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl rounded-bl-none">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#737373] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#737373] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-[#737373] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-[#1a1a1a]/50 border-t border-white/5">
        <div className="relative max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything or make a change..."
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all text-[#f5f2ed]"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-[#333] transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
