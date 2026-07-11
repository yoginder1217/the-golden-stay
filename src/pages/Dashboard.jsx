import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextUtils';
import { getUserBookings } from '../lib/bookings';
import BookingCard from '../components/BookingCard';
import { Helmet } from 'react-helmet-async';
import { Home, Calendar, User, LogOut, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [fetchError, setFetchError] = useState('');

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bookings.filter(b => new Date(b.checkin_date) >= today);
  const past = bookings.filter(b => new Date(b.checkin_date) < today);

  const BookingsSection = ({ title, items, empty }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-golden" />
          <h2 className="font-bold text-charcoal">{title}</h2>
          {items.length > 0 && (
            <span className="ml-1 bg-golden text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
        </div>
      </div>

      {loadingBookings ? (
        <div className="p-10 flex items-center justify-center">
          <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
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
          {items.map(b => <BookingCard key={b.id} booking={b} />)}
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

        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
            <User size={16} className="text-golden" /> Account Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
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
