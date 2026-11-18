import {
  CloudProvider,
  DashboardSummary,
  EC2Instance,
  CloudWatchAlarm,
  InstanceMetrics,
  LogGroup,
  LogEvent,
  MetricTrendPoint,
  OperationalEvent
} from './cloud-provider.js';

export class DemoCloudProvider implements CloudProvider {
  private instances: EC2Instance[] = [
    {
      instanceId: 'i-0a1b2c3d4e5f00001',
      name: 'prod-api-primary',
      state: 'running',
      instanceType: 't3.xlarge',
      availabilityZone: 'ap-south-1a',
      privateIp: '10.0.1.15',
      publicIp: '13.235.10.42',
      launchTime: new Date(Date.now() - 14 * 86400000).toISOString(),
      monitoringState: 'enabled',
      tags: { Environment: 'production', Team: 'backend', ManagedBy: 'Terraform' },
      statusChecks: { systemStatus: 'ok', instanceStatus: 'ok' }
    },
    {
      instanceId: 'i-0a1b2c3d4e5f00002',
      name: 'prod-api-secondary',
      state: 'running',
      instanceType: 't3.xlarge',
      availabilityZone: 'ap-south-1b',
      privateIp: '10.0.2.22',
      publicIp: '13.235.11.88',
      launchTime: new Date(Date.now() - 14 * 86400000).toISOString(),
      monitoringState: 'enabled',
      tags: { Environment: 'production', Team: 'backend', ManagedBy: 'Terraform' },
      statusChecks: { systemStatus: 'ok', instanceStatus: 'ok' }
    },
    {
      instanceId: 'i-0a1b2c3d4e5f00003',
      name: 'prod-worker-batch',
      state: 'running',
      instanceType: 'c6i.2xlarge',
      availabilityZone: 'ap-south-1a',
      privateIp: '10.0.1.48',
      launchTime: new Date(Date.now() - 4 * 86400000).toISOString(),
      monitoringState: 'enabled',
      tags: { Environment: 'production', Team: 'data', ManagedBy: 'Terraform' },
      statusChecks: { systemStatus: 'ok', instanceStatus: 'ok' }
    },
    {
      instanceId: 'i-0a1b2c3d4e5f00004',
      name: 'prod-redis-cache-01',
      state: 'running',
      instanceType: 'r6g.large',
      availabilityZone: 'ap-south-1a',
      privateIp: '10.0.3.5',
      launchTime: new Date(Date.now() - 30 * 86400000).toISOString(),
      monitoringState: 'enabled',
      tags: { Environment: 'production', Team: 'platform', ManagedBy: 'Terraform' },
      statusChecks: { systemStatus: 'ok', instanceStatus: 'ok' }
    },
    {
      instanceId: 'i-0a1b2c3d4e5f00005',
      name: 'staging-api-server',
      state: 'running',
      instanceType: 't3.medium',
      availabilityZone: 'ap-south-1b',
      privateIp: '10.1.1.10',
      publicIp: '13.126.90.104',
      launchTime: new Date(Date.now() - 2 * 86400000).toISOString(),
      monitoringState: 'disabled',
      tags: { Environment: 'staging', Team: 'backend', ManagedBy: 'Terraform' },
      statusChecks: { systemStatus: 'ok', instanceStatus: 'ok' }
    },
    {
      instanceId: 'i-0a1b2c3d4e5f00006',
      name: 'dev-bastion-host',
      state: 'stopped',
      instanceType: 't3.micro',
      availabilityZone: 'ap-south-1a',
      privateIp: '10.2.0.4',
      publicIp: '13.232.44.12',
      launchTime: new Date(Date.now() - 60 * 86400000).toISOString(),
      monitoringState: 'disabled',
      tags: { Environment: 'development', Purpose: 'bastion', CostCenter: 'dev' },
      statusChecks: { systemStatus: 'not-applicable', instanceStatus: 'not-applicable' }
    },
    {
      instanceId: 'i-0a1b2c3d4e5f00007',
      name: 'qa-stress-runner',
      state: 'stopped',
      instanceType: 'c6i.xlarge',
      availabilityZone: 'ap-south-1c',
      privateIp: '10.3.1.55',
      launchTime: new Date(Date.now() - 5 * 86400000).toISOString(),
      monitoringState: 'disabled',
      tags: { Environment: 'qa', Automated: 'true' },
      statusChecks: { systemStatus: 'not-applicable', instanceStatus: 'not-applicable' }
    },
    {
      instanceId: 'i-0a1b2c3d4e5f00008',
      name: 'legacy-analytics-archive',
      state: 'stopped',
      instanceType: 'm5.large',
      availabilityZone: 'ap-south-1b',
      privateIp: '10.4.0.12',
      launchTime: new Date(Date.now() - 180 * 86400000).toISOString(),
      monitoringState: 'disabled',
      tags: { Environment: 'archive', Status: 'decommissioning' },
      statusChecks: { systemStatus: 'not-applicable', instanceStatus: 'not-applicable' }
    }
  ];

