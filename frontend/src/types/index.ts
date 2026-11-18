export interface DashboardSummary {
  environmentHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  instances: {
    total: number;
    running: number;
    stopped: number;
    pending: number;
    other: number;
  };
  alarms: {
    total: number;
    inAlarm: number;
    ok: number;
    insufficientData: number;
  };
  account: {
    accountId: string;
    alias?: string;
    region: string;
    isDemo: boolean;
  };
  lastSyncedAt: string;
}

export interface MetricTrendPoint {
  timestamp: string;
  avgCpuUtilization: number;
  networkInBytes: number;
  networkOutBytes: number;
}

export interface OperationalEvent {
  id: string;
  timestamp: string;
  source: string;
  type: string;
  message: string;
  severity: 'INFO' | 'WARN' | 'ERROR';
}

export interface EC2Instance {
  instanceId: string;
  name: string;
  state: 'running' | 'stopped' | 'pending' | 'stopping' | 'terminated';
  instanceType: string;
  availabilityZone: string;
  privateIp: string;
  publicIp?: string;
  launchTime: string;
  monitoringState: string;
  tags: Record<string, string>;
  statusChecks?: {
    systemStatus: string;
    instanceStatus: string;
  };
}

export interface CloudWatchAlarm {
  alarmName: string;
  state: 'OK' | 'ALARM' | 'INSUFFICIENT_DATA';
  metricName: string;
  namespace: string;
  threshold: number;
  comparisonOperator: string;
  evaluationPeriods: number;
  period: number;
  stateUpdatedTimestamp: string;
  stateReason?: string;
  dimensions?: { name: string; value: string }[];
}

export interface LogGroup {
  logGroupName: string;
  arn?: string;
  storedBytes?: number;
}

export interface LogEvent {
  timestamp: string;
  message: string;
  eventId?: string;
  logStreamName?: string;
}

export interface UserSettings {
  userId: string;
  email: string;
  defaultRegion: string;
  refreshIntervalSeconds: number;
  cloudProvider: string;
  isDemoMode: boolean;
}
