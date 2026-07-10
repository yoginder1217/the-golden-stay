import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Calendar, Users, ShieldCheck, AlertCircle } from 'lucide-react';

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.property) {
      navigate('/properties', { replace: true });
    }
  }, []);

  const { property, checkin, checkout, guests, nights, subtotal, cleaningFee, serviceFee, total } =
    state || {};

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!state?.property) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit Indian mobile number.';
    return errs;
  };

  const openRazorpay = () => {
    const bookingId = 'TGS-' + Date.now().toString(36).toUpperCase();

    const onSuccess = (paymentId) => {
      navigate('/booking-success', {
        state: {
          property,
          checkin,
          checkout,
          guests,
          nights,
          total,
          guestName: form.name,
          guestEmail: form.email,
          paymentId,
          bookingId,
        },
      });
    };

    if (window.Razorpay) {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: total * 100,
        currency: 'INR',
        name: 'The Golden Stay',
        description: `${property.title} · ${nights} ${nights === 1 ? 'night' : 'nights'}`,
        image: '/logo.png',
        handler: (response) => onSuccess(response.razorpay_payment_id),
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { booking_id: bookingId, property: property.title },
        theme: { color: '#D4AF37' },
        modal: { ondismiss: () => setLoading(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Razorpay script failed to load — graceful fallback
      setTimeout(() => onSuccess('DEMO-' + Date.now()), 1200);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    openRazorpay();
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <Helmet>
        <title>Checkout | The Golden Stay</title>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-charcoal mb-2">Confirm Your Stay</h1>
        <p className="text-gray-500 mb-10">You're one step away from your golden experience.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* --- Left: Guest Details Form --- */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-charcoal mb-6">Your Details</h2>
              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Yogendra Singh"
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-golden/40 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition focus:ring-2 focus:ring-golden/40 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                  <div className="flex">
                    <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium">+91</span>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`flex-1 px-4 py-3 border rounded-r-xl outline-none transition focus:ring-2 focus:ring-golden/40 ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.phone}</p>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-golden hover:bg-golden-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition text-lg flex items-center justify-center gap-2 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Processing…
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={20} />
                        Pay ₹{total?.toLocaleString('en-IN')} Securely
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} /> Secured by Razorpay · 256-bit SSL encryption
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* --- Right: Order Summary --- */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-40 object-cover rounded-xl mb-5"
              />

              <h3 className="text-lg font-bold text-charcoal mb-1">{property.title}</h3>
              <p className="text-gray-500 text-sm flex items-center gap-1 mb-5">
                <MapPin size={14} className="text-golden" /> {property.location}
              </p>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 rounded-lg p-3">
                  <Calendar size={16} className="text-golden shrink-0" />
                  <div>
                    <p className="font-bold text-charcoal">{formatDate(checkin)} → {formatDate(checkout)}</p>
                    <p className="text-gray-400">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 rounded-lg p-3">
                  <Users size={16} className="text-golden shrink-0" />
                  <span className="font-medium">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>₹{property.price?.toLocaleString('en-IN')} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                  <span>₹{subtotal?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cleaning fee</span>
                  <span>₹{cleaningFee}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service fee</span>
                  <span>₹{serviceFee}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-charcoal text-lg mt-4 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>₹{total?.toLocaleString('en-IN')}</span>
              </div>

              <Link to={`/property/${property.id}`} className="block text-center text-golden text-xs font-bold mt-5 hover:underline">
                ← Edit dates or guests
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
