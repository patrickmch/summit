'use client';

import { cn } from '@/lib/utils/cn';
import { formatRelativeTime } from '@/lib/utils/date';
import type { MessageRole, PlanChange } from '@/types/database';
import { StructuredContent } from './StructuredContent';

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  planChanges?: PlanChange[] | null;
  createdAt?: string;
  isStreaming?: boolean;
}

export function MessageBubble({
  role,
  content,
  planChanges,
  createdAt,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  return (
    <div
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className={cn(
        'max-w-[85%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* Avatar for assistant */}
        {isAssistant && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[var(--color-header-bg)] flex items-center justify-center">
              <MountainIcon className="w-3 h-3 text-[var(--color-accent)]" />
            </div>
            <span className="text-micro text-[var(--color-text-muted)]">Summit Coach</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-[var(--color-header-bg)] text-white rounded-br-md'
              : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-bl-md'
          )}
        >
          {/* Message content */}
          <div className={cn(
            'text-body whitespace-pre-wrap',
            isStreaming && 'animate-pulse-subtle'
          )}>
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>

          {/* Plan changes (structured content) */}
          {planChanges && planChanges.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border-light)]">
              <StructuredContent planChanges={planChanges} />
            </div>
          )}
        </div>

        {/* Timestamp */}
        {createdAt && !isStreaming && (
          <p className={cn(
            'text-micro text-[var(--color-text-muted)] mt-1',
            isUser ? 'text-right' : 'text-left'
          )}>
            {formatRelativeTime(createdAt)}
          </p>
        )}
      </div>
    </div>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

export default MessageBubble;
