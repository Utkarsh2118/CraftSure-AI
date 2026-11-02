import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage component', () => {
  it('renders block error message and title', () => {
    render(<ErrorMessage title="Failed to load" message="Could not connect to service" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getByText('Could not connect to service')).toBeInTheDocument();
  });

  it('renders inline error message', () => {
    render(<ErrorMessage display="inline" message="Required field" />);
    const alert = screen.getByRole('alert');
    expect(alert.className).toMatch(/inline/);
    expect(alert).toHaveTextContent('Required field');
  });

  it('invokes onRetry callback when retry button clicked', async () => {
    const handleRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorMessage message="Something failed" onRetry={handleRetry} />);

    const retryBtn = screen.getByRole('button', { name: /try again/i });
    expect(retryBtn).toBeInTheDocument();
    await user.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
