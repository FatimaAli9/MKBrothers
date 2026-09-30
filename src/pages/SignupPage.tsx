import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useStore(state => state.signup);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name || !email) {
      toast.error('Please enter your full name and email address.', { className: 'toast-luxury' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.', { className: 'toast-luxury' });
      return;
    }
    if (phone && !/^[+()\d\s-]{7,20}$/.test(phone)) {
      toast.error('Please enter a valid phone number.', { className: 'toast-luxury' });
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match', { className: 'toast-luxury' });
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters', { className: 'toast-luxury' });
      return;
    }
    if (!agreed) {
      toast.error('Please accept the privacy policy', { className: 'toast-luxury' });
      return;
    }

    setLoading(true);
    const result = await signup(name, email, form.password, phone);
    setLoading(false);

    if (result.success) {
      toast.success('Account created! Welcome to MK Brothers!', { className: 'toast-luxury' });
      navigate('/');
    } else {
      toast.error(result.message || 'Unable to create account.', { className: 'toast-luxury' });
    }
  };

  return (
    <div className="pt-[104px] min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-bold text-xl font-display mx-auto mb-4">MK</div>
          <h1 className="font-display text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join the MK Brothers community</p>
        </div>

        <div className="luxury-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Full Name</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" required autoComplete="name" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" required autoComplete="email" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Phone Number <span className="text-gray-600 normal-case">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92 3xx xxxxxxx" autoComplete="tel" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  autoComplete="new-password"
                  className="luxury-input w-full px-4 py-3 rounded-xl text-sm pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors" aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} required autoComplete="new-password" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-gray-400 text-xs leading-relaxed">
                I agree to the <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
              </span>
            </label>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:underline font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
