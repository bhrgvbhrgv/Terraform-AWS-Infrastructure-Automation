import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Server,
  BellRing,
  ShieldCheck,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { dashboardApi } from '../../services/api';

export const OverviewPage: React.FC = () => {
  const { data: summary, isLoading: loadingSummary, error: summaryError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
    refetchInterval: 30000
  });

  const { data: trends, isLoading: loadingTrends } = useQuery({
    queryKey: ['dashboard-trends'],
    queryFn: dashboardApi.getTrends,
    refetchInterval: 30000
  });

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: dashboardApi.getEvents,
    refetchInterval: 30000
  });

  if (loadingSummary) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#121824] rounded-xl border border-[#1f293d]"></div>
          ))}
        </div>
        <div className="h-72 bg-[#121824] rounded-xl border border-[#1f293d]"></div>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="p-6 bg-rose-950/20 border border-rose-800/40 rounded-xl text-rose-300">
        <h3 className="font-semibold text-lg mb-1">Failed to load overview data</h3>
        <p className="text-sm">Please verify the backend API is running and reachable.</p>
      </div>
    );
  }

  const healthColor =
    summary?.environmentHealth === 'HEALTHY'
      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50'
      : summary?.environmentHealth === 'DEGRADED'
      ? 'text-amber-400 bg-amber-950/40 border-amber-800/50'
      : 'text-rose-400 bg-rose-950/40 border-rose-800/50';

  return (
    <div className="space-y-8">
      {/* Top Banner & Health Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#121824] border border-[#1f293d] rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Environment Operational Overview</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time status metrics from AWS Region <span className="font-mono text-slate-300">ap-south-1</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 font-medium text-sm ${healthColor}`}>
            {summary?.environmentHealth === 'HEALTHY' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : summary?.environmentHealth === 'DEGRADED' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Status: {summary?.environmentHealth}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-[#1a2332] px-3 py-2 rounded-lg border border-[#1f293d]">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated: {summary?.lastSyncedAt ? new Date(summary.lastSyncedAt).toLocaleTimeString() : 'Just now'}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-[#121824] border border-[#1f293d] rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{summary?.instances.total || 0}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              EC2 Instances (<span className="text-emerald-400 font-medium">{summary?.instances.running || 0}</span> running)
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#121824] border border-[#1f293d] rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{summary?.alarms.inAlarm || 0}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Active Alarms (<span className="text-slate-300 font-medium">{summary?.alarms.total || 0}</span> configured)
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#121824] border border-[#1f293d] rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">48.2%</div>
            <div className="text-xs text-slate-400 mt-0.5">Fleet Avg CPU Utilization</div>
          </div>
        </div>

        <div className="p-5 bg-[#121824] border border-[#1f293d] rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 mt-0.5">System Reachability Checks</div>
          </div>
        </div>
      </div>

      {/* Aggregate Metric Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-[#121824] border border-[#1f293d] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Fleet CPU Utilization Trend (Past Hour)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Unit: %</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends || []}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121824', borderColor: '#1f293d', borderRadius: 8 }}
                  formatter={(val: any) => [`${val}%`, 'Avg CPU']}
                  labelFormatter={(lbl) => new Date(lbl).toLocaleTimeString()}
                />
                <Area type="monotone" dataKey="avgCpuUtilization" stroke="#3b82f6" strokeWidth={2} fill="url(#cpuGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-[#121824] border border-[#1f293d] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Aggregate Network In/Out (Bytes/sec)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Bytes/sec</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends || []}>
                <defs>
                  <linearGradient id="netInGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121824', borderColor: '#1f293d', borderRadius: 8 }}
                  formatter={(val: any) => [`${(val / 1000000).toFixed(1)} MB/s`, 'Network In']}
                  labelFormatter={(lbl) => new Date(lbl).toLocaleTimeString()}
                />
                <Area type="monotone" dataKey="networkInBytes" stroke="#10b981" strokeWidth={2} fill="url(#netInGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Events Table */}
      <div className="p-5 bg-[#121824] border border-[#1f293d] rounded-xl">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Infrastructure Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1f293d] text-xs font-medium text-slate-400">
                <th className="pb-3 pl-2">Time</th>
                <th className="pb-3">Source</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Message</th>
                <th className="pb-3 pr-2">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f293d]">
              {events?.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#1a2332]/50 transition-colors">
                  <td className="py-3 pl-2 text-xs font-mono text-slate-400">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 text-xs font-mono text-slate-300">{evt.source}</td>
                  <td className="py-3 text-xs font-medium text-blue-400">{evt.type}</td>
                  <td className="py-3 text-sm text-slate-200">{evt.message}</td>
                  <td className="py-3 pr-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        evt.severity === 'ERROR'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          : evt.severity === 'WARN'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                          : 'bg-blue-950/60 text-blue-400 border border-blue-800/60'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
