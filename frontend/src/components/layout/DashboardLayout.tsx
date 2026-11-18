import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  BellRing,
  ScrollText,
  Settings,
  LogOut,
  ShieldCheck,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { authApi } from '../../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/overview', icon: LayoutDashboard },
    { label: 'Compute / EC2', path: '/compute', icon: Server },
    { label: 'Monitoring / Alarms', path: '/monitoring', icon: BellRing },
    { label: 'Logs & Events', path: '/logs', icon: ScrollText },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0b0f17] text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121824] border-r border-[#1f293d] flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 gap-3 border-b border-[#1f293d]">
            <Cloud className="w-7 h-7 text-blue-500" />
            <div>
              <span className="font-bold text-base tracking-wide text-white block">CloudOps</span>
              <span className="text-xs text-blue-400 font-mono">Command Center</span>
            </div>
          </div>

          {/* Persistent Demo Badge */}
          <div className="mx-4 my-3 px-3 py-1.5 bg-blue-950/60 border border-blue-800/60 rounded-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-xs font-medium text-blue-200">Demo Environment (ap-south-1)</span>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2332]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer in Sidebar */}
        <div className="p-4 border-t border-[#1f293d]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Read-Only Session</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-400 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-[#121824] border-b border-[#1f293d] flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white capitalize">
              {location.pathname.replace('/', '') || 'Overview'}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2 bg-[#1a2332] px-3 py-1.5 rounded-md border border-[#1f293d]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">AWS: Connected</span>
            </div>
            <div className="text-slate-400">
              Region: <span className="font-mono text-slate-200 font-medium">ap-south-1</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#0b0f17]">
          {children}
        </main>
      </div>
    </div>
  );
};
