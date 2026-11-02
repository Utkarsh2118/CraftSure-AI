import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header component', () => {
  it('renders brand link and main navigation links', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByLabelText(/CraftSure AI — Go to homepage/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse' })).toHaveAttribute('href', '/browse');
    expect(screen.getByRole('link', { name: 'Districts' })).toHaveAttribute('href', '/districts');
    expect(screen.getByRole('link', { name: 'Crafts' })).toHaveAttribute('href', '/crafts');
    expect(screen.getByRole('link', { name: 'Sell with Us' })).toHaveAttribute(
      'href',
      '/artisan/apply',
    );
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  });

  it('renders action links with accessible labels', () => {
    render(<Header />);
    expect(screen.getByLabelText('Search products')).toBeInTheDocument();
    expect(screen.getByLabelText('Saved items')).toBeInTheDocument();
    expect(screen.getByLabelText('Shopping cart')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/auth/sign-in');
  });
});
