import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextUtils';
import { Helmet } from 'react-helmet-async';
import { Home, Calendar, User, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Helmet><title>My Dashboard | The Golden Stay</title></Helmet>

      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Hello, {displayName} 👋</h1>
            <p className="text-gray-500 mt-1">Member since {joinedDate}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-full transition self-start sm:self-auto"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
            <User size={18} className="text-golden" /> Account Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Full Name</p>
              <p className="font-bold text-charcoal">{displayName}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Email</p>
              <p className="font-bold text-charcoal truncate">{user?.email}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Member Since</p>
              <p className="font-bold text-charcoal">{joinedDate}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Account Status</p>
              <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Active
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Trips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Calendar size={18} className="text-golden" />
            <h2 className="font-bold text-charcoal">Upcoming Trips</h2>
          </div>
          <div className="p-12 text-center">
            <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium mb-1">No upcoming trips</p>
            <p className="text-gray-400 text-sm mb-5">Your confirmed bookings will appear here</p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 bg-golden hover:bg-golden-dark text-white font-bold px-6 py-2 rounded-full transition text-sm"
            >
              <Home size={16} /> Browse Properties
            </Link>
          </div>
        </div>

        {/* Past Trips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <h2 className="font-bold text-charcoal">Past Trips</h2>
          </div>
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">Your completed stays will appear here</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
