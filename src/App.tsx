import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import MineList from './pages/MineList';
import MineDetail from './pages/MineDetail';
import Alerts from './pages/Alerts';
import FlightUpload from './pages/FlightUpload';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-surface-950"><div className="animate-pulse-slow text-brand-400 text-xl">Loading...</div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="map" element={<MapView />} />
        <Route path="mines" element={<MineList />} />
        <Route path="mines/:id" element={<MineDetail />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="flights" element={<ProtectedRoute roles={['super_admin', 'state_admin', 'district_officer', 'field_inspector']}><FlightUpload /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute roles={['super_admin', 'state_admin', 'district_officer']}><Reports /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute roles={['super_admin']}><AdminPanel /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
