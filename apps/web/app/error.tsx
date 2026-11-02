'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './error.module.css';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router error boundary — shown when an unhandled error occurs
 * in a route segment. Must be a Client Component.
 *
 * Provides:
 * - A retry option (calls reset() to re-render the segment)
 * - Navigation back to safety
 * - Error digest for support (not the full stack trace — never expose internals to users)
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error tracking service in production (Phase 2: Sentry)
    console.error('[Page Error]', error);
  }, [error]);

  return (
    <main className={styles.main} id="main-content">
      <div className={styles.content}>
        <p className={styles.code} aria-label="Error code">
          500
        </p>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.description}>
          We ran into an unexpected problem loading this page. This has been noted. You can try
          again, or head back to the homepage.
        </p>
        {error.digest && (
          <p className={styles.digest}>
            Error reference: <code>{error.digest}</code>
          </p>
        )}
        <div className={styles.actions}>
          <button onClick={reset} className={styles.retryButton} type="button">
            Try again
          </button>
          <Link href="/" className={styles.homeLink}>
            Go to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
