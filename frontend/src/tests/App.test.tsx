import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '../features/auth/LoginPage';
import { OverviewPage } from '../features/overview/OverviewPage';

describe('Frontend Application Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    localStorage.clear();
  });

  it('renders login page with email and password inputs and demo badge', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('CloudOps Command Center')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@organization.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText(/admin@cloudops.internal/i)).toBeInTheDocument();
  });

  it('renders overview page with summary cards when query succeeds', async () => {
    // Mock fetch for overview
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/dashboard/summary')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                environmentHealth: 'HEALTHY',
                instances: { total: 8, running: 5, stopped: 3, pending: 0, other: 0 },
                alarms: { total: 5, inAlarm: 0, ok: 4, insufficientData: 1 },
                account: { accountId: '123456789012', region: 'ap-south-1', isDemo: true },
                lastSyncedAt: new Date().toISOString()
              }
            })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] })
      });
    }) as any;

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OverviewPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Environment Operational Overview/i)).toBeInTheDocument();
      expect(screen.getByText(/Status: HEALTHY/i)).toBeInTheDocument();
    });
  });
});
