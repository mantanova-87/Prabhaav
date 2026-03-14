import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../contexts/AuthContext';
import { Upload, File, X, CheckCircle, Plane, Calendar, Clock, Mountain, Plus } from 'lucide-react';

export default function FlightUpload() {
  const { apiFetch } = useApi();
  const [mines, setMines] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showFlightForm, setShowFlightForm] = useState(false);
  const [newFlight, setNewFlight] = useState({ mineId: '', droneModel: '', date: '', startTime: '', endTime: '', altitude: '', notes: '' });

  useEffect(() => {
    apiFetch('/api/mines').then(r => r.json()).then(setMines);
    apiFetch('/api/flights').then(r => r.json()).then(setFlights);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('prabhaav_token')}` }, body: formData });
      if (res.ok) { setUploadSuccess(true); setFiles([]); setTimeout(() => setUploadSuccess(false), 3000); }
    } catch (err) { console.error(err); }
    setUploading(false);
  };

  const handleCreateFlight = async () => {
    await apiFetch('/api/flights', { method: 'POST', body: JSON.stringify({ ...newFlight, altitude: Number(newFlight.altitude) }) });
    setShowFlightForm(false);
    setNewFlight({ mineId: '', droneModel: '', date: '', startTime: '', endTime: '', altitude: '', notes: '' });
    apiFetch('/api/flights').then(r => r.json()).then(setFlights);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Flights & Data Upload</h1>
          <p className="text-surface-400 mt-1">Manage flight logs and upload drone data</p>
        </div>
        <button onClick={() => setShowFlightForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Flight
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`glass-card p-12 border-2 border-dashed transition-all duration-300 text-center cursor-pointer ${
              dragOver ? 'border-brand-500 bg-brand-500/5' : 'border-surface-600 hover:border-surface-500'
            }`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input id="file-input" type="file" multiple onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.tiff,.csv,.kml,.json,.pdf" />
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-brand-400' : 'text-surface-500'}`} />
            <h3 className="text-lg font-semibold text-surface-200">
              {dragOver ? 'Drop files here' : 'Drag & drop files to upload'}
            </h3>
            <p className="text-sm text-surface-500 mt-2">
              Supports: JPG, PNG, TIFF (imagery), CSV, KML (flight logs), JSON (AI reports)
            </p>
            <p className="text-xs text-surface-600 mt-1">Maximum 50MB per file</p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="glass-card p-4 space-y-2">
              <h4 className="text-sm font-semibold text-surface-200 mb-2">{files.length} file(s) selected</h4>
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-surface-800/50 rounded-lg">
                  <File className="w-4 h-4 text-brand-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-200 truncate">{file.name}</p>
                    <p className="text-xs text-surface-500">{formatSize(file.size)}</p>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-surface-500 hover:text-danger-400"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full mt-3 flex items-center justify-center gap-2">
                {uploading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Upload Files</>
                )}
              </button>
            </div>
          )}

          {uploadSuccess && (
            <div className="glass-card p-4 bg-success-500/10 border-success-500/30 flex items-center gap-3 animate-slide-up">
              <CheckCircle className="w-5 h-5 text-success-400" />
              <p className="text-success-300 text-sm">Files uploaded successfully!</p>
            </div>
          )}
        </div>

        {/* Flight Log List */}
        <div className="glass-card p-5">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">Recent Flights</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {flights.map((flight) => (
              <div key={flight.id} className="flex items-center gap-3 p-3 bg-surface-800/50 rounded-xl hover:bg-surface-800 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  flight.status === 'completed' ? 'bg-success-500/10 text-success-400' : 'bg-warning-500/10 text-warning-400'
                }`}>
                  <Plane className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-surface-200">{flight.id}</p>
                    <span className={`badge ${flight.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{flight.status}</span>
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-2">
                    <span>{flight.droneModel}</span>
                    <span>•</span>
                    <span>{flight.date}</span>
                    <span>•</span>
                    <span>{flight.mineId}</span>
                  </p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-xs text-surface-400">{flight.imagesCollected} imgs</p>
                  <p className="text-xs text-surface-500">{flight.altitude}m alt</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Flight Modal */}
      {showFlightForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFlightForm(false)}>
          <div className="glass-card p-6 w-full max-w-lg animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-100">Schedule New Flight</h3>
              <button onClick={() => setShowFlightForm(false)} className="text-surface-400 hover:text-surface-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-surface-300 mb-1 block">Mine</label>
                <select value={newFlight.mineId} onChange={e => setNewFlight(f => ({ ...f, mineId: e.target.value }))} className="input-field">
                  <option value="">Select mine...</option>
                  {mines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-surface-300 mb-1 block">Drone Model</label>
                <select value={newFlight.droneModel} onChange={e => setNewFlight(f => ({ ...f, droneModel: e.target.value }))} className="input-field">
                  <option value="">Select drone...</option>
                  <option>DJI Matrice 350 RTK</option>
                  <option>DJI Phantom 4 RTK</option>
                  <option>DJI Mavic 3 Enterprise</option>
                  <option>Autel EVO II Pro</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">Date</label>
                  <input type="date" value={newFlight.date} onChange={e => setNewFlight(f => ({ ...f, date: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">Start</label>
                  <input type="time" value={newFlight.startTime} onChange={e => setNewFlight(f => ({ ...f, startTime: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">End</label>
                  <input type="time" value={newFlight.endTime} onChange={e => setNewFlight(f => ({ ...f, endTime: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-sm text-surface-300 mb-1 block">Altitude (meters)</label>
                <input type="number" value={newFlight.altitude} onChange={e => setNewFlight(f => ({ ...f, altitude: e.target.value }))} className="input-field" placeholder="120" />
              </div>
              <div>
                <label className="text-sm text-surface-300 mb-1 block">Notes</label>
                <textarea value={newFlight.notes} onChange={e => setNewFlight(f => ({ ...f, notes: e.target.value }))} className="input-field h-20 resize-none" placeholder="Mission objectives..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowFlightForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleCreateFlight} className="btn-primary flex-1" disabled={!newFlight.mineId || !newFlight.date}>Schedule Flight</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
