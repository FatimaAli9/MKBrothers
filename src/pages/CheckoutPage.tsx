import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Package, MapPin, Phone, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import ProductImage from '../components/ProductImage';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, user, placeOrder } = useStore();
  const total = cartTotal();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'Pakistan',
    notes: '',
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const shipping = total >= 5000 ? 0 : 250;
  const grandTotal = total + shipping;

  if (cart.length === 0) {
    return (
      <div className="pt-[104px] min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="font-display text-2xl text-white mb-2">Your cart is empty</h2>
        <Link to="/shop" className="btn-gold mt-4 px-6 py-2.5 rounded-full text-sm">Continue Shopping</Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-[104px] min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="font-display text-2xl text-white mb-2">Please sign in to checkout</h2>
        <Link to="/login" className="btn-gold mt-4 px-6 py-2.5 rounded-full text-sm">Sign In</Link>
      </div>
    );
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zipCode: form.zipCode.trim(),
      country: form.country.trim(),
    };

    if (!normalized.name || !normalized.email || !normalized.phone || !normalized.street || !normalized.city || !normalized.zipCode) {
      toast.error('Please fill all required fields', { className: 'toast-luxury' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
      toast.error('Please enter a valid email address.', { className: 'toast-luxury' });
      return;
    }
    if (!/^[+()\d\s-]{7,20}$/.test(normalized.phone)) {
      toast.error('Please enter a valid phone number.', { className: 'toast-luxury' });
      return;
    }
    setForm(prev => ({ ...prev, ...normalized }));
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const result = await placeOrder({
      address: { street: form.street.trim(), city: form.city.trim(), state: form.state.trim(), zipCode: form.zipCode.trim(), country: form.country },
      phone: form.phone.trim(),
      fullName: form.name.trim(),
      email: form.email.trim(),
      subtotal: total,
      shippingCost: shipping,
      total: grandTotal,
    });
    setLoading(false);
    if (result.success && result.order) {
      if (result.message) toast.error(result.message, { className: 'toast-luxury' });
      navigate(`/order-confirmation/${result.order.id}`);
    } else {
      toast.error(result.message || 'Failed to place order. Please try again.', { className: 'toast-luxury' });
    }
  };

  return (
    <div className="pt-[104px] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Link to="/" className="hover:text-gold">Home</Link>
            <ChevronRight size={12} />
            <Link to="/cart" className="hover:text-gold">Cart</Link>
            <ChevronRight size={12} />
            <span className="text-gray-300">Checkout</span>
          </nav>
          <h1 className="font-display text-3xl font-bold text-white">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { num: 1, label: 'Shipping Details' },
            { num: 2, label: 'Review & Confirm' },
          ].map(s => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                step >= s.num ? 'bg-gold border-gold text-black' : 'border-gray-700 text-gray-600'
              }`}>
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className={`text-sm font-medium ${step >= s.num ? 'text-white' : 'text-gray-600'}`}>{s.label}</span>
              {s.num < 2 && <ChevronRight size={14} className="text-gray-700 ml-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              <form onSubmit={handleStep1} className="luxury-card rounded-2xl p-6 space-y-5">
                <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
                  <MapPin size={18} className="text-gold" /> Shipping Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Full Name *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your full name" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Email *</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="your@email.com" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Phone Number *</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="+92 3xx xxxxxxx" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Street Address *</label>
                  <input value={form.street} onChange={e => set('street', e.target.value)} required placeholder="House no, Street, Area" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">City *</label>
                    <input value={form.city} onChange={e => set('city', e.target.value)} required placeholder="City" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">State / Province</label>
                    <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="Province" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Zip / Postal *</label>
                    <input value={form.zipCode} onChange={e => set('zipCode', e.target.value)} required placeholder="75000" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Country</label>
                  <select value={form.country} onChange={e => set('country', e.target.value)} className="luxury-select w-full px-4 py-3 rounded-xl text-sm">
                    <option>Pakistan</option>
                    <option>UAE</option>
                    <option>Saudi Arabia</option>
                    <option>UK</option>
                    <option>USA</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Order Notes <span className="text-gray-600 normal-case">(optional)</span></label>
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Special instructions for delivery..." rows={3} className="luxury-input w-full px-4 py-3 rounded-xl text-sm resize-none" />
                </div>
                <button type="submit" className="btn-gold w-full py-4 rounded-xl text-sm font-semibold">
                  Continue to Review →
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Address review */}
                <div className="luxury-card rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display text-base font-semibold text-white flex items-center gap-2"><MapPin size={16} className="text-gold" /> Delivery Address</h2>
                    <button onClick={() => setStep(1)} className="text-gold text-xs hover:underline">Edit</button>
                  </div>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p className="font-semibold text-white">{form.name}</p>
                    <p>{form.street}, {form.city}</p>
                    {form.state && <p>{form.state}, {form.zipCode}</p>}
                    <p>{form.country}</p>
                    <p className="flex items-center gap-1 text-gray-400"><Phone size={12} /> {form.phone}</p>
                  </div>
                </div>

                {/* Payment method */}
                <div className="luxury-card rounded-2xl p-5">
                  <h2 className="font-display text-base font-semibold text-white mb-3 flex items-center gap-2">
                    <Package size={16} className="text-gold" /> Payment Method
                  </h2>
                  <div className="flex items-center gap-3 p-4 border border-gold rounded-xl bg-gold/5">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-lg">💵</div>
                    <div>
                      <p className="text-white font-semibold text-sm">Cash on Delivery</p>
                      <p className="text-gray-400 text-xs">Pay when your order arrives</p>
                    </div>
                    <div className="ml-auto"><Check size={18} className="text-gold" /></div>
                  </div>
                </div>

                {/* Items review */}
                <div className="luxury-card rounded-2xl p-5">
                  <h2 className="font-display text-base font-semibold text-white mb-4">Order Items</h2>
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-gray-800 overflow-hidden">
                          <ProductImage src={item.product.image} alt={item.product.name} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold">{item.product.name}</p>
                          <p className="text-gray-500 text-xs">{item.size} × {item.quantity}</p>
                        </div>
                        <p className="text-gold font-semibold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-gold w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    '✓ Place Order – Cash on Delivery'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="luxury-card rounded-2xl p-5 sticky top-28">
              <h2 className="font-display text-base font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-gray-400 truncate pr-2">{item.product.name} ({item.size}) ×{item.quantity}</span>
                    <span className="text-white flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="gold-divider mb-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment</span>
                  <span className="text-gold text-xs">💵 Cash on Delivery</span>
                </div>
              </div>
              <div className="gold-divider my-3" />
              <div className="flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="font-display text-xl font-bold gold-text">{formatPrice(grandTotal)}</span>
              </div>
              {total < 5000 && (
                <p className="text-gray-500 text-xs mt-2">
                  Add {formatPrice(5000 - total)} more for free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
