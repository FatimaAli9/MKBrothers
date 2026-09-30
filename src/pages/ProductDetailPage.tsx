import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Share2, ChevronRight, Minus, Plus, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist, user, addReview, setCartOpen } = useStore();
  const product = products.find(p => p.id === id);
  const related = products.filter(p => p.category === product?.category && p.id !== id).slice(0, 4);

  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'notes' | 'reviews'>('description');

  useEffect(() => {
    if (product && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedSize]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [imgError, setImgError] = useState(false);

  const inWishlist = isInWishlist(id || '');

  if (!product) {
    return (
      <div className="pt-[104px] min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="font-display text-2xl text-white mb-2">Product not found</h2>
        <Link to="/shop" className="btn-gold mt-4 px-6 py-2.5 rounded-full text-sm">Back to Shop</Link>
      </div>
    );
  }

  const initSize = selectedSize || product.sizes[0] || '';

  const handleAddToCart = () => {
    if (!product.sizes.length) {
      toast.error('This product is missing a valid size selection.', { className: 'toast-luxury' });
      return;
    }
    addToCart(product, initSize, qty);
    toast.success(`${product.name} added to cart!`, { className: 'toast-luxury', icon: '🛍️' });
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!product.sizes.length) {
      toast.error('This product is missing a valid size selection.', { className: 'toast-luxury' });
      return;
    }
    addToCart(product, initSize, qty);
    navigate('/checkout');
  };

  const handleWishlist = () => {
    if (!user) { toast.error('Please login to use wishlist', { className: 'toast-luxury' }); return; }
    toggleWishlist(product.id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', { className: 'toast-luxury', icon: inWishlist ? '💔' : '❤️' });
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to leave a review', { className: 'toast-luxury' }); return; }
    const comment = reviewComment.trim();
    if (!comment) { toast.error('Please write a comment', { className: 'toast-luxury' }); return; }
    addReview(product.id, reviewRating, comment);
    toast.success('Review submitted!', { className: 'toast-luxury', icon: '⭐' });
    setReviewComment('');
    setReviewRating(5);
  };

  const images = product.images.length > 0 ? product.images : product.image ? [product.image] : [];
  const activeImage = images[activeImg];

  return (
    <div className="pt-[104px]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <Link to={`/shop?category=${product.category}`} className="hover:text-gold transition-colors capitalize">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-gray-400">{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900">
              {activeImage && !imgError ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No image uploaded</div>
              )}
              {product.isNew && <div className="absolute top-4 left-4"><span className="badge-gold">New</span></div>}
              {product.isBestseller && <div className="absolute top-4 right-4"><span className="text-xs font-bold text-gold bg-gold/10 border border-gold/30 px-2 py-1 rounded">⭐ Bestseller</span></div>}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gold text-xs tracking-widest uppercase">{product.brand}</span>
              {product.isNew && <span className="badge-gold">New</span>}
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-2">{product.name}</h1>
            <p className="text-gray-400 text-sm mb-4">{product.concentration} · {product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} className={s <= Math.round(product.rating) ? 'fill-gold text-gold' : 'text-gray-700'} />
                ))}
              </div>
              <span className="text-gold font-semibold text-sm">{product.rating}</span>
              <span className="text-gray-500 text-sm">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-4xl font-bold gold-text">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-gray-600 text-xl line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-red-900/50 text-red-300 text-xs px-2 py-0.5 rounded border border-red-800/50">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Size Selection */}
            <div className="mb-5">
              <p className="text-white text-sm font-semibold mb-2">Size / Volume</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      initSize === size
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gray-700 text-gray-400 hover:border-gold/50 hover:text-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-white text-sm font-semibold mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="text-white font-semibold text-lg w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button onClick={handleAddToCart} className="btn-gold flex-1 py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn-outline-gold flex-1 py-4 rounded-xl text-sm font-semibold">
                Buy Now
              </button>
              <button onClick={handleWishlist} className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-colors ${inWishlist ? 'border-gold bg-gold/10 text-gold' : 'border-gray-700 text-gray-400 hover:border-gold hover:text-gold'}`}>
                <Heart size={20} className={inWishlist ? 'fill-gold' : ''} />
              </button>
            </div>

            {/* Stock / COD */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-400" />
                <span className={product.inStock ? 'text-green-400' : 'text-red-400'}>
                  {product.inStock ? 'In Stock – Ready to Ship' : 'Out of Stock'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-gold" />
                <span className="text-gray-300">Cash on Delivery Available</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-gold" />
                <span className="text-gray-300">Free shipping on orders above Rs. 5,000</span>
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Share2 size={14} />
              <span>Share this product</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-12">
          <div className="flex border-b border-gold/20 mb-6 gap-1">
            {(['description', 'notes', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
                  activeTab === tab ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'reviews' ? `Reviews (${product.reviewCount})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="max-w-2xl">
              <p className="text-gray-300 leading-relaxed text-base">{product.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="luxury-card rounded-xl p-4 text-center">
                  <p className="text-gold text-xs uppercase tracking-wider mb-1">Volume</p>
                  <p className="text-white font-semibold">{product.volume}</p>
                </div>
                <div className="luxury-card rounded-xl p-4 text-center">
                  <p className="text-gold text-xs uppercase tracking-wider mb-1">Type</p>
                  <p className="text-white font-semibold text-xs">{product.concentration}</p>
                </div>
                <div className="luxury-card rounded-xl p-4 text-center">
                  <p className="text-gold text-xs uppercase tracking-wider mb-1">Category</p>
                  <p className="text-white font-semibold capitalize">{product.category}</p>
                </div>
                <div className="luxury-card rounded-xl p-4 text-center">
                  <p className="text-gold text-xs uppercase tracking-wider mb-1">Brand</p>
                  <p className="text-white font-semibold">{product.brand}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
              {[
                { label: 'Top Notes', notes: product.notes.top, icon: '🌬️', desc: 'First impression, 0-30 min' },
                { label: 'Heart Notes', notes: product.notes.heart, icon: '💫', desc: 'The soul, 30min-4hrs' },
                { label: 'Base Notes', notes: product.notes.base, icon: '🌳', desc: 'Lasting impression, 4+ hrs' },
              ].map(layer => (
                <div key={layer.label} className="luxury-card rounded-2xl p-5">
                  <div className="text-2xl mb-2">{layer.icon}</div>
                  <h3 className="font-display font-semibold text-white text-base mb-0.5">{layer.label}</h3>
                  <p className="text-gray-600 text-xs mb-3">{layer.desc}</p>
                  <div className="space-y-1.5">
                    {layer.notes.map(note => (
                      <div key={note} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-2xl">
              {/* Review summary */}
              <div className="luxury-card rounded-2xl p-5 flex items-center gap-6">
                <div className="text-center">
                  <div className="font-display text-5xl font-bold gold-text">{product.rating}</div>
                  <div className="flex items-center gap-0.5 justify-center my-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} className={s <= Math.round(product.rating) ? 'fill-gold text-gold' : 'text-gray-700'} />
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">{product.reviewCount} reviews</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5,4,3,2,1].map(r => (
                    <div key={r} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-2">{r}</span>
                      <Star size={10} className="text-gold fill-gold" />
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                          style={{ width: `${r === 5 ? 70 : r === 4 ? 20 : r === 3 ? 5 : r === 2 ? 3 : 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Existing reviews */}
              {product.reviews.map(review => (
                <div key={review.id} className="luxury-card rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white text-sm">{review.userName}</p>
                      <p className="text-gray-600 text-xs">{formatDate(review.date)}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= review.rating ? 'fill-gold text-gold' : 'text-gray-700'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{review.comment}</p>
                </div>
              ))}

              {product.reviews.length === 0 && (
                <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
              )}

              {/* Write review */}
              <div className="luxury-card rounded-2xl p-5">
                <h3 className="font-display text-base font-semibold text-white mb-4">Write a Review</h3>
                <form onSubmit={handleReview} className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Your Rating</label>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewRating(s)}>
                          <Star size={24} className={s <= reviewRating ? 'fill-gold text-gold' : 'text-gray-700 hover:text-gold/50'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Your Review</label>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this fragrance..."
                      rows={4}
                      className="luxury-input w-full px-4 py-3 rounded-lg text-sm resize-none"
                    />
                  </div>
                  <button type="submit" className="btn-gold px-6 py-2.5 rounded-lg text-sm">
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <div className="mb-8">
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">You May Also Like</p>
              <h2 className="font-display text-3xl font-bold text-white">Related Fragrances</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
