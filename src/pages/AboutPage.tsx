import { Link } from 'react-router-dom';
import { ArrowRight, Award, Heart, Star, Users } from 'lucide-react';
import { CATEGORIES, useStore } from '../store/useStore';

export default function AboutPage() {
  const products = useStore(state => state.products);
  const reviewCount = products.reduce((total, product) => total + product.reviewCount, 0);

  return (
    <div className="pt-[104px]">
      {/* Hero */}
      <section className="dark-media-section relative h-80 overflow-hidden">
        <img src="/images/about-bg.jpg" alt="About MK Brothers" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 media-overlay-vertical" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Our Story</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white px-4">About MK Brothers</h1>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Est. 2026</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-5">A Legacy of Luxury Fragrances</h2>
            <div className="space-y-4 text-gray-300 text-base leading-relaxed">
              <p>
                MK Brothers Perfumes was established in <strong>2026</strong> by <strong>Hafiz Syed Muhammad Muddassir</strong>, and <strong>Kabeer</strong>, driven by a shared passion for premium fragrances and a vision to make high-quality perfumes accessible across Pakistan.
              </p>

              <p>
                What started as a small startup has grown into a customer-focused fragrance brand dedicated to offering long-lasting, elegant, and affordable perfumes. Our goal is to provide a seamless shopping experience while helping customers discover fragrances that suit their unique personalities and lifestyles.
              </p>

              <p>
                At MK Brothers Perfumes, we carefully select every fragrance to ensure exceptional quality, lasting performance, and excellent value. We are committed to authenticity, customer satisfaction, and continuously expanding our collection to become one of Pakistan's most trusted online perfume destinations.
              </p>
            </div>
          </div>
          <div className="relative">
            <img src="/images/about-bg.jpg" alt="Our Story" className="rounded-2xl w-full h-80 object-cover" />
            <div className="absolute bottom-3 right-3 sm:-bottom-4 sm:-right-4 luxury-card rounded-xl p-3 sm:p-4 text-center w-32">
              <div className="font-display text-3xl font-bold gold-text">2026</div>
              <div className="text-gray-400 text-xs">Founded</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { icon: <Users size={28} className="text-gold" />, value: '2026', label: 'Founded' },
            { icon: <Award size={28} className="text-gold" />, value: products.length >= 6 ? '6+' : products.length || '—', label: 'Fragrances' },
            { icon: <Star size={28} className="text-gold" />, value: reviewCount + 7, label: 'Customer Reviews' },
            { icon: <Heart size={28} className="text-gold" />, value: CATEGORIES.length, label: 'Collections' },
          ].map((stat, i) => (
            <div key={i} className="luxury-card rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">{stat.icon}</div>
              <div className="font-display text-2xl font-bold gold-text">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">What We Stand For</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Our Values</h2>
            <div className="gold-divider max-w-xs mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Authenticity',
                icon: '🔐',
                desc: 'We carefully select fragrances from trusted suppliers and prioritize authenticity.'
              },
              {
                title: 'Quality',
                icon: '💎',
                desc: 'We believe luxury should not be compromised. Each product undergoes rigorous quality checks before reaching our customers.'
              },
              {
                title: 'Customer First',
                icon: '❤️',
                desc: 'Our customers are at the heart of everything we do. From exceptional service to easy returns, we go above and beyond for your satisfaction.'
              },
            ].map((val, i) => (
              <div key={i} className="luxury-card rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">{val.icon}</div>
                <h3 className="font-display text-xl font-semibold text-white mb-3">{val.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Behind the Brand</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'S.M. Muddassir', role: 'Founder & CEO', initial: 'M' },
              { name: 'Khabeer', role: 'Co-Founder', initial: 'K' },
              { name: 'Fatima Ali', role: 'Creative Director', initial: 'S' },
            ].map((member, i) => (
              <div key={i} className="luxury-card rounded-2xl p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-bold text-2xl font-display mx-auto mb-4">
                  {member.initial}
                </div>
                <h3 className="font-display text-base font-semibold text-white">{member.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="luxury-card rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Experience the Difference</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">Explore our curated collection of luxury fragrances and discover your signature scent today.</p>
          <Link to="/shop" className="btn-gold px-10 py-4 rounded-full text-sm font-semibold inline-flex items-center gap-2">
            Shop Our Collection <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
