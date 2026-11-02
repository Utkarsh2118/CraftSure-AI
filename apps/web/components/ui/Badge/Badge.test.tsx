import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge component', () => {
  it('renders children correctly', () => {
    render(<Badge>Chikankari</Badge>);
    expect(screen.getByText('Chikankari')).toBeInTheDocument();
  });

  it('renders default craft variant', () => {
    const { container } = render(<Badge>Handmade</Badge>);
    expect((container.firstChild as HTMLElement).className).toMatch(/craft/);
  });

  it('renders specific variant (e.g. gi badge)', () => {
    const { container } = render(<Badge variant="gi">GI Tagged</Badge>);
    expect((container.firstChild as HTMLElement).className).toMatch(/gi/);
    expect(screen.getByText('GI Tagged')).toBeInTheDocument();
  });

  it('renders district and category variants', () => {
    const { container: distContainer } = render(<Badge variant="district">Varanasi</Badge>);
    expect((distContainer.firstChild as HTMLElement).className).toMatch(/district/);
    expect(screen.getByText('Varanasi')).toBeInTheDocument();

    const { container: catContainer } = render(<Badge variant="category">Metal & Glass</Badge>);
    expect((catContainer.firstChild as HTMLElement).className).toMatch(/category/);
    expect(screen.getByText('Metal & Glass')).toBeInTheDocument();
  });
});
