'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { api } from '@/lib/api/client';
import { Header } from '@/components/layout/Header/Header';
import styles from './page.module.css';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const initialError = oauthError
    ? errorDescription || 'Google authentication was not completed. Please try signing in again.'
    : null;

  const [statusMessage, setStatusMessage] = useState('Verifying your Google session...');
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);

  useEffect(() => {
    if (initialError) {
      return;
    }

    const returnUrl = searchParams.get('returnUrl') || '/browse';
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      // Offline fallback: navigate safely to returnUrl
      router.replace(returnUrl);
      return;
    }

    let isMounted = true;

    async function processAuth() {
      try {
        setStatusMessage('Establishing secure artisan marketplace session...');
        const { data, error: sessionError } = await supabase!.auth.getSession();

        if (sessionError) {
          if (isMounted) setErrorMessage(sessionError.message);
          return;
        }

        if (data.session?.access_token) {
          try {
            // Lazy provision and verify user role in backend database
            await api.getCurrentUser(data.session.access_token);
          } catch {
            // Backend offline resilience - continue with authenticated Supabase session
          }

          if (isMounted) {
            setStatusMessage('Authentication verified! Redirecting to CraftSure AI...');
            router.replace(returnUrl);
          }
        } else {
          // If session is still propagating, listen for state change event
          const {
            data: { subscription },
          } = supabase!.auth.onAuthStateChange(async (event, newSession) => {
            if (event === 'SIGNED_IN' && newSession?.access_token) {
              try {
                await api.getCurrentUser(newSession.access_token);
              } catch {
                // Resilience
              }
              subscription.unsubscribe();
              if (isMounted) {
                router.replace(returnUrl);
              }
            }
          });

          // Timeout fallback in case of stalled redirect
          setTimeout(() => {
            if (isMounted) {
              router.replace(returnUrl);
            }
          }, 3000);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(
            err instanceof Error ? err.message : 'An unexpected error occurred during login.',
          );
        }
      }
    }

    void processAuth();

    return () => {
      isMounted = false;
    };
  }, [initialError, router, searchParams]);

  return (
    <div className={styles.card}>
      {errorMessage ? (
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <AlertCircle size={36} />
          </div>
          <span className={styles.eyebrow}>AUTHENTICATION FAILED</span>
          <h1 className={styles.title}>Could not complete Google Sign-In</h1>
          <p className={styles.description}>{errorMessage}</p>

          <Link href="/auth/sign-in" className={styles.retryBtn}>
            <span>Return to Sign In</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className={styles.loadingContent}>
          <div className={styles.spinnerWrapper}>
            <Sparkles size={32} className={styles.sparkleIcon} />
            <div className={styles.spinner} />
          </div>
          <span className={styles.eyebrow}>CRAFTSURE AI HERITAGE AUTH</span>
          <h1 className={styles.title}>Connecting your account</h1>
          <p className={styles.description}>{statusMessage}</p>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className={styles.container}>
          <Suspense
            fallback={
              <div className={styles.card}>
                <div className={styles.loadingContent}>
                  <div className={styles.spinnerWrapper}>
                    <div className={styles.spinner} />
                  </div>
                  <h1 className={styles.title}>Loading session...</h1>
                </div>
              </div>
            }
          >
            <CallbackHandler />
          </Suspense>
        </div>
      </main>
    </>
  );
}
