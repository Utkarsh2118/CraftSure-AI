import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { env } from '../config/env';

/**
 * Initializes server-side Supabase client for user JWT verification.
 * Employs least-privilege configuration: prefers SUPABASE_ANON_KEY,
 * falling back to SUPABASE_SERVICE_ROLE_KEY if that is the sole key provisioned.
 * Server-side keys are kept strictly within server memory and never logged or exposed.
 */
function initSupabaseAuthClient(): SupabaseClient | null {
  const url = env.SUPABASE_URL?.trim();
  const authKey = env.SUPABASE_ANON_KEY?.trim() || env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !authKey) {
    return null;
  }

  try {
    return createClient(url, authKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch {
    // Never expose secrets or sensitive details in logs
    console.warn('[Supabase Client Init Warning] Could not initialize Supabase auth client.');
    return null;
  }
}

export const supabaseAuthClient = initSupabaseAuthClient();

export interface SupabaseAuthResult {
  readonly user: User | null;
  readonly error: Error | null;
}

/**
 * Verifies a Supabase JWT token and retrieves the authenticated user identity.
 * Cryptographically validates token signature, issuer, audience, and expiry.
 * Returns null user if client is unconfigured or token is invalid/expired.
 */
export async function verifySupabaseToken(token: string): Promise<SupabaseAuthResult> {
  if (!supabaseAuthClient) {
    return {
      user: null,
      error: new Error('Supabase client is not configured (missing URL or API key).'),
    };
  }

  try {
    const { data, error } = await supabaseAuthClient.auth.getUser(token);
    if (error || !data.user) {
      return {
        user: null,
        error: error ? new Error(error.message) : new Error('Invalid or expired token'),
      };
    }

    return {
      user: data.user,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? new Error(err.message) : new Error('Authentication failed'),
    };
  }
}
