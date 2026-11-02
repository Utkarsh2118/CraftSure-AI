import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('combines classes properly', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  it('filters out falsy and undefined values', () => {
    expect(cn('btn', false && 'hidden', undefined, null, 'active')).toBe('btn active');
  });
});
