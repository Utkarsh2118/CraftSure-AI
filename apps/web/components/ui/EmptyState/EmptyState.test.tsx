import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState component', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No artisans found"
        description="Try adjusting your technique or fabric filters to discover other artisans."
      />,
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'No artisans found' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/adjusting your technique/)).toBeInTheDocument();
  });

  it('renders action button and illustration when provided', () => {
    render(
      <EmptyState
        title="Saved items empty"
        description="Browse our catalogue to save authentic Chikankari creations."
        action={<button>Browse Catalogue</button>}
        illustration={<span data-testid="test-icon">icon</span>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Browse Catalogue' })).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});
