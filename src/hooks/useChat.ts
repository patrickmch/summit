'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api/client';
import type { ChatMessage, ChatRequest, ChatResponse } from '@/types/database';

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: Error | null;
  streamingContent: string;
  sendMessage: (content: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamingContent, setStreamingContent] = useState('');

  // Load existing messages
  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet<ChatMessage[]>('/chat');
      setMessages(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load messages'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Send a new message
  const sendMessage = useCallback(async (content: string) => {
    if (sending) return;

    setSending(true);
    setError(null);
    setStreamingContent('');

    // Optimistically add user message
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: '',
      role: 'user',
      content,
      context_snapshot: null,
      plan_changes: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // For now, use regular POST. In production, this would be streaming.
      const response = await apiPost<ChatResponse>('/chat', { message: content } as ChatRequest);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `temp-${Date.now() + 1}`,
        user_id: '',
        role: 'assistant',
        content: response.message,
        context_snapshot: null,
        plan_changes: response.plan_changes ?? null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setSending(false);
      setStreamingContent('');
    }
  }, [sending]);

  return {
    messages,
    loading,
    sending,
    error,
    streamingContent,
    sendMessage,
    refresh: loadMessages,
  };
}

export default useChat;
