import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const JWT_SECRET = 'prabhaav-secret-key-2024-mining-surveillance';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── FILE UPLOAD CONFIG ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Ensure uploads directory
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─── IN-MEMORY DATABASE ───────────────────────────────────────

const users = [
  { id: '1', name: 'Rajesh Kumar', email: 'superadmin@prabhaav.gov.in', password: bcrypt.hashSync('admin123', 10), role: 'super_admin', state: 'Rajasthan', district: null, phone: '+91-9876543210', active: true, twoFactorEnabled: true, createdAt: '2024-01-15T10:00:00Z', lastLogin: '2024-09-10T08:30:00Z' },
  { id: '2', name: 'Priya Sharma', email: 'state@prabhaav.gov.in', password: bcrypt.hashSync('state123', 10), role: 'state_admin', state: 'Rajasthan', district: null, phone: '+91-9876543211', active: true, twoFactorEnabled: false, createdAt: '2024-02-20T10:00:00Z', lastLogin: '2024-09-09T14:20:00Z' },
  { id: '3', name: 'Amit Verma', email: 'dmo@prabhaav.gov.in', password: bcrypt.hashSync('dmo123', 10), role: 'district_officer', state: 'Rajasthan', district: 'Udaipur', phone: '+91-9876543212', active: true, twoFactorEnabled: false, createdAt: '2024-03-10T10:00:00Z', lastLogin: '2024-09-10T09:15:00Z' },
  { id: '4', name: 'Suresh Patel', email: 'inspector@prabhaav.gov.in', password: bcrypt.hashSync('field123', 10), role: 'field_inspector', state: 'Rajasthan', district: 'Udaipur', phone: '+91-9876543213', active: true, twoFactorEnabled: false, createdAt: '2024-04-05T10:00:00Z', lastLogin: '2024-09-10T07:00:00Z' },
  { id: '5', name: 'Guest Viewer', email: 'viewer@prabhaav.gov.in', password: bcrypt.hashSync('viewer123', 10), role: 'viewer', state: 'Rajasthan', district: null, phone: '+91-9876543214', active: true, twoFactorEnabled: false, createdAt: '2024-05-01T10:00:00Z', lastLogin: '2024-09-08T16:00:00Z' },
  { id: '6', name: 'Meena Devi', email: 'dmo2@prabhaav.gov.in', password: bcrypt.hashSync('dmo123', 10), role: 'district_officer', state: 'Rajasthan', district: 'Jaipur', phone: '+91-9876543215', active: true, twoFactorEnabled: false, createdAt: '2024-03-15T10:00:00Z', lastLogin: '2024-09-09T11:00:00Z' },
  { id: '7', name: 'Vikram Singh', email: 'inspector2@prabhaav.gov.in', password: bcrypt.hashSync('field123', 10), role: 'field_inspector', state: 'Rajasthan', district: 'Jaipur', phone: '+91-9876543216', active: true, twoFactorEnabled: false, createdAt: '2024-04-12T10:00:00Z', lastLogin: '2024-09-10T06:30:00Z' },
];

