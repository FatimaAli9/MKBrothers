import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: 'men' | 'women' | 'luxury' | 'oud' | 'unisex';
  image: string;
  images: string[];
  description: string;
  notes: { top: string[]; heart: string[]; base: string[] };
  sizes: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  volume: string;
  concentration: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address;
  role: 'user' | 'admin';
  isAdmin: boolean;
  wishlist: string[];
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod';
  address: Address;
  createdAt: string;
  updatedAt: string;
  phone: string;
  shippingCost: number;
  subtotal: number;
  emailSent?: boolean;
}

export const CATEGORIES = [
  { id: 'men', label: "Men's", icon: '🌑', description: 'Bold & Masculine' },
  { id: 'women', label: "Women's", icon: '🌸', description: 'Elegant & Feminine' },
  { id: 'luxury', label: 'Luxury', icon: '💎', description: 'Exclusive Collection' },
  { id: 'oud', label: 'Oud', icon: '🌿', description: 'Oriental Treasures' },
  { id: 'unisex', label: 'Unisex', icon: '✨', description: 'For Everyone' },
];

// ─── Store Interface ───────────────────────────────────────────────────────────

interface StoreState {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // User
  user: User | null;
  users: User[];
  authReady: boolean;
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Pick<Partial<User>, 'name' | 'phone' | 'address' | 'wishlist'>) => Promise<{ success: boolean; message?: string }>;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders
  orders: Order[];
  fetchOrders: () => Promise<void>;
  placeOrder: (details: {
    address: Address;
    phone: string;
    fullName: string;
    email: string;
    shippingCost: number;
    subtotal: number;
    total: number;
  }) => Promise<{ success: boolean; order?: Order; message?: string }>;
  cancelOrder: (orderId: string) => Promise<{ success: boolean; message?: string }>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<{ success: boolean; message?: string }>;
  getUserOrders: () => Order[];

  // Products
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<{ success: boolean; message?: string }>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<{ success: boolean; message?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; message?: string }>;

  // Reviews
  addReview: (productId: string, rating: number, comment: string) => void;

  // UI
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

// ─── Default Admin + Users ────────────────────────────────────────────────────

const isAdminUser = (user: User | null) => user?.role === 'admin' && user.isAdmin === true;

const adminUsername = import.meta.env.VITE_ADMIN_USERNAME as string | undefined;
const ADMIN_SESSION_KEY = 'mk-admin-session';

type SupabaseUser = {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
};

const userFromSupabase = (authUser: SupabaseUser): User => ({
  id: authUser.id,
  name: String(authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Customer'),
  email: authUser.email || '',
  phone: typeof authUser.user_metadata?.phone === 'string' ? authUser.user_metadata.phone : undefined,
  address: authUser.user_metadata?.address as Address | undefined,
  role: 'user',
  isAdmin: false,
  wishlist: Array.isArray(authUser.user_metadata?.wishlist) ? authUser.user_metadata.wishlist as string[] : [],
  createdAt: authUser.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
});

const getAdminUser = (): User => ({
  id: 'admin',
  name: 'Administrator',
  email: adminUsername || 'admin',
  role: 'admin',
  isAdmin: true,
  wishlist: [],
  createdAt: new Date().toISOString().split('T')[0],
});

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidPhone = (value: string) => /^[+()\d\s-]{7,20}$/.test(value.trim());
const sanitizeAddress = (address?: Partial<Address>): Address | undefined => {
  if (!address) return undefined;
  const street = String(address.street ?? '').trim();
  const city = String(address.city ?? '').trim();
  const state = String(address.state ?? '').trim();
  const zipCode = String(address.zipCode ?? '').trim();
  const country = String(address.country ?? '').trim();
  if (!street || !city || !zipCode || !country) return undefined;
  return { street, city, state, zipCode, country };
};
const hasAdminSession = () => {
  if (!adminUsername) return false;
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(host);
  return isLocalhost && localStorage.getItem(ADMIN_SESSION_KEY) === 'active';
};

type OrderRow = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  items: CartItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: Order['status'];
  payment_method: 'cod';
  address: Address;
  phone: string;
  email_sent?: boolean;
  created_at: string;
  updated_at: string;
};

