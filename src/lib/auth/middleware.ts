/**
 * Authentication Middleware
 *
 * Extracts and validates the user from the Authorization header.
 * Supabase handles JWT validation automatically.
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthResult {
  user: AuthenticatedUser | null;
  error: string | null;
}

/**
 * Extract and validate user from request
 * Returns null user if not authenticated
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const supabase = createServerClient();

    // Verify the JWT and get user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { user: null, error: error?.message || 'Invalid token' };
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
      },
      error: null,
    };
  } catch (err) {
    console.error('Auth error:', err);
    return { user: null, error: 'Authentication failed' };
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthenticatedUser> {
  const { user, error } = await getAuthenticatedUser(request);

  if (!user) {
    throw new AuthError(error || 'Unauthorized');
  }

  return user;
}

/**
 * Custom auth error class
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Helper to create error responses
 */
export function errorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 });
}
