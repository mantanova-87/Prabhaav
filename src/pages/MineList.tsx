import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../contexts/AuthContext';
import { Search, Filter, Mountain, ArrowUpRight, MapPin } from 'lucide-react';

export default function MineList() {
  const { apiFetch } = useApi();
  const [mines, setMines] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (complianceFilter) params.set('compliance', complianceFilter);
    apiFetch(`/api/mines?${params}`).then(r => r.json()).then(setMines);
  }, [search, statusFilter, complianceFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Mine Registry</h1>
          <p className="text-surface-400 mt-1">{mines.length} mines found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, leaseholder, or mineral type..."
            className="input-field pl-10"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="illegal">Illegal</option>
        </select>
        <select value={complianceFilter} onChange={e => setComplianceFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Compliance</option>
          <option value="compliant">Compliant</option>
          <option value="warning">Warning</option>
          <option value="violation">Violation</option>
        </select>
      </div>

      {/* Mine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mines.map((mine, i) => (
          <Link to={`/mines/${mine.id}`} key={mine.id}
            className="glass-card-hover p-5 group animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  mine.status === 'illegal' ? 'bg-danger-500/10 text-danger-400' :
                  mine.status === 'suspended' ? 'bg-warning-500/10 text-warning-400' :
                  'bg-brand-500/10 text-brand-400'
                }`}>
                  <Mountain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-100 group-hover:text-brand-300 transition-colors">{mine.name}</h3>
                  <p className="text-xs text-surface-500">{mine.id}</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-surface-500 group-hover:text-brand-400 transition-colors" />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-surface-400">
                <span>Type</span>
                <span className="text-surface-200">{mine.type}</span>
              </div>
              <div className="flex justify-between text-surface-400">
                <span>District</span>
                <span className="text-surface-200 flex items-center gap-1"><MapPin className="w-3 h-3" />{mine.district}</span>
              </div>
              <div className="flex justify-between text-surface-400">
                <span>Leaseholder</span>
                <span className="text-surface-200 truncate ml-4">{mine.leaseholder}</span>
              </div>
              <div className="flex justify-between text-surface-400">
                <span>Area</span>
                <span className="text-surface-200">{mine.area} ha</span>
              </div>
              <div className="flex justify-between text-surface-400">
                <span>Revenue</span>
                <span className="text-surface-200">₹{(mine.revenue / 100000).toFixed(1)} L</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-surface-800">
              <span className={`badge ${
                mine.compliance === 'compliant' ? 'badge-success' :
                mine.compliance === 'warning' ? 'badge-warning' : 'badge-danger'
              }`}>{mine.compliance}</span>
              <span className={`badge ${
                mine.status === 'active' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' :
                mine.status === 'illegal' ? 'badge-danger' : 'badge-warning'
              }`}>{mine.status}</span>
              {mine.leaseExpiry && (
                <span className="text-[10px] text-surface-500 ml-auto flex items-center">
                  Exp: {mine.leaseExpiry}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