const orderFromRow = (row: OrderRow): Order => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  userEmail: row.user_email,
  items: row.items,
  subtotal: row.subtotal,
  shippingCost: row.shipping_cost,
  total: row.total,
  status: row.status,
  paymentMethod: row.payment_method,
  address: row.address,
  phone: row.phone,
  emailSent: row.email_sent,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

type ProductRow = {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price?: number | null;
  category: Product['category'];
  image: string;
  images: string[];
  description: string;
  notes: Product['notes'];
  sizes: string[];
  rating: number;
  review_count: number;
  in_stock: boolean;
  featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  volume: string;
  concentration: string;
  reviews: Review[];
};

const productFromRow = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  brand: row.brand,
  price: Number(row.price),
  originalPrice: row.original_price == null ? undefined : Number(row.original_price),
  category: row.category,
  image: row.image,
  images: row.images || [],
  description: row.description,
  notes: row.notes || { top: [], heart: [], base: [] },
  sizes: row.sizes || [],
  rating: Number(row.rating || 0),
  reviewCount: Number(row.review_count || 0),
  inStock: row.in_stock,
  featured: row.featured,
  isNew: row.is_new,
  isBestseller: row.is_bestseller,
  volume: row.volume,
  concentration: row.concentration,
  reviews: row.reviews || [],
});

const productToRow = (product: Partial<Product>) => ({
  name: product.name,
  brand: product.brand,
  price: product.price,
  original_price: product.originalPrice ?? null,
  category: product.category,
  image: product.image,
  images: product.images,
  description: product.description,
  notes: product.notes,
  sizes: product.sizes,
  rating: product.rating,
  review_count: product.reviewCount,
  in_stock: product.inStock,
  featured: product.featured,
  is_new: product.isNew,
  is_bestseller: product.isBestseller,
  volume: product.volume,
  concentration: product.concentration,
  reviews: product.reviews,
});

export const canCancelOrder = (order: Order) => {
  if (!['pending', 'confirmed'].includes(order.status)) return false;
  return Date.now() - new Date(order.createdAt).getTime() <= 15 * 60 * 1000;
};

