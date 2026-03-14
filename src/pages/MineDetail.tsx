import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../contexts/AuthContext';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Popup } from 'react-leaflet';
import { ArrowLeft, Mountain, Calendar, MapPin, AlertTriangle, Plane, FileText, Clock, User } from 'lucide-react';

export default function MineDetail() {
  const { id } = useParams();
  const { apiFetch } = useApi();
  const [mine, setMine] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    apiFetch(`/api/mines/${id}`).then(r => r.json()).then(setMine);
  }, [id]);

  if (!mine) return <div className="flex items-center justify-center h-96"><div className="animate-pulse-slow text-brand-400">Loading mine details...</div></div>;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Mountain },
    { key: 'flights', label: 'Flights', icon: Plane, count: mine.flights?.length },
    { key: 'alerts', label: 'Alerts', icon: AlertTriangle, count: mine.alerts?.length },
    { key: 'documents', label: 'Documents', icon: FileText },
  ];

  const statusColor = mine.compliance === 'compliant' ? 'text-success-400' : mine.compliance === 'warning' ? 'text-warning-400' : 'text-danger-400';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + Header */}
      <div>
        <Link to="/mines" className="flex items-center gap-2 text-surface-400 hover:text-brand-400 transition-colors mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Mine Registry
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-100">{mine.name}</h1>
            <p className="text-surface-400 mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{mine.district}, {mine.state}</span>
              <span>{mine.id}</span>
              <span className={`badge ${mine.compliance === 'compliant' ? 'badge-success' : mine.compliance === 'warning' ? 'badge-warning' : 'badge-danger'}`}>{mine.compliance}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="glass-card overflow-hidden h-64 rounded-2xl">
        <MapContainer center={[mine.lat, mine.lng]} zoom={13} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {mine.boundary && (
            <Polygon
              positions={mine.boundary}
              pathOptions={{ color: mine.compliance === 'compliant' ? '#22c55e' : mine.compliance === 'warning' ? '#f59e0b' : '#ef4444', fillOpacity: 0.2, weight: 2 }}
            />
          )}
          <CircleMarker center={[mine.lat, mine.lng]} radius={8} pathOptions={{ color: '#338dff', fillColor: '#338dff', fillOpacity: 0.8 }} />
          {mine.flights?.filter((f: any) => f.path.length > 0).map((f: any) => (
            <Polyline key={f.id} positions={f.path} pathOptions={{ color: '#14b8a6', weight: 2, dashArray: '6, 4' }} />
          ))}
        </MapContainer>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-800">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === tab.key
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-surface-400 hover:text-surface-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && (
              <span className="bg-surface-800 text-surface-300 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-surface-100">Mine Information</h3>
            {[
              ['Mine ID', mine.id],
              ['Name', mine.name],
              ['Type', mine.type],
              ['Leaseholder', mine.leaseholder],
              ['District', mine.district],
              ['State', mine.state],
              ['Area', `${mine.area} hectares`],
              ['Status', mine.status],
              ['Compliance', mine.compliance],
              ['Lease Expiry', mine.leaseExpiry || 'N/A'],
              ['Last Inspection', mine.lastInspection],
              ['Revenue', `₹${(mine.revenue / 100000).toFixed(1)} Lakhs`],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between py-2 border-b border-surface-800 last:border-0">
                <span className="text-surface-400 text-sm">{label}</span>
                <span className="text-surface-200 text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-surface-100">Location & Coordinates</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-surface-400 text-sm">Latitude</span><span className="text-surface-200 font-mono text-sm">{mine.lat}°N</span></div>
              <div className="flex justify-between"><span className="text-surface-400 text-sm">Longitude</span><span className="text-surface-200 font-mono text-sm">{mine.lng}°E</span></div>
              <div className="flex justify-between"><span className="text-surface-400 text-sm">Boundary Points</span><span className="text-surface-200 text-sm">{mine.boundary?.length || 0} vertices</span></div>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-surface-200 mb-3">Summary</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-surface-800/50 rounded-xl">
                  <p className="text-lg font-bold text-brand-400">{mine.flights?.length || 0}</p>
                  <p className="text-[10px] text-surface-500">Flights</p>
                </div>
                <div className="text-center p-3 bg-surface-800/50 rounded-xl">
                  <p className="text-lg font-bold text-danger-400">{mine.alerts?.length || 0}</p>
                  <p className="text-[10px] text-surface-500">Alerts</p>
                </div>
                <div className="text-center p-3 bg-surface-800/50 rounded-xl">
                  <p className="text-lg font-bold text-accent-400">{mine.area}</p>
                  <p className="text-[10px] text-surface-500">Hectares</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'flights' && (
        <div className="space-y-3 animate-fade-in">
          {mine.flights?.length === 0 ? (
            <p className="text-surface-500 text-center py-12">No flights recorded for this mine.</p>
          ) : mine.flights?.map((f: any) => (
            <div key={f.id} className="glass-card p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.status === 'completed' ? 'bg-success-500/10 text-success-400' : 'bg-brand-500/10 text-brand-400'}`}>
                <Plane className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-surface-200">{f.id} – {f.droneModel}</p>
                  <span className={`badge ${f.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{f.status}</span>
                </div>
                <p className="text-xs text-surface-500 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{f.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{f.startTime} – {f.endTime}</span>
                  <span>{f.imagesCollected} images</span>
                  <span>Alt: {f.altitude}m</span>
                </p>
                {f.notes && <p className="text-xs text-surface-400 mt-1">{f.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-3 animate-fade-in">
          {mine.alerts?.length === 0 ? (
            <p className="text-surface-500 text-center py-12">No alerts for this mine.</p>
          ) : mine.alerts?.map((a: any) => (
            <div key={a.id} className="glass-card p-5">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 mt-2 rounded-full ${a.severity === 'high' ? 'bg-danger-500 animate-pulse' : a.severity === 'medium' ? 'bg-warning-500' : 'bg-brand-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-surface-200">{a.title}</p>
                    <span className={`badge ${a.severity === 'high' ? 'badge-high' : a.severity === 'medium' ? 'badge-medium' : 'badge-low'}`}>{a.severity}</span>
                    <span className={`badge ${a.status === 'active' ? 'badge-danger' : a.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>{a.status}</span>
                  </div>
                  <p className="text-sm text-surface-400 mt-1">{a.description}</p>
                  <p className="text-xs text-surface-500 mt-2">{new Date(a.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="glass-card p-12 text-center animate-fade-in">
          <FileText className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-300">No Documents Uploaded</h3>
          <p className="text-surface-500 mt-1">Upload drone imagery, AI reports, or flight logs from the Flights page.</p>
        </div>
      )}
    </div>
  );
}
