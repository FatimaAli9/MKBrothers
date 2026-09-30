import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Heart, Menu, X, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, user, setCartOpen, searchQuery, setSearchQuery } = useStore();
  const count = cartCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/30' : 'bg-transparent'
      }`}>
        {/* Top bar */}
        <div className="border-b border-gold/10 bg-ink/80">
          <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>📞 +92 328 2681830</span>
              <span className="hidden lg:inline">✉️ hafizmuddassir46@gmail.com</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:flex items-center gap-1">
                <span className="text-gold">✓</span> Free shipping on orders above Rs. 5,000
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <span className="text-gold">✓</span> Cash on Delivery
              </span>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-bold text-sm font-display">MK</div>
              <div className="hidden sm:block">
                <div className="font-display text-xl font-bold gold-text leading-tight">MK Brothers</div>
                <div className="text-[10px] tracking-[0.2em] text-gray-400 uppercase">Perfume</div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className={`nav-link text-sm tracking-wide ${isActive('/') ? 'active' : ''}`}>Home</Link>
              
              <div className="relative group">
                <button
                  className={`nav-link text-sm tracking-wide flex items-center gap-1 ${location.pathname.includes('/shop') ? 'active' : ''}`}
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                >
                  Shop <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                </button>
                <div
                  className={`absolute top-full left-0 mt-2 w-48 glass rounded-lg overflow-hidden shadow-2xl transition-all duration-200 ${shopOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                >
                  <Link to="/shop" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors">All Products</Link>
                  <Link to="/shop?category=men" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors">Men's</Link>
                  <Link to="/shop?category=women" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors">Women's</Link>
                  <Link to="/shop?category=luxury" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors">Luxury</Link>
                  <Link to="/shop?category=oud" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors">Oud Collection</Link>
                  <Link to="/shop?category=unisex" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors">Unisex</Link>
                </div>
              </div>

              <Link to="/about" className={`nav-link text-sm tracking-wide ${isActive('/about') ? 'active' : ''}`}>About</Link>
              <Link to="/contact" className={`nav-link text-sm tracking-wide ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
              {user?.isAdmin && (
                <Link to="/admin" className={`nav-link text-sm tracking-wide text-gold ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-300 hover:text-gold transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              {user && (
                <Link to="/wishlist" className="p-2 text-gray-300 hover:text-gold transition-colors relative" aria-label="Wishlist">
                  <Heart size={20} />
                  {user.wishlist.length > 0 && (
                    <span className="notification-dot text-[9px]">{user.wishlist.length}</span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="p-2 text-gray-300 hover:text-gold transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {count > 0 && (
                  <span className="notification-dot text-[9px]">{count}</span>
                )}
              </button>

              {/* User */}
              <Link to={user ? '/profile' : '/login'} className="p-2 text-gray-300 hover:text-gold transition-colors" aria-label="Account">
                <User size={20} />
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-300 hover:text-gold transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <form onSubmit={handleSearch} className="mt-3 flex gap-2">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search fragrances..."
                className="luxury-input flex-1 px-4 py-2.5 rounded-lg text-sm"
              />
              <button type="submit" className="btn-gold px-6 py-2.5 rounded-lg text-sm">Search</button>
            </form>
          )}
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden glass border-t border-gold/10">
            <div className="px-4 py-4 space-y-1">
              <Link to="/" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors">Home</Link>
              <Link to="/shop" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors">All Products</Link>
              <Link to="/shop?category=men" className="block px-4 py-3 text-sm pl-8 text-gray-400 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors">Men's</Link>
              <Link to="/shop?category=women" className="block px-4 py-3 text-sm pl-8 text-gray-400 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors">Women's</Link>
              <Link to="/shop?category=luxury" className="block px-4 py-3 text-sm pl-8 text-gray-400 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors">Luxury</Link>
              <Link to="/shop?category=oud" className="block px-4 py-3 text-sm pl-8 text-gray-400 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors">Oud</Link>
              <Link to="/about" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors">About</Link>
              <Link to="/contact" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors">Contact</Link>
              {user ? (
                <>
                  <Link to="/profile" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors">My Account</Link>
                  <Link to="/orders" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors">Orders</Link>
                  {user.isAdmin && <Link to="/admin" className="block px-4 py-3 text-sm text-gold rounded-lg hover:bg-gold/5 transition-colors">Admin Panel</Link>}
                </>
              ) : (
                <Link to="/login" className="block px-4 py-3 text-sm text-gray-300 hover:text-gold rounded-lg hover:bg-gold/5 transition-colors">Login / Register</Link>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}