const generateOrderId = () => `MK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

const authErrorMessage = (error: unknown, fallback: string) => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object') {
    const value = error as { message?: unknown; error_description?: unknown; msg?: unknown; status?: unknown };
    const message = value.message || value.error_description || value.msg;
    if (typeof message === 'string' && message.trim()) return message;
    if (value.status === 429) return 'Too many emails have been sent. Please wait before trying again.';
  }
  return fallback;
};
// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ── Cart ──────────────────────────────────────────────────────────────
      cart: [],
      addToCart: (product, size, quantity = 1) => {
        if (!product?.id || !size?.trim() || quantity < 1) return;
        const { cart } = get();
        const nextQty = Number(quantity) || 1;
        const existing = cart.find(i => i.product.id === product.id && i.size === size);
        if (existing) {
          set({
            cart: cart.map(i =>
              i.product.id === product.id && i.size === size
                ? { ...i, quantity: i.quantity + nextQty }
                : i
            )
          });
        } else {
          set({ cart: [...cart, { product, quantity: nextQty, size }] });
        }
      },
      removeFromCart: (productId, size) => {
        set({ cart: get().cart.filter(i => !(i.product.id === productId && i.size === size)) });
      },
      updateQuantity: (productId, size, quantity) => {
        if (!productId || !size || quantity < 1) { get().removeFromCart(productId, size); return; }
        set({
          cart: get().cart.map(i =>
            i.product.id === productId && i.size === size ? { ...i, quantity } : i
          )
        });
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),

      // ── Users ─────────────────────────────────────────────────────────────
      user: null,
      users: [],
      authReady: false,
      initAuth: async () => {
        if (!supabase) {
          const restoredAdmin = hasAdminSession() ? getAdminUser() : null;
          set({ user: restoredAdmin, authReady: true });
          return;
        }

        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user ? userFromSupabase(data.session.user) : hasAdminSession() ? getAdminUser() : null;
        set({ user: currentUser, authReady: true });
        if (currentUser) void get().fetchOrders();

        supabase.auth.onAuthStateChange((_event, session) => {
          const nextUser = session?.user ? userFromSupabase(session.user) : hasAdminSession() ? getAdminUser() : null;
          set({ user: nextUser, authReady: true });
          if (nextUser) void get().fetchOrders();
        });
      },
      login: async (email, password) => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password.trim()) {
          return { success: false, message: 'Email and password are required.' };
        }
        if (!isValidEmail(trimmedEmail)) {
          return { success: false, message: 'Please enter a valid email address.' };
        }
        if (!supabase) return { success: false, message: 'Supabase is not configured.' };
        const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error || !data.user) return { success: false, message: error?.message || 'Invalid email or password.' };
        set({ user: userFromSupabase(data.user) });
        return { success: true };
      },
      adminLogin: async (username, password) => {
        const trimmedUsername = username.trim();
        if (!trimmedUsername || !password.trim()) {
          return { success: false, message: 'Username and password are required.' };
        }
        if (!supabase) return { success: false, message: 'Admin access requires Supabase to be configured.' };

        const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedUsername, password });
        if (error || !data.user) {
          return { success: false, message: error?.message || 'Invalid admin credentials.' };
        }

        const user = userFromSupabase(data.user);
        const isAdminAccount = Boolean(
          data.user.app_metadata?.role === 'admin' ||
          data.user.email?.toLowerCase() === adminUsername?.toLowerCase()
        );
        if (!isAdminAccount) {
          await supabase.auth.signOut();
          return { success: false, message: 'This account is not authorized for admin access.' };
        }

        set({ user: { ...user, role: 'admin', isAdmin: true } });
        localStorage.setItem(ADMIN_SESSION_KEY, 'active');
        void get().fetchOrders();
        return { success: true };
      },
      signup: async (name, email, password, phone) => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPhone = phone?.trim() || '';
        if (!trimmedName || !trimmedEmail || !password) {
          return { success: false, message: 'Name, email, and password are required.' };
        }
        if (!isValidEmail(trimmedEmail)) {
          return { success: false, message: 'Please enter a valid email address.' };
        }
        if (password.length < 6) {
          return { success: false, message: 'Password must be at least 6 characters.' };
        }
        if (trimmedPhone && !isValidPhone(trimmedPhone)) {
          return { success: false, message: 'Please enter a valid phone number.' };
        }
        if (!supabase) return { success: false, message: 'Supabase is not configured.' };
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { data: { name: trimmedName, phone: trimmedPhone || undefined, wishlist: [] } },
        });
        if (error) return { success: false, message: error.message };
        if (data.user) set({ user: userFromSupabase(data.user) });
        return { success: true };
      },
      resetPassword: async (email) => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
          return { success: false, message: 'Please enter a valid email address.' };
        }
        if (!supabase) return { success: false, message: 'Supabase is not configured.' };
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        return error ? { success: false, message: authErrorMessage(error, 'Unable to send reset email.') } : { success: true };
      },
      logout: async () => {
        if (supabase) await supabase.auth.signOut();
        localStorage.removeItem(ADMIN_SESSION_KEY);
        set({ user: null });
      },
      updateProfile: async (data) => {
        const currentUser = get().user;
        if (!currentUser) return { success: false, message: 'You must be signed in.' };
        const safeUpdate = {
          name: data.name?.trim() || currentUser.name,
          phone: data.phone?.trim() || currentUser.phone,
          address: sanitizeAddress(data.address) ?? currentUser.address,
          wishlist: Array.isArray(data.wishlist) ? data.wishlist : currentUser.wishlist,
        };
        if (safeUpdate.phone && !isValidPhone(safeUpdate.phone)) {
          return { success: false, message: 'Please enter a valid phone number.' };
        }
        const user = { ...currentUser, ...safeUpdate };
        if (!user.isAdmin && supabase) {
          const { error } = await supabase.auth.updateUser({ data: safeUpdate });
          if (error) return { success: false, message: error.message };
        }
        set({ user });
        return { success: true };
      },
      toggleWishlist: (productId) => {
        const { user } = get();
        if (!user) return;
        const wishlist = user.wishlist.includes(productId)
          ? user.wishlist.filter(id => id !== productId)
          : [...user.wishlist, productId];
        set({ user: { ...user, wishlist } });
        void get().updateProfile({ wishlist });
      },
      isInWishlist: (productId) => {
        return get().user?.wishlist.includes(productId) ?? false;
      },

      // ── Orders ────────────────────────────────────────────────────────────
      orders: [],
      fetchOrders: async () => {
        const { user } = get();
        if (!user || !supabase) return;
        const query = supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        const { data, error } = user.isAdmin ? await query : await query.eq('user_id', user.id);
        if (!error && data) set({ orders: (data as OrderRow[]).map(orderFromRow) });
      },
      placeOrder: async ({ address, phone, fullName, email, shippingCost, subtotal, total }) => {
        const { user, cart } = get();
        if (!user || cart.length === 0) return { success: false, message: 'Your cart is empty.' };
        if (!supabase) return { success: false, message: 'Supabase is not configured.' };

        const trimmedName = fullName.trim();
        const trimmedEmail = email.trim();
        const trimmedPhone = phone.trim();
        const sanitizedAddress = sanitizeAddress(address);
        if (!trimmedName || !trimmedEmail || !trimmedPhone || !sanitizedAddress) {
          return { success: false, message: 'Please complete all required shipping details.' };
        }
        if (!isValidEmail(trimmedEmail)) {
          return { success: false, message: 'Please enter a valid email address.' };
        }
        if (!isValidPhone(trimmedPhone)) {
          return { success: false, message: 'Please enter a valid phone number.' };
        }
        if (subtotal <= 0 || total <= 0) {
          return { success: false, message: 'Order totals are invalid.' };
        }

        const now = new Date().toISOString();
        const order: Order = {
          id: generateOrderId(),
          userId: user.id,
          userName: trimmedName,
          userEmail: trimmedEmail,
          items: [...cart],
          subtotal,
          shippingCost,
          total,
          status: 'pending',
          paymentMethod: 'cod',
          address: sanitizedAddress,
          phone: trimmedPhone,
          createdAt: now,
          updatedAt: now,
          emailSent: false,
        };

        const { error } = await supabase.from('orders').insert({
          id: order.id,
          user_id: order.userId,
          user_name: order.userName,
          user_email: order.userEmail,
          items: order.items,
          subtotal: order.subtotal,
          shipping_cost: order.shippingCost,
          total: order.total,
          status: order.status,
          payment_method: order.paymentMethod,
          address: order.address,
          phone: order.phone,
          email_sent: false,
        });
        if (error) return { success: false, message: error.message };

        const { error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
          body: { order },
        });
        if (!emailError) {
          order.emailSent = true;
          await supabase.from('orders').update({ email_sent: true }).eq('id', order.id);
        }

        set(state => ({ orders: [order, ...state.orders] }));
        get().clearCart();
        return { success: true, order, message: emailError ? 'Order placed, but confirmation email could not be sent.' : undefined };
      },
      cancelOrder: async (orderId) => {
        const order = get().orders.find(o => o.id === orderId);
        if (!order) return { success: false, message: 'Order not found.' };
        if (!canCancelOrder(order)) return { success: false, message: 'This order can no longer be cancelled.' };
        if (!supabase) return { success: false, message: 'Supabase is not configured.' };

        const updatedAt = new Date().toISOString();
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled', updated_at: updatedAt })
          .eq('id', orderId)
          .eq('user_id', order.userId)
          .in('status', ['pending', 'confirmed']);
        if (error) return { success: false, message: error.message };

        const updated = { ...order, status: 'cancelled' as const, updatedAt };
        set(state => ({ orders: state.orders.map(o => o.id === orderId ? updated : o) }));
        await supabase.functions.invoke('send-order-confirmation', {
          body: { order: updated, type: 'cancelled' },
        });
        return { success: true };
      },
      updateOrderStatus: async (orderId, status) => {
        if (!isAdminUser(get().user)) return;
        const updatedAt = new Date().toISOString();
        if (supabase) await supabase.from('orders').update({ status, updated_at: updatedAt }).eq('id', orderId);
        set(state => ({
          orders: state.orders.map(o =>
            o.id === orderId ? { ...o, status, updatedAt } : o
          )
        }));
      },
      deleteOrder: async (orderId) => {
        if (!isAdminUser(get().user)) return { success: false, message: 'Admin access is required.' };
        const order = get().orders.find(o => o.id === orderId);
        if (!order) return { success: false, message: 'Order not found.' };
        if (!['cancelled', 'delivered'].includes(order.status)) {
          return { success: false, message: 'Only cancelled or delivered orders can be deleted.' };
        }
        if (!supabase) return { success: false, message: 'Supabase is not configured.' };
        const { error } = await supabase.from('orders').delete().eq('id', orderId).in('status', ['cancelled', 'delivered']);
        if (error) return { success: false, message: error.message };
        set(state => ({ orders: state.orders.filter(o => o.id !== orderId) }));
        return { success: true };
      },
      getUserOrders: () => {
        const { user, orders } = get();
        if (!user) return [];
        return orders.filter(o => o.userId === user.id);
      },
      // ── Products ──────────────────────────────────────────────────────────
      products: [],
      fetchProducts: async () => {
        if (!supabase) {
          set({ products: [] });
          return;
        }
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) set({ products: (data as ProductRow[]).map(productFromRow) });
        else set({ products: [] });
      },
      addProduct: async (product) => {
        if (!isAdminUser(get().user)) return { success: false, message: 'Admin access is required.' };
        if (!supabase) return { success: false, message: 'Supabase is not configured.' };
        const { data, error } = await supabase
          .from('products')
          .insert(productToRow(product))
          .select('*')
          .single();
        if (error) return { success: false, message: error.message };
        const newProduct = productFromRow(data as ProductRow);
        set(state => ({ products: [newProduct, ...state.products] }));
        return { success: true };
      },
      updateProduct: async (id, data) => {
        if (!isAdminUser(get().user)) return { success: false, message: 'Admin access is required.' };
        if (!supabase) return { success: false, message: 'Supabase is not configured.' };
        const { data: updatedRow, error } = await supabase
          .from('products')
          .update(productToRow(data))
          .eq('id', id)
          .select('*')
          .single();
        if (error) return { success: false, message: error.message };
        const updatedProduct = productFromRow(updatedRow as ProductRow);
        set(state => ({
          products: state.products.map(p => p.id === id ? updatedProduct : p)
        }));
        return { success: true };
      },
      deleteProduct: async (id) => {
        if (!isAdminUser(get().user)) return { success: false, message: 'Admin access is required.' };
        if (!supabase) return { success: false, message: 'Supabase is not configured.' };
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) return { success: false, message: error.message };
        set(state => ({ products: state.products.filter(p => p.id !== id) }));
        return { success: true };
      },

      // ── Reviews ───────────────────────────────────────────────────────────
      addReview: (productId, rating, comment) => {
        const { user } = get();
        if (!user) return;
        const review: Review = {
          id: `rev${Date.now()}`,
          userId: user.id,
          userName: user.name,
          rating,
          comment,
          date: new Date().toISOString().split('T')[0],
        };
        set(state => ({
          products: state.products.map(p =>
            p.id === productId
              ? {
                  ...p,
                  reviews: [...p.reviews, review],
                  reviewCount: p.reviewCount + 1,
                  rating: parseFloat(((p.rating * p.reviewCount + rating) / (p.reviewCount + 1)).toFixed(1)),
                }
              : p
          )
        }));
      },

      // ── UI ────────────────────────────────────────────────────────────────
      isMenuOpen: false,
      setMenuOpen: (open) => set({ isMenuOpen: open }),
      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
    }),
    {
      name: 'mk-store',
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as Partial<StoreState>;
        return {
          ...state,
          products: [],
          cart: state.cart?.map(item => ({
            ...item,
            product: {
              ...item.product,
              image: item.product.image.startsWith('/images/perfume-') ? '' : item.product.image,
              images: item.product.images.filter(image => !image.startsWith('/images/perfume-')),
            },
          })),
        };
      },
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
      }),
    }
  )
);


