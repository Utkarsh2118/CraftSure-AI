import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Required: explicit id for label association */
  id: string;
  /** Always visible label — never use placeholder as the only label */
  label: string;
  /** Supplementary help text shown below the input */
  hint?: string;
  /** Validation error message */
  error?: string;
  /** Icon or addon on the left side of the input */
  leftAddon?: ReactNode;
  /** Icon or addon on the right side of the input */
  rightAddon?: ReactNode;
}

/**
 * Text input with visible label, hint, and error state.
 * Labels are always visible — placeholder is optional supplementary text only.
 * Never use placeholder alone as the label.
 */
export function Input({
  id,
  label,
  hint,
  error,
  leftAddon,
  rightAddon,
  className,
  disabled,
  required,
  ...props
}: InputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn(styles.wrapper, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-label="required">
            *
          </span>
        )}
      </label>

      <div
        className={cn(styles.inputWrapper, error && styles.hasError, disabled && styles.disabled)}
      >
        {leftAddon && (
          <span className={styles.addon} aria-hidden="true">
            {leftAddon}
          </span>
        )}
        <input
          id={id}
          className={styles.input}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...props}
        />
        {rightAddon && (
          <span className={cn(styles.addon, styles.addonRight)} aria-hidden="true">
            {rightAddon}
          </span>
        )}
      </div>

      {hint && !error && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