  private alarms: CloudWatchAlarm[] = [
    {
      alarmName: 'prod-api-high-cpu-utilization',
      state: 'OK',
      metricName: 'CPUUtilization',
      namespace: 'AWS/EC2',
      threshold: 80,
      comparisonOperator: 'GreaterThanOrEqualToThreshold',
      evaluationPeriods: 2,
      period: 300,
      stateUpdatedTimestamp: new Date(Date.now() - 3600000).toISOString(),
      stateReason: 'Threshold not crossed: latest value 48.2% < 80.0%',
      dimensions: [{ name: 'InstanceId', value: 'i-0a1b2c3d4e5f00001' }]
    },
    {
      alarmName: 'prod-worker-batch-cpu-spike',
      state: 'ALARM',
      metricName: 'CPUUtilization',
      namespace: 'AWS/EC2',
      threshold: 85,
      comparisonOperator: 'GreaterThanOrEqualToThreshold',
      evaluationPeriods: 3,
      period: 300,
      stateUpdatedTimestamp: new Date(Date.now() - 900000).toISOString(),
      stateReason: 'Threshold breached: CPU utilization reached 92.4% during batch transform',
      dimensions: [{ name: 'InstanceId', value: 'i-0a1b2c3d4e5f00003' }]
    },
    {
      alarmName: 'prod-api-status-check-failed',
      state: 'OK',
      metricName: 'StatusCheckFailed',
      namespace: 'AWS/EC2',
      threshold: 1,
      comparisonOperator: 'GreaterThanOrEqualToThreshold',
      evaluationPeriods: 2,
      period: 60,
      stateUpdatedTimestamp: new Date(Date.now() - 7200000).toISOString(),
      stateReason: 'All system and instance health checks reporting OK (0.0)',
      dimensions: [{ name: 'InstanceId', value: 'i-0a1b2c3d4e5f00001' }]
    },
    {
      alarmName: 'prod-redis-memory-pressure',
      state: 'OK',
      metricName: 'NetworkIn',
      namespace: 'AWS/EC2',
      threshold: 500000000,
      comparisonOperator: 'GreaterThanThreshold',
      evaluationPeriods: 1,
      period: 300,
      stateUpdatedTimestamp: new Date(Date.now() - 1800000).toISOString(),
      stateReason: 'Network threshold within limits: 42 MB/s average',
      dimensions: [{ name: 'InstanceId', value: 'i-0a1b2c3d4e5f00004' }]
    },
    {
      alarmName: 'dev-bastion-inactivity-monitor',
      state: 'INSUFFICIENT_DATA',
      metricName: 'CPUUtilization',
      namespace: 'AWS/EC2',
      threshold: 10,
      comparisonOperator: 'LessThanThreshold',
      evaluationPeriods: 5,
      period: 300,
      stateUpdatedTimestamp: new Date(Date.now() - 86400000).toISOString(),
      stateReason: 'Instance is currently stopped; missing metric datapoints',
      dimensions: [{ name: 'InstanceId', value: 'i-0a1b2c3d4e5f00006' }]
    }
  ];

  private logGroups: LogGroup[] = [
    { logGroupName: '/aws/ec2/prod-api-gateway', storedBytes: 15420000 },
    { logGroupName: '/aws/ec2/prod-worker-batch', storedBytes: 8940000 },
    { logGroupName: '/aws/system/cloudops-auth', storedBytes: 1204000 }
  ];

  async getAccountSummary(): Promise<DashboardSummary> {
    const running = this.instances.filter(i => i.state === 'running').length;
    const stopped = this.instances.filter(i => i.state === 'stopped').length;
    const inAlarm = this.alarms.filter(a => a.state === 'ALARM').length;
    const ok = this.alarms.filter(a => a.state === 'OK').length;
    const insufficientData = this.alarms.filter(a => a.state === 'INSUFFICIENT_DATA').length;

    const envHealth = inAlarm > 0 ? (inAlarm >= 2 ? 'CRITICAL' : 'DEGRADED') : 'HEALTHY';

    return {
      environmentHealth: envHealth,
      instances: {
        total: this.instances.length,
        running,
        stopped,
        pending: 0,
        other: 0
      },
      alarms: {
        total: this.alarms.length,
        inAlarm,
        ok,
        insufficientData
      },
      account: {
        accountId: '123456789012',
        alias: 'demo-cloudops-sandbox',
        region: 'ap-south-1',
        isDemo: true
      },
      lastSyncedAt: new Date().toISOString()
    };
  }

