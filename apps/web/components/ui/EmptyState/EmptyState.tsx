import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  /** Short headline explaining what's missing */
  title: string;
  /** Helpful description — suggest what the user can do */
  description: string;
  /** Optional action (e.g., a Button or Link) */
  action?: ReactNode;
  /** Optional illustration or icon — keep it simple */
  illustration?: ReactNode;
}

/**
 * Shown when a list or search returns no results.
 * Always provide a helpful description and ideally an action.
 * Never use generic copy like "No items found."
 */
export function EmptyState({ title, description, action, illustration }: EmptyStateProps) {
  return (
    <div className={styles.container} role="status">
      {illustration && (
        <div className={styles.illustration} aria-hidden="true">
          {illustration}
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
