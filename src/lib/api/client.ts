/**
 * API Client for Summit
 * Handles authenticated requests to our backend API routes
 */

import { createBrowserClient } from '@/lib/supabase/browser';

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message?: string
  ) {
    super(message || `API Error: ${status}`);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * Make an authenticated API request
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const supabase = createBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();

  const { body, ...restOptions } = options;

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`/api${endpoint}`, fetchOptions);

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    throw new ApiError(response.status, errorData);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/**
 * GET request helper
 */
export function apiGet<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export function apiPost<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * PUT request helper
 */
export function apiPut<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: 'PUT', body });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
}
