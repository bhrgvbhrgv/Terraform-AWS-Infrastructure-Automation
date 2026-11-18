export interface InstanceMetrics {
  instanceId: string;
  metricName: string;
  unit: string;
  period: number;
  datapoints: { timestamp: string; value: number }[];
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
    systemStatus: 'ok' | 'impaired' | 'insufficient-data' | 'not-applicable';
    instanceStatus: 'ok' | 'impaired' | 'insufficient-data' | 'not-applicable';
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

export interface CloudProvider {
  getAccountSummary(): Promise<DashboardSummary>;
  getDashboardTrends(): Promise<MetricTrendPoint[]>;
  getOperationalEvents(limit?: number): Promise<OperationalEvent[]>;
  listInstances(filters?: { state?: string; search?: string; az?: string }): Promise<EC2Instance[]>;
  getInstance(instanceId: string): Promise<EC2Instance | null>;
  getInstanceMetrics(instanceId: string, metricName: string, rangeMinutes?: number): Promise<InstanceMetrics>;
  listAlarms(filters?: { state?: string; search?: string }): Promise<CloudWatchAlarm[]>;
  getAlarm(alarmName: string): Promise<CloudWatchAlarm | null>;
  listConfiguredLogGroups(): Promise<LogGroup[]>;
  getLogEvents(logGroupName: string, startTime?: number, endTime?: number, limit?: number): Promise<LogEvent[]>;
}
