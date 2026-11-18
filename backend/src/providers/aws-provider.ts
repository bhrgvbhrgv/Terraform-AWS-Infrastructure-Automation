import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeInstanceStatusCommand
} from '@aws-sdk/client-ec2';
import {
  CloudWatchClient,
  DescribeAlarmsCommand,
  GetMetricDataCommand
} from '@aws-sdk/client-cloudwatch';
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  FilterLogEventsCommand
} from '@aws-sdk/client-cloudwatch-logs';
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

export class AwsCloudProvider implements CloudProvider {
  private ec2Client: EC2Client;
  private cwClient: CloudWatchClient;
  private logsClient: CloudWatchLogsClient;
  private region: string;

  constructor(region: string = 'ap-south-1') {
    this.region = region;
    this.ec2Client = new EC2Client({ region });
    this.cwClient = new CloudWatchClient({ region });
    this.logsClient = new CloudWatchLogsClient({ region });
  }

  async getAccountSummary(): Promise<DashboardSummary> {
    const instances = await this.listInstances();
    const alarms = await this.listAlarms();

    const running = instances.filter(i => i.state === 'running').length;
    const stopped = instances.filter(i => i.state === 'stopped').length;
    const inAlarm = alarms.filter(a => a.state === 'ALARM').length;
    const ok = alarms.filter(a => a.state === 'OK').length;
    const insufficientData = alarms.filter(a => a.state === 'INSUFFICIENT_DATA').length;

    const envHealth = inAlarm > 0 ? (inAlarm >= 2 ? 'CRITICAL' : 'DEGRADED') : 'HEALTHY';

    return {
      environmentHealth: envHealth,
      instances: {
        total: instances.length,
        running,
        stopped,
        pending: instances.filter(i => i.state === 'pending').length,
        other: instances.filter(i => !['running', 'stopped', 'pending'].includes(i.state)).length
      },
      alarms: {
        total: alarms.length,
        inAlarm,
        ok,
        insufficientData
      },
      account: {
        accountId: 'AWS-LIVE-ACCOUNT',
        region: this.region,
        isDemo: false
      },
      lastSyncedAt: new Date().toISOString()
    };
  }

  async getDashboardTrends(): Promise<MetricTrendPoint[]> {
    // CloudWatch GetMetricData can be polled here in AWS mode
    return [];
  }

  async getOperationalEvents(limit: number = 5): Promise<OperationalEvent[]> {
    return [];
  }

  async listInstances(filters?: { state?: string; search?: string; az?: string }): Promise<EC2Instance[]> {
    try {
      const response = await this.ec2Client.send(new DescribeInstancesCommand({}));
      const instances: EC2Instance[] = [];

      for (const reservation of response.Reservations || []) {
        for (const inst of reservation.Instances || []) {
          const tags: Record<string, string> = {};
          (inst.Tags || []).forEach(t => {
            if (t.Key && t.Value) tags[t.Key] = t.Value;
          });

          const nameTag = tags['Name'] || inst.InstanceId || 'unnamed-instance';
          const state = (inst.State?.Name as any) || 'unknown';

          instances.push({
            instanceId: inst.InstanceId || 'unknown',
            name: nameTag,
            state: state,
            instanceType: inst.InstanceType || 'unknown',
            availabilityZone: inst.Placement?.AvailabilityZone || this.region,
            privateIp: inst.PrivateIpAddress || '-',
            publicIp: inst.PublicIpAddress,
            launchTime: inst.LaunchTime ? inst.LaunchTime.toISOString() : new Date().toISOString(),
            monitoringState: inst.Monitoring?.State || 'disabled',
            tags
          });
        }
      }

      return instances.filter(instance => {
        if (filters?.state && filters.state !== 'all' && instance.state !== filters.state) return false;
        if (filters?.az && filters.az !== 'all' && instance.availabilityZone !== filters.az) return false;
        if (filters?.search) {
          const query = filters.search.toLowerCase();
          return (
            instance.name.toLowerCase().includes(query) ||
            instance.instanceId.toLowerCase().includes(query) ||
            instance.privateIp.includes(query)
          );
        }
        return true;
      });
    } catch (err: any) {
      throw new Error(`AWS EC2 API Error: ${err.message}`);
    }
  }

