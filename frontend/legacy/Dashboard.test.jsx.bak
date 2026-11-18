import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Dashboard from '../pages/Dashboard';
import * as api from '../services/api';

vi.mock('../services/api');

const mockServices = [
  {
    id: 1,
    name: 'Web Frontend',
    description: 'User-facing SPA',
    status: 'operational',
    updated_at: '2026-10-28T00:00:00Z',
  },
  {
    id: 2,
    name: 'REST API',
    description: 'Backend services',
    status: 'degraded',
    updated_at: '2026-10-28T00:00:00Z',
  },
  {
    id: 3,
    name: 'Database',
    description: 'Postgres RDS',
    status: 'offline',
    updated_at: '2026-10-28T00:00:00Z',
  },
];

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially then renders services list and summary cards', async () => {
    api.getServices.mockResolvedValueOnce(mockServices);

    render(<Dashboard />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('CloudOps Status Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Web Frontend')).toBeInTheDocument();
      expect(screen.getByText('REST API')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
    });

    // Check summary counters
    expect(screen.getByTestId('count-total')).toHaveTextContent('3');
    expect(screen.getByTestId('count-operational')).toHaveTextContent('1');
    expect(screen.getByTestId('count-degraded')).toHaveTextContent('1');
    expect(screen.getByTestId('count-offline')).toHaveTextContent('1');
  });

  it('renders empty state when no services are returned', async () => {
    api.getServices.mockResolvedValueOnce([]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No Services Found')).toBeInTheDocument();
    });
  });

  it('renders error state when API request fails', async () => {
    api.getServices.mockRejectedValueOnce(new Error('Network connection failed'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Network connection failed/)).toBeInTheDocument();
    });
  });

  it('opens service detail modal when a service card is clicked', async () => {
    const user = userEvent.setup();
    api.getServices.mockResolvedValueOnce(mockServices);
    api.getServiceById.mockResolvedValueOnce({
      ...mockServices[0],
      history: [
        { id: 10, service_id: 1, status: 'operational', changed_at: '2026-10-28T00:00:00Z' },
      ],
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Web Frontend')).toBeInTheDocument();
    });

    const webFrontendCard = screen.getByRole('button', { name: /View details for Web Frontend/i });
    await user.click(webFrontendCard);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Recent Status History')).toBeInTheDocument();
      expect(screen.getByText('Save Status Change')).toBeInTheDocument();
    });
  });

  it('allows updating service status from the modal', async () => {
    const user = userEvent.setup();
    api.getServices.mockResolvedValueOnce(mockServices);
    api.getServiceById
      .mockResolvedValueOnce({
        ...mockServices[0],
        history: [{ id: 10, service_id: 1, status: 'operational', changed_at: '2026-10-28T00:00:00Z' }],
      })
      .mockResolvedValueOnce({
        ...mockServices[0],
        status: 'degraded',
        history: [
          { id: 11, service_id: 1, status: 'degraded', changed_at: '2026-10-28T01:00:00Z' },
          { id: 10, service_id: 1, status: 'operational', changed_at: '2026-10-28T00:00:00Z' },
        ],
      });

    api.updateServiceStatus.mockResolvedValueOnce({
      success: true,
      message: 'Status updated successfully to degraded.',
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Web Frontend')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /View details for Web Frontend/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Select 'degraded' radio button
    const degradedRadio = screen.getByRole('radio', { name: /degraded/i });
    await user.click(degradedRadio);

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Save Status Change/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.updateServiceStatus).toHaveBeenCalledWith(1, 'degraded');
      expect(screen.getByText('Status updated successfully to degraded.')).toBeInTheDocument();
    });
  });
});

