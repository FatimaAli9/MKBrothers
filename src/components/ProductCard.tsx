import { useState } from 'react';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore, Product } from '../store/useStore';
import { formatPrice, getDiscountPercent } from '../utils/helpers';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  view?: 'grid' | 'list';
}

export default function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist, user } = useStore();
  const inWishlist = isInWishlist(product.id);
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(product.image && !imgError);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const size = product.sizes[0] || '';
    if (!size) {
      toast.error('This product is missing a valid size option.', { className: 'toast-luxury' });
      return;
    }
    addToCart(product, size);
    toast.success(`${product.name} added to cart!`, {
      className: 'toast-luxury',
      icon: '🛍️',
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to use wishlist', { className: 'toast-luxury' });
      return;
    }
    toggleWishlist(product.id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', {
      className: 'toast-luxury',
      icon: inWishlist ? '💔' : '❤️',
    });
  };

  if (view === 'list') {
    return (
      <Link to={`/product/${product.id}`}>
        <div className="luxury-card rounded-xl overflow-hidden flex gap-4 p-4 cursor-pointer">
          <div className="product-image-container w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
            {hasImage ? (
              <img
                src={product.image}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No image</div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                {product.isNew && <span className="badge-gold text-[10px] mr-2">NEW</span>}
                {product.isBestseller && <span className="text-[10px] uppercase tracking-wider text-gold border border-gold/30 px-2 py-0.5 rounded-sm">Bestseller</span>}
                <h3 className="font-display text-lg font-semibold text-white mt-1">{product.name}</h3>
                <p className="text-gray-500 text-xs">{product.concentration} · {product.volume}</p>
              </div>
              <button onClick={handleWishlist} className="p-2 rounded-full hover:bg-gold/10 transition-colors flex-shrink-0">
                <Heart size={18} className={inWishlist ? 'fill-gold text-gold' : 'text-gray-500'} />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={12} className={s <= Math.round(product.rating) ? 'fill-gold text-gold' : 'text-gray-700'} />
              ))}
              <span className="text-gray-500 text-xs ml-1">({product.reviewCount})</span>
            </div>
            <p className="text-gray-400 text-sm mt-2 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold gold-text">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-gray-600 text-sm line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              <button onClick={handleAddToCart} className="btn-gold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5">
                <ShoppingBag size={14} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group luxury-card rounded-xl overflow-hidden cursor-pointer">
      <Link to={`/product/${product.id}`}>
        {/* Image */}
        <div className="product-image-container relative bg-gray-900 aspect-[3/4]">
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No image</div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && <span className="badge-gold">New</span>}
            {product.originalPrice && (
              <span className="bg-red-900/80 text-red-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border border-red-700/50">
                -{getDiscountPercent(product.originalPrice, product.price)}%
              </span>
            )}
          </div>
          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-gold/20 transition-colors"
            >
              <Heart size={16} className={inWishlist ? 'fill-gold text-gold' : 'text-white'} />
            </button>
            <Link
              to={`/product/${product.id}`}
              className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-gold/20 transition-colors"
              aria-label={`View ${product.name}`}
            >
              <Eye size={16} className="text-white" />
            </Link>
          </div>
          {/* Bestseller ribbon */}
          {product.isBestseller && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gold/80 to-transparent py-2 px-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-black">⭐ Bestseller</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11} className={s <= Math.round(product.rating) ? 'fill-gold text-gold' : 'text-gray-700'} />
            ))}
            <span className="text-gray-500 text-xs ml-1">({product.reviewCount})</span>
          </div>
          <h3 className="font-display text-base font-semibold text-white group-hover:text-gold transition-colors">{product.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{product.concentration} · {product.volume}</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-display text-lg font-bold gold-text">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-gray-600 text-xs line-through ml-1.5">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          className="btn-gold w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0"
        >
          <ShoppingBag size={14} /> Add to Cart
        </button>
      </div>
    </div>
  );
}
