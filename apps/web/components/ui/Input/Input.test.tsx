import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input component', () => {
  it('renders input with associated label and allows typing', async () => {
    const user = userEvent.setup();
    render(<Input id="search-input" label="Search Techniques" placeholder="e.g. shadow work" />);

    const input = screen.getByLabelText('Search Techniques');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'e.g. shadow work');

    await user.type(input, 'Murri');
    expect(input).toHaveValue('Murri');
  });

  it('renders error state and sets aria-invalid and aria-describedby', () => {
    render(
      <Input id="email-input" label="Email address" error="Please enter a valid email address" />,
    );

    const input = screen.getByLabelText('Email address');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-input-error');

    const errorMsg = screen.getByRole('alert');
    expect(errorMsg).toHaveTextContent('Please enter a valid email address');
  });

  it('renders hint text and sets aria-describedby when no error', () => {
    render(<Input id="phone-input" label="Phone number" hint="10-digit Indian mobile number" />);

    const input = screen.getByLabelText('Phone number');
    expect(input).toHaveAttribute('aria-describedby', 'phone-input-hint');
    expect(screen.getByText('10-digit Indian mobile number')).toBeInTheDocument();
  });
});
