import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen font-sans text-charcoal relative">
          <Navbar />

          <main className="flex-grow">
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

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
          <WhatsAppButton />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
