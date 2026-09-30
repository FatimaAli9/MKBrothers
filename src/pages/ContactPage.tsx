import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || 'Not provided'}`,
      '',
      form.message,
    ].join('\n');
    window.location.href = `mailto:hafizmuddassir46@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`;
    setLoading(false);
    toast.success('Email draft opened.', { className: 'toast-luxury' });
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };
  return (
    <div className="pt-[104px]">
      {/* Hero */}
      <section className="py-16 text-center">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Get in Touch</p>
        <h1 className="font-display text-5xl font-bold text-white mb-3">Contact Us</h1>
        <p className="text-gray-400 text-base max-w-lg mx-auto">
          Have a question about a fragrance? Need help with your order? Our team is here to assist you.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-4">
            {[
              {
                icon: <MapPin size={22} className="text-gold" />,
                title: 'Visit Our Store',
                lines: ['MC 1441 Azeem Pura Main Stop', '(Rehmat Boot House) Shah Faisal Colony', 'Pakistan']
              },
              {
                icon: <Phone size={22} className="text-gold" />,
                title: 'Call Us',
                lines: ['+92 328 2681830', 'Mon-Sat, 9am-9pm']
              },
              {
                icon: <Mail size={22} className="text-gold" />,
                title: 'Email Us',
                lines: ['hafizmuddassir46@gmail.com', 'We respond within 24hrs']
              },
              {
                icon: <Clock size={22} className="text-gold" />,
                title: 'Business Hours',
                lines: ['Mon-Sat: 9:00 AM-9:00 PM', 'Sunday: Closed', 'Holidays: Closed']
              },
            ].map((card, i) => (
              <div key={i} className="luxury-card rounded-2xl p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{card.title}</h3>
                  {card.lines.map((line, j) => (
                    <p key={j} className="text-gray-400 text-xs">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Social */}
            <div className="luxury-card rounded-2xl p-5">
              <h3 className="font-semibold text-white text-sm mb-3">Follow Us</h3>
              <div className="flex gap-2">
                {[
                  { icon: '📸', label: 'Instagram' },
                  { icon: '📘', label: 'Facebook' },
                  { icon: '🐦', label: 'Twitter' },
                ].map(s => (
                  <button key={s.label} className="flex-1 py-2 rounded-lg border border-gold/20 text-xs text-gray-400 hover:text-gold hover:border-gold/50 transition-colors">
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 luxury-card rounded-2xl p-6">
            <h2 className="font-display text-2xl font-semibold text-white mb-5">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your name" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Email Address *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="your@email.com" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92 300 xxxxxxx" className="luxury-input w-full px-4 py-3 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Subject *</label>
                  <select value={form.subject} onChange={e => set('subject', e.target.value)} required className="luxury-select w-full px-4 py-3 rounded-xl text-sm">
                    <option value="">Select a subject</option>
                    <option>Order Inquiry</option>
                    <option>Product Question</option>
                    <option>Return / Refund</option>
                    <option>Wholesale Inquiry</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Message *</label>
                <textarea
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  required
                  placeholder="How can we help you? Please provide as much detail as possible..."
                  rows={6}
                  className="luxury-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <><Send size={16} /> Send Message</>
                )}
              </button>
            </form>

            {/* FAQ */}
            <div className="mt-6 pt-6 border-t border-gold/15">
              <h3 className="font-display text-base font-semibold text-white mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {[
                  { q: 'Do you offer Cash on Delivery?', a: 'Yes! We offer COD across all major cities in Pakistan.' },
                  { q: 'How long does delivery take?', a: 'Typically 2-5 business days depending on your location.' },
                  { q: 'Are all your products authentic?', a: 'Absolutely. We guarantee 100% authenticity on all products.' },
                ].map((faq, i) => (
                  <div key={i} className="bg-gray-900/50 rounded-xl p-3.5">
                    <p className="text-white text-sm font-semibold mb-1">Q: {faq.q}</p>
                    <p className="text-gray-400 text-xs">A: {faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


