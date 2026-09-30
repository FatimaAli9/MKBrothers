import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SignupPage from './pages/SignupPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { useStore } from './store/useStore';

function NotFoundPage() {
  return (
    <div className="pt-[104px] min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">404</div>
      <h1 className="font-display text-4xl font-bold gold-text mb-3">Page Not Found</h1>
      <p className="text-gray-400 text-sm mb-6 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="btn-gold px-8 py-3 rounded-full text-sm font-semibold">Return Home</a>
    </div>
  );
}

function PrivacyPage() {
  return (
    <div className="pt-[104px] min-h-screen py-12 sm:py-16 max-w-3xl mx-auto px-4">
    <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">Privacy Policy</h1>
    <div className="space-y-6 text-gray-300 text-sm leading-relaxed luxury-card rounded-2xl p-5 sm:p-8">
        <div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Information We Collect</h2>
          <p>We collect information you provide directly to us, including name, email, phone number, and delivery address when you create an account or place an order.</p>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">How We Use Your Information</h2>
          <p>We use the information to process orders, communicate with you, and improve our services. We do not sell your personal information to third parties.</p>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access or disclosure.</p>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at hafizmuddassir46@gmail.com</p>
        </div>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useStore(state => state.user);
  const authReady = useStore(state => state.authReady);
  const location = useLocation();

  if (!authReady) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const user = useStore(state => state.user);
  const authReady = useStore(state => state.authReady);
  const location = useLocation();

  if (!authReady) return null;

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== 'admin' || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const initAuth = useStore(state => state.initAuth);
  const fetchProducts = useStore(state => state.fetchProducts);

  useEffect(() => {
    void initAuth();
    void fetchProducts();
  }, [initAuth, fetchProducts]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-ink">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
            <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
            <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin/*" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
            <Route path="/dashboard/*" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#1f1a14',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}
