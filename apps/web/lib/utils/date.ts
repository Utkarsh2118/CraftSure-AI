/**
 * Date formatting utilities
 * Uses Intl.DateTimeFormat for locale-aware display.
 */

const DATE_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const DATE_SHORT_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/**
 * Format an ISO 8601 date string as a long date.
 * @example formatDate("2024-06-15T10:00:00Z") // "15 June 2024"
 */
export function formatDate(isoString: string): string {
  return DATE_FORMATTER.format(new Date(isoString));
}

/**
 * Format an ISO 8601 date string as a short date.
 * @example formatDateShort("2024-06-15T10:00:00Z") // "15 Jun 2024"
 */
export function formatDateShort(isoString: string): string {
  return DATE_SHORT_FORMATTER.format(new Date(isoString));
}

/**
 * Format an ISO 8601 date as a relative time string.
 * Falls back to a short date for dates older than 30 days.
 * @example formatRelativeDate("2024-06-15T10:00:00Z") // "3 days ago"
 */
export function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) > 30) {
    return formatDateShort(isoString);
  }

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return RELATIVE_FORMATTER.format(diffHours, 'hour');
  }

  return RELATIVE_FORMATTER.format(diffDays, 'day');
}