  async getInstance(instanceId: string): Promise<EC2Instance | null> {
    const list = await this.listInstances({ search: instanceId });
    return list.find(i => i.instanceId === instanceId) || null;
  }

  async getInstanceMetrics(instanceId: string, metricName: string, rangeMinutes: number = 60): Promise<InstanceMetrics> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - rangeMinutes * 60 * 1000);

    const cmd = new GetMetricDataCommand({
      StartTime: startTime,
      EndTime: endTime,
      MetricDataQueries: [
        {
          Id: 'm1',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: metricName,
              Dimensions: [{ Name: 'InstanceId', Value: instanceId }]
            },
            Period: 300,
            Stat: 'Average'
          },
          ReturnData: true
        }
      ]
    });

    try {
      const res = await this.cwClient.send(cmd);
      const results = res.MetricDataResults?.[0];
      const timestamps = results?.Timestamps || [];
      const values = results?.Values || [];

      const datapoints = timestamps.map((ts, idx) => ({
        timestamp: ts.toISOString(),
        value: values[idx] || 0
      })).reverse();

      return {
        instanceId,
        metricName,
        unit: metricName === 'CPUUtilization' ? 'Percent' : 'Bytes',
        period: 300,
        datapoints
      };
    } catch (err: any) {
      throw new Error(`AWS CloudWatch API Error: ${err.message}`);
    }
  }

  async listAlarms(filters?: { state?: string; search?: string }): Promise<CloudWatchAlarm[]> {
    try {
      const res = await this.cwClient.send(new DescribeAlarmsCommand({}));
      const alarms: CloudWatchAlarm[] = (res.MetricAlarms || []).map(a => ({
        alarmName: a.AlarmName || '',
        state: (a.StateValue as any) || 'INSUFFICIENT_DATA',
        metricName: a.MetricName || '',
        namespace: a.Namespace || '',
        threshold: a.Threshold || 0,
        comparisonOperator: a.ComparisonOperator || '',
        evaluationPeriods: a.EvaluationPeriods || 1,
        period: a.Period || 300,
        stateUpdatedTimestamp: a.StateUpdatedTimestamp?.toISOString() || new Date().toISOString(),
        stateReason: a.StateReason,
        dimensions: (a.Dimensions || []).map(d => ({ name: d.Name || '', value: d.Value || '' }))
      }));

      return alarms.filter(alarm => {
        if (filters?.state && filters.state !== 'all' && alarm.state !== filters.state) return false;
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          return alarm.alarmName.toLowerCase().includes(q) || alarm.metricName.toLowerCase().includes(q);
        }
        return true;
      });
    } catch (err: any) {
      throw new Error(`AWS CloudWatch API Error: ${err.message}`);
    }
  }

  async getAlarm(alarmName: string): Promise<CloudWatchAlarm | null> {
    const list = await this.listAlarms({ search: alarmName });
    return list.find(a => a.alarmName === alarmName) || null;
  }

  async listConfiguredLogGroups(): Promise<LogGroup[]> {
    try {
      const res = await this.logsClient.send(new DescribeLogGroupsCommand({ limit: 10 }));
      return (res.logGroups || []).map(lg => ({
        logGroupName: lg.logGroupName || '',
        arn: lg.arn,
        storedBytes: lg.storedBytes
      }));
    } catch (err: any) {
      throw new Error(`AWS CloudWatch Logs Error: ${err.message}`);
    }
  }

  async getLogEvents(logGroupName: string, startTime?: number, endTime?: number, limit: number = 50): Promise<LogEvent[]> {
    try {
      const res = await this.logsClient.send(
        new FilterLogEventsCommand({
          logGroupName,
          startTime,
          endTime,
          limit: Math.min(limit, 100)
        })
      );

      return (res.events || []).map(e => ({
        timestamp: e.timestamp ? new Date(e.timestamp).toISOString() : new Date().toISOString(),
        message: e.message || '',
        eventId: e.eventId,
        logStreamName: e.logStreamName
      }));
    } catch (err: any) {
      throw new Error(`AWS CloudWatch Logs Filter Error: ${err.message}`);
    }
  }
}