const mines = [
  { id: 'M001', name: 'Rajpura Marble Mine', type: 'Marble', leaseholder: 'Rajpura Minerals Pvt Ltd', district: 'Udaipur', state: 'Rajasthan', status: 'active', compliance: 'compliant', area: 45.5, leaseExpiry: '2028-12-31', lat: 24.5854, lng: 73.7125, lastInspection: '2024-09-05', revenue: 4500000, boundary: [[24.590, 73.708], [24.590, 73.717], [24.581, 73.717], [24.581, 73.708]] },
  { id: 'M002', name: 'Jodhpur Sandstone Quarry', type: 'Sandstone', leaseholder: 'Desert Stone Corp', district: 'Jodhpur', state: 'Rajasthan', status: 'active', compliance: 'violation', area: 32.0, leaseExpiry: '2026-06-30', lat: 26.2389, lng: 73.0243, lastInspection: '2024-09-01', revenue: 2800000, boundary: [[26.243, 73.020], [26.243, 73.029], [26.235, 73.029], [26.235, 73.020]] },
  { id: 'M003', name: 'Bhilwara Zinc Mine', type: 'Zinc', leaseholder: 'Hindustan Zinc Ltd', district: 'Bhilwara', state: 'Rajasthan', status: 'active', compliance: 'compliant', area: 120.0, leaseExpiry: '2030-03-15', lat: 25.3476, lng: 74.6362, lastInspection: '2024-08-28', revenue: 15000000, boundary: [[25.352, 74.632], [25.352, 74.641], [25.343, 74.641], [25.343, 74.632]] },
  { id: 'M004', name: 'Jaipur Granite Mine', type: 'Granite', leaseholder: 'Jaipur Stones Ltd', district: 'Jaipur', state: 'Rajasthan', status: 'active', compliance: 'warning', area: 28.0, leaseExpiry: '2027-09-30', lat: 26.9124, lng: 75.7873, lastInspection: '2024-09-03', revenue: 3200000, boundary: [[26.916, 75.783], [26.916, 75.792], [26.909, 75.792], [26.909, 75.783]] },
  { id: 'M005', name: 'Alwar Copper Mine', type: 'Copper', leaseholder: 'Khetri Copper Complex', district: 'Alwar', state: 'Rajasthan', status: 'suspended', compliance: 'violation', area: 85.0, leaseExpiry: '2025-12-31', lat: 27.5514, lng: 76.6346, lastInspection: '2024-08-15', revenue: 0, boundary: [[27.555, 76.630], [27.555, 76.639], [27.548, 76.639], [27.548, 76.630]] },
  { id: 'M006', name: 'Makrana White Marble', type: 'Marble', leaseholder: 'Makrana Heritage Stones', district: 'Nagaur', state: 'Rajasthan', status: 'active', compliance: 'compliant', area: 55.0, leaseExpiry: '2029-06-30', lat: 27.0426, lng: 74.7238, lastInspection: '2024-09-08', revenue: 8500000, boundary: [[27.047, 74.720], [27.047, 74.728], [27.038, 74.728], [27.038, 74.720]] },
  { id: 'M007', name: 'Barmer Limestone Mine', type: 'Limestone', leaseholder: 'Western Minerals Corp', district: 'Barmer', state: 'Rajasthan', status: 'active', compliance: 'compliant', area: 40.0, leaseExpiry: '2028-03-31', lat: 25.7521, lng: 71.3967, lastInspection: '2024-09-06', revenue: 3100000, boundary: [[25.756, 71.393], [25.756, 71.401], [25.748, 71.401], [25.748, 71.393]] },
  { id: 'M008', name: 'Sirohi Feldspar Mine', type: 'Feldspar', leaseholder: 'Minerex Industries', district: 'Sirohi', state: 'Rajasthan', status: 'active', compliance: 'warning', area: 18.0, leaseExpiry: '2026-12-31', lat: 24.8854, lng: 72.8640, lastInspection: '2024-08-25', revenue: 1200000, boundary: [[24.889, 72.860], [24.889, 72.868], [24.882, 72.868], [24.882, 72.860]] },
  { id: 'M009', name: 'Chittorgarh Lead Mine', type: 'Lead', leaseholder: 'Rajasthan State Mines', district: 'Chittorgarh', state: 'Rajasthan', status: 'active', compliance: 'compliant', area: 92.0, leaseExpiry: '2031-06-30', lat: 24.8887, lng: 74.6269, lastInspection: '2024-09-02', revenue: 11000000, boundary: [[24.893, 74.623], [24.893, 74.631], [24.885, 74.631], [24.885, 74.623]] },
  { id: 'M010', name: 'Banswara Manganese Mine', type: 'Manganese', leaseholder: 'Southern Rajasthan Mining Co', district: 'Banswara', state: 'Rajasthan', status: 'active', compliance: 'violation', area: 65.0, leaseExpiry: '2027-03-31', lat: 23.5462, lng: 74.4446, lastInspection: '2024-08-20', revenue: 5800000, boundary: [[23.550, 74.441], [23.550, 74.449], [23.542, 74.449], [23.542, 74.441]] },
  { id: 'M011', name: 'Dungarpur Silica Mine', type: 'Silica', leaseholder: 'Dungarpur Minerals Ltd', district: 'Dungarpur', state: 'Rajasthan', status: 'active', compliance: 'compliant', area: 22.0, leaseExpiry: '2026-09-30', lat: 23.8437, lng: 73.7172, lastInspection: '2024-09-04', revenue: 1800000, boundary: [[23.847, 73.713], [23.847, 73.721], [23.840, 73.721], [23.840, 73.713]] },
  { id: 'M012', name: 'Illegal Mica Extraction Site', type: 'Mica', leaseholder: 'UNLICENSED', district: 'Bhilwara', state: 'Rajasthan', status: 'illegal', compliance: 'violation', area: 12.0, leaseExpiry: null, lat: 25.4102, lng: 74.5830, lastInspection: '2024-09-09', revenue: 0, boundary: [[25.413, 74.579], [25.413, 74.587], [25.407, 74.587], [25.407, 74.579]] },
  { id: 'M013', name: 'Unauthorized Sand Mining', type: 'Sand', leaseholder: 'UNLICENSED', district: 'Udaipur', state: 'Rajasthan', status: 'illegal', compliance: 'violation', area: 8.5, leaseExpiry: null, lat: 24.6312, lng: 73.6812, lastInspection: '2024-09-07', revenue: 0, boundary: [[24.634, 73.677], [24.634, 73.685], [24.628, 73.685], [24.628, 73.677]] },
  { id: 'M014', name: 'Ajmer Quartz Mine', type: 'Quartz', leaseholder: 'Ajmer Mining Associates', district: 'Ajmer', state: 'Rajasthan', status: 'active', compliance: 'compliant', area: 35.0, leaseExpiry: '2029-12-31', lat: 26.4499, lng: 74.6399, lastInspection: '2024-09-01', revenue: 2600000, boundary: [[26.453, 74.636], [26.453, 74.644], [26.447, 74.644], [26.447, 74.636]] },
  { id: 'M015', name: 'Pali Soapstone Quarry', type: 'Soapstone', leaseholder: 'Pali Stone Works', district: 'Pali', state: 'Rajasthan', status: 'active', compliance: 'warning', area: 15.0, leaseExpiry: '2026-06-30', lat: 25.7711, lng: 73.3234, lastInspection: '2024-08-30', revenue: 900000, boundary: [[25.774, 73.320], [25.774, 73.327], [25.768, 73.327], [25.768, 73.320]] },
];

