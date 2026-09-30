import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';
import ProductImage from './ProductImage';

export default function CartDrawer() {
  const { isCartOpen, setCartOpen, cart, removeFromCart, updateQuantity, cartTotal } = useStore();
  const total = cartTotal();

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col transition-transform duration-300 ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
        style={{ background: '#ffffff', borderLeft: '1px solid rgba(201,168,76,0.28)', boxShadow: '-24px 0 60px rgba(64,45,18,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-gold" size={22} />
            <h2 className="font-display text-xl font-semibold text-white">Your Cart</h2>
            <span className="badge-gold">{cart.length} items</span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gold transition-colors rounded-lg hover:bg-gold/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
                <ShoppingBag className="text-gold" size={32} />
              </div>
              <p className="font-display text-xl text-gray-300">Your cart is empty</p>
              <p className="text-gray-500 text-sm">Discover our luxury fragrances</p>
              <Link
                to="/shop"
                onClick={() => setCartOpen(false)}
                className="btn-gold px-6 py-2.5 rounded-full text-sm mt-2"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.product.id}-${item.size}`} className="luxury-card rounded-xl p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                  <ProductImage src={item.product.image} alt={item.product.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-sm font-semibold text-white truncate">{item.product.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.size} · {item.product.concentration}</p>
                  <p className="text-gold font-semibold text-sm mt-1">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-white text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="ml-auto p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gold/20 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Subtotal</span>
              <span className="text-white font-semibold">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Shipping</span>
              <span className={total >= 5000 ? 'text-green-400 text-sm' : 'text-white text-sm'}>
                {total >= 5000 ? 'FREE' : formatPrice(250)}
              </span>
            </div>
            <div className="gold-divider" />
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Total</span>
              <span className="font-display text-xl font-bold gold-text">
                {formatPrice(total >= 5000 ? total : total + 250)}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setCartOpen(false)}
              className="btn-gold w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link
              to="/shop"
              onClick={() => setCartOpen(false)}
              className="btn-outline-gold w-full py-3 rounded-xl text-sm text-center"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
