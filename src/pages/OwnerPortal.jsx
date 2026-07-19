import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextUtils';
import {
  getMyOwnerProfile, getOwnerProperties, getOwnerBookings,
  getOwnerMonthlyEarnings, getPayouts,
} from '../lib/owners';
import {
  Home, Calendar, TrendingUp, Banknote, Building2, RefreshCw,
  CheckCircle, Clock, XCircle, ChevronRight,
} from 'lucide-react';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_COLORS = {
  confirmed: 'text-green-600 bg-green-50 border-green-200',
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  cancelled: 'text-red-500 bg-red-50 border-red-200',
  completed: 'text-gray-500 bg-gray-50 border-gray-200',
};

const Spinner = () => (
  <div className="p-14 flex items-center justify-center">
    <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  </div>
);

const OwnerPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [portalError, setPortalError] = useState('');

  const fetchAll = useCallback(async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      const profile = await getMyOwnerProfile(user.id);
      if (!profile) { navigate('/'); return; }
      setOwnerProfile(profile);

      const [props, pyts] = await Promise.all([
        getOwnerProperties(profile.id),
        getPayouts(profile.id),
      ]);
      setProperties(props);
      setPayouts(pyts);

      if (props.length) {
        const bkgs = await getOwnerBookings(props.map(p => p.id));
        setBookings(bkgs);
      }
    } catch (err) {
      setPortalError(err?.message || 'Failed to load your portal. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const commission = ownerProfile?.commission_percent ?? 10;

  const completedBookings = useMemo(() => bookings.filter(b => b.status === 'completed'), [bookings]);
  const grossEarned = useMemo(() => completedBookings.reduce((s, b) => s + (b.total || 0), 0), [completedBookings]);
  const platformFee = useMemo(() => Math.round(grossEarned * commission / 100), [grossEarned, commission]);
  const netEarned = grossEarned - platformFee;

  const pendingPayout = useMemo(() => payouts.filter(p => p.status === 'pending').reduce((s, p) => s + (p.net_amount || 0), 0), [payouts]);
  const paidOut = useMemo(() => payouts.filter(p => p.status === 'paid').reduce((s, p) => s + (p.net_amount || 0), 0), [payouts]);

  const monthlyData = useMemo(() => getOwnerMonthlyEarnings(bookings, commission), [bookings, commission]);
  const maxMonthNet = Math.max(...monthlyData.map(m => m.net), 1);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'properties', label: 'My Properties', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'earnings', label: 'Earnings', icon: Banknote },
    { id: 'payouts', label: 'Payout History', icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-9 w-9 text-golden" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (portalError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4 font-medium">{portalError}</p>
          <button
            onClick={() => { setPortalError(''); fetchAll(); }}
            className="px-5 py-2 bg-golden hover:bg-golden-dark text-white font-bold rounded-xl transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!ownerProfile) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Helmet><title>Owner Portal | The Golden Stay</title></Helmet>

      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-charcoal">Owner Portal</h1>
              <span className="bg-golden/10 text-golden text-xs font-bold px-3 py-1 rounded-full border border-golden/30 tracking-wide">
                {commission}% Commission
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Welcome back, <span className="font-semibold text-charcoal">{ownerProfile.name}</span>
            </p>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 text-sm font-bold text-golden border border-golden/30 hover:bg-golden/5 px-4 py-2 rounded-full transition self-start sm:self-auto"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTab === id
                  ? 'bg-golden text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-golden hover:text-golden'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Properties Listed', value: properties.length, icon: Home, color: 'text-purple-600 bg-purple-50' },
                { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
                { label: 'Net Earned', value: fmt(netEarned), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
                { label: 'Pending Payout', value: fmt(pendingPayout), icon: Banknote, color: 'text-golden bg-golden/10' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <p className="text-2xl font-bold text-charcoal mb-0.5">{value}</p>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            {/* Commission breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-charcoal mb-4 flex items-center gap-2 text-base">
                <Banknote size={16} className="text-golden" /> Earnings Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1">Gross (Guest Paid)</p>
                  <p className="text-2xl font-bold text-charcoal">{fmt(grossEarned)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-red-400 uppercase font-bold tracking-wide mb-1">Platform Fee ({commission}%)</p>
                  <p className="text-2xl font-bold text-red-500">− {fmt(platformFee)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-green-500 uppercase font-bold tracking-wide mb-1">Your Net Earnings</p>
                  <p className="text-2xl font-bold text-green-600">{fmt(netEarned)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Calculated from {completedBookings.length} completed stay{completedBookings.length !== 1 ? 's' : ''}. Monthly settlement by The Golden Stay admin.
              </p>
            </div>

            {/* Recent bookings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                  <Calendar size={16} className="text-golden" /> Recent Bookings
                </h2>
                <button onClick={() => setActiveTab('bookings')} className="text-xs text-golden font-bold hover:underline flex items-center gap-1">
                  View all <ChevronRight size={13} />
                </button>
              </div>
              {bookings.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">No bookings yet.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {bookings.slice(0, 5).map(b => (
                    <div key={b.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50/50 transition">
                      <div>
                        <p className="font-semibold text-charcoal text-sm">{b.guest_name}</p>
                        <p className="text-xs text-gray-400">{b.property_title} · {fmtDate(b.checkin_date)} → {fmtDate(b.checkout_date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-charcoal text-sm">{fmt(b.total)}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[b.status] ?? STATUS_COLORS.confirmed}`}>
                          {b.status ?? 'confirmed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── My Properties ── */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                <Home size={16} className="text-golden" /> My Properties
                <span className="ml-1 bg-golden text-white text-xs font-bold px-2 py-0.5 rounded-full">{properties.length}</span>
              </h2>
            </div>
            {properties.length === 0 ? (
              <div className="p-14 text-center">
                <Home size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No properties linked to your account yet.</p>
                <p className="text-gray-400 text-xs mt-1">Contact The Golden Stay admin to get your properties added.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {properties.map(p => {
                  const propBookings = bookings.filter(b => b.property_id === p.id);
                  const propRevenue = propBookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.total || 0), 0);
                  return (
                    <div key={p.id} className="p-5 flex gap-4 hover:bg-gray-50/50 transition">
                      <div className="w-20 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-charcoal text-sm">{p.title}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{p.location} · {p.type}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {(p.amenities || []).slice(0, 4).map(a => (
                                <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-golden">₹{Number(p.price).toLocaleString('en-IN')}/night</p>
                            <p className="text-xs text-gray-400 mt-0.5">{propBookings.length} booking{propBookings.length !== 1 ? 's' : ''}</p>
                            {propRevenue > 0 && (
                              <p className="text-xs font-semibold text-green-600 mt-0.5">Gross: {fmt(propRevenue)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Bookings ── */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                <Calendar size={16} className="text-golden" /> All Bookings
                <span className="ml-1 bg-golden text-white text-xs font-bold px-2 py-0.5 rounded-full">{bookings.length}</span>
              </h2>
            </div>
            {bookings.length === 0 ? (
              <div className="p-14 text-center text-gray-400 text-sm">No bookings yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Guest', 'Property', 'Check-in', 'Check-out', 'Nights', 'Total (Gross)', 'Your Net', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map(b => {
                      const net = b.status === 'completed' ? Math.round((b.total || 0) * (1 - commission / 100)) : null;
                      return (
                        <tr key={b.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-semibold text-charcoal">{b.guest_name}</p>
                            <p className="text-gray-400 text-xs">{b.guest_email}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{b.property_title}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkin_date)}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkout_date)}</td>
                          <td className="px-4 py-3 text-gray-500 text-center">{b.nights}</td>
                          <td className="px-4 py-3 font-bold text-charcoal whitespace-nowrap">{fmt(b.total)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {net !== null
                              ? <span className="font-bold text-green-600">{fmt(net)}</span>
                              : <span className="text-gray-400 text-xs">After checkout</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[b.status] ?? STATUS_COLORS.confirmed}`}>
                              {b.status ?? 'confirmed'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Earnings ── */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-2">Total Gross</p>
                <p className="text-3xl font-bold text-charcoal">{fmt(grossEarned)}</p>
                <p className="text-xs text-gray-400 mt-1">from {completedBookings.length} completed stays</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-2">Platform Fee ({commission}%)</p>
                <p className="text-3xl font-bold text-red-400">− {fmt(platformFee)}</p>
                <p className="text-xs text-gray-400 mt-1">retained by The Golden Stay</p>
              </div>
              <div className="bg-golden rounded-2xl shadow-sm p-5 text-center">
                <p className="text-xs text-white/70 uppercase font-bold tracking-wide mb-2">Your Total Net</p>
                <p className="text-3xl font-bold text-white">{fmt(netEarned)}</p>
                <p className="text-xs text-white/70 mt-1">
                  {fmt(paidOut)} paid · {fmt(pendingPayout)} pending
                </p>
              </div>
            </div>

            {/* Monthly chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-charcoal mb-5 flex items-center gap-2 text-base">
                <TrendingUp size={16} className="text-golden" /> Monthly Net Earnings — Last 6 Months
              </h2>
              <div className="flex items-end gap-3 h-36">
                {monthlyData.map(({ label, net, count }) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-xs font-bold text-golden tabular-nums">
                      {net > 0 ? `₹${net >= 1000 ? `${Math.round(net / 1000)}k` : net}` : ''}
                    </span>
                    <div className="w-full flex items-end" style={{ height: '80px' }}>
                      <div
                        className="w-full bg-golden rounded-t-lg transition-all duration-700"
                        style={{ height: `${Math.max(net > 0 ? 6 : 2, (net / maxMonthNet) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{label}</span>
                    {count > 0 && <span className="text-[10px] text-gray-300">{count} stay{count !== 1 ? 's' : ''}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Per-property breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-charcoal mb-5 flex items-center gap-2 text-base">
                <Building2 size={16} className="text-golden" /> Earnings by Property
              </h2>
              {properties.length === 0 ? (
                <p className="text-gray-400 text-sm">No properties linked.</p>
              ) : (
                <div className="space-y-5">
                  {properties.map(p => {
                    const gross = bookings
                      .filter(b => b.property_id === p.id && b.status === 'completed')
                      .reduce((s, b) => s + (b.total || 0), 0);
                    const net = Math.round(gross * (1 - commission / 100));
                    const maxGross = properties.reduce((m, pp) => {
                      const g = bookings.filter(b => b.property_id === pp.id && b.status === 'completed').reduce((s, b) => s + (b.total || 0), 0);
                      return Math.max(m, g);
                    }, 1);
                    return (
                      <div key={p.id}>
                        <div className="flex justify-between items-center mb-1.5">
                          <div>
                            <span className="text-sm font-semibold text-charcoal">{p.title}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-golden">{fmt(net)}</span>
                            <span className="text-xs text-gray-400 ml-1">net</span>
                          </div>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-golden rounded-full transition-all duration-700"
                            style={{ width: `${(gross / maxGross) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Gross: {fmt(gross)} · Platform: {fmt(gross - net)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Payout History ── */}
        {activeTab === 'payouts' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                <CheckCircle size={16} className="text-golden" /> Payout History
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Payouts are processed monthly by The Golden Stay admin for completed stays.
              </p>
            </div>
            {payouts.length === 0 ? (
              <div className="p-14 text-center">
                <Banknote size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No payouts recorded yet.</p>
                <p className="text-gray-400 text-xs mt-1">Your first payout will appear here after your first monthly settlement.</p>
              </div>
            ) : (
              <>
                {/* Summary chips */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 text-xs">
                  <span className="text-gray-500">Total paid out: <span className="font-bold text-charcoal">{fmt(paidOut)}</span></span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500">Pending: <span className="font-bold text-charcoal">{fmt(pendingPayout)}</span></span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Period', 'Bookings', 'Gross', 'Commission', 'You Get', 'Status', 'Payment'].map(h => (
                          <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {payouts.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-4 py-3 font-semibold text-charcoal whitespace-nowrap">{p.period_label}</td>
                          <td className="px-4 py-3 text-gray-500 text-center">{p.booking_count}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(p.gross_amount)}</td>
                          <td className="px-4 py-3 text-red-400 whitespace-nowrap">− {fmt(p.commission_amount)}</td>
                          <td className="px-4 py-3 font-bold text-green-600 whitespace-nowrap">{fmt(p.net_amount)}</td>
                          <td className="px-4 py-3">
                            {p.status === 'paid' ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full w-fit">
                                <CheckCircle size={11} /> Paid
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full w-fit">
                                <Clock size={11} /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {p.status === 'paid' && (
                              <div>
                                <p className="font-medium text-charcoal">{p.payment_method || '—'}</p>
                                {p.transaction_ref && <p className="text-gray-400 font-mono">{p.transaction_ref}</p>}
                                {p.paid_at && <p className="text-gray-400">{fmtDate(p.paid_at)}</p>}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default OwnerPortal;
