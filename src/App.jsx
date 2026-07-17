import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { SiteContentProvider } from './context/SiteContentContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Checkout from './pages/Checkout';
import BookingSuccess from './pages/BookingSuccess';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerPortal from './pages/OwnerPortal';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import RefundPolicy from './pages/RefundPolicy';
import Rewards from './pages/Rewards';

function RoutedMain() {
  const location = useLocation();
  return (
    <main className="flex-grow">
      <ErrorBoundary key={location.pathname}>
        <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />

              {/* Semi-protected: accessible but guards itself via useEffect */}
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/booking-success" element={<BookingSuccess />} />

              {/* Protected routes — require login */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/owner" element={
                <ProtectedRoute>
                  <OwnerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/owner-portal" element={
                <ProtectedRoute>
                  <OwnerPortal />
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/rewards" element={
                <ProtectedRoute>
                  <Rewards />
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
        </ErrorBoundary>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <SiteContentProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen font-sans text-charcoal relative">
          <Navbar />
          <RoutedMain />
          <Footer />
          <WhatsAppButton />
        </div>
      </Router>
      </SiteContentProvider>
    </AuthProvider>
  );
}

export default App;
