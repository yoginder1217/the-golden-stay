import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Calendar, Users, Hash, CreditCard, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <CheckCircle size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-charcoal mb-2">No booking found</h2>
        <p className="text-gray-500 mb-6">This page is only accessible after completing a booking.</p>
        <Link to="/properties" className="bg-golden text-white px-8 py-3 rounded-full font-bold">
          Browse Properties
        </Link>
      </div>
    );
  }

  const { property, checkin, checkout, guests, nights, total, guestName, guestEmail, paymentId, bookingId } = state;

  const summaryItems = [
    { icon: Hash, label: 'Booking ID', value: bookingId },
    { icon: MapPin, label: 'Property', value: `${property.title}, ${property.location}` },
    { icon: Calendar, label: 'Check-in', value: formatDate(checkin) },
    { icon: Calendar, label: 'Check-out', value: formatDate(checkout) },
    { icon: Users, label: 'Guests', value: `${guests} ${guests === 1 ? 'guest' : 'guests'} · ${nights} ${nights === 1 ? 'night' : 'nights'}` },
    { icon: CreditCard, label: 'Amount Paid', value: `₹${total?.toLocaleString('en-IN')}` },
    { icon: Hash, label: 'Payment ID', value: paymentId },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <Helmet>
        <title>Booking Confirmed | The Golden Stay</title>
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Green Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-10 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle size={72} className="mx-auto mb-4" strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-3xl font-bold mb-1">Booking Confirmed!</h1>
            <p className="text-green-100 text-sm">
              A confirmation has been sent to <strong>{guestEmail}</strong>
            </p>
          </div>

          {/* Summary Body */}
          <div className="p-8">
            <h2 className="text-lg font-bold text-charcoal mb-6">Booking Summary</h2>

            <div className="space-y-4">
              {summaryItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="p-2 bg-golden/10 rounded-lg text-golden shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-semibold text-charcoal break-all">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Property Image */}
            <div className="mt-8 rounded-xl overflow-hidden">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-44 object-cover"
              />
            </div>

            {/* WhatsApp Note */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <p className="font-bold mb-1">What happens next?</p>
              <p>Our team will contact you on WhatsApp within 2 hours to share check-in instructions and property access details. Please keep your mobile available.</p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                to="/dashboard"
                className="flex-1 text-center bg-charcoal hover:bg-black text-white font-bold py-3 rounded-xl transition"
              >
                View My Bookings
              </Link>
              <Link
                to="/"
                className="flex-1 text-center border border-gray-200 hover:border-golden text-gray-600 hover:text-golden font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Home size={16} /> Return Home
              </Link>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Need help? WhatsApp us at <strong>+91 79839 14058</strong>
        </p>
      </div>
    </div>
  );
};

export default BookingSuccess;