  async getDashboardTrends(): Promise<MetricTrendPoint[]> {
    const points: MetricTrendPoint[] = [];
    const now = Date.now();
    for (let i = 12; i >= 0; i--) {
      const time = new Date(now - i * 300000);
      // Realistic smooth curve with a spike
      const baseCpu = 35 + Math.sin(i / 2) * 12 + (i <= 2 ? 25 : 0);
      points.push({
        timestamp: time.toISOString(),
        avgCpuUtilization: Math.round(baseCpu * 10) / 10,
        networkInBytes: Math.round((45000000 + Math.cos(i) * 15000000) * 10) / 10,
        networkOutBytes: Math.round((38000000 + Math.sin(i) * 12000000) * 10) / 10
      });
    }
    return points;
  }

  async getOperationalEvents(limit: number = 5): Promise<OperationalEvent[]> {
    const now = Date.now();
    const events: OperationalEvent[] = [
      {
        id: 'evt-001',
        timestamp: new Date(now - 15 * 60000).toISOString(),
        source: 'aws.cloudwatch',
        type: 'ALARM_STATE_CHANGE',
        message: 'Alarm "prod-worker-batch-cpu-spike" transitioned from OK to ALARM',
        severity: 'WARN'
      },
      {
        id: 'evt-002',
        timestamp: new Date(now - 45 * 60000).toISOString(),
        source: 'aws.ec2',
        type: 'INSTANCE_HEALTH_CHECK',
        message: 'System and instance reachability checks passed for all production nodes',
        severity: 'INFO'
      },
      {
        id: 'evt-003',
        timestamp: new Date(now - 2 * 3600000).toISOString(),
        source: 'aws.autoscaling',
        type: 'CAPACITY_REBALANCE',
        message: 'Target group auto-balancing completed in ap-south-1b',
        severity: 'INFO'
      },
      {
        id: 'evt-004',
        timestamp: new Date(now - 5 * 3600000).toISOString(),
        source: 'cloudops.security',
        type: 'AUDIT_AUTH_LOGIN',
        message: 'Successful console login for admin@cloudops.internal',
        severity: 'INFO'
      },
      {
        id: 'evt-005',
        timestamp: new Date(now - 12 * 3600000).toISOString(),
        source: 'aws.cloudwatch',
        type: 'LOG_METRIC_FILTER',
        message: 'No 5xx error spikes detected in prod-api-gateway over the past 24 hours',
        severity: 'INFO'
      }
    ];
    return events.slice(0, limit);
  }

  async listInstances(filters?: { state?: string; search?: string; az?: string }): Promise<EC2Instance[]> {
    return this.instances.filter(instance => {
      if (filters?.state && filters.state !== 'all' && instance.state !== filters.state) {
        return false;
      }
      if (filters?.az && filters.az !== 'all' && instance.availabilityZone !== filters.az) {
        return false;
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        const matchesName = instance.name.toLowerCase().includes(query);
        const matchesId = instance.instanceId.toLowerCase().includes(query);
        const matchesIp = instance.privateIp.includes(query) || (instance.publicIp && instance.publicIp.includes(query));
        if (!matchesName && !matchesId && !matchesIp) return false;
      }
      return true;
    });
  }

  async getInstance(instanceId: string): Promise<EC2Instance | null> {
    const found = this.instances.find(i => i.instanceId === instanceId);
    return found || null;
  }

  async getInstanceMetrics(instanceId: string, metricName: string, rangeMinutes: number = 60): Promise<InstanceMetrics> {
    const datapoints: { timestamp: string; value: number }[] = [];
    const now = Date.now();
    const step = 300000; // 5 min
    const count = Math.min(Math.floor((rangeMinutes * 60000) / step), 24);

    const isSpike = instanceId === 'i-0a1b2c3d4e5f00003';
    const unit = metricName === 'CPUUtilization' ? 'Percent' : 'Bytes';

    for (let i = count; i >= 0; i--) {
      const ts = new Date(now - i * step).toISOString();
      let val = 0;
      if (metricName === 'CPUUtilization') {
        val = isSpike ? 75 + Math.sin(i) * 18 : 28 + Math.cos(i) * 12;
      } else if (metricName === 'NetworkIn') {
        val = 15000000 + Math.sin(i) * 8000000;
      } else if (metricName === 'NetworkOut') {
        val = 11000000 + Math.cos(i) * 6000000;
      } else {
        val = 0;
      }
      datapoints.push({ timestamp: ts, value: Math.max(0, Math.round(val * 10) / 10) });
    }

    return {
      instanceId,
      metricName,
      unit,
      period: 300,
      datapoints
    };
  }

