import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FeedbackModal from './components/FeedbackModal';
import Home from './pages/Home'; // Eager — landing page
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// ── Lazy-load all non-landing pages (code splitting) ──────────────────────
const Gallery        = lazy(() => import('./pages/Gallery'));
const ProductDetail  = lazy(() => import('./pages/ProductDetail'));
const Cart           = lazy(() => import('./pages/Cart'));
const Login          = lazy(() => import('./pages/Login'));
const Register       = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Checkout       = lazy(() => import('./pages/Checkout'));
const CustomRequest  = lazy(() => import('./pages/CustomRequest'));
const About          = lazy(() => import('./pages/About'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));
const ArtAcademy     = lazy(() => import('./pages/ArtAcademy'));

// Scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

// Minimal loading fallback — preserves layout during chunk fetch
const PageLoader = () => (
  <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{
      width: 36, height: 36,
      border: '3px solid rgba(189,0,255,0.2)',
      borderTopColor: '#bd00ff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', moveCursor, { passive: true });
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="custom-cursor" ref={cursorRef}></div>
          <Navbar />
          <main style={{ minHeight: '80vh' }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"               element={<Home />} />
                <Route path="/gallery"         element={<Gallery />} />
                <Route path="/product/:id"     element={<ProductDetail />} />
                <Route path="/cart"            element={<Cart />} />
                <Route path="/checkout"        element={<Checkout />} />
                <Route path="/custom-request"  element={<CustomRequest />} />
                <Route path="/about"           element={<About />} />
                <Route path="/login"           element={<Login />} />
                <Route path="/register"        element={<Register />} />
                <Route path="/admin"           element={<AdminDashboard />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/art-academy"     element={<ArtAcademy />} />
              </Routes>
            </Suspense>
          </main>
          <FeedbackModal />
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
