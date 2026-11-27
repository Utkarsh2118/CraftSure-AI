'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { UserRole } from '@craftsure/shared-types';
import {
  getSupabaseBrowserClient,
  signInWithGoogle as initiateGoogleAuth,
  signOut as terminateSession,
} from '../supabase/client';
import { api } from '../api/client';

export interface AuthProfile {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  profile: AuthProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: (returnUrl?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setDemoUser: (profile: AuthProfile, token?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'craftsure_demo_profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthProfile) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthProfile;
        return `demo-${parsed.role.replace('_', '-')}`;
      }
    } catch {
      // Ignore parse error
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!getSupabaseBrowserClient();
  });

  // Sync profile from backend whenever a Supabase access token is available
  const syncBackendProfile = useCallback(async (jwt: string, authUser: SupabaseUser) => {
    try {
      const dbUser = await api.getCurrentUser(jwt);
      if (dbUser) {
        setProfile({
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          displayName: dbUser.displayName,
          avatarUrl: dbUser.avatarUrl,
        });
        return;
      }
    } catch {
      // If backend is unreachable or not yet synced, construct profile from metadata
    }

    const fallbackRole: UserRole =
      (authUser.user_metadata?.['role'] as UserRole) ?? 'buyer';
    const fallbackName =
      (authUser.user_metadata?.['full_name'] as string) ??
      (authUser.user_metadata?.['name'] as string) ??
      authUser.email?.split('@')[0] ??
      'Craft Patron';

    setProfile({
      id: authUser.id,
      email: authUser.email ?? 'patron@craftsure.ai',
      role: fallbackRole,
      displayName: fallbackName,
      avatarUrl: (authUser.user_metadata?.['avatar_url'] as string) ?? null,
    });
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setToken(initialSession?.access_token ?? null);

      if (initialSession?.access_token && initialSession.user) {
        syncBackendProfile(initialSession.access_token, initialSession.user).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // 2. Auth state subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setToken(newSession?.access_token ?? null);

      if (newSession?.access_token && newSession.user) {
        await syncBackendProfile(newSession.access_token, newSession.user);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncBackendProfile]);

  const signInWithGoogle = async (returnUrl?: string) => {
    return initiateGoogleAuth(returnUrl);
  };

  const signOut = async () => {
    await terminateSession();
    setUser(null);
    setSession(null);
    setProfile(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }
  };

  const setDemoUser = (demoProfile: AuthProfile, demoToken?: string) => {
    setProfile(demoProfile);
    const resolvedToken = demoToken ?? `demo-${demoProfile.role.replace('_', '-')}`;
    setToken(resolvedToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoProfile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        token,
        isLoading,
        isAuthenticated: !!profile || !!user,
        signInWithGoogle,
        signOut,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    // Return safe default when used outside AuthProvider
    return {
      user: null,
      session: null,
      profile: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      signInWithGoogle: async () => ({
        error: new Error('Auth provider is not initialized.'),
      }),
      signOut: async () => {},
      setDemoUser: () => {},
    };
  }
  return context;
}
