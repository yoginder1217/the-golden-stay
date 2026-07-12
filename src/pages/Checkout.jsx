import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Calendar, Users, ShieldCheck, AlertCircle, LogIn, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContextUtils';
import { saveBooking, getUserBookings } from '../lib/bookings';
import { supabase } from '../lib/supabase';

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!state?.property) {
      navigate('/properties', { replace: true });
    }
  }, []);

  const { property, checkin, checkout, guests, nights, subtotal, cleaningFee, serviceFee, total,
    weekendPremium, weekdayNights, weekendNights, weekendPrice } = state || {};

  const hasVariableRates = weekendPremium > 0 && weekendNights > 0 && weekdayNights > 0;

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Loyalty points
  const [userBookings, setUserBookings] = useState([]);
  const [usePoints, setUsePoints] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: f.name || user.user_metadata?.full_name || '',
        email: f.email || user.email || '',
      }));
      getUserBookings(user.id)
        .then(setUserBookings)
        .catch(() => {});
    }
  }, [user]);

  const availablePoints = useMemo(() =>
    userBookings.reduce((s, b) => s + Math.floor((b.total || 0) / 100) - (b.points_redeemed || 0), 0),
  [userBookings]);

  // Max redeemable: round down to nearest 100, cap at 50% of booking total
  const maxRedeemable = useMemo(() => {
    const byPoints = Math.floor(availablePoints / 100) * 100;
    const byTotal = Math.floor((total || 0) * 0.5 / 100) * 100;
    return Math.min(byPoints, byTotal);
  }, [availablePoints, total]);

  const pointsDiscount = usePoints ? maxRedeemable : 0;
  const pointsRedeemed = pointsDiscount; // 100 pts = ₹100
  const finalTotal = (total || 0) - pointsDiscount;

  if (!state?.property) return null;

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-golden/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <LogIn size={28} className="text-golden" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">Sign in to continue</h2>
          <p className="text-gray-500 text-sm mb-8">
            You need an account to complete your booking. Your selected dates and property will be waiting.
          </p>
          <Link
            to="/login"
            state={{ from: '/checkout' }}
            className="block w-full bg-golden hover:bg-golden-dark text-white font-bold py-3 rounded-xl transition mb-3"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="block w-full border border-gray-200 hover:border-golden text-gray-600 hover:text-golden font-bold py-3 rounded-xl transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

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
    const bookingRef = 'TGS-' + Date.now().toString(36).toUpperCase();

    const onSuccess = async (paymentId) => {
      try {
        await saveBooking({
          user_id: user.id,
          property_id: property.id,
          property_title: property.title,
          property_location: property.location,
          property_image: property.image,
          checkin_date: checkin,
          checkout_date: checkout,
          guests,
          nights,
          subtotal,
          cleaning_fee: cleaningFee,
          service_fee: serviceFee,
          loyalty_discount: pointsDiscount,
          points_redeemed: pointsRedeemed,
          total: finalTotal,
          guest_name: form.name,
          guest_email: form.email,
          guest_phone: form.phone,
          payment_id: paymentId,
          booking_ref: bookingRef,
          status: 'confirmed',
        });

        // Send confirmation email via Edge Function (non-blocking)
        supabase.functions.invoke('send-booking-email', {
          body: {
            guest_email: form.email,
            guest_name: form.name,
            booking_ref: bookingRef,
            property_title: property.title,
            property_location: property.location,
            checkin_date: checkin,
            checkout_date: checkout,
            guests,
            nights,
            total: finalTotal,
            loyalty_discount: pointsDiscount,
          },
        }).catch(() => {}); // fire-and-forget — don't block navigation
      } catch (err) {
        console.error('Booking save failed:', err.message);
      }

      navigate('/booking-success', {
        state: {
          property, checkin, checkout, guests, nights,
          total: finalTotal,
          guestName: form.name,
          guestEmail: form.email,
          paymentId,
          bookingId: bookingRef,
          pointsRedeemed,
        },
      });
    };

    if (window.Razorpay) {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: finalTotal * 100,
        currency: 'INR',
        name: 'The Golden Stay',
        description: `${property.title} · ${nights} ${nights === 1 ? 'night' : 'nights'}`,
        image: '/logo.png',
        handler: (response) => onSuccess(response.razorpay_payment_id),
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { booking_ref: bookingRef, property: property.title },
        theme: { color: '#D4AF37' },
        modal: { ondismiss: () => setLoading(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      onSuccess('DEMO-' + Date.now());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    openRazorpay();
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <Helmet><title>Checkout | The Golden Stay</title></Helmet>

      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-charcoal mb-2">Confirm Your Stay</h1>
        <p className="text-gray-500 mb-10">You're one step away from your golden experience.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Left: Guest Details */}
          <div className="lg:col-span-3 space-y-5">
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
                  {/* Cancellation policy summary */}
                  {checkin && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 text-xs text-gray-600 leading-relaxed">
                      <p className="font-bold text-charcoal mb-1.5">Cancellation Policy</p>
                      {(() => {
                        const daysToCheckin = Math.ceil((new Date(checkin) - new Date()) / (1000 * 60 * 60 * 24));
                        return daysToCheckin >= 7
                          ? <span><span className="text-green-600 font-bold">Free cancellation</span> until {new Date(new Date(checkin).getTime() - 7 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}. Cancel after that for a 50% refund (3–6 days out) or no refund (under 3 days).</span>
                          : daysToCheckin >= 3
                            ? <span><span className="text-yellow-600 font-bold">50% refund</span> if cancelled now. No refund within 3 days of check-in.</span>
                            : <span><span className="text-red-500 font-bold">Non-refundable.</span> Cancellations within 72 hours of check-in are not eligible for a refund.</span>;
                      })()}
                      {' '}<Link to="/refund-policy" target="_blank" className="text-golden font-bold hover:underline">Full policy →</Link>
                    </div>
                  )}

                  {/* Terms & Conditions */}
                  <label className="flex items-start gap-3 cursor-pointer mb-4 select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={e => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-golden cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 leading-relaxed">
                      I agree to The Golden Stay{' '}
                      <a href="/terms" target="_blank" className="text-golden font-bold hover:underline">Terms & Conditions</a>
                      {' '}and{' '}
                      <a href="/privacy-policy" target="_blank" className="text-golden font-bold hover:underline">Privacy Policy</a>.
                      I understand that cancellations made after check-in are non-refundable.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading || !agreedToTerms}
                    className="w-full bg-golden hover:bg-golden-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition text-lg flex items-center justify-center gap-2 shadow-lg"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <><ShieldCheck size={20} /> Pay ₹{finalTotal?.toLocaleString('en-IN')} Securely</>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} /> Secured by Razorpay · 256-bit SSL encryption
                  </p>
                </div>
              </form>
            </div>

            {/* Loyalty Points Card */}
            {availablePoints >= 100 && (
              <div className={`bg-white rounded-2xl shadow-sm border p-5 transition ${usePoints ? 'border-golden/50 bg-golden/5' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-golden/10 flex items-center justify-center">
                      <Award size={20} className="text-golden" />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal text-sm">Use Golden Points</p>
                      <p className="text-gray-500 text-xs">You have <strong>{availablePoints}</strong> pts — redeem <strong>{maxRedeemable}</strong> for <strong>₹{maxRedeemable} off</strong></p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUsePoints(p => !p)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${usePoints ? 'bg-golden' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${usePoints ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {usePoints && (
                  <p className="text-green-600 text-xs font-bold mt-3 flex items-center gap-1">
                    ✓ ₹{pointsDiscount} discount applied — {pointsRedeemed} points will be deducted
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <img src={property.image} alt={property.title} className="w-full h-40 object-cover rounded-xl mb-5" />
              <h3 className="text-lg font-bold text-charcoal mb-1">{property.title}</h3>
              <p className="text-gray-500 text-sm flex items-center gap-1 mb-5">
                <MapPin size={14} className="text-golden" /> {property.location}
              </p>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <Calendar size={16} className="text-golden shrink-0" />
                  <div>
                    <p className="font-bold text-charcoal">{formatDate(checkin)} → {formatDate(checkout)}</p>
                    <p className="text-gray-400">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <Users size={16} className="text-golden shrink-0" />
                  <span className="font-medium text-gray-600">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                {hasVariableRates ? (
                  <>
                    {weekdayNights > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>₹{property.price?.toLocaleString('en-IN')} × {weekdayNights} weekday {weekdayNights === 1 ? 'night' : 'nights'}</span>
                        <span>₹{(weekdayNights * property.price).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {weekendNights > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>₹{weekendPrice?.toLocaleString('en-IN')} × {weekendNights} weekend {weekendNights === 1 ? 'night' : 'nights'}</span>
                        <span>₹{(weekendNights * weekendPrice).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between text-gray-600">
                    <span>₹{property.price?.toLocaleString('en-IN')} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                    <span>₹{subtotal?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Cleaning fee</span><span>₹{cleaningFee}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service fee</span><span>₹{serviceFee}</span>
                </div>
                {usePoints && pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Points discount ({pointsRedeemed} pts)</span>
                    <span>- ₹{pointsDiscount}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-charcoal text-lg mt-4 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span className={usePoints && pointsDiscount > 0 ? 'text-golden' : ''}>
                  ₹{finalTotal?.toLocaleString('en-IN')}
                </span>
              </div>
              {usePoints && pointsDiscount > 0 && (
                <p className="text-gray-400 text-xs text-right mt-1 line-through">
                  ₹{total?.toLocaleString('en-IN')}
                </p>
              )}

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