const alerts = [
  { id: 'A001', mineId: 'M002', type: 'boundary_violation', severity: 'high', title: 'Boundary Violation – Jodhpur Sandstone', description: 'Drone imagery shows extraction activity 120m beyond the approved lease boundary on the eastern side.', lat: 26.2410, lng: 73.0300, status: 'active', evidence: ['/uploads/evidence-001.jpg'], createdBy: '4', assignedTo: '3', createdAt: '2024-09-10T06:30:00Z', updatedAt: '2024-09-10T06:30:00Z', comments: [] },
  { id: 'A002', mineId: 'M005', type: 'over_extraction', severity: 'high', title: 'Excessive Copper Extraction – Alwar', description: 'AI volumetric analysis indicates 340% over-extraction compared to permitted monthly quota. Estimated revenue loss: ₹2.3 Cr.', lat: 27.5530, lng: 76.6360, status: 'acknowledged', evidence: ['/uploads/evidence-002.jpg'], createdBy: '4', assignedTo: '3', createdAt: '2024-09-08T14:00:00Z', updatedAt: '2024-09-09T10:00:00Z', comments: [{ by: '3', text: 'Team dispatched for ground verification', at: '2024-09-09T10:00:00Z' }] },
  { id: 'A003', mineId: 'M012', type: 'illegal_mining', severity: 'high', title: 'Illegal Mica Mining Detected – Bhilwara', description: 'Thermal imagery reveals active mining operation at night. No valid lease found in records. Multiple heavy vehicles spotted.', lat: 25.4102, lng: 74.5830, status: 'escalated', evidence: ['/uploads/evidence-003.jpg'], createdBy: '4', assignedTo: '2', createdAt: '2024-09-07T22:15:00Z', updatedAt: '2024-09-08T08:00:00Z', comments: [{ by: '3', text: 'Confirmed illegal operation. Escalating to state level.', at: '2024-09-08T08:00:00Z' }] },
  { id: 'A004', mineId: 'M013', type: 'illegal_mining', severity: 'high', title: 'Unauthorized Sand Mining – Udaipur', description: 'Drone footage shows unauthorized sand extraction from riverbed. Environmental damage visible in multispectral imagery.', lat: 24.6312, lng: 73.6812, status: 'active', evidence: [], createdBy: '4', assignedTo: '3', createdAt: '2024-09-09T16:45:00Z', updatedAt: '2024-09-09T16:45:00Z', comments: [] },
  { id: 'A005', mineId: 'M004', type: 'unauthorized_equipment', severity: 'medium', title: 'Unauthorized Heavy Machinery – Jaipur Granite', description: 'Two unregistered excavators spotted at the mine site. Equipment registration not found in DMO database.', lat: 26.9140, lng: 75.7890, status: 'active', evidence: [], createdBy: '7', assignedTo: '6', createdAt: '2024-09-10T08:00:00Z', updatedAt: '2024-09-10T08:00:00Z', comments: [] },
  { id: 'A006', mineId: 'M010', type: 'boundary_violation', severity: 'medium', title: 'Minor Boundary Encroachment – Banswara', description: 'Extraction pits detected 25m beyond the approved southern boundary. Appears to be recent activity.', lat: 23.5400, lng: 74.4470, status: 'resolved', evidence: [], createdBy: '4', assignedTo: '3', createdAt: '2024-08-25T11:30:00Z', updatedAt: '2024-09-01T14:00:00Z', comments: [{ by: '3', text: 'Inspected on-site. Boundary restored. Fine levied.', at: '2024-09-01T14:00:00Z' }] },
  { id: 'A007', mineId: 'M008', type: 'over_extraction', severity: 'low', title: 'Minor Over-extraction – Sirohi Feldspar', description: 'Monthly extraction volume exceeds permit by 8%. Within tolerance but flagged for monitoring.', lat: 24.8860, lng: 72.8650, status: 'active', evidence: [], createdBy: '4', assignedTo: '3', createdAt: '2024-09-09T12:00:00Z', updatedAt: '2024-09-09T12:00:00Z', comments: [] },
  { id: 'A008', mineId: 'M015', type: 'unauthorized_equipment', severity: 'low', title: 'Unregistered Vehicle – Pali Soapstone', description: 'One unregistered truck detected at the mine. May be a temporary contractor vehicle.', lat: 25.7720, lng: 73.3240, status: 'resolved', evidence: [], createdBy: '7', assignedTo: '6', createdAt: '2024-08-20T09:00:00Z', updatedAt: '2024-08-22T15:00:00Z', comments: [{ by: '6', text: 'Contractor vehicle verified. Registration updated.', at: '2024-08-22T15:00:00Z' }] },
  { id: 'A009', mineId: 'M001', type: 'boundary_violation', severity: 'low', title: 'Survey Marker Displacement – Rajpura Marble', description: 'Two survey markers found displaced during routine drone survey. No extraction beyond boundary confirmed.', lat: 24.5870, lng: 73.7140, status: 'resolved', evidence: [], createdBy: '4', assignedTo: '3', createdAt: '2024-09-05T10:00:00Z', updatedAt: '2024-09-06T11:00:00Z', comments: [{ by: '3', text: 'Markers reinstalled. No violation.', at: '2024-09-06T11:00:00Z' }] },
  { id: 'A010', mineId: 'M002', type: 'over_extraction', severity: 'high', title: 'Massive Over-extraction – Jodhpur Sandstone Q3', description: 'Quarterly AI analysis shows 520% over-extraction. Estimated ₹4.1 Cr revenue loss. Immediate action required.', lat: 26.2395, lng: 73.0250, status: 'active', evidence: [], createdBy: '4', assignedTo: '3', createdAt: '2024-09-10T09:00:00Z', updatedAt: '2024-09-10T09:00:00Z', comments: [] },
];

