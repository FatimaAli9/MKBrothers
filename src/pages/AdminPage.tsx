import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Plus, Edit2, Trash2,
  X, Check, TrendingUp, DollarSign, Save, BarChart3, Upload, Image as ImageIcon
} from 'lucide-react';
import { useStore, Product, CATEGORIES } from '../store/useStore';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import ProductImage from '../components/ProductImage';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'categories';

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '', brand: 'MK Brothers', price: 0, category: 'men',
  image: '', images: [],
  description: '', notes: { top: [], heart: [], base: [] },
  sizes: ['50ml', '100ml'], rating: 0, reviewCount: 0,
  inStock: true, featured: false, isNew: false, isBestseller: false,
  volume: '100ml', concentration: 'Eau de Parfum', reviews: [],
};

const IMAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'product-images';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, products, orders, users, addProduct, updateProduct, deleteProduct, updateOrderStatus, fetchOrders, deleteOrder } = useStore();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [productModal, setProductModal] = useState<{ open: boolean; editing?: Product; data: Omit<Product, 'id'> }>({
    open: false, data: { ...EMPTY_PRODUCT }
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [orderDeleteConfirm, setOrderDeleteConfirm] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) void fetchOrders();
  }, [fetchOrders, user?.isAdmin]);

  if (!user?.isAdmin) {
    return (
      <div className="pt-[104px] min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="font-display text-2xl text-white mb-2">Access Denied</h2>
        <p className="text-gray-400 text-sm mb-4">You must be an admin to view this page.</p>
        <button onClick={() => navigate('/')} className="btn-gold px-6 py-2.5 rounded-full text-sm">Go Home</button>
      </div>
    );
  }

  // Dashboard stats
  const totalRevenue = orders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.total : 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const totalUsers = users.filter(u => !u.isAdmin).length;

  const openAddModal = () => setProductModal({ open: true, data: { ...EMPTY_PRODUCT } });
  const openEditModal = (p: Product) => setProductModal({ open: true, editing: p, data: { ...p } });

  const closeModal = () => setProductModal({ open: false, data: { ...EMPTY_PRODUCT } });
  const handleSaveProduct = async () => {
    const sanitizedName = productModal.data.name.trim();
    const sanitizedDescription = productModal.data.description.trim();
    const sanitizedSizes = productModal.data.sizes.map(size => size.trim()).filter(Boolean);

    if (!sanitizedName || !productModal.data.price || Number(productModal.data.price) <= 0) {
      toast.error('Please provide a valid product name and price.', { className: 'toast-luxury' });
      return;
    }
    if (sanitizedSizes.length === 0) {
      toast.error('Please add at least one valid volume/size option.', { className: 'toast-luxury' });
      return;
    }
    if (productModal.data.images.length === 0) {
      toast.error('Please upload at least one product image', { className: 'toast-luxury' });
      return;
    }
    if (!sanitizedDescription) {
      toast.error('Please add a product description.', { className: 'toast-luxury' });
      return;
    }
    const payload = {
      ...productModal.data,
      name: sanitizedName,
      description: sanitizedDescription,
      sizes: sanitizedSizes,
      image: productModal.data.image || productModal.data.images[0],
    };
    const result = productModal.editing
      ? await updateProduct(productModal.editing.id, payload)
      : await addProduct(payload);
    if (!result.success) {
      toast.error(result.message || 'Unable to save product', { className: 'toast-luxury' });
      return;
    }
    toast.success(productModal.editing ? 'Product updated!' : 'Product added!', { className: 'toast-luxury' });
    closeModal();
  };

  const handleDelete = async (id: string) => {
    const result = await deleteProduct(id);
    if (!result.success) {
      toast.error(result.message || 'Unable to delete product', { className: 'toast-luxury' });
      return;
    }
    setDeleteConfirm(null);
    toast.success('Product deleted', { className: 'toast-luxury' });
  };
  const handleDeleteOrder = async (id: string) => {
    const result = await deleteOrder(id);
    if (result.success) {
      toast.success('Order deleted', { className: 'toast-luxury' });
      setOrderDeleteConfirm(null);
    } else {
      toast.error(result.message || 'Unable to delete order', { className: 'toast-luxury' });
    }
  };

  const setField = (key: string, val: any) =>
    setProductModal(m => ({ ...m, data: { ...m.data, [key]: val } }));

  const setImages = (images: string[]) => {
    setProductModal(m => ({
      ...m,
      data: {
        ...m.data,
        images,
        image: images[0] || '',
      },
    }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    if (!supabase) {
      toast.error('Supabase is not configured.', { className: 'toast-luxury' });
      return;
    }

    const selected = Array.from(files);
    const invalid = selected.find(file => !ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE);
    if (invalid) {
      toast.error('Images must be JPG, JPEG, PNG, or WEBP and 5MB or smaller.', { className: 'toast-luxury' });
      return;
    }

    setImageUploading(true);
    const uploaded: string[] = [];
    for (const file of selected) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `products/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) {
        setImageUploading(false);
        toast.error(error.message, { className: 'toast-luxury' });
        return;
      }
      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);
      uploaded.push(data.publicUrl);
    }

    setImages([...productModal.data.images, ...uploaded]);
    setImageUploading(false);
    toast.success('Image upload complete', { className: 'toast-luxury' });
  };

  const removeImage = (url: string) => {
    setImages(productModal.data.images.filter(image => image !== url));
  };

  const makePrimaryImage = (url: string) => {
    const images = [url, ...productModal.data.images.filter(image => image !== url)];
    setImages(images);
  };

  const statusColors: Record<string, string> = {
    pending: 'status-pending',
    confirmed: 'status-shipped',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
  };

  return (
    <div className="pt-[104px] min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 bg-[#0d0d0d] border-r border-gold/10 min-h-screen fixed top-[104px] pt-4 flex flex-col">
          <div className="px-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="badge-gold">Admin</span>
              <span className="text-white text-xs font-semibold truncate">{user.name}</span>
            </div>
          </div>
          <nav className="px-3 space-y-1 flex-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
              { id: 'products', label: 'Products', icon: <Package size={16} />, badge: products.length },
              { id: 'orders', label: 'Orders', icon: <ShoppingCart size={16} />, badge: orders.length },
              { id: 'users', label: 'Users', icon: <Users size={16} />, badge: totalUsers },
              { id: 'categories', label: 'Categories', icon: <Tag size={16} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as AdminTab)}
                className={`admin-nav-item w-full text-sm justify-between ${tab === item.id ? 'active' : ''}`}
              >
                <div className="flex items-center gap-2">{item.icon} {item.label}</div>
                {item.badge !== undefined && <span className="badge-gold text-[9px]">{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="px-3 pb-4">
            <button onClick={() => navigate('/')} className="admin-nav-item w-full text-sm text-gray-500">
              ← Back to Store
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-60 p-6 min-h-screen">

          {/* ── Dashboard ─────────────────────────────────────────────── */}
          {tab === 'dashboard' && (
            <div>
              <h1 className="font-display text-2xl font-bold text-white mb-6">Dashboard Overview</h1>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: <DollarSign size={20} className="text-gold" />, change: '+12%' },
                  { label: 'Total Orders', value: orders.length, icon: <ShoppingCart size={20} className="text-gold" />, change: '+5%' },
                  { label: 'Pending Orders', value: pendingOrders, icon: <TrendingUp size={20} className="text-gold" />, change: pendingOrders > 0 ? 'Needs action' : 'All clear' },
                  { label: 'Customers', value: totalUsers, icon: <Users size={20} className="text-gold" />, change: '+3 this week' },
                ].map((stat, i) => (
                  <div key={i} className="luxury-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-500 text-xs">{stat.label}</p>
                      <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">{stat.icon}</div>
                    </div>
                    <p className="font-display text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-green-400 text-xs mt-1">{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="luxury-card rounded-xl p-4">
                  <h2 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <ShoppingCart size={16} className="text-gold" /> Recent Orders
                  </h2>
                  <div className="space-y-3">
                    {orders.slice(-5).reverse().map(order => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                        <div>
                          <p className="text-white text-xs font-semibold">{order.userName}</p>
                          <p className="text-gray-500 text-[10px]">{order.id} · {order.items.length} items</p>
                        </div>
                        <div className="text-right">
                          <span className={`${statusColors[order.status]} px-2 py-0.5 rounded text-[10px] font-semibold capitalize`}>
                            {order.status}
                          </span>
                          <p className="text-gold text-xs mt-0.5">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category breakdown */}
                <div className="luxury-card rounded-xl p-4">
                  <h2 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 size={16} className="text-gold" /> Products by Category
                  </h2>
                  <div className="space-y-3">
                    {CATEGORIES.map(cat => {
                      const count = products.filter(p => p.category === cat.id).length;
                      const pct = Math.round((count / products.length) * 100) || 0;
                      return (
                        <div key={cat.id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">{cat.icon} {cat.label}</span>
                            <span className="text-gold">{count} products ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Products ──────────────────────────────────────────────── */}
          {tab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold text-white">Manage Products</h1>
                <button onClick={openAddModal} className="btn-gold px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Plus size={16} /> Add Product
                </button>
              </div>
              <div className="luxury-card rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">Product</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">Category</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">Price</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">Stock</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">Featured</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden">
                              <ProductImage src={product.image} alt={product.name} />
                            </div>
                            <div>
                              <p className="text-white font-semibold">{product.name}</p>
                              <p className="text-gray-500 text-xs">{product.concentration}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 capitalize text-gray-400">{product.category}</td>
                        <td className="p-4 text-gold font-semibold">{formatPrice(product.price)}</td>
                        <td className="p-4">
                          <span className={product.inStock ? 'status-delivered px-2 py-0.5 rounded text-xs' : 'status-cancelled px-2 py-0.5 rounded text-xs'}>
                            {product.inStock ? 'In Stock' : 'Out'}
                          </span>
                        </td>
                        <td className="p-4">
                          {product.featured ? <Check size={14} className="text-gold" /> : <X size={14} className="text-gray-700" />}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(product)} className="p-1.5 rounded-lg hover:bg-gold/10 text-gray-400 hover:text-gold transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => setDeleteConfirm(product.id)} className="p-1.5 rounded-lg hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Orders ────────────────────────────────────────────────── */}
          {tab === 'orders' && (
            <div>
              <h1 className="font-display text-2xl font-bold text-white mb-6">Manage Orders</h1>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="luxury-card rounded-xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-semibold text-sm">{order.userName}</p>
                          <span className="badge-gold text-[10px]">{order.id}</span>
                        </div>
                        <p className="text-gray-500 text-xs">{order.userEmail} · {order.phone}</p>
                        <p className="text-gray-600 text-xs">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold gold-text">{formatPrice(order.total)}</span>
                        <select
                          value={order.status}
                          onChange={e => {
                            void updateOrderStatus(order.id, e.target.value as any);
                            toast.success('Order status updated', { className: 'toast-luxury' });
                          }}
                          className={`${statusColors[order.status]} px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer border-0 outline-none`}
                          style={{ background: 'transparent' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {['cancelled', 'delivered'].includes(order.status) && (
                          <button
                            onClick={() => setOrderDeleteConfirm(order.id)}
                            className="p-2 rounded-lg hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors"
                            aria-label="Delete order"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
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
                    <p className="text-gray-600 text-xs">
                      📍 {order.address.street}, {order.address.city}, {order.address.country}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Users ─────────────────────────────────────────────────── */}
          {tab === 'users' && (
            <div>
              <h1 className="font-display text-2xl font-bold text-white mb-6">Manage Users</h1>
              <div className="luxury-card rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">User</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">Email</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">Phone</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">Role</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">Joined</th>
                      <th className="text-left text-gray-500 text-xs uppercase tracking-wider p-4">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const uOrders = orders.filter(o => o.userId === u.id).length;
                      return (
                        <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-bold text-xs">
                                {u.name.charAt(0)}
                              </div>
                              <span className="text-white font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-400">{u.email}</td>
                          <td className="p-4 text-gray-400">{(u as any).phone || '—'}</td>
                          <td className="p-4">
                            <span className={u.isAdmin ? 'badge-gold' : 'text-gray-400 text-xs'}>
                              {u.isAdmin ? 'Admin' : 'Customer'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                          <td className="p-4 text-gold font-semibold">{uOrders}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Categories ────────────────────────────────────────────── */}
          {tab === 'categories' && (
            <div>
              <h1 className="font-display text-2xl font-bold text-white mb-6">Product Categories</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map(cat => {
                  const count = products.filter(p => p.category === cat.id).length;
                  return (
                    <div key={cat.id} className="luxury-card rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{cat.icon}</span>
                        <div>
                          <h3 className="font-display text-base font-semibold text-white">{cat.label}</h3>
                          <p className="text-gray-500 text-xs">{cat.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{count} products</span>
                        <span className="badge-gold">{cat.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {productModal.open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-[#111] border border-gold/20 rounded-2xl p-6 w-full max-w-2xl z-10 my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-white">
                {productModal.editing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gold"><X size={20} /></button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Product Name *</label>
                  <input value={productModal.data.name} onChange={e => setField('name', e.target.value)} className="luxury-input w-full px-3 py-2.5 rounded-lg text-sm" placeholder="Fragrance name" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Price (Rs.) *</label>
                  <input type="number" value={productModal.data.price} onChange={e => setField('price', +e.target.value)} className="luxury-input w-full px-3 py-2.5 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Original Price (Rs.)</label>
                  <input type="number" value={productModal.data.originalPrice || ''} onChange={e => setField('originalPrice', e.target.value ? +e.target.value : undefined)} className="luxury-input w-full px-3 py-2.5 rounded-lg text-sm" placeholder="Optional" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Category *</label>
                  <select value={productModal.data.category} onChange={e => setField('category', e.target.value)} className="luxury-select w-full px-3 py-2.5 rounded-lg text-sm">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Concentration</label>
                  <select value={productModal.data.concentration} onChange={e => setField('concentration', e.target.value)} className="luxury-select w-full px-3 py-2.5 rounded-lg text-sm">
                    <option>Eau de Toilette</option>
                    <option>Eau de Parfum</option>
                    <option>Parfum</option>
                    <option>Extrait de Parfum</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Volume</label>
                  <input value={productModal.data.volume} onChange={e => setField('volume', e.target.value)} className="luxury-input w-full px-3 py-2.5 rounded-lg text-sm" placeholder="100ml" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Product Images *</label>
                <label className="border border-dashed border-gold/30 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gold/60 hover:bg-gold/5 transition-colors">
                  <Upload size={22} className="text-gold" />
                  <span className="text-white text-sm font-semibold">{imageUploading ? 'Uploading...' : 'Upload Image'}</span>
                  <span className="text-gray-500 text-xs text-center">Select one or multiple JPG, JPEG, PNG, or WEBP files. Max 5MB each.</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    multiple
                    disabled={imageUploading}
                    onChange={e => {
                      void handleImageUpload(e.target.files);
                      e.currentTarget.value = '';
                    }}
                    className="hidden"
                  />
                </label>
                {productModal.data.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {productModal.data.images.map((image, index) => (
                      <div key={image} className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900">
                        <img src={image} alt={`${productModal.data.name || 'Product'} ${index + 1}`} className="w-full aspect-square object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 p-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => makePrimaryImage(image)}
                            className={`flex-1 text-[10px] rounded-md py-1 ${index === 0 ? 'bg-gold text-black font-semibold' : 'bg-gray-800 text-gray-300 hover:text-gold'}`}
                          >
                            {index === 0 ? 'Primary' : 'Make Primary'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(image)}
                            className="w-7 h-7 rounded-md bg-red-900/60 text-red-200 flex items-center justify-center hover:bg-red-900"
                            aria-label="Remove image"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-gray-800 bg-gray-900/70 p-4 flex items-center gap-3 text-gray-500 text-sm">
                    <ImageIcon size={18} />
                    No product images uploaded yet.
                  </div>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea value={productModal.data.description} onChange={e => setField('description', e.target.value)} rows={3} className="luxury-input w-full px-3 py-2.5 rounded-lg text-sm resize-none" placeholder="Product description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Top Notes (comma-separated)</label>
                  <input
                    value={productModal.data.notes.top.join(', ')}
                    onChange={e => setField('notes', { ...productModal.data.notes, top: e.target.value.split(',').map(n => n.trim()).filter(Boolean) })}
                    className="luxury-input w-full px-3 py-2.5 rounded-lg text-sm"
                    placeholder="Bergamot, Pepper"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Heart Notes</label>
                  <input
                    value={productModal.data.notes.heart.join(', ')}
                    onChange={e => setField('notes', { ...productModal.data.notes, heart: e.target.value.split(',').map(n => n.trim()).filter(Boolean) })}
                    className="luxury-input w-full px-3 py-2.5 rounded-lg text-sm"
                    placeholder="Rose, Oud"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Base Notes</label>
                <input
                  value={productModal.data.notes.base.join(', ')}
                  onChange={e => setField('notes', { ...productModal.data.notes, base: e.target.value.split(',').map(n => n.trim()).filter(Boolean) })}
                  className="luxury-input w-full px-3 py-2.5 rounded-lg text-sm"
                  placeholder="Amber, Musk"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'inStock', label: 'In Stock' },
                  { key: 'featured', label: 'Featured' },
                  { key: 'isNew', label: 'New Arrival' },
                  { key: 'isBestseller', label: 'Bestseller' },
                ].map(toggle => (
                  <label key={toggle.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productModal.data[toggle.key as keyof typeof productModal.data] as boolean}
                      onChange={e => setField(toggle.key, e.target.checked)}
                    />
                    <span className="text-gray-300 text-sm">{toggle.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-800">
              <button disabled={imageUploading} onClick={() => void handleSaveProduct()} className="btn-gold flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                <Save size={16} /> {productModal.editing ? 'Update Product' : 'Add Product'}
              </button>
              <button onClick={closeModal} className="btn-outline-gold px-6 py-3 rounded-xl text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-[#111] border border-red-900/50 rounded-2xl p-6 w-full max-w-sm z-10 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Delete Product?</h3>
            <p className="text-gray-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => void handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-900/50 text-red-300 border border-red-800 text-sm font-semibold hover:bg-red-900 transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl btn-outline-gold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {orderDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOrderDeleteConfirm(null)} />
          <div className="relative bg-[#111] border border-red-900/50 rounded-2xl p-6 w-full max-w-sm z-10 text-center">
            <div className="text-4xl mb-3">Delete</div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Delete Order?</h3>
            <p className="text-gray-400 text-sm mb-5">This will permanently remove the order from the dashboard and database.</p>
            <div className="flex gap-3">
              <button onClick={() => void handleDeleteOrder(orderDeleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-900/50 text-red-300 border border-red-800 text-sm font-semibold hover:bg-red-900 transition-colors">Delete</button>
              <button onClick={() => setOrderDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl btn-outline-gold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

