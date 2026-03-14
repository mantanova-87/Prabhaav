import { useState, useEffect } from 'react';
import { useApi } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { FileBarChart, Download, Calendar, TrendingUp, AlertTriangle, Mountain, Printer } from 'lucide-react';

const COLORS = ['#338dff', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#22c55e', '#f97316'];

export default function Reports() {
  const { apiFetch } = useApi();
  const [stats, setStats] = useState<any>(null);
  const [reportType, setReportType] = useState('compliance');
  const [dateRange, setDateRange] = useState({ from: '2024-04-01', to: '2024-09-30' });

  useEffect(() => { apiFetch('/api/stats').then(r => r.json()).then(setStats); }, []);

  if (!stats) return <div className="flex items-center justify-center h-96"><div className="animate-pulse-slow text-brand-400">Loading reports...</div></div>;

  const alertTypeData = Object.entries(stats.alertsByType).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: value as number,
  }));

  const violatorData = [
    { name: 'Jodhpur Sandstone Quarry', violations: 4, revenueLoss: 4100000, risk: 'Critical' },
    { name: 'Alwar Copper Mine', violations: 3, revenueLoss: 2300000, risk: 'Critical' },
    { name: 'Banswara Manganese Mine', violations: 2, revenueLoss: 1200000, risk: 'High' },
    { name: 'Illegal Mica Site', violations: 2, revenueLoss: 800000, risk: 'Critical' },
    { name: 'Sirohi Feldspar Mine', violations: 1, revenueLoss: 450000, risk: 'Medium' },
  ];

  const recoveryData = [
    { month: 'Apr', target: 50, actual: 42 },
    { month: 'May', target: 55, actual: 48 },
    { month: 'Jun', target: 58, actual: 52 },
    { month: 'Jul', target: 60, actual: 57 },
    { month: 'Aug', target: 62, actual: 55 },
    { month: 'Sep', target: 65, actual: 61 },
  ];

  const exportReport = (format: string) => {
    const data = `PRABHAAV Mining Surveillance Report\n${'='.repeat(40)}\nGenerated: ${new Date().toLocaleString('en-IN')}\nPeriod: ${dateRange.from} to ${dateRange.to}\n\nSummary:\n- Total Mines: ${stats.totalMines}\n- Active Alerts: ${stats.activeAlerts}\n- Compliance Rate: ${((stats.compliantMines / stats.totalMines) * 100).toFixed(1)}%\n- Total Revenue: ₹${(stats.totalRevenue / 10000000).toFixed(2)} Cr\n\nTop Violators:\n${violatorData.map((v, i) => `${i + 1}. ${v.name} - ${v.violations} violations - ₹${(v.revenueLoss / 100000).toFixed(1)}L loss`).join('\n')}`;
    const blob = new Blob([data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `prabhaav-report-${reportType}.${format === 'pdf' ? 'txt' : 'csv'}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Reports & Analytics</h1>
          <p className="text-surface-400 mt-1">Generate compliance reports and analyze mining data</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => exportReport('csv')} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => exportReport('pdf')} className="btn-primary flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <select value={reportType} onChange={e => setReportType(e.target.value)} className="input-field w-auto">
          <option value="compliance">Compliance Report</option>
          <option value="revenue">Revenue Analysis</option>
          <option value="alerts">Alert Trends</option>
          <option value="enforcement">Enforcement Summary</option>
        </select>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-surface-400" />
          <input type="date" value={dateRange.from} onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))} className="input-field w-auto" />
          <span className="text-surface-500">to</span>
          <input type="date" value={dateRange.to} onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))} className="input-field w-auto" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-surface-400">Compliance Rate</p>
          <p className="text-3xl font-bold text-success-400">{((stats.compliantMines / stats.totalMines) * 100).toFixed(0)}%</p>
          <p className="text-xs text-surface-500 mt-1">{stats.compliantMines} of {stats.totalMines} mines</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-surface-400">Revenue Loss (Est.)</p>
          <p className="text-3xl font-bold text-danger-400">₹8.8 Cr</p>
          <p className="text-xs text-surface-500 mt-1">From over-extraction</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-surface-400">Alerts Resolved</p>
          <p className="text-3xl font-bold text-brand-400">{stats.resolvedAlerts}/{stats.totalAlerts}</p>
          <p className="text-xs text-surface-500 mt-1">{((stats.resolvedAlerts / stats.totalAlerts) * 100).toFixed(0)}% resolution rate</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-surface-400">Illegal Sites Found</p>
          <p className="text-3xl font-bold text-warning-400">{stats.illegalMines}</p>
          <p className="text-xs text-surface-500 mt-1">Active illegal operations</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Recovery vs Target */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-400" /> Recovery vs Target (₹ Lakhs)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recoveryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="target" fill="#334155" radius={[4, 4, 0, 0]} name="Target" />
              <Bar dataKey="actual" fill="#338dff" radius={[4, 4, 0, 0]} name="Actual Recovery" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning-400" /> Incidents by Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={alertTypeData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {alertTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">Alert Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Total Alerts" />
              <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Violators */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
            <Mountain className="w-5 h-5 text-danger-400" /> Top Violators
          </h3>
          <div className="space-y-3">
            {violatorData.map((v, i) => (
              <div key={v.name} className="flex items-center gap-3 p-3 bg-surface-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-danger-500/10 flex items-center justify-center text-danger-400 font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-200 truncate">{v.name}</p>
                  <p className="text-xs text-surface-500">{v.violations} violations • ₹{(v.revenueLoss / 100000).toFixed(1)}L loss</p>
                </div>
                <span className={`badge ${v.risk === 'Critical' ? 'badge-danger' : v.risk === 'High' ? 'badge-warning' : 'badge-medium'}`}>{v.risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District Summary Table */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-surface-100 mb-4">District-wise Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="py-3 px-4 text-left text-surface-400 font-medium">District</th>
                <th className="py-3 px-4 text-center text-surface-400 font-medium">Mines</th>
                <th className="py-3 px-4 text-center text-surface-400 font-medium">Alerts</th>
                <th className="py-3 px-4 text-center text-surface-400 font-medium">Compliance</th>
                <th className="py-3 px-4 text-right text-surface-400 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.districtData.map((d: any) => (
                <tr key={d.district} className="table-row">
                  <td className="py-3 px-4 text-surface-200 font-medium">{d.district}</td>
                  <td className="py-3 px-4 text-center text-surface-300">{d.mines}</td>
                  <td className="py-3 px-4 text-center"><span className={d.alerts > 0 ? 'text-danger-400' : 'text-surface-500'}>{d.alerts}</span></td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${d.compliance}%`, backgroundColor: d.compliance >= 80 ? '#22c55e' : d.compliance >= 50 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <span className="text-surface-300 text-xs">{d.compliance}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-surface-300">₹{(d.revenue / 100000).toFixed(1)}L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
