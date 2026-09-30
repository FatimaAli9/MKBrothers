import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Thank you for subscribing!', { className: 'toast-luxury', icon: '✨' });
      setEmail('');
    }
  };

  return (
    <footer className="bg-ink border-t border-gold/20 mt-20">
      {/* Newsletter */}
      <div className="border-b border-gold/10 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Exclusive Offers</p>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">Join Our Fragrance Circle</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Subscribe to receive exclusive offers, new arrivals, and fragrance stories delivered to your inbox.
          </p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="luxury-input flex-1 px-4 py-3 rounded-lg text-sm"
              required
            />
            <button type="submit" className="btn-gold px-6 py-3 rounded-lg text-sm flex items-center justify-center gap-2">
              <Send size={15} /> Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-bold text-sm font-display">MK</div>
            <div>
              <div className="font-display text-xl font-bold gold-text">MK Brothers</div>
              <div className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">Perfume</div>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Founded in 2026, our mission is to make luxury fragrances accessible to every connoisseur.
          </p>
          <div className="flex items-center gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors text-sm">
              📸
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors text-sm">
              📘
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors text-sm">
              🐦
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display text-base font-semibold text-white mb-4 pb-2 border-b border-gold/20">Quick Links</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Home', to: '/' },
              { label: 'Shop All', to: '/shop' },
              { label: "Men's Collection", to: '/shop?category=men' },
              { label: "Women's Collection", to: '/shop?category=women' },
              { label: 'Oud Collection', to: '/shop?category=oud' },
              { label: 'Luxury Collection', to: '/shop?category=luxury' },
            ].map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-gray-400 hover:text-gold text-sm transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-display text-base font-semibold text-white mb-4 pb-2 border-b border-gold/20">Customer Support</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'About Us', to: '/about' },
              { label: 'Contact Us', to: '/contact' },
              { label: 'My Account', to: '/profile' },
              { label: 'Order History', to: '/orders' },
              { label: 'Wishlist', to: '/wishlist' },
              { label: 'Privacy Policy', to: '/privacy' },
            ].map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-gray-400 hover:text-gold text-sm transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display text-base font-semibold text-white mb-4 pb-2 border-b border-gold/20">Get In Touch</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-gold flex-shrink-0 mt-0.5" />
              <span className="text-gray-400 text-sm">MC 1441 Azeem Pura Main Stop<br />(Rehmat Boot House) Shah Faisal Colony<br />Pakistan</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-gold flex-shrink-0" />
              <a href="tel:+923282681830" className="text-gray-400 hover:text-gold text-sm transition-colors">+92 328 2681830</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-gold flex-shrink-0" />
              <a href="mailto:hafizmuddassir46@gmail.com" className="text-gray-400 hover:text-gold text-sm transition-colors break-all">hafizmuddassir46@gmail.com</a>
            </li>
          </ul>

          {/* Payment badges */}
          <div className="mt-5">
            <p className="text-gray-600 text-xs mb-2">Payment Method</p>
            <div className="flex items-center gap-2">
              <div className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-400 flex items-center gap-1">
                💵 Cash on Delivery
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gold/10 py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} MK Brothers Perfume. All rights reserved.</p>
          <p className="text-gray-700 text-xs">Crafted with ❤️ for fragrance lovers</p>
        </div>
      </div>
    </footer>
  );
}
