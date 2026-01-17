const SUMMIT_AI_URL = import.meta.env.VITE_SUMMIT_AI_URL || 'http://localhost:8000';

interface QueryRequest {
  prompt: string;
  context_source?: 'vector';
  context_config?: {
    collection: string;
    top_k: number;
  };
  llm?: 'claude' | 'gemini';
}

interface QueryResponse {
  response: string;
  llm_used: string;
  context_loaded: boolean;
}

export const getCoachResponse = async (
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> => {
  // Build prompt with conversation history
  const conversationContext = history
    .map((h) => `${h.role === 'user' ? 'User' : 'Coach'}: ${h.content}`)
    .join('\n');

  const fullPrompt = conversationContext
    ? `${conversationContext}\nUser: ${userMessage}`
    : userMessage;

  const request: QueryRequest = {
    prompt: fullPrompt,
    context_source: 'vector',
    context_config: {
      collection: 'training_methodology',
      top_k: 5,
    },
    llm: 'claude',
  };

  const res = await fetch(`${SUMMIT_AI_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Summit AI error: ${res.status}`);
  }

  const data: QueryResponse = await res.json();
  return data.response;
};