  async listAlarms(filters?: { state?: string; search?: string }): Promise<CloudWatchAlarm[]> {
    return this.alarms.filter(alarm => {
      if (filters?.state && filters.state !== 'all' && alarm.state !== filters.state) {
        return false;
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        return alarm.alarmName.toLowerCase().includes(query) || alarm.metricName.toLowerCase().includes(query);
      }
      return true;
    });
  }

  async getAlarm(alarmName: string): Promise<CloudWatchAlarm | null> {
    const alarm = this.alarms.find(a => a.alarmName === alarmName);
    return alarm || null;
  }

  async listConfiguredLogGroups(): Promise<LogGroup[]> {
    return this.logGroups;
  }

  async getLogEvents(logGroupName: string, startTime?: number, endTime?: number, limit: number = 50): Promise<LogEvent[]> {
    const now = Date.now();
    const sampleEvents: Record<string, LogEvent[]> = {
      '/aws/ec2/prod-api-gateway': [
        { timestamp: new Date(now - 120000).toISOString(), message: 'INFO [HTTP] GET /api/v1/health 200 OK 1.4ms', eventId: 'evt-log-1', logStreamName: 'i-0a1b2c3d4e5f00001' },
        { timestamp: new Date(now - 105000).toISOString(), message: 'INFO [AuthService] Token validated for user session usr_9948', eventId: 'evt-log-2', logStreamName: 'i-0a1b2c3d4e5f00001' },
        { timestamp: new Date(now - 90000).toISOString(), message: 'WARN [RateLimit] Client 192.168.1.100 approaching 80% threshold', eventId: 'evt-log-3', logStreamName: 'i-0a1b2c3d4e5f00002' },
        { timestamp: new Date(now - 60000).toISOString(), message: 'INFO [WorkerPool] Auto-scaling metrics collected: CPU=42%, Memory=58%', eventId: 'evt-log-4', logStreamName: 'i-0a1b2c3d4e5f00001' },
        { timestamp: new Date(now - 30000).toISOString(), message: 'INFO [HTTP] GET /api/v1/dashboard/summary 200 OK 12.8ms', eventId: 'evt-log-5', logStreamName: 'i-0a1b2c3d4e5f00002' },
        { timestamp: new Date(now - 10000).toISOString(), message: 'INFO [Telemetry] Heartbeat healthy; 0 dropped connections', eventId: 'evt-log-6', logStreamName: 'i-0a1b2c3d4e5f00001' }
      ],
      '/aws/ec2/prod-worker-batch': [
        { timestamp: new Date(now - 300000).toISOString(), message: 'INFO [BatchProcessor] Commencing partition sync job #7481', eventId: 'evt-log-11', logStreamName: 'batch-node-a' },
        { timestamp: new Date(now - 240000).toISOString(), message: 'WARN [BatchProcessor] Processing delay detected on queue telemetry-inbound (latency: 420ms)', eventId: 'evt-log-12', logStreamName: 'batch-node-a' },
        { timestamp: new Date(now - 180000).toISOString(), message: 'ERROR [BatchProcessor] Worker thread #3 retry 1/3: Socket timeout on shard 4', eventId: 'evt-log-13', logStreamName: 'batch-node-a' },
        { timestamp: new Date(now - 120000).toISOString(), message: 'INFO [BatchProcessor] Shard 4 recovered; retry successful', eventId: 'evt-log-14', logStreamName: 'batch-node-a' },
        { timestamp: new Date(now - 60000).toISOString(), message: 'INFO [BatchProcessor] Partition sync job #7481 completed successfully', eventId: 'evt-log-15', logStreamName: 'batch-node-a' }
      ],
      '/aws/system/cloudops-auth': [
        { timestamp: new Date(now - 600000).toISOString(), message: 'INFO [AuthAudit] User admin@cloudops.internal logged in from 10.0.0.1', eventId: 'evt-log-21', logStreamName: 'auth-service' },
        { timestamp: new Date(now - 300000).toISOString(), message: 'INFO [AuthAudit] Refresh token issued for subject usr_admin', eventId: 'evt-log-22', logStreamName: 'auth-service' }
      ]
    };

    const list = sampleEvents[logGroupName] || [
      { timestamp: new Date().toISOString(), message: `INFO [LogStream] Active sample stream for ${logGroupName}`, eventId: 'sample-01' }
    ];

    return list.slice(0, limit);
  }
}
