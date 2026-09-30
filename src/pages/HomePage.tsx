import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck, RefreshCw, Award } from 'lucide-react';
import { useStore, CATEGORIES } from '../store/useStore';
import ProductCard from '../components/ProductCard';


export default function HomePage() {
  const { products } = useStore();
  const featured = products.filter(p => p.featured);
  const bestsellers = products.filter(p => p.isBestseller);
  const newArrivals = products.filter(p => p.isNew);

  return (
    <div className="pt-[104px]">
      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section className="dark-media-section relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bg.jpg"
            alt="Luxury Perfumes"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 media-overlay-side" />
          <div className="absolute inset-0 media-overlay-bottom" />
        </div>

        {/* NOT centered, NOT extreme left */}
        <div className="relative z-10 w-full px-4 sm:px-10 lg:px-16 py-14 sm:py-20">
          <div className="max-w-2xl ml-2 sm:ml-8 lg:ml-16">

            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-10 bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase">
                Luxury Fragrances
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              The Art of <br></br><span className="gold-text italic">Scented</span> Luxury
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
              Discover exceptional fragrances crafted from the world's finest ingredients.
              <br className="hidden sm:block" />
              Every bottle tells a story of elegance, passion, and timeless beauty.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="btn-gold px-8 py-4 rounded-full text-sm font-semibold flex items-center gap-2"
              >
                Explore Collection <ArrowRight size={16} />
              </Link>

              <Link
                to="/about"
                className="btn-outline-gold px-8 py-4 rounded-full text-sm font-semibold"
              >
                Our Story
              </Link>
            </div>

            <div className="flex items-center gap-3 sm:gap-8 mt-10">
              <div>
                <div className="font-display text-2xl font-bold gold-text">500+</div>
                <div className="text-gray-500 text-[10px] sm:text-xs">Happy Customers</div>
              </div>

              <div className="w-px h-8 bg-gold/30" />

              <div>
                <div className="font-display text-2xl font-bold gold-text">50+</div>
                <div className="text-gray-500 text-[10px] sm:text-xs">Unique Fragrances</div>
              </div>

              <div className="w-px h-8 bg-gold/30" />

              <div>
                <div className="font-display text-2xl font-bold gold-text">25+</div>
                <div className="text-gray-500 text-[10px] sm:text-xs">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-gray-500 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* ── Marquee Banner ──────────────────────────────────────────────── */}
      <div className="py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-dark overflow-hidden">
        <div className="marquee-track">
          {Array(4).fill(['✦ Luxury Fragrances', '✦ Cash on Delivery', '✦ Premium Quality', '✦ Free Shipping Above Rs. 5,000', '✦ 100% Authentic', '✦ Expert Curation']).flat().map((text, i) => (
            <span key={i} className="text-black text-xs font-semibold tracking-widest uppercase px-6 whitespace-nowrap">{text}</span>
          ))}
        </div>
      </div>

      {/* ── Categories ──────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Browse By</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Our Collections</h2>
          <div className="gold-divider max-w-xs mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => (
            <Link to={`/shop?category=${cat.id}`} key={cat.id}>
              <div className="luxury-card rounded-2xl p-4 sm:p-6 text-center group cursor-pointer">
                <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                <h3 className="font-display text-sm sm:text-base font-semibold text-white group-hover:text-gold transition-colors">{cat.label}</h3>
                <p className="text-gray-500 text-xs mt-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-gradient-to-b from-charcoal/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Handpicked for You</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Featured Fragrances</h2>
            </div>
            <Link to="/shop" className="btn-outline-gold px-6 py-2.5 rounded-full text-xs hidden sm:block">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link to="/shop" className="btn-outline-gold px-8 py-3 rounded-full text-sm">View All Products</Link>
          </div>
        </div>
      </section>

      {/* ── Offer Banner ────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offer 1 */}
          <div className="dark-media-section relative rounded-2xl overflow-hidden h-56 group cursor-pointer">
            <div className="absolute inset-0 bg-[#14110d]" />
            <div className="absolute inset-0 media-overlay-banner" />
            <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-center">
              <span className="badge-gold mb-2 w-fit">Men's</span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-1">Bold & Masculine</h3>
              <p className="text-gray-300 text-sm mb-4">Up to 20% off selected fragrances</p>
              <Link to="/shop?category=men" className="btn-gold px-6 py-2 rounded-full text-xs w-fit flex items-center gap-1">
                Shop Now <ArrowRight size={12} />
              </Link>
            </div>
          </div>
          {/* Offer 2 */}
          <div className="dark-media-section relative rounded-2xl overflow-hidden h-56 group cursor-pointer">
            <div className="absolute inset-0 bg-[#151018]" />
            <div className="absolute inset-0 media-overlay-banner" />
            <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-center">
              <span className="badge-gold mb-2 w-fit">Women's</span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-1">Elegant & Feminine</h3>
              <p className="text-gray-300 text-sm mb-4">New arrivals now available</p>
              <Link to="/shop?category=women" className="btn-gold px-6 py-2 rounded-full text-xs w-fit flex items-center gap-1">
                Shop Now <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bestsellers ──────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Customer Favourites</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Bestsellers</h2>
          </div>
          <Link to="/shop?sort=popular" className="btn-outline-gold px-6 py-2.5 rounded-full text-xs hidden sm:block">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestsellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── Luxury Banner ────────────────────────────────────────────────── */}
      <section className="dark-media-section py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-[#100f0d]" />
          <div className="absolute inset-0 media-overlay-vertical" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">Exclusive Collection</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">The Oud Experience</h2>
          <div className="gold-divider max-w-xs mx-auto mb-6" />
          <p className="text-gray-300 text-base leading-relaxed mb-8">
            Journey into the heart of Arabia with our exclusive Oud collection.
            Each fragrance is a testament to the finest woods, resins and spices from across the ancient trade routes.
          </p>
          <Link to="/shop?category=oud" className="btn-gold px-10 py-4 rounded-full text-sm font-semibold inline-flex items-center gap-2">
            Discover Oud <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── New Arrivals ─────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Just Launched</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">New Arrivals</h2>
            </div>
            <Link to="/shop?sort=new" className="btn-outline-gold px-6 py-2.5 rounded-full text-xs hidden sm:block">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── Why Choose Us ────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-charcoal/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Why MK Brothers</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">The MK Difference</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield size={28} className="text-gold" />, title: '100% Authentic', desc: 'Every fragrance is guaranteed authentic, sourced directly from premium manufacturers.' },
              { icon: <Truck size={28} className="text-gold" />, title: 'Fast Delivery', desc: 'Swift and secure delivery to your doorstep. Free shipping on orders above Rs. 5,000.' },
              { icon: <Award size={28} className="text-gold" />, title: 'Premium Quality', desc: 'Only the finest ingredients go into our fragrances. Quality is our promise.' },
              { icon: <RefreshCw size={28} className="text-gold" />, title: 'Easy Returns', desc: 'Not satisfied? Return within 7 days for a full refund. No questions asked.' },
            ].map((item, i) => (
              <div key={i} className="luxury-card rounded-2xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-display text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Customer Love</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">What Our Clients Say</h2>
          <div className="gold-divider max-w-xs mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Ayesha Khan', location: 'Karachi', rating: 5, comment: 'MK Brothers has the most authentic fragrances I have experienced. The quality and presentation feel premium.', perfume: 'Verified Customer' },
            { name: 'Bilal Ahmed', location: 'Lahore', rating: 5, comment: 'The packaging is stunning and the fragrance lasts all day. Absolutely worth every rupee.', perfume: 'Verified Customer' },
            { name: 'Sara Malik', location: 'Islamabad', rating: 5, comment: 'The customer service is impeccable and delivery was fast. Will definitely shop again!', perfume: 'Verified Customer' },
          ].map((review, i) => (
            <div key={i} className="luxury-card rounded-2xl p-6">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={14} className={s <= review.rating ? 'fill-gold text-gold' : 'text-gray-700'} />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">"{review.comment}"</p>
              <div className="border-t border-gold/15 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{review.name}</p>
                  <p className="text-gray-500 text-xs">{review.location}</p>
                </div>
                <span className="badge-gold">{review.perfume}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4">
        <div className="luxury-card rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/5 rounded-3xl" />
          <div className="relative z-10">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Limited Time</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Get 10% Off Your First Order</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">Sign up today and receive an exclusive welcome discount on your first purchase.</p>
            <Link to="/signup" className="btn-gold px-10 py-4 rounded-full text-sm font-semibold inline-flex items-center gap-2">
              Claim Your Discount <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

