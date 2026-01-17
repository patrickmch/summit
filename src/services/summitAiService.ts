const SUMMIT_AI_URL = import.meta.env.VITE_SUMMIT_AI_URL || 'http://localhost:8000';

const COACH_PERSONA = `You are SummitCoach, a world-class training assistant for elite mountain athletes (climbers, ultra runners, alpinists, skimo racers).
Your tone is professional, encouraging, data-driven, and stoic.
You understand training methodologies like Uphill Athlete, periodization, and the nuances of mountain sports.
When athletes are tired or tweaked, you provide advice on whether to push or rest based on physiological principles.
Always maintain a premium, helpful, and slightly mysterious "mountain mentor" vibe.
Keep responses concise but high-impact.`;

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

  const userQuery = conversationContext
    ? `${conversationContext}\nUser: ${userMessage}`
    : userMessage;

  const fullPrompt = `${COACH_PERSONA}\n\n${userQuery}`;

  const request: QueryRequest = {
    prompt: fullPrompt,
    context_source: 'vector',
    context_config: {
      collection: 'endurance-training',
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
