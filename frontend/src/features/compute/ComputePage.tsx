import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Server,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ec2Api } from '../../services/api';
import { EC2Instance } from '../../types';

export const ComputePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [selectedInstance, setSelectedInstance] = useState<EC2Instance | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['ec2-instances', stateFilter, search],
    queryFn: () => ec2Api.listInstances({ state: stateFilter, search }),
    refetchInterval: 30000
  });

  const { data: instanceMetrics } = useQuery({
    queryKey: ['ec2-metrics', selectedInstance?.instanceId],
    queryFn: () => (selectedInstance ? ec2Api.getInstanceMetrics(selectedInstance.instanceId) : null),
    enabled: !!selectedInstance
  });

  const instances = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">EC2 Fleet Inventory</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Searchable read-only instance telemetry and operational status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, name, or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#121824] border border-[#1f293d] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors w-64"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#121824] border border-[#1f293d] rounded-lg px-3 py-2 text-sm text-slate-300">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs"
            >
              <option value="all">All States</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#121824] border border-[#1f293d] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse">Loading EC2 fleet inventory...</div>
        ) : instances.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Server className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-medium text-slate-300">No EC2 instances found</p>
            <p className="text-sm text-slate-500 mt-1">Try refining your search query or state filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161e2e] border-b border-[#1f293d] text-xs font-medium text-slate-400">
                <tr>
                  <th className="py-3 px-4">Name / ID</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Availability Zone</th>
                  <th className="py-3 px-4">Private IP</th>
                  <th className="py-3 px-4">Public IP</th>
                  <th className="py-3 px-4">Health Checks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f293d]">
                {instances.map((inst) => (
                  <tr
                    key={inst.instanceId}
                    className="hover:bg-[#1a2332]/60 cursor-pointer transition-colors"
                    onClick={() => setSelectedInstance(inst)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{inst.name}</div>
                      <div className="text-xs font-mono text-slate-500">{inst.instanceId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          inst.state === 'running'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            inst.state === 'running' ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                        ></span>
                        {inst.state}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{inst.instanceType}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{inst.availabilityZone}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{inst.privateIp}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{inst.publicIp || '—'}</td>
                    <td className="py-3.5 px-4">
                      {inst.statusChecks?.systemStatus === 'ok' ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>2/2 Passed</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInstance(inst);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 ml-auto"
                      >
                        <span>Telemetry</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instance Detail Drawer / Modal */}
      {selectedInstance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-[#1f293d] rounded-xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#1f293d] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedInstance.name}</h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{selectedInstance.instanceId}</p>
              </div>
              <button
                onClick={() => setSelectedInstance(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1a2332]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#1a2332] rounded-lg border border-[#1f293d] text-xs">
              <div>
                <span className="text-slate-500 block">Instance Type</span>
                <span className="font-mono text-white font-medium">{selectedInstance.instanceType}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Zone</span>
                <span className="font-mono text-white font-medium">{selectedInstance.availabilityZone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Private IP</span>
                <span className="font-mono text-white font-medium">{selectedInstance.privateIp}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Monitoring</span>
                <span className="font-mono text-emerald-400 font-medium capitalize">
                  {selectedInstance.monitoringState}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedInstance.tags || {}).map(([k, v]) => (
                  <span
                    key={k}
                    className="px-2.5 py-1 bg-[#1a2332] border border-[#1f293d] rounded text-xs font-mono text-slate-300"
                  >
                    <span className="text-slate-500">{k}:</span> {v}
                  </span>
                ))}
              </div>
            </div>

            {/* CPU Utilization Chart */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" />
                  CloudWatch CPUUtilization (Past 60m)
                </h4>
                <span className="text-xs font-mono text-slate-500">Period: 300s</span>
              </div>
              <div className="h-48 w-full bg-[#1a2332]/50 p-3 rounded-lg border border-[#1f293d]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={instanceMetrics?.datapoints || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#64748b"
                      fontSize={10}
                      tickFormatter={(val) =>
                        new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#121824', borderColor: '#1f293d', borderRadius: 8 }}
                      formatter={(val: any) => [`${val}%`, 'CPU Utilization']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedInstance(null)}
                className="px-4 py-2 bg-[#1a2332] hover:bg-[#222d40] border border-[#1f293d] rounded-lg text-sm font-medium text-white transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
