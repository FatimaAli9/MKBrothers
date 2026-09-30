import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, Heart, LogOut, Edit2, Save, X, Phone, Mail } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import ProductImage from '../components/ProductImage';

type Tab = 'profile' | 'orders' | 'wishlist' | 'addresses';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, orders, products } = useStore();
  const [tab, setTab] = useState<Tab>('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  if (!user) return null;

  const userOrders = orders.filter(o => o.userId === user.id);
  const wishlistProducts = products.filter(p => user.wishlist.includes(p.id));

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully', { className: 'toast-luxury' });
    navigate('/');
  };

  const handleSave = async () => {
    const result = await updateProfile(form);
    if (!result.success) {
      toast.error(result.message || 'Unable to update profile.', { className: 'toast-luxury' });
      return;
    }
    setEditing(false);
    toast.success('Profile updated!', { className: 'toast-luxury', icon: '✅' });
  };

  const statusColors: Record<string, string> = {
    pending: 'status-pending',
    confirmed: 'status-shipped',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
  };

  return (
    <div className="pt-[104px] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="luxury-card rounded-2xl p-6 lg:sticky lg:top-28">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-bold text-2xl font-display mx-auto mb-3">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="font-display text-base font-semibold text-white">{user.name}</h2>
                <p className="text-gray-500 text-xs break-all">{user.email}</p>
                {user.isAdmin && <span className="badge-gold mt-1 inline-block">Admin</span>}
              </div>

              {/* Nav */}
              <nav className="space-y-1">
                {[
                  { id: 'profile', label: 'My Profile', icon: <User size={15} /> },
                  { id: 'orders', label: 'Orders', icon: <Package size={15} />, badge: userOrders.length },
                  { id: 'wishlist', label: 'Wishlist', icon: <Heart size={15} />, badge: wishlistProducts.length },
                ] .map(item => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id as Tab)}
                    className={`admin-nav-item w-full text-sm justify-between ${tab === item.id ? 'active' : ''}`}
                  >
                    <div className="flex items-center gap-2">{item.icon} {item.label}</div>
                    {item.badge ? <span className="badge-gold text-[10px]">{item.badge}</span> : null}
                  </button>
                ))}
                {user.isAdmin && (
                  <Link to="/admin" className="admin-nav-item w-full text-sm text-gold">
                    👑 Admin Panel
                  </Link>
                )}
              </nav>

              <div className="gold-divider my-4" />
              <button onClick={handleLogout} className="admin-nav-item w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-900/10">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {tab === 'profile' && (
              <div className="luxury-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold text-white">Personal Information</h2>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="btn-outline-gold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5">
                      <Edit2 size={13} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="btn-gold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5"><Save size={13} /> Save</button>
                      <button onClick={() => setEditing(false)} className="btn-outline-gold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5"><X size={13} /> Cancel</button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                      <User size={11} /> Full Name
                    </label>
                    {editing ? (
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="luxury-input w-full px-4 py-2.5 rounded-lg text-sm" />
                    ) : (
                      <p className="text-white text-sm font-medium">{user.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                      <Mail size={11} /> Email
                    </label>
                    <p className="text-white text-sm font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                      <Phone size={11} /> Phone
                    </label>
                    {editing ? (
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92 300 xxxxxxx" className="luxury-input w-full px-4 py-2.5 rounded-lg text-sm" />
                    ) : (
                      <p className="text-white text-sm font-medium">{user.phone || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Member Since</label>
                    <p className="text-white text-sm font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gold/15">
                  {[
                    { label: 'Total Orders', value: userOrders.length },
                    { label: 'Wishlist Items', value: user.wishlist.length },
                    { label: 'Total Spent', value: `Rs. ${userOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}` },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <p className="font-display text-lg sm:text-xl font-bold gold-text break-words">{stat.value}</p>
                      <p className="text-gray-500 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {tab === 'orders' && (
              <div>
                <h2 className="font-display text-xl font-semibold text-white mb-5">My Orders</h2>
                {userOrders.length === 0 ? (
                  <div className="luxury-card rounded-2xl p-10 text-center">
                    <div className="text-5xl mb-3">📦</div>
                    <p className="font-display text-lg text-white mb-2">No orders yet</p>
                    <Link to="/shop" className="btn-gold px-6 py-2.5 rounded-full text-sm mt-2 inline-block">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(order => (
                      <div key={order.id} className="luxury-card rounded-2xl p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Order ID</p>
                            <p className="text-white font-semibold text-sm">{order.id}</p>
                          </div>
                          <div className="text-right">
                            <span className={`${statusColors[order.status] || 'status-pending'} px-2.5 py-1 rounded-full text-xs font-semibold capitalize`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {order.items.map(item => (
                            <div key={item.product.id} className="flex items-center gap-2 bg-gray-900 rounded-lg p-2">
                              <div className="w-8 h-8 rounded bg-gray-800 overflow-hidden">
                                <ProductImage src={item.product.image} alt={item.product.name} />
                              </div>
                              <div>
                                <p className="text-white text-xs">{item.product.name}</p>
                                <p className="text-gray-500 text-[10px]">{item.size} ×{item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm border-t border-gray-800 pt-3">
                          <span className="text-gray-500">{formatDate(order.createdAt)}</span>
                          <span className="font-display font-bold gold-text">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {tab === 'wishlist' && (
              <div>
                <h2 className="font-display text-xl font-semibold text-white mb-5">My Wishlist</h2>
                {wishlistProducts.length === 0 ? (
                  <div className="luxury-card rounded-2xl p-10 text-center">
                    <div className="text-5xl mb-3">💔</div>
                    <p className="font-display text-lg text-white mb-2">Your wishlist is empty</p>
                    <Link to="/shop" className="btn-gold px-6 py-2.5 rounded-full text-sm mt-2 inline-block">Explore Fragrances</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistProducts.map(product => (
                      <Link to={`/product/${product.id}`} key={product.id} className="luxury-card rounded-xl overflow-hidden group">
                        <div className="product-image-container aspect-square bg-gray-900">
                          <ProductImage src={product.image} alt={product.name} />
                        </div>
                        <div className="p-3">
                          <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold transition-colors">{product.name}</h3>
                          <p className="font-display text-base font-bold gold-text mt-1">{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
