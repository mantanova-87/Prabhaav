import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Map, Mountain, AlertTriangle, Plane, FileBarChart, Shield, LogOut, Radio } from 'lucide-react';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  state_admin: 'State Admin',
  district_officer: 'District Officer',
  field_inspector: 'Field Inspector',
  viewer: 'Viewer',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin', 'state_admin', 'district_officer', 'field_inspector', 'viewer'] },
    { to: '/map', icon: Map, label: 'Map View', roles: ['super_admin', 'state_admin', 'district_officer', 'field_inspector', 'viewer'] },
    { to: '/mines', icon: Mountain, label: 'Mines', roles: ['super_admin', 'state_admin', 'district_officer', 'field_inspector', 'viewer'] },
    { to: '/alerts', icon: AlertTriangle, label: 'Alerts', roles: ['super_admin', 'state_admin', 'district_officer', 'field_inspector'] },
    { to: '/flights', icon: Plane, label: 'Flights & Upload', roles: ['super_admin', 'state_admin', 'district_officer', 'field_inspector'] },
    { to: '/reports', icon: FileBarChart, label: 'Reports', roles: ['super_admin', 'state_admin', 'district_officer'] },
    { to: '/admin', icon: Shield, label: 'Admin Panel', roles: ['super_admin'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-72 bg-surface-900/80 backdrop-blur-xl border-r border-surface-700/50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              PRABHAAV
            </h1>
            <p className="text-[10px] text-surface-400 uppercase tracking-[0.2em]">Mining Surveillance</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'sidebar-item-active' : 'sidebar-item'
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-surface-700/50">
        <div className="glass-card p-4 mb-3">
          <p className="text-sm font-semibold text-surface-100">{user.name}</p>
          <p className="text-xs text-surface-400">{roleLabels[user.role]}</p>
          {user.district && <p className="text-xs text-brand-400 mt-1">{user.district} District</p>}
        </div>
        <button onClick={logout} className="sidebar-item w-full text-danger-400 hover:bg-danger-600/10 hover:text-danger-300">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
