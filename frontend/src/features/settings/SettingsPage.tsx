import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, Save, Check } from 'lucide-react';
import { settingsApi } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['user-settings'],
    queryFn: settingsApi.getSettings
  });

  const [region, setRegion] = useState('ap-south-1');
  const [refreshInterval, setRefreshInterval] = useState(60);

  React.useEffect(() => {
    if (settings) {
      setRegion(settings.defaultRegion);
      setRefreshInterval(settings.refreshIntervalSeconds);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      defaultRegion: region,
      refreshIntervalSeconds: Number(refreshInterval)
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Application & Cloud Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Configure AWS operational preferences and dashboard polling frequencies
        </p>
      </div>

      <div className="bg-[#121824] border border-[#1f293d] rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Default AWS Target Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-[#1a2332] border border-[#1f293d] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ap-south-1">Asia Pacific (Mumbai) — ap-south-1</option>
              <option value="us-east-1">US East (N. Virginia) — us-east-1</option>
              <option value="eu-west-1">Europe (Ireland) — eu-west-1</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Dashboard Polling Interval
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full bg-[#1a2332] border border-[#1f293d] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value={15}>15 Seconds (High Frequency)</option>
              <option value={30}>30 Seconds</option>
              <option value={60}>60 Seconds (Recommended Default)</option>
              <option value={300}>5 Minutes</option>
            </select>
          </div>

          <div className="p-4 bg-[#1a2332] border border-[#1f293d] rounded-lg space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Integration Mode:</span>
              <span className="font-mono text-blue-400 font-medium">
                {settings?.isDemoMode ? 'Offline Demo Mock Data' : 'Live AWS SDK'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Security Policy:</span>
              <span className="text-emerald-400 font-medium">Server-side Read-Only Least Privilege</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {mutation.isPending ? 'Saving...' : 'Save Preferences'}
            </button>
            {saved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
