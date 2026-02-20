import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductsPage } from '../src/pages/ProductsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

describe('ProductsPage', () => {
  it('renders loading state initially', () => {
    // We only test rendering loading state without mocking fetch
    render(
      <QueryClientProvider client={queryClient}>
        <ProductsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading inventory...')).toBeDefined();
  });
});
