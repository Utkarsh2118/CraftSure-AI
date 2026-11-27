import { createClient, type SupabaseClient, type Session, type User } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase browser client.
 * Returns null if Supabase environment variables are missing (e.g. offline dev).
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']?.trim();
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'craftsure-auth-token',
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.warn('[Supabase Client Error] Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Initiates Google OAuth redirect via Supabase Auth.
 */
export async function signInWithGoogle(returnUrl?: string): Promise<{ error: Error | null }> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      error: new Error(
        'Google OAuth requires Supabase configuration. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.',
      ),
    };
  }

  try {
    const callbackOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const queryParam = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';
    const redirectTo = `${callbackOrigin}/auth/callback${queryParam}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err : new Error('Unexpected error starting Google OAuth.'),
    };
  }
}

/**
 * Terminates the current Supabase session.
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err : new Error('Failed to sign out.'),
    };
  }
}

/**
 * Retrieves the current session if available.
 */
export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authenticated user if available.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}
