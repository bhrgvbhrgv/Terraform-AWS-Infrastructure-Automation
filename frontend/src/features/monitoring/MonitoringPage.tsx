import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  Filter
} from 'lucide-react';
import { cloudwatchApi } from '../../services/api';

export const MonitoringPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');

  const { data: alarms, isLoading } = useQuery({
    queryKey: ['cloudwatch-alarms', stateFilter, search],
    queryFn: () => cloudwatchApi.listAlarms({ state: stateFilter, search }),
    refetchInterval: 30000
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">CloudWatch Alarms & Health</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Active metric thresholds and automated operational alarm states
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search alarms..."
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
              <option value="ALARM">In Alarm</option>
              <option value="OK">OK</option>
              <option value="INSUFFICIENT_DATA">Insufficient Data</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alarms List */}
      <div className="bg-[#121824] border border-[#1f293d] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse">Loading CloudWatch alarms...</div>
        ) : (alarms || []).length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <BellRing className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-medium text-slate-300">No alarms found</p>
            <p className="text-sm text-slate-500 mt-1">No CloudWatch alarms match the current criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161e2e] border-b border-[#1f293d] text-xs font-medium text-slate-400">
                <tr>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Alarm Name</th>
                  <th className="py-3 px-4">Metric / Namespace</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Evaluation</th>
                  <th className="py-3 px-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f293d]">
                {(alarms || []).map((alarm) => {
                  const isAlarm = alarm.state === 'ALARM';
                  const isOk = alarm.state === 'OK';

                  return (
                    <tr key={alarm.alarmName} className="hover:bg-[#1a2332]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isAlarm
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                              : isOk
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {isAlarm ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : isOk ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <HelpCircle className="w-3.5 h-3.5" />
                          )}
                          {alarm.state}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">{alarm.alarmName}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-blue-400">{alarm.metricName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{alarm.namespace}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                        &gt;= {alarm.threshold}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {alarm.evaluationPeriods} period(s) of {alarm.period}s
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">
                        {alarm.stateReason || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
