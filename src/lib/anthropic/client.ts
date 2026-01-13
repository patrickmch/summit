/**
 * Anthropic Claude Client Configuration
 *
 * This module provides the Claude AI client for plan generation and coaching.
 * We use streaming for chat interactions and regular calls for plan generation.
 */

import Anthropic from '@anthropic-ai/sdk';

// Environment validation
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn('Warning: ANTHROPIC_API_KEY not set. AI features will not work.');
}

/**
 * Anthropic client instance
 * Claude 3.5 Sonnet is used for the balance of speed and quality
 */
export const anthropic = new Anthropic({
  apiKey: apiKey || '',
});

/**
 * Model configuration
 * Using Claude 3.5 Sonnet for optimal balance of cost, speed, and capability
 */
export const MODEL_CONFIG = {
  // Primary model for plan generation and complex reasoning
  primary: 'claude-sonnet-4-20250514' as const,

  // Fast model for simple adaptations and quick responses
  fast: 'claude-sonnet-4-20250514' as const,

  // Token limits
  maxTokens: {
    planGeneration: 8000,
    chat: 2000,
    adaptation: 4000,
  },
};

/**
 * Generate a completion with Claude
 * Wrapper function for consistent error handling
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
  const response = await anthropic.messages.create({
    model: options?.model || MODEL_CONFIG.primary,
    max_tokens: options?.maxTokens || 4000,
    temperature: options?.temperature ?? 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  // Extract text from response
  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return textBlock.text;
}

/**
 * Generate a structured JSON response from Claude
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
  const response = await generateCompletion(
    systemPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, just the JSON object.',
    userPrompt,
    {
      ...options,
      temperature: options?.temperature ?? 0.5, // Lower temp for structured output
    }
  );

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
    console.error('Failed to parse Claude response as JSON:', response);
    throw new Error(`Invalid JSON response from Claude: ${error}`);
  }
}

/**
 * Stream a response from Claude
 * Returns an async iterator for real-time chat
 */
export async function* streamCompletion(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): AsyncGenerator<string> {
  const stream = await anthropic.messages.stream({
    model: options?.model || MODEL_CONFIG.primary,
    max_tokens: options?.maxTokens || MODEL_CONFIG.maxTokens.chat,
    temperature: options?.temperature ?? 0.7,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}
