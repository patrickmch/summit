'use client';

import { useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import { PageShell, FullHeightContainer } from '@/components/layout';
import { MessageBubble, ChatInput } from '@/components/chat';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

const SUGGESTED_PROMPTS = [
  "What should I do if I miss a day?",
  "Explain my current training phase",
  "I'm feeling tired today",
  "Can you adjust my schedule?",
];

export default function ChatPage() {
  const searchParams = useSearchParams();
  const context = searchParams.get('context');

  const { messages, loading, sending, error, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  // Handle context-based initial messages
  useEffect(() => {
    if (context === 'modify-today' && messages.length === 0 && !loading) {
      // Could auto-send a contextual message here
      // For now, we'll just show the empty state with prompts
    }
  }, [context, messages.length, loading]);

  const handleSend = async (message: string) => {
    await sendMessage(message);
  };

  const handlePromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <PageShell
      showNav={true}
      padForNav={false}
      background="default"
      header={<ChatHeader />}
    >
      <FullHeightContainer className="flex flex-col h-[calc(100vh-4rem-4rem)]">
        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4"
        >
          {loading ? (
            <ChatSkeleton />
          ) : messages.length === 0 ? (
            <EmptyState
              onPromptClick={handlePromptClick}
              contextPrompt={context === 'modify-today' ? "I'd like to modify today's workout" : undefined}
            />
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  planChanges={message.plan_changes}
                  createdAt={message.created_at}
                />
              ))}

              {/* Streaming indicator */}
              {sending && (
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-caption">Coach is thinking...</span>
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="mb-4 p-3 bg-[var(--color-error-light)] rounded-lg text-[var(--color-error)] text-caption">
                  {error.message}
                </div>
              )}
            </>
          )}
        </div>

        {/* Input area */}
        <ChatInput
          onSend={handleSend}
          disabled={sending || loading}
        />
      </FullHeightContainer>
    </PageShell>
  );
}

function ChatHeader() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-header-bg)] safe-top">
      <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
        <MountainIcon className="w-5 h-5 text-[var(--color-accent)]" />
      </div>
      <div>
        <h1 className="text-body font-semibold text-white">Summit Coach</h1>
        <p className="text-micro text-slate-400">AI-powered training guidance</p>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void;
  contextPrompt?: string;
}

function EmptyState({ onPromptClick, contextPrompt }: EmptyStateProps) {
  const prompts = contextPrompt ? [contextPrompt, ...SUGGESTED_PROMPTS.slice(0, 3)] : SUGGESTED_PROMPTS;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--color-surface-secondary)] flex items-center justify-center">
        <ChatIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
      </div>
      <h2 className="text-title text-[var(--color-text-primary)] mb-2">
        Your AI Coach
      </h2>
      <p className="text-caption text-[var(--color-text-secondary)] max-w-xs mb-6">
        Ask questions about your training, request changes to your plan, or get guidance on recovery.
      </p>

      {/* Suggested prompts */}
      <div className="w-full max-w-sm space-y-2">
        <p className="text-micro text-[var(--color-text-muted)] uppercase tracking-wide">
          Try asking
        </p>
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptClick(prompt)}
            className={cn(
              'w-full text-left px-4 py-3 rounded-xl',
              'bg-[var(--color-surface)] border border-[var(--color-border)]',
              'text-caption text-[var(--color-text-primary)]',
              'hover:bg-[var(--color-surface-secondary)]',
              'transition-colors tap-highlight-none'
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <div className="max-w-[80%]">
          <Skeleton variant="rectangular" height={80} width={250} className="rounded-2xl" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <Skeleton variant="rectangular" height={50} width={200} className="rounded-2xl" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="max-w-[80%]">
          <Skeleton variant="rectangular" height={100} width={280} className="rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// Icons
function MountainIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  );
}
