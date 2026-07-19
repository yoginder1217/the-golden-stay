import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextUtils';
import { getUserBookings, cancelBooking } from '../lib/bookings';
import BookingCard from '../components/BookingCard';
import { Helmet } from 'react-helmet-async';
import { Home, Calendar, User, LogOut, RefreshCw, Heart, Award, Settings, Bell, BellOff, Star } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const { supported: pushSupported, subscribed, loading: pushLoading, subscribe, unsubscribe } = usePushNotifications();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    setFetchError('');
    try {
      const data = await getUserBookings(user.id);
      setBookings(data);
    } catch (err) {
      setFetchError(err?.message || 'Could not load bookings. Please try again.');
    } finally {
      setLoadingBookings(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchBookings();
  }, [user?.id, fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert(err?.message || 'Could not cancel booking. Please try again.');
    }
  };

  const handleUpdateDates = (updated) => {
    setBookings(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } : b));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bookings.filter(b => new Date(b.checkin_date) >= today && b.status !== 'cancelled');
  const past = bookings.filter(b => new Date(b.checkin_date) < today || b.status === 'cancelled');

  const totalPoints = useMemo(() =>
    bookings.reduce((s, b) => s + Math.floor((b.total || 0) / 100) - (b.points_redeemed || 0), 0),
  [bookings]);
  const tier = totalPoints >= 150 ? { label: 'Gold', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
    : totalPoints >= 50 ? { label: 'Silver', color: 'text-gray-500 bg-gray-50 border-gray-300' }
    : { label: 'Bronze', color: 'text-orange-600 bg-orange-50 border-orange-200' };

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 h-40 sm:h-auto shrink-0 bg-gray-200" />
        <div className="flex-1 p-5 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
          </div>
        </div>
      </div>
    </div>
  );

  const BookingsSection = ({ title, items, empty }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-golden" />
          <h2 className="font-bold text-charcoal">{title}</h2>
          {!loadingBookings && items.length > 0 && (
            <span className="ml-1 bg-golden text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
        </div>
      </div>

      {loadingBookings ? (
        <div className="p-4 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : fetchError ? (
        <div className="p-10 text-center">
          <p className="text-red-500 text-sm mb-3">{fetchError}</p>
          <button onClick={fetchBookings} className="flex items-center gap-1 text-golden font-bold text-sm mx-auto hover:underline">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : items.length > 0 ? (
        <div className="p-4 space-y-4">
          {items.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancelBooking} onUpdateDates={handleUpdateDates} />)}
        </div>
      ) : (
        <div className="p-12 text-center">
          <Calendar size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-1 font-medium">{empty.title}</p>
          <p className="text-gray-400 text-xs mb-5">{empty.subtitle}</p>
          {empty.cta && (
            <Link to="/properties" className="inline-flex items-center gap-2 bg-golden hover:bg-golden-dark text-white font-bold px-5 py-2 rounded-full transition text-sm">
              <Home size={14} /> Browse Properties
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Helmet><title>My Dashboard | The Golden Stay</title></Helmet>

      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Hello, {displayName} 👋</h1>
            <p className="text-gray-500 mt-1 text-sm">Member since {joinedDate}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-full transition self-start sm:self-auto"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Loyalty Points */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-golden/10 flex items-center justify-center">
              <Award size={24} className="text-golden" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Golden Points</p>
              <p className="text-2xl font-bold text-charcoal">{loadingBookings ? '—' : totalPoints} pts</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full border ${tier.color}`}>
              <Award size={14} /> {tier.label} Member
            </span>
            <Link to="/wishlist" className="flex items-center gap-1.5 text-sm font-bold text-golden border border-golden/30 hover:bg-golden/5 px-4 py-2 rounded-full transition">
              <Heart size={14} className="fill-golden" /> My Wishlist
            </Link>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
              <User size={16} className="text-golden" /> Account Details
            </h2>
            <Link
              to="/profile"
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-golden border border-gray-200 hover:border-golden px-3 py-1.5 rounded-full transition"
            >
              <Settings size={12} /> Edit Profile
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
            {[
              { label: 'Full Name', value: displayName },
              { label: 'Email', value: user?.email, truncate: true },
              { label: 'Member Since', value: joinedDate },
              { label: 'Total Bookings', value: bookings.length },
            ].map(({ label, value, truncate }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</p>
                <p className={`font-bold text-charcoal text-sm ${truncate ? 'truncate' : ''}`}>{value}</p>
              </div>
            ))}
          </div>
          {pushSupported && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-sm font-bold text-charcoal">Booking Notifications</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {subscribed ? 'You\'ll receive updates for bookings and alerts.' : 'Get notified about your bookings.'}
                </p>
              </div>
              <button
                onClick={subscribed ? unsubscribe : subscribe}
                disabled={pushLoading}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition disabled:opacity-60 ${
                  subscribed
                    ? 'text-gray-500 border-gray-200 hover:text-red-500 hover:border-red-200'
                    : 'text-golden border-golden hover:bg-golden hover:text-white'
                }`}
              >
                {subscribed ? <><BellOff size={13} /> Turn off</> : <><Bell size={13} /> Enable</>}
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Trips */}
        <BookingsSection
          title="Upcoming Trips"
          items={upcoming}
          empty={{
            title: 'No upcoming trips',
            subtitle: 'Your confirmed bookings will appear here',
            cta: true,
          }}
        />

        {/* Review Prompts */}
        {(() => {
          const today2 = new Date();
          const needsReview = past.filter(b =>
            b.status !== 'cancelled' &&
            new Date(b.checkout_date) <= today2 &&
            !b.reviewed
          ).slice(0, 3);
          if (!needsReview.length) return null;
          return (
            <div className="bg-golden/5 border border-golden/20 rounded-2xl p-5 mb-6">
              <h2 className="font-bold text-charcoal mb-3 flex items-center gap-2 text-base">
                <Star size={16} className="text-golden fill-golden" /> Rate your recent stays
              </h2>
              <div className="space-y-3">
                {needsReview.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-golden/10">
                    <div>
                      <p className="font-bold text-charcoal text-sm">{b.property_title}</p>
                      <p className="text-gray-400 text-xs">{new Date(b.checkout_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <Link
                      to={`/property/${b.property_id}`}
                      className="flex items-center gap-1.5 text-xs font-bold text-golden border border-golden px-3 py-1.5 rounded-full hover:bg-golden hover:text-white transition"
                    >
                      <Star size={12} /> Leave a Review
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Past Trips */}
        <BookingsSection
          title="Past Trips"
          items={past}
          empty={{
            title: 'No past trips yet',
            subtitle: 'Completed stays will appear here',
            cta: false,
          }}
        />

      </div>
    </div>
  );
};

export default Dashboard;
