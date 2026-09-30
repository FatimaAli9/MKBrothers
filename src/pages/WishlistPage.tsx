import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import ProductImage from '../components/ProductImage';

export default function WishlistPage() {
  const { user, products, toggleWishlist, addToCart } = useStore();
  const wishlistProducts = user ? products.filter(p => user.wishlist.includes(p.id)) : [];

  if (!user) {
    return (
      <div className="pt-[104px] min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">❤️</div>
        <h2 className="font-display text-2xl text-white mb-2">Sign in to view wishlist</h2>
        <Link to="/login" className="btn-gold mt-4 px-6 py-2.5 rounded-full text-sm">Sign In</Link>
      </div>
    );
  }

  const handleRemove = (id: string) => {
    toggleWishlist(id);
    toast.success('Removed from wishlist', { className: 'toast-luxury' });
  };

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product, product.sizes[0]);
    toast.success(`${product.name} added to cart!`, { className: 'toast-luxury', icon: '🛍️' });
  };

  return (
    <div className="pt-[104px] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="text-gold" size={24} />
          <h1 className="font-display text-3xl font-bold text-white">My Wishlist</h1>
          {wishlistProducts.length > 0 && <span className="badge-gold">{wishlistProducts.length}</span>}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="luxury-card rounded-2xl p-16 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 text-sm mb-6">Save your favourite fragrances to revisit them later</p>
            <Link to="/shop" className="btn-gold px-8 py-3 rounded-full text-sm">Explore Fragrances</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlistProducts.map(product => (
              <div key={product.id} className="luxury-card rounded-xl overflow-hidden group">
                <Link to={`/product/${product.id}`}>
                  <div className="product-image-container relative aspect-square bg-gray-900">
                    <ProductImage src={product.image} alt={product.name} />
                    <button
                      onClick={e => { e.preventDefault(); handleRemove(product.id); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-900/70 flex items-center justify-center hover:bg-red-800 transition-colors"
                    >
                      <X size={14} className="text-red-300" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold transition-colors">{product.name}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{product.concentration}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-display text-base font-bold gold-text">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-gray-600 text-xs line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="px-3 pb-3">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-gold w-full py-2 rounded-lg text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={13} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
