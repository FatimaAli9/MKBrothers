import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package, Phone, Wallet, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { canCancelOrder, useStore } from '../store/useStore';
import { formatPrice, formatDate } from '../utils/helpers';
import ProductImage from '../components/ProductImage';

export default function OrdersPage() {
  const { user, orders, fetchOrders, cancelOrder } = useStore();
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    if (user) void fetchOrders();
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [fetchOrders, user]);

  if (!user) return (
    <div className="pt-[104px] min-h-screen flex flex-col items-center justify-center text-center">
      <h2 className="font-display text-2xl text-white mb-2">Please sign in</h2>
      <Link to="/login" className="btn-gold mt-4 px-6 py-2.5 rounded-full text-sm">Sign In</Link>
    </div>
  );

  const userOrders = orders.filter(o => o.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const statusColors: Record<string, string> = {
    pending: 'status-pending',
    confirmed: 'status-shipped',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
  };

  const handleCancel = async (orderId: string) => {
    const result = await cancelOrder(orderId);
    if (result.success) toast.success('Order cancelled.', { className: 'toast-luxury' });
    else toast.error(result.message || 'Unable to cancel order.', { className: 'toast-luxury' });
  };

  return (
    <div className="pt-[104px] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Package className="text-gold" size={24} />
          <h1 className="font-display text-3xl font-bold text-white">My Orders</h1>
        </div>

        {userOrders.length === 0 ? (
          <div className="luxury-card rounded-2xl p-16 text-center">
            <h3 className="font-display text-2xl font-bold text-white mb-2">No orders yet</h3>
            <p className="text-gray-500 text-sm mb-6">Your orders will appear here once you shop</p>
            <Link to="/shop" className="btn-gold px-8 py-3 rounded-full text-sm">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {userOrders.map(order => (
              <div key={order.id} className="luxury-card rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-gray-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-500 text-xs">Order ID:</span>
                      <span className="text-white text-xs font-semibold">{order.id}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`${statusColors[order.status]} px-3 py-1 rounded-full text-xs font-semibold capitalize`}>
                      {order.status}
                    </span>
                    <span className="font-display text-lg font-bold gold-text">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.map(item => (
                    <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gray-800 overflow-hidden">
                        <ProductImage src={item.product.image} alt={item.product.name} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{item.product.name}</p>
                        <p className="text-gray-500 text-xs">{item.size} - {item.product.concentration} - Qty: {item.quantity}</p>
                      </div>
                      <p className="text-gold font-semibold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-900/50 rounded-xl p-3 text-xs text-gray-400 space-y-1">
                  <p className="flex items-center gap-2"><MapPin size={12} /> {order.address.street}, {order.address.city}, {order.address.zipCode}, {order.address.country}</p>
                  <p className="flex items-center gap-2"><Phone size={12} /> {order.phone}</p>
                  <p className="flex items-center gap-2"><Wallet size={12} /> Cash on Delivery</p>
                </div>

                {canCancelOrder(order) && (
                  <button onClick={() => void handleCancel(order.id)} className="mt-3 px-4 py-2 rounded-lg border border-red-800 text-red-300 hover:bg-red-900/20 text-xs font-semibold inline-flex items-center gap-2">
                    <XCircle size={14} /> Cancel Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
