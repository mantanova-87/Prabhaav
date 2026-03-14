import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);

  const roleLabels: Record<string, string> = {
    super_admin: 'System Administrator',
    state_admin: 'State Administration',
    district_officer: 'District Mining Office',
    field_inspector: 'Field Operations',
    viewer: 'Public View',
  };

  return (
    <header className="h-16 bg-surface-900/60 backdrop-blur-xl border-b border-surface-700/50 flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          placeholder="Search mines, alerts, reports..."
          className="w-full pl-10 pr-4 py-2 bg-surface-800/60 border border-surface-700 rounded-xl text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-brand-500/50 transition-colors"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 rounded-xl hover:bg-surface-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-surface-400" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              3
            </span>
          </button>
          
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 glass-card p-4 shadow-xl z-50 animate-slide-up">
              <h3 className="text-sm font-semibold text-surface-100 mb-3">Recent Notifications</h3>
              {[
                { text: 'New high alert: Boundary Violation – Jodhpur', time: '2 min ago', type: 'danger' },
                { text: 'Flight F007 scheduled for tomorrow', time: '1 hour ago', type: 'brand' },
                { text: 'Monthly report ready for download', time: '3 hours ago', type: 'success' },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-surface-800 last:border-0">
                  <div className={`w-2 h-2 mt-1.5 rounded-full bg-${n.type}-500 flex-shrink-0`} />
                  <div>
                    <p className="text-xs text-surface-200">{n.text}</p>
                    <p className="text-[10px] text-surface-500 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-surface-700" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-surface-200">{user?.name}</p>
            <p className="text-[10px] text-surface-500">{user ? roleLabels[user.role] : ''}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-surface-500" />
        </div>
      </div>
    </header>
  );
}
