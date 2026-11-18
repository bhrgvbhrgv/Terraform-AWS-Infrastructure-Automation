import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText, Search, Folder, RefreshCw } from 'lucide-react';
import { logsApi } from '../../services/api';

export const LogsPage: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('/aws/ec2/prod-api-gateway');
  const [search, setSearch] = useState('');

  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ['log-groups'],
    queryFn: logsApi.listGroups
  });

  const { data: events, isLoading: loadingEvents, refetch } = useQuery({
    queryKey: ['log-events', selectedGroup],
    queryFn: () => logsApi.getEvents(selectedGroup),
    enabled: !!selectedGroup
  });

  const filteredEvents = (events || []).filter((e) =>
    e.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">CloudWatch Log Streams</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Live bounded operational logs from configured AWS log groups
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Log Group Selector */}
        <div className="w-full lg:w-72 bg-[#121824] border border-[#1f293d] rounded-xl p-4 space-y-3 flex-shrink-0">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Log Groups</h3>
          {loadingGroups ? (
            <div className="text-xs text-slate-500 animate-pulse">Loading groups...</div>
          ) : (
            <div className="space-y-1">
              {(groups || []).map((grp) => (
                <button
                  key={grp.logGroupName}
                  onClick={() => setSelectedGroup(grp.logGroupName)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 truncate ${
                    selectedGroup === grp.logGroupName
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-300 hover:bg-[#1a2332]'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{grp.logGroupName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Log Viewer Terminal */}
        <div className="flex-1 bg-[#121824] border border-[#1f293d] rounded-xl flex flex-col min-h-[500px]">
          {/* Controls Bar */}
          <div className="p-3 border-b border-[#1f293d] flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter logs by keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1a2332] border border-[#1f293d] rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 bg-[#1a2332] hover:bg-[#222d40] border border-[#1f293d] rounded-lg text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* Console Output */}
          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 bg-[#090d14]">
            {loadingEvents ? (
              <div className="text-slate-500 animate-pulse">Fetching log stream events...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-slate-600">No log events recorded matching query.</div>
            ) : (
              filteredEvents.map((evt, idx) => {
                const isError = evt.message.includes('ERROR');
                const isWarn = evt.message.includes('WARN');
                return (
                  <div key={idx} className="flex gap-3 leading-relaxed hover:bg-slate-900/60 p-1 rounded">
                    <span className="text-slate-500 select-none flex-shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`break-all ${
                        isError ? 'text-rose-400' : isWarn ? 'text-amber-300' : 'text-slate-300'
                      }`}
                    >
                      {evt.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
