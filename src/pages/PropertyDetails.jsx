import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPropertyById, getProperties } from '../lib/properties';
import { calculateDynamicPricing } from '../lib/pricing';
import { Wifi, Home, Star, MapPin, CheckCircle, ExternalLink, ArrowRight, Users, Calendar, MessageSquare, LogIn, Share2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getPropertyQA, askQuestion } from '../lib/qa';
import { Helmet } from 'react-helmet-async';
import WishlistButton from '../components/WishlistButton';
import { StarPicker, StarDisplay } from '../components/StarRating';
import { getPropertyReviews, submitReview } from '../lib/reviews';
import { useAuth } from '../context/AuthContextUtils';
import { getPropertyAvailability, hasDateConflict, getBlockedDates, hasBlockedConflict } from '../lib/availability';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

const CLEANING_FEE = 500;
const SERVICE_FEE = 300;

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [propLoading, setPropLoading] = useState(true);
  const [similarProperties, setSimilarProperties] = useState([]);

  useEffect(() => {
    setPropLoading(true);
    getPropertyById(parseInt(id, 10))
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setPropLoading(false));
  }, [id]);

  // Track recently viewed + load similar properties
  useEffect(() => {
    if (!property) return;
    // Recently viewed tracking
    try {
      const prev = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const updated = [property.id, ...prev.filter(x => x !== property.id)].slice(0, 5);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch {}
    // Similar properties from same city
    getProperties().then(all => {
      const similar = all.filter(p => p.id !== property.id && p.city === property.city).slice(0, 3);
      setSimilarProperties(similar.length >= 2 ? similar : all.filter(p => p.id !== property.id).slice(0, 3));
    }).catch(() => {});
  }, [property]);

  const today = new Date().toISOString().split('T')[0];

  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('2');
  const [dateError, setDateError] = useState('');

  // Availability (booked) + blocked dates
  const [availability, setAvailability] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  useEffect(() => {
    if (property?.id) {
      getPropertyAvailability(property.id).then(setAvailability).catch(() => {});
      getBlockedDates(property.id).then(setBlockedDates).catch(() => {});
    }
  }, [property?.id]);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Q&A state
  const [qaList, setQaList] = useState([]);
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaSubmitting, setQaSubmitting] = useState(false);
  const [qaError, setQaError] = useState('');
  const [qaSuccess, setQaSuccess] = useState(false);
  const [showAllQA, setShowAllQA] = useState(false);

  useEffect(() => {
    if (property?.id) {
      getPropertyReviews(property.id)
        .then(setReviews)
        .catch(() => {})
        .finally(() => setReviewsLoading(false));
      getPropertyQA(property.id).then(setQaList).catch(() => {});
    }
  }, [property?.id]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const minCheckout = checkin
    ? new Date(new Date(checkin).getTime() + 86400000).toISOString().split('T')[0]
    : today;

  const nights =
    checkin && checkout
      ? Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)))
      : 0;

  const dynamicPricing = property
    ? calculateDynamicPricing(property.price, checkin, checkout, property.weekend_premium || 0)
    : { subtotal: 0, weekdayNights: 0, weekendNights: 0, weekdayPrice: 0, weekendPrice: 0, hasVariableRates: false };
  const subtotal = dynamicPricing.subtotal;
  const total = subtotal + CLEANING_FEE + SERVICE_FEE;

  const handleCheckinChange = (e) => {
    setCheckin(e.target.value);
    setCheckout('');
    setDateError('');
  };

  const handleCheckoutChange = (e) => {
    setCheckout(e.target.value);
    setDateError('');
  };

  const handleCalendarSelect = (iso) => {
    setDateError('');
    if (!checkin || (checkin && checkout)) {
      setCheckin(iso);
      setCheckout('');
    } else if (iso > checkin) {
      setCheckout(iso);
    } else {
      setCheckin(iso);
      setCheckout('');
    }
  };

  const handleBookDirect = () => {
    if (!checkin || !checkout) {
      setDateError('Please select your check-in and check-out dates to continue.');
      return;
    }
    if (hasDateConflict(availability, checkin, checkout)) {
      setDateError('Sorry, this property is already booked for those dates. Please choose different dates.');
      return;
    }
    if (hasBlockedConflict(blockedDates, checkin, checkout)) {
      setDateError('This property is unavailable for the selected dates. Please choose different dates.');
      return;
    }
    navigate('/checkout', {
      state: {
        property, checkin, checkout,
        guests: parseInt(guests, 10),
        nights, subtotal,
        cleaningFee: CLEANING_FEE,
        serviceFee: SERVICE_FEE,
        total,
        weekendPremium: property.weekend_premium || 0,
        weekdayNights: dynamicPricing.weekdayNights,
        weekendNights: dynamicPricing.weekendNights,
        weekendPrice: dynamicPricing.weekendPrice,
      },
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) { setReviewError('Please select a star rating.'); return; }
    if (!reviewForm.comment.trim()) { setReviewError('Please write a comment.'); return; }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const newReview = await submitReview({
        user_id: user.id,
        property_id: property.id,
        property_title: property.title,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        reviewer_name: user.user_metadata?.full_name || user.email.split('@')[0],
      });
      setReviews(prev => [newReview, ...prev]);
      setReviewForm({ rating: 0, comment: '' });
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (propLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-golden" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-2">Property not found</h2>
          <button onClick={() => navigate('/properties')} className="text-golden font-bold underline">
            Browse all properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Helmet>
        <title>{property.title} | The Golden Stay</title>
        <meta name="description" content={property.description} />
        <link rel="canonical" href={`https://the-golden-stay.vercel.app/property/${property.id}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://the-golden-stay.vercel.app/property/${property.id}`} />
        <meta property="og:title" content={`${property.title} | The Golden Stay`} />
        <meta property="og:description" content={property.description} />
        <meta property="og:image" content={property.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${property.title} | The Golden Stay`} />
        <meta name="twitter:description" content={property.description} />
        <meta name="twitter:image" content={property.image} />
      </Helmet>

      {/* Image Gallery */}
      {(() => {
        const imgs = (property.images && property.images.length > 0)
          ? property.images
          : [
              property.image,
              'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=600',
            ];
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 h-[50vh] md:h-[60vh] gap-1 md:gap-2 p-1 md:p-2"
          >
            <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-xl relative">
              <img src={imgs[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt={property.title} loading="eager" />
              <WishlistButton property={property} className="absolute top-3 left-3" />
            </div>
            {[1, 2, 3, 4].map((idx) => imgs[idx] && (
              <div key={idx} className={`overflow-hidden rounded-xl hidden md:block ${idx === 4 ? 'relative' : ''}`}>
                <img src={imgs[idx]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt={`Photo ${idx + 1}`} loading="lazy" />
                {idx === 4 && imgs.length > 5 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-bold border border-white px-4 py-2 rounded-full backdrop-blur-sm text-sm">
                      +{imgs.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        );
      })()}

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-16">

        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-2"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-charcoal mb-2 font-serif">{property.title}</h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-500 flex items-center gap-2">
                  <MapPin size={18} className="text-golden" /> {property.location} • {property.type}
                </p>
                <a
                  href={`https://wa.me/?text=Check out this property on The Golden Stay: ${property.title} in ${property.location} — ₹${property.price.toLocaleString('en-IN')}/night. ${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-green-600 border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-50 transition"
                >
                  <Share2 size={12} /> Share on WhatsApp
                </a>
              </div>
            </div>
            <div className="text-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shrink-0">
              <span className="text-2xl font-bold text-charcoal flex items-center gap-1 justify-center">
                {avgRating ?? property.rating} <Star size={20} className="fill-golden text-golden" />
              </span>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {reviews.length > 0 ? `${reviews.length} review${reviews.length !== 1 ? 's' : ''}` : 'Rating'}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-gray-200 my-8" />

          <h2 className="text-2xl font-bold mb-6 font-serif">About this Homestay</h2>
          <p className="text-gray-600 leading-loose mb-10 text-lg">
            {property.description} Experience true hospitality with our premium bedding, soundproof windows, and a dedicated workspace. Perfect for families looking to disconnect from the chaos and reconnect with each other.
          </p>

          <h2 className="text-2xl font-bold mb-6 font-serif">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {property.amenities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 text-gray-700 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-golden/30 transition">
                <div className="p-2 bg-white rounded-full text-golden shadow-sm"><Home size={20} /></div>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>

          {/* Location Map */}
          <div className="border-t border-gray-100 pt-10 mb-10">
            <h2 className="text-2xl font-bold mb-5 font-serif flex items-center gap-2">
              <MapPin size={22} className="text-golden" /> Location
            </h2>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <iframe
                title="Property Location Map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location + ', India')}&output=embed&z=14`}
                className="w-full h-72 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <MapPin size={11} /> {property.location} — exact address shared after booking confirmation
            </p>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-gray-100 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold font-serif">Guest Reviews</h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <StarDisplay rating={parseFloat(avgRating)} size={16} />
                  <span className="text-gray-500 text-sm font-medium">{avgRating} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
                </div>
              )}
            </div>

            {/* Existing reviews */}
            {reviewsLoading ? (
              <p className="text-gray-400 text-sm">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-400 text-sm mb-8">No reviews yet. Be the first to share your experience!</p>
            ) : (
              <div className="space-y-5 mb-10">
                {reviews.map(r => (
                  <div key={r.id} className="bg-gray-50 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-golden text-white flex items-center justify-center font-bold text-sm">
                          {r.reviewer_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-charcoal text-sm">{r.reviewer_name}</p>
                          <p className="text-gray-400 text-xs">{formatDate(r.created_at)}</p>
                        </div>
                      </div>
                      <StarDisplay rating={r.rating} size={14} />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mt-3">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Leave a Review */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-golden" /> Leave a Review
              </h3>

              {!user ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">Sign in to share your experience.</p>
                  <Link
                    to="/login"
                    state={{ from: `/property/${property.id}` }}
                    className="inline-flex items-center gap-2 bg-golden hover:bg-golden-dark text-white font-bold px-5 py-2.5 rounded-xl transition text-sm"
                  >
                    <LogIn size={15} /> Sign In to Review
                  </Link>
                </div>
              ) : reviewSuccess ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-bold py-3">
                  <CheckCircle size={18} /> Review submitted — thank you!
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Your rating</p>
                    <StarPicker value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Your review</p>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder="Share what you loved about your stay…"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-golden/40"
                    />
                  </div>
                  {reviewError && <p className="text-red-500 text-xs">{reviewError}</p>}
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-golden hover:bg-golden-dark disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm flex items-center gap-2"
                  >
                    {reviewSubmitting ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : <MessageSquare size={14} />}
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
          {/* Q&A Section */}
          <div className="border-t border-gray-100 pt-10 mt-4">
            <h2 className="text-2xl font-bold font-serif mb-6 flex items-center gap-2">
              <HelpCircle size={20} className="text-golden" /> Questions & Answers
            </h2>

            {/* Existing Q&A */}
            {qaList.length > 0 && (
              <div className="space-y-4 mb-6">
                {(showAllQA ? qaList : qaList.slice(0, 3)).map(q => (
                  <div key={q.id} className="bg-gray-50 rounded-2xl p-5">
                    <p className="font-bold text-charcoal text-sm mb-1">Q: {q.question}</p>
                    <p className="text-xs text-gray-400 mb-2">Asked by {q.asker_name || 'Guest'} · {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    {q.answer ? (
                      <div className="border-l-2 border-golden pl-3 mt-2">
                        <p className="text-sm text-gray-700">{q.answer}</p>
                        <p className="text-xs text-golden font-bold mt-1">— The Golden Stay Team</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic mt-1">Answer pending…</p>
                    )}
                  </div>
                ))}
                {qaList.length > 3 && (
                  <button onClick={() => setShowAllQA(v => !v)}
                    className="flex items-center gap-1 text-sm text-golden font-bold hover:underline">
                    {showAllQA ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show all {qaList.length} questions</>}
                  </button>
                )}
              </div>
            )}

            {/* Ask a question */}
            {!user ? (
              <p className="text-sm text-gray-400">
                <Link to="/login" className="text-golden font-bold hover:underline">Sign in</Link> to ask a question.
              </p>
            ) : qaSuccess ? (
              <p className="text-green-600 text-sm font-bold flex items-center gap-2">
                <CheckCircle size={16} /> Question submitted! Our team will answer shortly.
              </p>
            ) : (
              <div className="flex gap-3">
                <input
                  value={qaQuestion}
                  onChange={e => { setQaQuestion(e.target.value); setQaError(''); }}
                  placeholder="Ask something about this property…"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-golden/30"
                />
                <button
                  disabled={qaSubmitting}
                  onClick={async () => {
                    if (!qaQuestion.trim()) { setQaError('Please type a question.'); return; }
                    setQaSubmitting(true);
                    try {
                      const newQ = await askQuestion({
                        property_id: property.id,
                        user_id: user.id,
                        asker_name: user.user_metadata?.full_name || user.email.split('@')[0],
                        question: qaQuestion.trim(),
                      });
                      setQaList(prev => [newQ, ...prev]);
                      setQaQuestion('');
                      setQaSuccess(true);
                      setTimeout(() => setQaSuccess(false), 4000);
                    } catch { setQaError('Failed to submit. Try again.'); }
                    finally { setQaSubmitting(false); }
                  }}
                  className="bg-golden hover:bg-golden-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-60 whitespace-nowrap"
                >
                  {qaSubmitting ? '…' : 'Ask'}
                </button>
              </div>
            )}
            {qaError && <p className="text-red-500 text-xs mt-2">{qaError}</p>}
          </div>

          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <div className="border-t border-gray-100 pt-10 mt-4">
              <h2 className="text-2xl font-bold font-serif mb-6">Similar Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {similarProperties.map(p => (
                  <Link key={p.id} to={`/property/${p.id}`}
                    className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-golden/30 hover:shadow-md transition">
                    <div className="h-36 overflow-hidden">
                      <img src={p.image} alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-charcoal text-sm truncate">{p.title}</p>
                      <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {p.city}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-golden font-bold text-sm">₹{p.price.toLocaleString('en-IN')}<span className="text-gray-400 font-normal text-xs">/night</span></p>
                        {p.rating && (
                          <span className="flex items-center gap-0.5 text-xs font-bold text-gray-600">
                            <Star size={11} className="fill-golden text-golden" /> {p.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Column: Booking Widget */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 sticky top-24"
          >
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-3xl font-bold text-charcoal">₹{property.price.toLocaleString('en-IN')}</span>
                <span className="text-gray-400"> / night</span>
                {property.weekend_premium > 0 && (
                  <div className="text-xs text-amber-600 font-bold mt-1">
                    ₹{Math.round(property.price * (1 + property.weekend_premium / 100)).toLocaleString('en-IN')}/night on Fri &amp; Sat
                  </div>
                )}
              </div>
              <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded">Available</span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="grid grid-cols-2 divide-x divide-gray-200">
                <div className="p-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Check-in
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={checkin}
                    onChange={handleCheckinChange}
                    className="w-full text-sm font-medium text-charcoal outline-none [color-scheme:light]"
                  />
                </div>
                <div className="p-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Check-out
                  </label>
                  <input
                    type="date"
                    min={minCheckout}
                    value={checkout}
                    onChange={handleCheckoutChange}
                    disabled={!checkin}
                    className="w-full text-sm font-medium text-charcoal outline-none [color-scheme:light] disabled:text-gray-300"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 p-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Users size={12} /> Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full text-sm font-medium text-charcoal outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                  ))}
                </select>
              </div>
            </div>

            {dateError && (
              <p className="text-red-500 text-xs font-medium mb-3">⚠ {dateError}</p>
            )}

            {nights > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-b border-gray-100 py-4 mb-4 space-y-2 text-sm"
              >
                {dynamicPricing.hasVariableRates ? (
                  <>
                    {dynamicPricing.weekdayNights > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>₹{property.price.toLocaleString('en-IN')} × {dynamicPricing.weekdayNights} weekday {dynamicPricing.weekdayNights === 1 ? 'night' : 'nights'}</span>
                        <span>₹{(dynamicPricing.weekdayNights * dynamicPricing.weekdayPrice).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {dynamicPricing.weekendNights > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>₹{dynamicPricing.weekendPrice.toLocaleString('en-IN')} × {dynamicPricing.weekendNights} weekend {dynamicPricing.weekendNights === 1 ? 'night' : 'nights'}</span>
                        <span>₹{(dynamicPricing.weekendNights * dynamicPricing.weekendPrice).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between text-gray-600">
                    <span>₹{property.price.toLocaleString('en-IN')} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Cleaning fee</span><span>₹{CLEANING_FEE}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service fee</span><span>₹{SERVICE_FEE}</span>
                </div>
                <div className="flex justify-between font-bold text-charcoal pt-2 border-t border-gray-100">
                  <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </motion.div>
            )}

            <button
              onClick={handleBookDirect}
              className="w-full flex justify-between items-center bg-golden hover:bg-golden-dark text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl mb-3"
            >
              <span>{nights > 0 ? `Reserve for ₹${total.toLocaleString('en-IN')}` : 'Book Direct (Best Price)'}</span>
              <ArrowRight size={18} />
            </button>

            {/* Availability Calendar */}
            <div className="mt-5 mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Availability</p>
              <AvailabilityCalendar
                bookedRanges={availability}
                blockedRanges={blockedDates}
                checkin={checkin}
                checkout={checkout}
                onSelectDate={handleCalendarSelect}
              />
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">or book via</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-3">
              {property.links?.airbnb && (
                <a href={property.links.airbnb} target="_blank" rel="noopener noreferrer"
                  className="w-full flex justify-between items-center bg-[#FF5A5F] hover:bg-[#E00007] text-white font-bold py-3 px-5 rounded-xl transition group text-sm">
                  <span>Airbnb</span><ExternalLink size={16} className="opacity-70 group-hover:opacity-100" />
                </a>
              )}
              {property.links?.mmt && (
                <a href={property.links.mmt} target="_blank" rel="noopener noreferrer"
                  className="w-full flex justify-between items-center bg-[#E41F35] hover:bg-[#C21025] text-white font-bold py-3 px-5 rounded-xl transition group text-sm">
                  <span>MakeMyTrip</span><ExternalLink size={16} className="opacity-70 group-hover:opacity-100" />
                </a>
              )}
              {property.links?.goibibo && (
                <a href={property.links.goibibo} target="_blank" rel="noopener noreferrer"
                  className="w-full flex justify-between items-center bg-[#2274E0] hover:bg-[#1959AD] text-white font-bold py-3 px-5 rounded-xl transition group text-sm">
                  <span>Goibibo</span><ExternalLink size={16} className="opacity-70 group-hover:opacity-100" />
                </a>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs mt-5">
              <CheckCircle size={12} /> <span>No extra charges · Best price guaranteed</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
