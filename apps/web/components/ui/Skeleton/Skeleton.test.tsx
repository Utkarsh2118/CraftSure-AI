import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, ProductCardSkeleton } from './Skeleton';

describe('Skeleton component', () => {
  it('renders default skeleton with aria-hidden="true"', () => {
    const { container } = render(<Skeleton width="100px" height="20px" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.style.width).toBe('100px');
    expect(el.style.height).toBe('20px');
  });

  it('renders ProductCardSkeleton composite skeleton', () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('span')).toHaveLength(4);
  });
});
