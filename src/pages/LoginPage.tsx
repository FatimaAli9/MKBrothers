import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, resetPassword } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);

  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = window.setTimeout(() => setResetCooldown(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resetCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (forgotMode) {
      if (!trimmedEmail) {
        toast.error('Please enter your email address.', { className: 'toast-luxury' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        toast.error('Please enter a valid email address.', { className: 'toast-luxury' });
        return;
      }
      setLoading(true);
      if (resetCooldown > 0) {
        setLoading(false);
        toast.error(`Please wait ${resetCooldown}s before requesting another reset email.`, { className: 'toast-luxury' });
        return;
      }
      const result = await resetPassword(trimmedEmail);
      setLoading(false);
      if (result.success) {
        setResetCooldown(60);
        toast.success('Password reset email sent. Check your inbox and spam folder.', { className: 'toast-luxury' });
      } else {
        toast.error(result.message || 'Unable to send reset email.', { className: 'toast-luxury' });
      }
      return;
    }

    if (!trimmedEmail || !password.trim()) {
      toast.error('Email and password are required.', { className: 'toast-luxury' });
      return;
    }

    setLoading(true);
    const result = await login(trimmedEmail, password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back!', { className: 'toast-luxury' });
      navigate('/');
    } else {
      toast.error(result.message || 'Invalid email or password', { className: 'toast-luxury' });
    }
  };

  return (
    <div className="pt-[104px] min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="MK Brothers logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-white">{forgotMode ? 'Reset Password' : 'Welcome Back'}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {forgotMode ? 'Enter your email to receive a reset link' : 'Sign in to your account'}
          </p>
        </div>

        <div className="luxury-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="luxury-input w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>
            {!forgotMode && (
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
            )}
            <div className="flex items-center justify-between text-xs">
              {!forgotMode && (
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5" />
                  Remember me
                </label>
              )}
              <button type="button" onClick={() => setForgotMode(value => !value)} className="text-gold hover:underline ml-auto">
                {forgotMode ? 'Back to sign in' : 'Forgot password?'}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <><LogIn size={16} /> {forgotMode && resetCooldown > 0 ? `Wait ${resetCooldown}s` : forgotMode ? 'Send Reset Link' : 'Sign In'}</>
              )}
            </button>
          </form>

          {!forgotMode && (
            <p className="text-center text-gray-500 text-sm mt-5">
              Don't have an account?{' '}
              <Link to="/signup" className="text-gold hover:underline font-semibold">Create Account</Link>
            </p>
          )}
          {!forgotMode && (
            <p className="text-center text-gray-500 text-sm mt-3">
              Staff access?{' '}
              <Link to="/admin/login" className="text-gold hover:underline font-semibold">Admin Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
