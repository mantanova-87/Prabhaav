import { useState, useEffect } from 'react';
import { useApi } from '../contexts/AuthContext';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Eye, EyeOff, AlertTriangle, Mountain, Plane, Crosshair } from 'lucide-react';

// Fix leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const statusColors: Record<string, string> = {
  compliant: '#22c55e',
  warning: '#f59e0b',
  violation: '#ef4444',
};

const severityColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#338dff',
};

function MapControls({ center }: { center: [number, number] }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.flyTo(center, 7)}
      className="absolute top-4 right-4 z-[1000] p-2 glass-card hover:bg-surface-700 transition-colors"
      title="Reset View"
    >
      <Crosshair className="w-5 h-5 text-surface-300" />
    </button>
  );
}

export default function MapView() {
  const { apiFetch } = useApi();
  const [mines, setMines] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [layers, setLayers] = useState({ mines: true, alerts: true, flights: true, boundaries: true, heatmap: true });
  const [selectedMine, setSelectedMine] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/mines').then(r => r.json()),
      apiFetch('/api/alerts').then(r => r.json()),
      apiFetch('/api/flights').then(r => r.json()),
    ]).then(([m, a, f]) => { setMines(m); setAlerts(a); setFlights(f); });
  }, []);

  const center: [number, number] = [25.5, 73.8];

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4 animate-fade-in">
      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-surface-700/50 relative">
        <MapContainer center={center} zoom={7} className="h-full w-full" zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />
          <MapControls center={center} />

          {/* Mine Boundaries */}
          {layers.boundaries && mines.map(mine => mine.boundary && (
            <Polygon
              key={`boundary-${mine.id}`}
              positions={mine.boundary as [number, number][]}
              pathOptions={{
                color: statusColors[mine.compliance] || '#64748b',
                fillColor: statusColors[mine.compliance] || '#64748b',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: mine.status === 'illegal' ? '8, 4' : undefined,
              }}
            />
          ))}

          {/* Mine Markers */}
          {layers.mines && mines.map(mine => (
            <CircleMarker
              key={`mine-${mine.id}`}
              center={[mine.lat, mine.lng]}
              radius={mine.status === 'illegal' ? 10 : 7}
              pathOptions={{
                color: statusColors[mine.compliance] || '#64748b',
                fillColor: statusColors[mine.compliance] || '#64748b',
                fillOpacity: 0.8,
                weight: 2,
              }}
              eventHandlers={{ click: () => setSelectedMine(mine) }}
            >
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <p className="font-bold text-gray-900">{mine.name}</p>
                  <p className="text-gray-600">{mine.type} • {mine.district}</p>
                  <p className="text-gray-600">Leaseholder: {mine.leaseholder}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs text-white ${
                      mine.compliance === 'compliant' ? 'bg-green-500' :
                      mine.compliance === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>{mine.compliance}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-200">{mine.status}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Alert Markers */}
          {layers.alerts && alerts.filter(a => a.status !== 'resolved').map(alert => (
            <CircleMarker
              key={`alert-${alert.id}`}
              center={[alert.lat, alert.lng]}
              radius={alert.severity === 'high' ? 12 : 8}
              pathOptions={{
                color: severityColors[alert.severity],
                fillColor: severityColors[alert.severity],
                fillOpacity: 0.4,
                weight: 3,
              }}
            >
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <p className="font-bold text-gray-900">{alert.title}</p>
                  <p className="text-gray-600 text-xs mt-1">{alert.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs text-white ${
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>{alert.severity}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-200">{alert.status}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Flight Paths */}
          {layers.flights && flights.filter(f => f.path.length > 0).map(flight => (
            <Polyline
              key={`flight-${flight.id}`}
              positions={flight.path as [number, number][]}
              pathOptions={{ color: '#338dff', weight: 2, opacity: 0.7, dashArray: '6, 4' }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">Flight {flight.id}</p>
                  <p className="text-gray-600">{flight.droneModel}</p>
                  <p className="text-gray-600">{flight.date} • {flight.startTime}-{flight.endTime}</p>
                  <p className="text-gray-600">{flight.imagesCollected} images collected</p>
                </div>
              </Popup>
            </Polyline>
          ))}

          {/* Heatmap spots for illegal activity */}
          {layers.heatmap && mines.filter(m => m.compliance === 'violation' || m.status === 'illegal').map(mine => (
            <CircleMarker
              key={`heat-${mine.id}`}
              center={[mine.lat, mine.lng]}
              radius={25}
              pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.12 }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Sidebar Panel */}
      <div className="w-80 flex flex-col gap-4">
        {/* Layer Controls */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-surface-100 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            Map Layers
          </h3>
          <div className="space-y-2">
            {[
              { key: 'mines' as const, label: 'Mine Locations', icon: Mountain, count: mines.length },
              { key: 'boundaries' as const, label: 'Lease Boundaries', icon: Mountain, count: mines.filter(m => m.boundary).length },
              { key: 'alerts' as const, label: 'Active Alerts', icon: AlertTriangle, count: alerts.filter(a => a.status !== 'resolved').length },
              { key: 'flights' as const, label: 'Flight Paths', icon: Plane, count: flights.filter(f => f.path.length > 0).length },
              { key: 'heatmap' as const, label: 'Violation Hotspots', icon: Eye, count: mines.filter(m => m.compliance === 'violation').length },
            ].map(layer => (
              <button
                key={layer.key}
                onClick={() => toggleLayer(layer.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  layers[layer.key] ? 'bg-brand-500/10 text-brand-300 border border-brand-500/20' : 'text-surface-400 hover:bg-surface-800'
                }`}
              >
                {layers[layer.key] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="flex-1 text-left">{layer.label}</span>
                <span className="text-xs bg-surface-800 px-2 py-0.5 rounded-full">{layer.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-surface-100 mb-3">Legend</h3>
          <div className="space-y-2">
            {[
              { color: '#22c55e', label: 'Compliant' },
              { color: '#f59e0b', label: 'Warning' },
              { color: '#ef4444', label: 'Violation / Illegal' },
              { color: '#338dff', label: 'Flight Path' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-surface-300">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Mine */}
        {selectedMine && (
          <div className="glass-card p-5 animate-slide-up">
            <h3 className="text-sm font-semibold text-surface-100 mb-2">{selectedMine.name}</h3>
            <div className="space-y-1.5 text-xs text-surface-400">
              <p>Type: <span className="text-surface-200">{selectedMine.type}</span></p>
              <p>District: <span className="text-surface-200">{selectedMine.district}</span></p>
              <p>Leaseholder: <span className="text-surface-200">{selectedMine.leaseholder}</span></p>
              <p>Area: <span className="text-surface-200">{selectedMine.area} hectares</span></p>
              <p>Last Inspection: <span className="text-surface-200">{selectedMine.lastInspection}</span></p>
              <div className="flex gap-2 mt-3">
                <span className={`badge ${
                  selectedMine.compliance === 'compliant' ? 'badge-success' :
                  selectedMine.compliance === 'warning' ? 'badge-warning' : 'badge-danger'
                }`}>{selectedMine.compliance}</span>
                <span className="badge bg-surface-700 text-surface-300">{selectedMine.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-surface-100 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-surface-800/50 rounded-xl">
              <p className="text-xl font-bold text-brand-400">{mines.length}</p>
              <p className="text-[10px] text-surface-500 uppercase">Total Mines</p>
            </div>
            <div className="text-center p-3 bg-surface-800/50 rounded-xl">
              <p className="text-xl font-bold text-danger-400">{alerts.filter(a => a.status === 'active').length}</p>
              <p className="text-[10px] text-surface-500 uppercase">Active Alerts</p>
            </div>
            <div className="text-center p-3 bg-surface-800/50 rounded-xl">
              <p className="text-xl font-bold text-warning-400">{mines.filter(m => m.status === 'illegal').length}</p>
              <p className="text-[10px] text-surface-500 uppercase">Illegal Sites</p>
            </div>
            <div className="text-center p-3 bg-surface-800/50 rounded-xl">
              <p className="text-xl font-bold text-accent-400">{flights.filter(f => f.status === 'completed').length}</p>
              <p className="text-[10px] text-surface-500 uppercase">Flights Done</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
