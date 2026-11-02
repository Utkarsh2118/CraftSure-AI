import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button/Button';

/**
 * M1.1 Smoke test — verifies the design system renders and test tooling works.
 * Detailed component tests are added in M1.2.
 */
describe('M1.1 Scaffold Smoke Test', () => {
  it('renders the Button component without crashing', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument();
  });

  it('Button shows loading state correctly', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('Button is accessible with correct disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
