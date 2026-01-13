/**
 * LLM Router Client
 *
 * Provides a unified interface to the llm_router service, which abstracts
 * LLM providers (Claude, Gemini) behind a single API.
 *
 * This replaces direct Anthropic SDK usage for better flexibility.
 */

// Configuration
const LLM_ROUTER_URL = process.env.LLM_ROUTER_URL || 'http://localhost:8000';
const DEFAULT_LLM = process.env.DEFAULT_LLM || 'claude';

if (!process.env.LLM_ROUTER_URL) {
  console.warn('Warning: LLM_ROUTER_URL not set. Using default: http://localhost:8000');
}

/**
 * Response from the LLM Router service
 */
interface LLMRouterResponse {
  response: string;
  llm_used: string;
  context_loaded: boolean;
  context_summary?: string;
}

/**
 * Request to the LLM Router service
 */
interface LLMRouterRequest {
  prompt: string;
  llm?: string;
  context_source?: 'file' | 'json' | 'sqlite' | 'none';
  context_config?: {
    file_path?: string;
    json_data?: unknown;
    db_path?: string;
    query?: string;
  };
}

/**
 * Model configuration
 * Kept for compatibility with existing code
 */
export const MODEL_CONFIG = {
  // Primary model for plan generation and complex reasoning
  primary: 'claude' as const,

  // Fast model for simple adaptations and quick responses
  fast: 'claude' as const,

  // Token limits (informational - actual limits handled by llm_router)
  maxTokens: {
    planGeneration: 8000,
    chat: 2000,
    adaptation: 4000,
  },
};

/**
 * Call the LLM Router service
 */
async function callLLMRouter(request: LLMRouterRequest): Promise<LLMRouterResponse> {
  const response = await fetch(`${LLM_ROUTER_URL}/api/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: request.prompt,
      llm: request.llm || DEFAULT_LLM,
      context_source: request.context_source || 'none',
      context_config: request.context_config || {},
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM Router error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Generate a completion
 * Compatible interface with the previous Anthropic client
 */
export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  // Combine system prompt and user prompt for the router
  // The router doesn't have a separate system prompt concept
  const combinedPrompt = `${systemPrompt}

---

${userPrompt}`;

  const result = await callLLMRouter({
    prompt: combinedPrompt,
    llm: options?.model || DEFAULT_LLM,
  });

  return result.response;
}

/**
 * Generate a structured JSON response
 * Includes parsing and validation
 */
export async function generateStructuredResponse<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<T> {
  const enhancedSystemPrompt = `${systemPrompt}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, just the JSON object.`;

  const response = await generateCompletion(enhancedSystemPrompt, userPrompt, options);

  // Try to extract JSON from the response
  let jsonStr = response.trim();

  // Handle markdown code blocks
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }

  jsonStr = jsonStr.trim();

  try {
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error('Failed to parse LLM response as JSON:', response);
    throw new Error(`Invalid JSON response from LLM: ${error}`);
  }
}

/**
 * Generate completion with context from JSON data
 * Useful for providing user profile/plan data as context
 */
export async function generateCompletionWithContext(
  systemPrompt: string,
  userPrompt: string,
  context: unknown,
  options?: {
    model?: string;
  }
): Promise<string> {
  const combinedPrompt = `${systemPrompt}

---

${userPrompt}`;

  const result = await callLLMRouter({
    prompt: combinedPrompt,
    llm: options?.model || DEFAULT_LLM,
    context_source: 'json',
    context_config: {
      json_data: context,
    },
  });

  return result.response;
}

/**
 * Health check for the LLM Router service
 */
export async function checkLLMRouterHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${LLM_ROUTER_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
