import { useState, useEffect } from 'react';
import { useApi } from '../contexts/AuthContext';
import { Users, Shield, Search, Plus, Edit, Trash2, X, Save, Activity, Clock, User, FileText } from 'lucide-react';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  state_admin: 'State Admin',
  district_officer: 'District Officer',
  field_inspector: 'Field Inspector',
  viewer: 'Viewer',
};

const roleColors: Record<string, string> = {
  super_admin: 'from-purple-500 to-pink-500',
  state_admin: 'from-blue-500 to-cyan-500',
  district_officer: 'from-emerald-500 to-teal-500',
  field_inspector: 'from-orange-500 to-amber-500',
  viewer: 'from-gray-500 to-slate-500',
};

export default function AdminPanel() {
  const { apiFetch } = useApi();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'field_inspector', state: 'Rajasthan', district: '', phone: '' });

  useEffect(() => {
    apiFetch('/api/users').then(r => r.json()).then(setUsers);
    apiFetch('/api/audit-logs').then(r => r.json()).then(setAuditLogs);
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async () => {
    const res = await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(formData) });
    if (res.ok) {
      const newUser = await res.json();
      setUsers(prev => [...prev, newUser]);
      setShowUserForm(false);
      resetForm();
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    const res = await apiFetch(`/api/users/${editUser.id}`, { method: 'PUT', body: JSON.stringify(formData) });
    if (res.ok) {
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setEditUser(null);
      setShowUserForm(false);
      resetForm();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleToggleActive = async (user: any) => {
    const res = await apiFetch(`/api/users/${user.id}`, { method: 'PUT', body: JSON.stringify({ active: !user.active }) });
    if (res.ok) { const updated = await res.json(); setUsers(prev => prev.map(u => u.id === updated.id ? updated : u)); }
  };

  const openEdit = (user: any) => {
    setEditUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, state: user.state, district: user.district || '', phone: user.phone });
    setShowUserForm(true);
  };

  const resetForm = () => setFormData({ name: '', email: '', role: 'field_inspector', state: 'Rajasthan', district: '', phone: '' });

  const actionIcons: Record<string, string> = {
    LOGIN: '🔐', DATA_UPLOAD: '📤', ALERT_CREATE: '🚨', ALERT_ACKNOWLEDGE: '✅', ALERT_ESCALATE: '⬆️',
    ALERT_RESOLVE: '✅', ALERT_RESOLVED: '✅', REPORT_GENERATE: '📊', FLIGHT_CREATE: '✈️', FLIGHT_LOG: '📋',
    USER_CREATE: '👤',
  };

  const tabs = [
    { key: 'users', label: 'User Management', icon: Users },
    { key: 'audit', label: 'Audit Logs', icon: Activity },
    { key: 'system', label: 'System Config', icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Admin Panel</h1>
        <p className="text-surface-400 mt-1">System administration and configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-800">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === tab.key ? 'border-brand-500 text-brand-400' : 'border-transparent text-surface-400 hover:text-surface-200'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search users..." className="input-field pl-10" />
            </div>
            <button onClick={() => { resetForm(); setEditUser(null); setShowUserForm(true); }}
              className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>

          <div className="grid gap-3">
            {filteredUsers.map(user => (
              <div key={user.id} className="glass-card p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center text-white font-bold`}>
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-surface-200">{user.name}</p>
                    {!user.active && <span className="badge bg-surface-700 text-surface-500">Inactive</span>}
                  </div>
                  <p className="text-xs text-surface-500">{user.email}</p>
                </div>
                <div className="hidden md:block text-right">
                  <span className="badge bg-surface-800 text-surface-300">{roleLabels[user.role]}</span>
                  {user.district && <p className="text-xs text-surface-500 mt-1">{user.district} District</p>}
                </div>
                <div className="hidden lg:block text-right">
                  <p className="text-xs text-surface-400">{user.phone}</p>
                  <p className="text-[10px] text-surface-500">Last: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : 'Never'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggleActive(user)}
                    className={`p-2 rounded-lg transition-colors ${user.active ? 'hover:bg-warning-500/10 text-warning-400' : 'hover:bg-success-500/10 text-success-400'}`}
                    title={user.active ? 'Deactivate' : 'Activate'}>
                    <Shield className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(user)} className="p-2 rounded-lg hover:bg-brand-500/10 text-brand-400" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} className="p-2 rounded-lg hover:bg-danger-500/10 text-danger-400" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="glass-card p-6 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700">
                  <th className="py-3 px-4 text-left text-surface-400 font-medium">Time</th>
                  <th className="py-3 px-4 text-left text-surface-400 font-medium">User</th>
                  <th className="py-3 px-4 text-left text-surface-400 font-medium">Action</th>
                  <th className="py-3 px-4 text-left text-surface-400 font-medium">Details</th>
                  <th className="py-3 px-4 text-left text-surface-400 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} className="table-row">
                    <td className="py-3 px-4 text-surface-300 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-surface-200 font-medium">{log.userName}</td>
                    <td className="py-3 px-4">
                      <span className="badge bg-surface-800 text-surface-300">
                        {actionIcons[log.action] || '📝'} {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-surface-400 max-w-xs truncate">{log.details}</td>
                    <td className="py-3 px-4 text-surface-500 font-mono text-xs">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Config Tab */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-surface-100">System Information</h3>
            {[
              ['Platform Version', 'PRABHAAV v1.0.0'],
              ['API Server', 'http://localhost:3001'],
              ['Database', 'In-Memory JSON Store'],
              ['File Storage', 'Local /uploads/'],
              ['JWT Expiry', '24 hours'],
              ['Max Upload Size', '50 MB'],
              ['Total Users', `${users.length}`],
              ['Server Uptime', 'Active'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-surface-800 last:border-0">
                <span className="text-surface-400 text-sm">{label}</span>
                <span className="text-surface-200 text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-surface-100">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Clear All Resolved Alerts', desc: 'Remove all resolved alerts from the system', color: 'warning' },
                { label: 'Export Full Database', desc: 'Download all data as JSON backup', color: 'brand' },
                { label: 'Reset Demo Data', desc: 'Restore seed data to defaults', color: 'accent' },
                { label: 'Purge Audit Logs', desc: 'Clear all audit log entries', color: 'danger' },
              ].map(action => (
                <button key={action.label} className="w-full p-4 glass-card-hover text-left">
                  <p className="text-sm font-medium text-surface-200">{action.label}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowUserForm(false)}>
          <div className="glass-card p-6 w-full max-w-lg animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-100">{editUser ? 'Edit User' : 'Create New User'}</h3>
              <button onClick={() => setShowUserForm(false)} className="text-surface-400 hover:text-surface-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-surface-300 mb-1 block">Full Name</label>
                <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Full name" />
              </div>
              {!editUser && (
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">Email</label>
                  <input value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="email@prabhaav.gov.in" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">Role</label>
                  <select value={formData.role} onChange={e => setFormData(f => ({ ...f, role: e.target.value }))} className="input-field">
                    {Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">Phone</label>
                  <input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+91-..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">State</label>
                  <input value={formData.state} onChange={e => setFormData(f => ({ ...f, state: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">District</label>
                  <input value={formData.district} onChange={e => setFormData(f => ({ ...f, district: e.target.value }))} className="input-field" placeholder="Optional" />
                </div>
              </div>
              {!editUser && <p className="text-xs text-surface-500">Default password: <span className="font-mono text-surface-400">default123</span></p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowUserForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={editUser ? handleUpdateUser : handleCreateUser} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {editUser ? 'Update' : 'Create'} User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
