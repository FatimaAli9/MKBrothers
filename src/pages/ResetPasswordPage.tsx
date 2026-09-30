import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Eye, EyeOff, Mail, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

type RecoveryState = 'checking' | 'valid' | 'invalid' | 'success';

const passwordChecks = (password: string) => [
  { label: 'At least 8 characters', valid: password.length >= 8 },
  { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
  { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
  { label: 'One number', valid: /\d/.test(password) },
  { label: 'One special character', valid: /[^A-Za-z0-9]/.test(password) },
];

const readUrlParams = () => {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(window.location.search);
  return { hash, query };
};

const getUrlError = (hash: URLSearchParams, query: URLSearchParams) => {
  return hash.get('error_description') || query.get('error_description') || hash.get('error') || query.get('error');
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [recoveryState, setRecoveryState] = useState<RecoveryState>('checking');
  const [linkError, setLinkError] = useState('');

  const checks = useMemo(() => passwordChecks(password), [password]);
  const strongPassword = checks.every(check => check.valid);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!supabase) {
      setLinkError('Supabase is not configured.');
      setRecoveryState('invalid');
      return;
    }

    let cancelled = false;

    const completeRecovery = (sessionEmail?: string | null) => {
      if (cancelled) return;
      const safeEmail = sessionEmail || '';
      setEmail(safeEmail);
      setRequestEmail(safeEmail);
      setRecoveryState('valid');
      window.history.replaceState(null, document.title, '/reset-password');
    };

    const markInvalid = (message?: string) => {
      if (cancelled) return;
      setLinkError(message || 'This password reset link is invalid or has expired.');
      setRecoveryState('invalid');
    };

    const recoverSession = async () => {
      const { hash, query } = readUrlParams();
      const urlError = getUrlError(hash, query);
      if (urlError) {
        markInvalid(urlError.replace(/\+/g, ' '));
        return;
      }

      const code = query.get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session?.user) {
          completeRecovery(data.session.user.email);
          return;
        }
        markInvalid(error?.message);
        return;
      }

      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      const type = hash.get('type');
      if (accessToken && refreshToken && type === 'recovery') {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error && data.session?.user) {
          completeRecovery(data.session.user.email);
          return;
        }
        markInvalid(error?.message);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session?.user) {
        completeRecovery(data.session.user.email);
        return;
      }

      markInvalid();
    };

    void recoverSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session?.user) {
        completeRecovery(session.user.email);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error('Supabase is not configured.', { className: 'toast-luxury' });
      return;
    }
    if (recoveryState !== 'valid') {
      toast.error('Use a valid password reset link before setting a new password.', { className: 'toast-luxury' });
      return;
    }
    if (!strongPassword) {
      toast.error('Password does not meet the strength requirements.', { className: 'toast-luxury' });
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.', { className: 'toast-luxury' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message, { className: 'toast-luxury' });
      return;
    }

    setRecoveryState('success');
    toast.success('Your password has been reset successfully.', { className: 'toast-luxury' });
    await supabase.auth.signOut();
    window.setTimeout(() => navigate('/login', { replace: true }), 1500);
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error('Supabase is not configured.', { className: 'toast-luxury' });
      return;
    }
    if (!requestEmail.trim()) {
      toast.error('Enter your registered email address.', { className: 'toast-luxury' });
      return;
    }
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown}s before requesting another reset email.`, { className: 'toast-luxury' });
      return;
    }

    setResending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(requestEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResending(false);

    if (error) {
      toast.error(error.message, { className: 'toast-luxury' });
      return;
    }

    setResendCooldown(60);
    toast.success('A new password reset email has been sent.', { className: 'toast-luxury' });
  };

  return (
    <div className="pt-[104px] min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="MK Brothers logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-gray-400 text-sm mt-1">Set a secure new password for your account.</p>
        </div>

        <div className="luxury-card rounded-2xl p-8">
          {recoveryState === 'checking' && (
            <div className="flex items-center justify-center py-10">
              <span className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          )}

          {recoveryState === 'success' && (
            <div className="text-center py-8">
              <CheckCircle size={42} className="text-green-400 mx-auto mb-4" />
              <p className="text-white font-semibold">Your password has been reset successfully.</p>
              <p className="text-gray-400 text-sm mt-2">Redirecting to Sign In...</p>
            </div>
          )}

          {recoveryState === 'invalid' && (
            <div>
              <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 mb-5 flex gap-3">
                <AlertCircle size={18} className="text-red-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-200 text-sm font-semibold">Reset link unavailable</p>
                  <p className="text-red-200/70 text-xs mt-1">{linkError || 'This password reset link is invalid or has expired.'}</p>
                </div>
              </div>
              <form onSubmit={handleResend} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Registered Email</label>
                  <input
                    type="email"
                    value={requestEmail}
                    onChange={e => setRequestEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="luxury-input w-full px-4 py-3 rounded-xl text-sm"
                    placeholder="your@email.com"
                  />
                </div>
                <button disabled={resending || resendCooldown > 0} type="submit" className="btn-gold w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {resending ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Mail size={16} /> {resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Send New Reset Email'}</>}
                </button>
              </form>
              <p className="text-center text-gray-500 text-sm mt-5">
                Back to <Link to="/login" className="text-gold hover:underline font-semibold">Sign In</Link>
              </p>
            </div>
          )}

          {recoveryState === 'valid' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Username or Email</label>
                <input
                  type="email"
                  value={email || 'Reset session verified'}
                  readOnly
                  className="luxury-input w-full px-4 py-3 rounded-xl text-sm opacity-80 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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
                <div className="mt-2 space-y-1">
                  {checks.map(check => (
                    <p key={check.label} className={`text-xs ${check.valid ? 'text-green-400' : 'text-gray-500'}`}>
                      {check.valid ? 'OK' : '-'} {check.label}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="luxury-input w-full px-4 py-3 rounded-xl text-sm"
                />
                {confirm && password !== confirm && <p className="text-red-300 text-xs mt-1">Passwords do not match.</p>}
              </div>
              <button disabled={loading || !strongPassword || password !== confirm} type="submit" className="btn-gold w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Save size={16} /> Reset Password</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
