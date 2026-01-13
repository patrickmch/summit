/**
 * Supabase Client Configuration
 *
 * We use two different clients:
 * 1. Browser client - for client-side operations with user's session
 * 2. Server client - for API routes with service role (bypasses RLS for admin ops)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables (validated at runtime, not build time)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Validate that required environment variables are set
 * Called at runtime, not during build
 */
function validateEnv() {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
}

// Lazy-initialized browser client
let _supabase: SupabaseClient | null = null;

/**
 * Browser/Client-side Supabase client
 * Uses anon key and respects RLS policies
 */
export const supabase = {
  get client() {
    if (!_supabase) {
      validateEnv();
      _supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return _supabase;
  },
};

/**
 * Server-side Supabase client with service role
 * Bypasses RLS - use only in trusted server contexts
 */
export function createServerClient(): SupabaseClient {
  validateEnv();
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Create a Supabase client authenticated with a user's JWT
 * Use this in API routes to maintain user context
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  validateEnv();
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
