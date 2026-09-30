import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Home, XCircle } from 'lucide-react';
import { canCancelOrder, useStore } from '../store/useStore';
import { formatPrice, formatDate } from '../utils/helpers';
import ProductImage from '../components/ProductImage';
import toast from 'react-hot-toast';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { orders, cancelOrder, fetchOrders } = useStore();
  const [, setNow] = useState(Date.now());
  const order = orders.find(o => o.id === id);

  useEffect(() => {
    void fetchOrders();
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [fetchOrders]);

  if (!order) {
    return (
      <div className="pt-[104px] min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="font-display text-2xl text-white mb-2">Order not found</h2>
        <Link to="/" className="btn-gold mt-4 px-6 py-2.5 rounded-full text-sm">Go Home</Link>
      </div>
    );
  }

  const canCancel = canCancelOrder(order);
  const handleCancel = async () => {
    const result = await cancelOrder(order.id);
    if (result.success) toast.success('Order cancelled.', { className: 'toast-luxury' });
    else toast.error(result.message || 'Unable to cancel order.', { className: 'toast-luxury' });
  };

  return (
    <div className="pt-[104px] min-h-screen py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Success Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto">
            <CheckCircle size={48} className="text-green-400" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-green-400/10 animate-ping" />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">Order Confirmed! 🎉</h1>
        <p className="text-gray-400 text-base mb-2">
          Thank you, <span className="text-gold font-semibold">{order.userName}</span>!
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Your order has been placed successfully. We'll contact you shortly to confirm the delivery.
        </p>
        {canCancel && (
          <button onClick={handleCancel} className="mb-5 px-5 py-2.5 rounded-xl border border-red-800 text-red-300 hover:bg-red-900/20 text-sm font-semibold inline-flex items-center gap-2">
            <XCircle size={16} /> Cancel Order
          </button>
        )}

        {/* Order ID */}
        <div className="luxury-card rounded-2xl p-5 mb-5 text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-white flex items-center gap-2">
              <Package size={16} className="text-gold" /> Order Details
            </h2>
            <span className="badge-gold">{order.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p className="text-gray-500 text-xs mb-1">Order Date</p>
              <p className="text-white">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Status</p>
              <span className={`status-pending px-2 py-1 rounded text-xs font-semibold capitalize`}>
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Payment</p>
              <p className="text-white">💵 Cash on Delivery</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Total</p>
              <p className="font-display text-lg font-bold gold-text">{formatPrice(order.total)}</p>
            </div>
          </div>

          <div className="gold-divider mb-4" />

          {/* Items */}
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden">
                  <ProductImage src={item.product.image} alt={item.product.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold">{item.product.name}</p>
                  <p className="text-gray-500 text-xs">{item.size} × {item.quantity}</p>
                </div>
                <p className="text-gold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="gold-divider my-4" />

          {/* Delivery Address */}
          <div>
            <p className="text-gray-500 text-xs mb-1">Delivery Address</p>
            <p className="text-white text-sm">
              {order.address.street}, {order.address.city}, {order.address.country}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">📞 {order.phone}</p>
          </div>
        </div>

        {/* What's Next */}
        <div className="luxury-card rounded-2xl p-5 mb-8 text-left">
          <h3 className="font-display text-base font-semibold text-white mb-3">What happens next?</h3>
          <div className="space-y-3">
            {[
              { icon: '📞', step: 'Confirmation Call', desc: 'Our team will call you to confirm your order within 24 hours.' },
              { icon: '📦', step: 'Order Packed', desc: 'Your luxury fragrances are carefully packaged with premium materials.' },
              { icon: '🚚', step: 'Shipped', desc: 'Your order will be shipped and you\'ll receive tracking details.' },
              { icon: '🏠', step: 'Delivered', desc: 'Delivered to your doorstep. Pay with cash upon delivery.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{item.step}</p>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/orders" className="btn-outline-gold flex-1 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <Package size={16} /> View My Orders
          </Link>
          <Link to="/shop" className="btn-gold flex-1 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <Home size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
