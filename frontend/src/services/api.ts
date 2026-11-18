import { apiRequest, setToken, clearToken } from './apiClient';
import {
  DashboardSummary,
  MetricTrendPoint,
  OperationalEvent,
  EC2Instance,
  CloudWatchAlarm,
  LogGroup,
  LogEvent,
  UserSettings
} from '../types';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiRequest<{ data: { token: string; user: { id: string; email: string } } }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }
    );
    setToken(res.data.token);
    return res.data;
  },
  me: async () => {
    return apiRequest<{ data: { user: { userId: string; email: string } } }>('/auth/me');
  },
  logout: () => {
    clearToken();
  }
};

export const dashboardApi = {
  getSummary: async () => {
    const res = await apiRequest<{ data: DashboardSummary }>('/dashboard/summary');
    return res.data;
  },
  getTrends: async () => {
    const res = await apiRequest<{ data: MetricTrendPoint[] }>('/dashboard/trends');
    return res.data;
  },
  getEvents: async () => {
    const res = await apiRequest<{ data: OperationalEvent[] }>('/dashboard/events');
    return res.data;
  }
};

export const ec2Api = {
  listInstances: async (filters?: { state?: string; search?: string; az?: string }) => {
    const params = new URLSearchParams();
    if (filters?.state && filters.state !== 'all') params.set('state', filters.state);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.az && filters.az !== 'all') params.set('az', filters.az);

    const res = await apiRequest<{ data: EC2Instance[]; meta: { total: number } }>(
      `/ec2/instances?${params.toString()}`
    );
    return res;
  },
  getInstance: async (instanceId: string) => {
    const res = await apiRequest<{ data: EC2Instance }>(`/ec2/instances/${instanceId}`);
    return res.data;
  },
  getInstanceMetrics: async (instanceId: string, metric: string = 'CPUUtilization') => {
    const res = await apiRequest<{ data: any }>(
      `/ec2/instances/${instanceId}/metrics?metric=${metric}&range=60`
    );
    return res.data;
  }
};

export const cloudwatchApi = {
  listAlarms: async (filters?: { state?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.state && filters.state !== 'all') params.set('state', filters.state);
    if (filters?.search) params.set('search', filters.search);

    const res = await apiRequest<{ data: CloudWatchAlarm[]; meta: { total: number } }>(
      `/cloudwatch/alarms?${params.toString()}`
    );
    return res.data;
  },
  getAlarm: async (alarmName: string) => {
    const res = await apiRequest<{ data: CloudWatchAlarm }>(`/cloudwatch/alarms/${alarmName}`);
    return res.data;
  }
};

export const logsApi = {
  listGroups: async () => {
    const res = await apiRequest<{ data: LogGroup[] }>('/logs/groups');
    return res.data;
  },
  getEvents: async (logGroupName: string, limit: number = 50) => {
    const res = await apiRequest<{ data: LogEvent[] }>(
      `/logs/events?logGroupName=${encodeURIComponent(logGroupName)}&limit=${limit}`
    );
    return res.data;
  }
};

export const settingsApi = {
  getSettings: async () => {
    const res = await apiRequest<{ data: UserSettings }>('/settings');
    return res.data;
  },
  updateSettings: async (settings: Partial<UserSettings>) => {
    const res = await apiRequest<{ data: UserSettings }>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
    return res.data;
  }
};
