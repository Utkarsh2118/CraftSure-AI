import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <main className={styles.main} id="main-content">
      <div className={styles.content}>
        <p className={styles.code} aria-label="Error code">
          404
        </p>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Try browsing our
          catalogue instead.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryLink}>
            Go to homepage
          </Link>
          <Link href="/browse" className={styles.secondaryLink}>
            Browse handicrafts
          </Link>
        </div>
      </div>
    </main>
  );
}
