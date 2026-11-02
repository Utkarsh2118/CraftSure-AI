import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** For inline errors (e.g. form fields), use 'inline'. For page sections, use 'block'. */
  display?: 'inline' | 'block';
}

/**
 * Displays error states in a consistent, accessible way.
 * - Inline: small, next to a field or component
 * - Block: section-level error with optional retry
 *
 * Always provides a specific, actionable message. Never show "Something went wrong."
 * alone — add context about what failed and what the user can do.
 */
export function ErrorMessage({ title, message, onRetry, display = 'block' }: ErrorMessageProps) {
  if (display === 'inline') {
    return (
      <span className={styles.inline} role="alert">
        <AlertCircle size={14} aria-hidden="true" />
        {message}
      </span>
    );
  }

  return (
    <div className={styles.block} role="alert" aria-live="assertive">
      <AlertCircle size={24} className={styles.icon} aria-hidden="true" />
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        <p className={styles.message}>{message}</p>
      </div>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry} type="button">
          <RefreshCw size={16} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
