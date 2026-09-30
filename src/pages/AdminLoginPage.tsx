import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminLogin = useStore(state => state.adminLogin);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const destination = typeof location.state?.from === 'string' ? location.state.from : '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await adminLogin(username, password);
    setLoading(false);

    if (!result.success) {
      toast.error(result.message || 'Invalid admin credentials', { className: 'toast-luxury' });
      return;
    }

    toast.success('Admin signed in', { className: 'toast-luxury' });
    navigate(destination, { replace: true });
  };

  return (
    <div className="pt-[104px] min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-bold text-xl font-display mx-auto mb-4">
            <Shield size={26} />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Admin Sign In</h1>
          <p className="text-gray-400 text-sm mt-1">Restricted dashboard access</p>
        </div>

        <div className="luxury-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="luxury-input w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="luxury-input w-full px-4 py-3 rounded-xl text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
