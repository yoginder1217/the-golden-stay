import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContextUtils';
import { supabase } from '../lib/supabase';
import { getUserBookings } from '../lib/bookings';
import { User, Lock, CheckCircle, AlertCircle, Phone, Award, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  confirmed: 'text-green-600 bg-green-50',
  pending: 'text-yellow-600 bg-yellow-50',
  cancelled: 'text-red-500 bg-red-50',
  completed: 'text-gray-500 bg-gray-50',
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const Profile = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [nameStatus, setNameStatus] = useState('idle');
  const [nameError, setNameError] = useState('');

  const [passwords, setPasswords] = useState({ newPass: '', confirm: '' });
  const [passStatus, setPassStatus] = useState('idle');
  const [passError, setPassError] = useState('');

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getUserBookings(user.id);
      setBookings(data);
    } catch {}
    finally { setBookingsLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const totalPoints = bookings.reduce(
    (s, b) => s + Math.floor((b.total || 0) / 100) - (b.points_redeemed || 0), 0
  );
  const tier = totalPoints >= 150
    ? { label: 'Gold', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', next: null }
    : totalPoints >= 50
    ? { label: 'Silver', color: 'text-gray-500 bg-gray-50 border-gray-300', next: { label: 'Gold', pts: 150 } }
    : { label: 'Bronze', color: 'text-orange-600 bg-orange-50 border-orange-200', next: { label: 'Silver', pts: 50 } };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setNameError('Name cannot be empty.'); return; }
    setNameStatus('loading'); setNameError('');
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name.trim(), phone: phone.trim() },
      });
      if (error) throw error;
      setNameStatus('success');
      setTimeout(() => setNameStatus('idle'), 3000);
    } catch (err) {
      setNameError(err.message || 'Failed to update profile.');
      setNameStatus('idle');
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPassError('');
    if (passwords.newPass.length < 6) { setPassError('Password must be at least 6 characters.'); return; }
    if (passwords.newPass !== passwords.confirm) { setPassError('Passwords do not match.'); return; }
    setPassStatus('loading');
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.newPass });
      if (error) throw error;
      setPassStatus('success');
      setPasswords({ newPass: '', confirm: '' });
      setTimeout(() => setPassStatus('idle'), 3000);
    } catch (err) {
      setPassError(err.message || 'Failed to update password.');
      setPassStatus('idle');
    }
  };

  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 text-sm';

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Helmet><title>Profile | The Golden Stay</title></Helmet>

      <div className="max-w-2xl mx-auto px-4 space-y-5">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-charcoal">My Profile</h1>
          <Link to="/dashboard" className="text-sm text-golden font-bold hover:underline flex items-center gap-1">
            Dashboard <ArrowRight size={14} />
          </Link>
        </div>

        {/* Loyalty Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-charcoal mb-4 flex items-center gap-2 text-base">
            <Award size={16} className="text-golden" /> Loyalty Status
          </h2>
          {bookingsLoading ? (
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${tier.color}`}>
                {tier.label} Member
              </span>
              <span className="text-charcoal font-bold text-lg tabular-nums">{totalPoints} pts</span>
              {tier.next && (
                <span className="text-gray-400 text-xs">
                  {tier.next.pts - totalPoints} pts to {tier.next.label}
                </span>
              )}
              <span className="text-gray-400 text-xs ml-auto">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</span>
            </div>
          )}
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-charcoal mb-5 flex items-center gap-2 text-base">
            <User size={16} className="text-golden" /> Personal Details
          </h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input type="email" value={user?.email} disabled
                className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Phone size={13} className="text-golden" /> Phone Number
              </label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210" className={inputCls}
              />
            </div>
            {nameError && (
              <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{nameError}</p>
            )}
            <button type="submit" disabled={nameStatus === 'loading'}
              className="flex items-center gap-2 bg-golden hover:bg-golden-dark disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
            >
              {nameStatus === 'loading' ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : nameStatus === 'success' ? <><CheckCircle size={14} /> Saved!</> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Booking History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
              <Calendar size={16} className="text-golden" /> Recent Bookings
            </h2>
            <Link to="/dashboard" className="text-xs text-golden font-bold hover:underline">
              View all
            </Link>
          </div>
          {bookingsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No bookings yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-charcoal text-sm truncate">{b.property_title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {fmtDate(b.checkin_date)} → {fmtDate(b.checkout_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-charcoal text-sm tabular-nums">
                      ₹{Number(b.total || 0).toLocaleString('en-IN')}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[b.status] || 'text-gray-500 bg-gray-50'}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-charcoal mb-5 flex items-center gap-2 text-base">
            <Lock size={16} className="text-golden" /> Change Password
          </h2>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
              <input type="password" value={passwords.newPass} placeholder="Min. 6 characters"
                onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" value={passwords.confirm} placeholder="Re-enter new password"
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className={inputCls}
              />
            </div>
            {passError && (
              <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{passError}</p>
            )}
            <button type="submit" disabled={passStatus === 'loading'}
              className="flex items-center gap-2 bg-charcoal hover:bg-black disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
            >
              {passStatus === 'loading' ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : passStatus === 'success' ? <><CheckCircle size={14} /> Updated!</> : <><Lock size={14} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
