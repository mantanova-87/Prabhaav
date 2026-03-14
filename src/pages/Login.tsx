import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Radio, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';

const demoCredentials = [
  { role: 'Super Admin', email: 'superadmin@prabhaav.gov.in', password: 'admin123', color: 'from-purple-500 to-pink-500' },
  { role: 'State Admin', email: 'state@prabhaav.gov.in', password: 'state123', color: 'from-blue-500 to-cyan-500' },
  { role: 'District Officer', email: 'dmo@prabhaav.gov.in', password: 'dmo123', color: 'from-emerald-500 to-teal-500' },
  { role: 'Field Inspector', email: 'inspector@prabhaav.gov.in', password: 'field123', color: 'from-orange-500 to-amber-500' },
  { role: 'Viewer', email: 'viewer@prabhaav.gov.in', password: 'viewer123', color: 'from-gray-500 to-slate-500' },
];

export default function Login() {
  const { login, error, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await login(email, password); } catch {}
  };

  const quickLogin = (cred: typeof demoCredentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-brand-950 to-surface-950" />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(51, 141, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)',
      }} />
      
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
        <div className="max-w-lg animate-fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-glow-lg">
              <Radio className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-brand-300 to-accent-300 bg-clip-text text-transparent">
                PRABHAAV
              </h1>
              <p className="text-sm text-surface-400 tracking-[0.3em] uppercase">Mining Surveillance</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-surface-100 mb-4 leading-tight">
            Drone-Based Illegal Mining Detection & Enforcement Platform
          </h2>
          <p className="text-surface-400 text-lg leading-relaxed mb-8">
            Centralized data platform integrating drone imagery, AI analytics, and government databases 
            for transparent mining oversight across all districts.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: '🛰️', text: 'Real-time drone surveillance & geospatial visualization' },
              { icon: '🤖', text: 'AI-powered violation detection & volumetric analysis' },
              { icon: '📊', text: 'Automated compliance reporting & revenue tracking' },
              { icon: '🔒', text: 'Multi-level RBAC with role-specific dashboards' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-surface-300">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-brand-300 to-accent-300 bg-clip-text text-transparent">
              PRABHAAV
            </h1>
          </div>

          <div className="glass-card p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-surface-100">Welcome back</h2>
              <p className="text-surface-400 mt-1">Sign in to access the surveillance platform</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-danger-600/10 border border-danger-600/30 rounded-xl text-danger-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Email Address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@prabhaav.gov.in" className="input-field" required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" className="input-field pr-12" required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={enable2FA} onChange={() => setEnable2FA(!enable2FA)}
                    className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500/20" />
                  <span className="text-sm text-surface-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Enable 2FA
                  </span>
                </label>
                <a href="#" className="text-sm text-brand-400 hover:text-brand-300">Forgot password?</a>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>

          {/* Quick Login Cards */}
          <div className="mt-6">
            <p className="text-xs text-surface-500 text-center mb-3 uppercase tracking-wider">Demo Accounts — Click to autofill</p>
            <div className="grid grid-cols-2 gap-2">
              {demoCredentials.map((cred) => (
                <button key={cred.role} onClick={() => quickLogin(cred)}
                  className="p-3 glass-card hover:border-brand-500/30 transition-all text-left group">
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${cred.color} flex items-center justify-center text-white text-xs font-bold mb-1`}>
                    {cred.role.charAt(0)}
                  </div>
                  <p className="text-xs font-medium text-surface-200 group-hover:text-brand-300 transition-colors">{cred.role}</p>
                  <p className="text-[10px] text-surface-500 truncate">{cred.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
