import { useState, useEffect } from 'react';
import { useAuth, useApi } from '../contexts/AuthContext';
import { AlertTriangle, Filter, CheckCircle, ArrowUpCircle, Clock, MessageSquare, X, Plus, Send } from 'lucide-react';

export default function Alerts() {
  const { user } = useAuth();
  const { apiFetch } = useApi();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState({ severity: '', status: '', type: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [actionAlert, setActionAlert] = useState<any>(null);
  const [actionType, setActionType] = useState('');
  const [comment, setComment] = useState('');
  const [mines, setMines] = useState<any[]>([]);
  const [newAlert, setNewAlert] = useState({ mineId: '', type: 'boundary_violation', severity: 'medium', title: '', description: '' });

  const loadAlerts = () => {
    const params = new URLSearchParams();
    if (filter.severity) params.set('severity', filter.severity);
    if (filter.status) params.set('status', filter.status);
    if (filter.type) params.set('type', filter.type);
    apiFetch(`/api/alerts?${params}`).then(r => r.json()).then(setAlerts);
  };

  useEffect(() => { loadAlerts(); apiFetch('/api/mines').then(r => r.json()).then(setMines); }, [filter]);

  const handleAction = async (alertId: string, status: string) => {
    await apiFetch(`/api/alerts/${alertId}`, { method: 'PATCH', body: JSON.stringify({ status, comment: comment || undefined }) });
    setActionAlert(null); setComment(''); loadAlerts();
  };

  const handleCreate = async () => {
    await apiFetch('/api/alerts', { method: 'POST', body: JSON.stringify(newAlert) });
    setShowCreate(false); setNewAlert({ mineId: '', type: 'boundary_violation', severity: 'medium', title: '', description: '' }); loadAlerts();
  };

  const canModify = ['super_admin', 'state_admin', 'district_officer'].includes(user?.role || '');
  const canCreate = ['super_admin', 'district_officer', 'field_inspector'].includes(user?.role || '');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Alert Management</h1>
          <p className="text-surface-400 mt-1">{alerts.length} alerts found</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Alert
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-4">
        <select value={filter.severity} onChange={e => setFilter(f => ({ ...f, severity: e.target.value }))} className="input-field w-auto">
          <option value="">All Severity</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🔵 Low</option>
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} className="input-field w-auto">
          <option value="">All Types</option>
          <option value="boundary_violation">Boundary Violation</option>
          <option value="over_extraction">Over-Extraction</option>
          <option value="illegal_mining">Illegal Mining</option>
          <option value="unauthorized_equipment">Unauthorized Equipment</option>
        </select>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={alert.id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                alert.severity === 'high' ? 'bg-danger-500/10' :
                alert.severity === 'medium' ? 'bg-warning-500/10' : 'bg-brand-500/10'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  alert.severity === 'high' ? 'text-danger-400' :
                  alert.severity === 'medium' ? 'text-warning-400' : 'text-brand-400'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-surface-100">{alert.title}</h3>
                  <span className={`badge ${alert.severity === 'high' ? 'badge-high' : alert.severity === 'medium' ? 'badge-medium' : 'badge-low'}`}>{alert.severity}</span>
                  <span className={`badge ${
                    alert.status === 'active' ? 'badge-danger' :
                    alert.status === 'resolved' ? 'badge-success' :
                    alert.status === 'acknowledged' ? 'badge-warning' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}>{alert.status}</span>
                  <span className="badge bg-surface-700 text-surface-300">{alert.type.replace(/_/g, ' ')}</span>
                </div>

                <p className="text-sm text-surface-400 mt-2">{alert.description}</p>

                <div className="flex items-center gap-4 mt-3 text-xs text-surface-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(alert.createdAt).toLocaleString('en-IN')}</span>
                  <span>Mine: {alert.mineId}</span>
                  <span>📍 {alert.lat?.toFixed(4)}°N, {alert.lng?.toFixed(4)}°E</span>
                </div>

                {/* Comments */}
                {alert.comments?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {alert.comments.map((c: any, j: number) => (
                      <div key={j} className="flex items-start gap-2 p-2 bg-surface-800/50 rounded-lg text-xs text-surface-300">
                        <MessageSquare className="w-3 h-3 mt-0.5 text-surface-500" />
                        <div>
                          <p>{c.text}</p>
                          <p className="text-surface-500 mt-0.5">{new Date(c.at).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              {canModify && alert.status !== 'resolved' && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {alert.status === 'active' && (
                    <button onClick={() => { setActionAlert(alert); setActionType('acknowledged'); }}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Acknowledge
                    </button>
                  )}
                  {(alert.status === 'active' || alert.status === 'acknowledged') && (
                    <button onClick={() => { setActionAlert(alert); setActionType('resolved'); }}
                      className="text-xs px-3 py-1.5 bg-success-600/20 text-success-400 rounded-xl hover:bg-success-600/30 transition-colors flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Resolve
                    </button>
                  )}
                  {alert.status !== 'escalated' && user?.role === 'district_officer' && (
                    <button onClick={() => { setActionAlert(alert); setActionType('escalated'); }}
                      className="text-xs px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-xl hover:bg-purple-600/30 transition-colors flex items-center gap-1">
                      <ArrowUpCircle className="w-3 h-3" /> Escalate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Modal */}
      {actionAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setActionAlert(null)}>
          <div className="glass-card p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-surface-100 capitalize">{actionType} Alert</h3>
              <button onClick={() => setActionAlert(null)} className="text-surface-400 hover:text-surface-200"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-surface-400 mb-4">{actionAlert.title}</p>
            <textarea
              value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Add a comment (optional)..."
              className="input-field h-24 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setActionAlert(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleAction(actionAlert.id, actionType)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="glass-card p-6 w-full max-w-lg animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-100">Create New Alert</h3>
              <button onClick={() => setShowCreate(false)} className="text-surface-400 hover:text-surface-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-surface-300 mb-1 block">Mine</label>
                <select value={newAlert.mineId} onChange={e => setNewAlert(a => ({ ...a, mineId: e.target.value }))} className="input-field">
                  <option value="">Select a mine...</option>
                  {mines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">Type</label>
                  <select value={newAlert.type} onChange={e => setNewAlert(a => ({ ...a, type: e.target.value }))} className="input-field">
                    <option value="boundary_violation">Boundary Violation</option>
                    <option value="over_extraction">Over-Extraction</option>
                    <option value="illegal_mining">Illegal Mining</option>
                    <option value="unauthorized_equipment">Unauthorized Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">Severity</label>
                  <select value={newAlert.severity} onChange={e => setNewAlert(a => ({ ...a, severity: e.target.value }))} className="input-field">
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🔵 Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-surface-300 mb-1 block">Title</label>
                <input value={newAlert.title} onChange={e => setNewAlert(a => ({ ...a, title: e.target.value }))} className="input-field" placeholder="Alert title..." />
              </div>
              <div>
                <label className="text-sm text-surface-300 mb-1 block">Description</label>
                <textarea value={newAlert.description} onChange={e => setNewAlert(a => ({ ...a, description: e.target.value }))} className="input-field h-24 resize-none" placeholder="Detailed description..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleCreate} className="btn-primary flex-1" disabled={!newAlert.mineId || !newAlert.title}>Create Alert</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
