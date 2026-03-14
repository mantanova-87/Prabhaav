import { useState, useEffect } from 'react';
import { useAuth, useApi } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Mountain, AlertTriangle, Plane, Users, TrendingUp, Shield, Activity, MapPin, ArrowUpRight, ArrowDownRight, Clock, Eye } from 'lucide-react';

interface Stats {
  totalMines: number; activeMines: number; illegalMines: number; suspendedMines: number;
  compliantMines: number; violatingMines: number; warningMines: number; totalRevenue: number;
  totalAlerts: number; activeAlerts: number; resolvedAlerts: number; escalatedAlerts: number;
  totalFlights: number; completedFlights: number; scheduledFlights: number; totalUsers: number; activeUsers: number;
  alertsByType: Record<string, number>; alertsBySeverity: Record<string, number>;
  monthlyData: any[]; districtData: any[];
}

const COLORS = ['#338dff', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function StatCard({ icon: Icon, label, value, change, changeType, color }: any) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-surface-100">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${changeType === 'up' ? 'text-success-400' : 'text-danger-400'}`}>
              {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { apiFetch } = useApi();
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/stats').then(r => r.json()).then(setStats);
    apiFetch('/api/alerts').then(r => r.json()).then(d => setAlerts(d.slice(0, 5)));
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-96"><div className="animate-pulse-slow text-brand-400 text-lg">Loading dashboard...</div></div>;

  const alertPieData = Object.entries(stats.alertsByType).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value,
  }));

  const severityData = Object.entries(stats.alertsBySeverity).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value,
  }));

  const roleLabel = user?.role === 'super_admin' ? 'System Overview' :
    user?.role === 'state_admin' ? `${user.state} State Overview` :
    user?.role === 'district_officer' ? `${user.district} District` :
    user?.role === 'field_inspector' ? 'Field Operations' : 'Overview';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Dashboard</h1>
          <p className="text-surface-400 mt-1">{roleLabel} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to="/reports" className="btn-primary text-sm">Generate Report</Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Mountain} label="Total Mines" value={stats.totalMines} change="+2 this month" changeType="up" color="from-brand-500 to-brand-600" />
        <StatCard icon={AlertTriangle} label="Active Alerts" value={stats.activeAlerts} change={`${stats.escalatedAlerts} escalated`} changeType="up" color="from-danger-500 to-danger-600" />
        <StatCard icon={Plane} label="Flights Completed" value={stats.completedFlights} change={`${stats.scheduledFlights} scheduled`} changeType="up" color="from-accent-500 to-accent-600" />
        <StatCard icon={TrendingUp} label="Revenue (₹)" value={`${(stats.totalRevenue / 10000000).toFixed(1)} Cr`} change="+12% vs last Q" changeType="up" color="from-success-500 to-success-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trends */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">Monthly Alert Trends</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.monthlyData}>
              <defs>
                <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#338dff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#338dff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="alerts" stroke="#338dff" fill="url(#alertGradient)" strokeWidth={2} name="Total Alerts" />
              <Area type="monotone" dataKey="resolved" stroke="#22c55e" fill="url(#resolvedGradient)" strokeWidth={2} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">Alerts by Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={alertPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {alertPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {alertPieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-surface-300">{d.name}</span>
                </div>
                <span className="text-surface-100 font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-100">Recent Alerts</h3>
            <Link to="/alerts" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors">
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                  alert.severity === 'high' ? 'bg-danger-500 animate-pulse' :
                  alert.severity === 'medium' ? 'bg-warning-500' : 'bg-brand-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-200 truncate">{alert.title}</p>
                  <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.createdAt).toLocaleDateString('en-IN')}
                    <span className={`badge ${
                      alert.severity === 'high' ? 'badge-high' :
                      alert.severity === 'medium' ? 'badge-medium' : 'badge-low'
                    }`}>{alert.severity}</span>
                  </p>
                </div>
                <span className={`badge ${
                  alert.status === 'active' ? 'badge-danger' :
                  alert.status === 'resolved' ? 'badge-success' :
                  alert.status === 'acknowledged' ? 'badge-warning' : 'badge-medium'
                }`}>{alert.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* District Performance / Compliance */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">District Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.districtData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <YAxis type="category" dataKey="district" stroke="#64748b" fontSize={11} width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
              <Bar dataKey="compliance" fill="#338dff" radius={[0, 6, 6, 0]} name="Compliance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-success-500/10 border border-success-500/20 flex items-center justify-center">
            <Shield className="w-7 h-7 text-success-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success-400">{stats.compliantMines}</p>
            <p className="text-sm text-surface-400">Compliant Mines</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-warning-500/10 border border-warning-500/20 flex items-center justify-center">
            <Activity className="w-7 h-7 text-warning-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-warning-400">{stats.warningMines}</p>
            <p className="text-sm text-surface-400">Under Watch</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-danger-500/10 border border-danger-500/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-danger-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-danger-400">{stats.violatingMines}</p>
            <p className="text-sm text-surface-400">In Violation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
