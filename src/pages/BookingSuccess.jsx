import React, { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Calendar, Users, Hash, CreditCard, Home, Printer, Receipt } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useReactToPrint } from 'react-to-print';
import BookingInvoice from '../components/BookingInvoice';

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

const getGSTRate = (subtotal, nights) => {
  if (!subtotal || !nights) return 0;
  const perNight = subtotal / nights;
  return perNight > 7500 ? 18 : perNight > 1000 ? 12 : 0;
};

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef: invoiceRef });

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

  const {
    property, checkin, checkout, guests, nights, total,
    guestName, guestEmail, paymentId, bookingId,
    pointsRedeemed, subtotal, cleaningFee, serviceFee,
    promoDiscount, promoCode, loyaltyDiscount, addonsTotal, addonsData,
  } = state;

  const gstRate = getGSTRate(subtotal, nights);
  const baseAccommodation = gstRate ? Math.round(subtotal / (1 + gstRate / 100)) : subtotal;
  const gstAmount = gstRate ? subtotal - baseAccommodation : 0;

  // Build booking object for the printable invoice
  const bookingForInvoice = {
    booking_ref: bookingId,
    created_at: new Date().toISOString(),
    status: 'confirmed',
    property_title: property.title,
    property_location: property.location,
    guest_name: guestName,
    guest_email: guestEmail,
    checkin_date: checkin,
    checkout_date: checkout,
    guests,
    nights,
    subtotal: subtotal || 0,
    cleaning_fee: cleaningFee || 0,
    service_fee: serviceFee || 0,
    loyalty_discount: loyaltyDiscount || 0,
    promo_discount: promoDiscount || 0,
    promo_code: promoCode || null,
    addons_data: addonsData || '[]',
    addons_total: addonsTotal || 0,
    total,
    payment_id: paymentId,
  };

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

      {/* Hidden invoice for printing */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <BookingInvoice ref={invoiceRef} booking={bookingForInvoice} />
      </div>

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

            {/* GST Breakdown */}
            {gstRate > 0 && (
              <div className="mt-6 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt size={14} className="text-golden" />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tax Breakdown (GST)</p>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Accommodation (excl. GST)</span>
                    <span>₹{baseAccommodation?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST @ {gstRate}% (SAC 9963)</span>
                    <span>₹{gstAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  {cleaningFee > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Cleaning Fee</span>
                      <span>₹{Number(cleaningFee).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {serviceFee > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Service Fee</span>
                      <span>₹{Number(serviceFee).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-charcoal pt-2 border-t border-gray-200 mt-1">
                    <span>Total Paid</span>
                    <span className="text-golden">₹{total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Property Image */}
            <div className="mt-6 rounded-xl overflow-hidden">
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
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 border border-golden text-golden hover:bg-golden hover:text-white font-bold py-3 rounded-xl transition"
              >
                <Printer size={16} /> Download Invoice
              </button>
            </div>
            <Link
              to="/"
              className="block text-center text-gray-400 hover:text-golden text-sm font-medium mt-4 transition flex items-center justify-center gap-2"
            >
              <Home size={14} /> Return Home
            </Link>
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