const flights = [
  { id: 'F001', mineId: 'M001', inspectorId: '4', droneModel: 'DJI Matrice 350 RTK', date: '2024-09-05', startTime: '06:30', endTime: '08:15', altitude: 120, areaSwept: 45.5, imagesCollected: 342, status: 'completed', path: [[24.592, 73.710], [24.590, 73.715], [24.585, 73.713], [24.583, 73.710], [24.585, 73.708], [24.590, 73.710]], notes: 'Routine monthly survey. Clear weather conditions.', files: [] },
  { id: 'F002', mineId: 'M002', inspectorId: '4', droneModel: 'DJI Phantom 4 RTK', date: '2024-09-01', startTime: '07:00', endTime: '09:30', altitude: 100, areaSwept: 38.5, imagesCollected: 456, status: 'completed', path: [[26.245, 73.022], [26.243, 73.027], [26.239, 73.026], [26.237, 73.022], [26.239, 73.020], [26.243, 73.022]], notes: 'Detected boundary violation on eastern perimeter. Thermal scan included.', files: [] },
  { id: 'F003', mineId: 'M003', inspectorId: '4', droneModel: 'DJI Matrice 350 RTK', date: '2024-08-28', startTime: '05:45', endTime: '08:00', altitude: 150, areaSwept: 120.0, imagesCollected: 678, status: 'completed', path: [[25.354, 74.634], [25.352, 74.639], [25.348, 74.637], [25.345, 74.634], [25.348, 74.632], [25.352, 74.634]], notes: 'Large area survey. All parameters normal.', files: [] },
  { id: 'F004', mineId: 'M012', inspectorId: '4', droneModel: 'DJI Mavic 3 Enterprise', date: '2024-09-09', startTime: '22:00', endTime: '23:30', altitude: 80, areaSwept: 15.0, imagesCollected: 189, status: 'completed', path: [[25.414, 74.581], [25.412, 74.585], [25.409, 74.584], [25.408, 74.581], [25.410, 74.579], [25.412, 74.581]], notes: 'Night surveillance mission. Thermal camera used. Illegal activity confirmed.', files: [] },
  { id: 'F005', mineId: 'M004', inspectorId: '7', droneModel: 'DJI Phantom 4 RTK', date: '2024-09-03', startTime: '06:00', endTime: '07:45', altitude: 110, areaSwept: 28.0, imagesCollected: 256, status: 'completed', path: [[26.918, 75.785], [26.916, 75.790], [26.912, 75.788], [26.910, 75.785], [26.912, 75.783], [26.916, 75.785]], notes: 'Routine inspection. Unauthorized equipment spotted.', files: [] },
  { id: 'F006', mineId: 'M013', inspectorId: '4', droneModel: 'DJI Mavic 3 Enterprise', date: '2024-09-07', startTime: '06:30', endTime: '08:00', altitude: 90, areaSwept: 12.0, imagesCollected: 167, status: 'completed', path: [[24.636, 73.679], [24.634, 73.683], [24.630, 73.682], [24.629, 73.679], [24.631, 73.678], [24.634, 73.679]], notes: 'Unauthorized sand mining from riverbed detected. Environmental impact visible.', files: [] },
  { id: 'F007', mineId: 'M001', inspectorId: '4', droneModel: 'DJI Matrice 350 RTK', date: '2024-09-15', startTime: '06:00', endTime: '08:00', altitude: 120, areaSwept: 45.5, imagesCollected: 0, status: 'scheduled', path: [], notes: 'Scheduled monthly survey.', files: [] },
  { id: 'F008', mineId: 'M010', inspectorId: '4', droneModel: 'DJI Phantom 4 RTK', date: '2024-09-16', startTime: '07:00', endTime: '09:00', altitude: 100, areaSwept: 65.0, imagesCollected: 0, status: 'scheduled', path: [], notes: 'Follow-up on boundary violation report.', files: [] },
];

const auditLogs = [
  { id: 'L001', userId: '1', action: 'LOGIN', details: 'Super Admin login successful', ip: '192.168.1.10', timestamp: '2024-09-10T08:30:00Z' },
  { id: 'L002', userId: '4', action: 'DATA_UPLOAD', details: 'Uploaded drone imagery for mine M002', ip: '10.0.0.45', timestamp: '2024-09-10T06:35:00Z' },
  { id: 'L003', userId: '3', action: 'ALERT_ACKNOWLEDGE', details: 'Acknowledged alert A002 - Over-extraction at Alwar', ip: '192.168.1.22', timestamp: '2024-09-09T10:00:00Z' },
  { id: 'L004', userId: '3', action: 'ALERT_ESCALATE', details: 'Escalated alert A003 to state level', ip: '192.168.1.22', timestamp: '2024-09-08T08:00:00Z' },
  { id: 'L005', userId: '2', action: 'REPORT_GENERATE', details: 'Generated monthly compliance report for August 2024', ip: '192.168.1.15', timestamp: '2024-09-07T16:00:00Z' },
  { id: 'L006', userId: '4', action: 'FLIGHT_LOG', details: 'Night surveillance mission at illegal mica site M012', ip: '10.0.0.45', timestamp: '2024-09-09T22:00:00Z' },
  { id: 'L007', userId: '1', action: 'USER_CREATE', details: 'Created new field inspector account', ip: '192.168.1.10', timestamp: '2024-09-06T11:00:00Z' },
  { id: 'L008', userId: '6', action: 'ALERT_RESOLVE', details: 'Resolved alert A008 - Unregistered vehicle at Pali', ip: '192.168.1.30', timestamp: '2024-08-22T15:00:00Z' },
  { id: 'L009', userId: '3', action: 'ALERT_RESOLVE', details: 'Resolved alert A006 - Boundary encroachment at Banswara', ip: '192.168.1.22', timestamp: '2024-09-01T14:00:00Z' },
  { id: 'L010', userId: '2', action: 'LOGIN', details: 'State Admin login successful', ip: '192.168.1.15', timestamp: '2024-09-09T14:20:00Z' },
];

// ─── MIDDLEWARE ────────────────────────────────────────────────

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// ─── AUTH ROUTES ──────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!user.active) return res.status(403).json({ error: 'Account deactivated' });

  user.lastLogin = new Date().toISOString();
  auditLogs.push({ id: `L${auditLogs.length + 1}`, userId: user.id, action: 'LOGIN', details: `${user.name} logged in`, ip: req.ip || '127.0.0.1', timestamp: new Date().toISOString() });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, state: user.state, district: user.district }, JWT_SECRET, { expiresIn: '24h' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// ─── USER ROUTES ──────────────────────────────────────────────

app.get('/api/users', authenticate, authorize('super_admin', 'state_admin'), (req, res) => {
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

app.post('/api/users', authenticate, authorize('super_admin'), (req, res) => {
  const { name, email, role, state, district, phone } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
  const newUser = { id: uuidv4(), name, email, password: bcrypt.hashSync('default123', 10), role, state, district, phone, active: true, twoFactorEnabled: false, createdAt: new Date().toISOString(), lastLogin: null };
  users.push(newUser);
  auditLogs.push({ id: `L${auditLogs.length + 1}`, userId: req.user.id, action: 'USER_CREATE', details: `Created user: ${name}`, ip: req.ip, timestamp: new Date().toISOString() });
  const { password, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

app.put('/api/users/:id', authenticate, authorize('super_admin'), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { name, role, state, district, phone, active } = req.body;
  if (name) user.name = name;
  if (role) user.role = role;
  if (state) user.state = state;
  if (district !== undefined) user.district = district;
  if (phone) user.phone = phone;
  if (active !== undefined) user.active = active;
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.delete('/api/users/:id', authenticate, authorize('super_admin'), (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users.splice(idx, 1);
  res.json({ message: 'User deleted' });
});

// ─── MINE ROUTES ──────────────────────────────────────────────

app.get('/api/mines', authenticate, (req, res) => {
  let result = [...mines];
  if (req.user.role === 'district_officer' || req.user.role === 'field_inspector') {
    result = result.filter(m => m.district === req.user.district);
  }
  if (req.query.district) result = result.filter(m => m.district === req.query.district);
  if (req.query.status) result = result.filter(m => m.status === req.query.status);
  if (req.query.compliance) result = result.filter(m => m.compliance === req.query.compliance);
  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    result = result.filter(m => m.name.toLowerCase().includes(s) || m.leaseholder.toLowerCase().includes(s) || m.type.toLowerCase().includes(s));
  }
  res.json(result);
});

app.get('/api/mines/:id', authenticate, (req, res) => {
  const mine = mines.find(m => m.id === req.params.id);
  if (!mine) return res.status(404).json({ error: 'Mine not found' });
  const mineAlerts = alerts.filter(a => a.mineId === mine.id);
  const mineFlights = flights.filter(f => f.mineId === mine.id);
  res.json({ ...mine, alerts: mineAlerts, flights: mineFlights });
});

// ─── ALERT ROUTES ─────────────────────────────────────────────

app.get('/api/alerts', authenticate, (req, res) => {
  let result = [...alerts];
  if (req.user.role === 'district_officer') {
    const districtMines = mines.filter(m => m.district === req.user.district).map(m => m.id);
    result = result.filter(a => districtMines.includes(a.mineId));
  }
  if (req.user.role === 'field_inspector') {
    result = result.filter(a => a.createdBy === req.user.id);
  }
  if (req.query.severity) result = result.filter(a => a.severity === req.query.severity);
  if (req.query.status) result = result.filter(a => a.status === req.query.status);
  if (req.query.type) result = result.filter(a => a.type === req.query.type);
  res.json(result);
});

app.post('/api/alerts', authenticate, authorize('field_inspector', 'district_officer', 'super_admin'), (req, res) => {
  const { mineId, type, severity, title, description, lat, lng } = req.body;
  const mine = mines.find(m => m.id === mineId);
  const newAlert = { id: `A${String(alerts.length + 1).padStart(3, '0')}`, mineId, type, severity, title, description, lat: lat || mine?.lat, lng: lng || mine?.lng, status: 'active', evidence: [], createdBy: req.user.id, assignedTo: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [] };
  alerts.push(newAlert);
  auditLogs.push({ id: `L${auditLogs.length + 1}`, userId: req.user.id, action: 'ALERT_CREATE', details: `Created alert: ${title}`, ip: req.ip, timestamp: new Date().toISOString() });
  res.status(201).json(newAlert);
});

app.patch('/api/alerts/:id', authenticate, authorize('district_officer', 'state_admin', 'super_admin'), (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  const { status, comment } = req.body;
  if (status) {
    alert.status = status;
    alert.updatedAt = new Date().toISOString();
    auditLogs.push({ id: `L${auditLogs.length + 1}`, userId: req.user.id, action: `ALERT_${status.toUpperCase()}`, details: `Updated alert ${alert.id} to ${status}`, ip: req.ip, timestamp: new Date().toISOString() });
  }
  if (comment) {
    alert.comments.push({ by: req.user.id, text: comment, at: new Date().toISOString() });
  }
  res.json(alert);
});

// ─── FLIGHT ROUTES ────────────────────────────────────────────

app.get('/api/flights', authenticate, (req, res) => {
  let result = [...flights];
  if (req.user.role === 'field_inspector') result = result.filter(f => f.inspectorId === req.user.id);
  if (req.user.role === 'district_officer') {
    const districtMines = mines.filter(m => m.district === req.user.district).map(m => m.id);
    result = result.filter(f => districtMines.includes(f.mineId));
  }
  res.json(result);
});

app.post('/api/flights', authenticate, authorize('field_inspector'), (req, res) => {
  const { mineId, droneModel, date, startTime, endTime, altitude, notes } = req.body;
  const newFlight = { id: `F${String(flights.length + 1).padStart(3, '0')}`, mineId, inspectorId: req.user.id, droneModel, date, startTime, endTime, altitude, areaSwept: 0, imagesCollected: 0, status: 'scheduled', path: [], notes, files: [] };
  flights.push(newFlight);
  auditLogs.push({ id: `L${auditLogs.length + 1}`, userId: req.user.id, action: 'FLIGHT_CREATE', details: `Scheduled flight for mine ${mineId}`, ip: req.ip, timestamp: new Date().toISOString() });
  res.status(201).json(newFlight);
});

// ─── FILE UPLOAD ROUTE ────────────────────────────────────────

app.post('/api/upload', authenticate, authorize('field_inspector'), upload.array('files', 10), (req, res) => {
  const fileInfos = req.files.map(f => ({ filename: f.filename, originalName: f.originalname, size: f.size, path: `/uploads/${f.filename}` }));
  auditLogs.push({ id: `L${auditLogs.length + 1}`, userId: req.user.id, action: 'DATA_UPLOAD', details: `Uploaded ${req.files.length} file(s)`, ip: req.ip, timestamp: new Date().toISOString() });
  res.json({ files: fileInfos });
});

// ─── REPORT / STATS ROUTES ───────────────────────────────────

app.get('/api/stats', authenticate, (req, res) => {
  const totalMines = mines.length;
  const activeMines = mines.filter(m => m.status === 'active').length;
  const illegalMines = mines.filter(m => m.status === 'illegal').length;
  const suspendedMines = mines.filter(m => m.status === 'suspended').length;
  const compliantMines = mines.filter(m => m.compliance === 'compliant').length;
  const violatingMines = mines.filter(m => m.compliance === 'violation').length;
  const warningMines = mines.filter(m => m.compliance === 'warning').length;
  const totalRevenue = mines.reduce((s, m) => s + m.revenue, 0);
  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;
  const escalatedAlerts = alerts.filter(a => a.status === 'escalated').length;
  const totalFlights = flights.length;
  const completedFlights = flights.filter(f => f.status === 'completed').length;
  const scheduledFlights = flights.filter(f => f.status === 'scheduled').length;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.active).length;

  const alertsByType = { boundary_violation: alerts.filter(a => a.type === 'boundary_violation').length, over_extraction: alerts.filter(a => a.type === 'over_extraction').length, illegal_mining: alerts.filter(a => a.type === 'illegal_mining').length, unauthorized_equipment: alerts.filter(a => a.type === 'unauthorized_equipment').length };
  const alertsBySeverity = { high: alerts.filter(a => a.severity === 'high').length, medium: alerts.filter(a => a.severity === 'medium').length, low: alerts.filter(a => a.severity === 'low').length };

  const monthlyData = [
    { month: 'Apr', alerts: 8, resolved: 6, revenue: 32000000 },
    { month: 'May', alerts: 12, resolved: 9, revenue: 35000000 },
    { month: 'Jun', alerts: 15, resolved: 11, revenue: 38000000 },
    { month: 'Jul', alerts: 10, resolved: 8, revenue: 41000000 },
    { month: 'Aug', alerts: 18, resolved: 14, revenue: 44000000 },
    { month: 'Sep', alerts: totalAlerts, resolved: resolvedAlerts, revenue: totalRevenue },
  ];

  const districtData = [
    { district: 'Udaipur', mines: 3, alerts: 4, compliance: 67, revenue: 4500000 },
    { district: 'Jodhpur', mines: 1, alerts: 2, compliance: 0, revenue: 2800000 },
    { district: 'Bhilwara', mines: 2, alerts: 1, compliance: 50, revenue: 15000000 },
    { district: 'Jaipur', mines: 1, alerts: 1, compliance: 0, revenue: 3200000 },
    { district: 'Alwar', mines: 1, alerts: 1, compliance: 0, revenue: 0 },
    { district: 'Nagaur', mines: 1, alerts: 0, compliance: 100, revenue: 8500000 },
    { district: 'Barmer', mines: 1, alerts: 0, compliance: 100, revenue: 3100000 },
    { district: 'Others', mines: 5, alerts: 1, compliance: 60, revenue: 6500000 },
  ];

  res.json({ totalMines, activeMines, illegalMines, suspendedMines, compliantMines, violatingMines, warningMines, totalRevenue, totalAlerts, activeAlerts, resolvedAlerts, escalatedAlerts, totalFlights, completedFlights, scheduledFlights, totalUsers, activeUsers, alertsByType, alertsBySeverity, monthlyData, districtData });
});

// ─── AUDIT LOG ROUTES ─────────────────────────────────────────

app.get('/api/audit-logs', authenticate, authorize('super_admin'), (req, res) => {
  let result = [...auditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (req.query.action) result = result.filter(l => l.action === req.query.action);
  if (req.query.userId) result = result.filter(l => l.userId === req.query.userId);
  const enriched = result.map(log => ({ ...log, userName: users.find(u => u.id === log.userId)?.name || 'Unknown' }));
  res.json(enriched);
});

// ─── START SERVER ─────────────────────────────────────────────

export default app;
