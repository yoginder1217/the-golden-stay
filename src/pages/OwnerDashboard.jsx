import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContextUtils';
import { getAllBookings } from '../lib/adminBookings';
import {
  TrendingUp, Calendar, Home, CreditCard,
  Search, RefreshCw, BarChart2, Users,
} from 'lucide-react';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_COLORS = {
  confirmed: 'text-green-600 bg-green-50 border-green-200',
  pending:   'text-yellow-600 bg-yellow-50 border-yellow-200',
  cancelled: 'text-red-500 bg-red-50 border-red-200',
  completed: 'text-gray-500 bg-gray-50 border-gray-200',
};

const OwnerDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      setError(err?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchBookings();
    else setLoading(false);
  }, [isAdmin, fetchBookings]);

  const totalRevenue = useMemo(() => bookings.reduce((s, b) => s + (b.total || 0), 0), [bookings]);
  const avgValue = bookings.length ? Math.round(totalRevenue / bookings.length) : 0;

  const revenueByProperty = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      map[b.property_title] = (map[b.property_title] || 0) + (b.total || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [bookings]);

  const maxPropRevenue = revenueByProperty[0]?.[1] || 1;
  const propertyList = useMemo(() => [...new Set(bookings.map(b => b.property_title))], [bookings]);

  const filtered = useMemo(() => bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.guest_name?.toLowerCase().includes(q) ||
      b.guest_email?.toLowerCase().includes(q) ||
      b.booking_ref?.toLowerCase().includes(q);
    return matchSearch &&
      (statusFilter === 'all' || b.status === statusFilter) &&
      (propertyFilter === 'all' || b.property_title === propertyFilter);
  }), [bookings, search, statusFilter, propertyFilter]);

  const filteredRevenue = useMemo(() => filtered.reduce((s, b) => s + (b.total || 0), 0), [filtered]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home size={28} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">This page is for property owners only.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Revenue', value: fmt(totalRevenue), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
    { label: 'Properties', value: 3, icon: Home, color: 'text-purple-600 bg-purple-50' },
    { label: 'Avg Booking Value', value: fmt(avgValue), icon: CreditCard, color: 'text-golden bg-golden/10' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Helmet><title>Owner Dashboard | The Golden Stay</title></Helmet>

      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-charcoal">Owner Dashboard</h1>
              <span className="bg-golden text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">ADMIN</span>
            </div>
            <p className="text-gray-500 text-sm">Revenue analytics and booking management</p>
          </div>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 text-sm font-bold text-golden border border-golden/30 hover:bg-golden/5 px-4 py-2 rounded-full transition self-start sm:self-auto"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-charcoal mb-0.5">{loading ? '—' : value}</p>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* Revenue by Property */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-charcoal mb-5 flex items-center gap-2 text-base">
            <BarChart2 size={16} className="text-golden" /> Revenue by Property
          </h2>
          {loading ? (
            <div className="h-20 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
          ) : revenueByProperty.length === 0 ? (
            <p className="text-gray-400 text-sm">No bookings yet.</p>
          ) : (
            <div className="space-y-5">
              {revenueByProperty.map(([title, revenue]) => {
                const count = bookings.filter(b => b.property_title === title).length;
                return (
                  <div key={title}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div>
                        <span className="text-sm font-semibold text-charcoal">{title}</span>
                        <span className="ml-2 text-xs text-gray-400">{count} {count === 1 ? 'booking' : 'bookings'}</span>
                      </div>
                      <span className="text-sm font-bold text-golden">{fmt(revenue)}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-golden rounded-full transition-all duration-700"
                        style={{ width: `${(revenue / maxPropRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All Bookings Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-charcoal mb-4 flex items-center gap-2 text-base">
              <Users size={16} className="text-golden" /> All Bookings
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guest name, email or booking ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-golden/40"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-golden/40 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={propertyFilter}
                onChange={e => setPropertyFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-golden/40 bg-white"
              >
                <option value="all">All Properties</option>
                {propertyList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-14 flex items-center justify-center">
              <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <button onClick={fetchBookings} className="text-golden font-bold text-sm hover:underline flex items-center gap-1 mx-auto">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-14 text-center text-gray-400 text-sm">No bookings match your filters.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {['Booking ID', 'Guest', 'Property', 'Check-in', 'Check-out', 'Nights', 'Total', 'Status', 'Booked On'].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{b.booking_ref}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-semibold text-charcoal">{b.guest_name}</p>
                          <p className="text-gray-400 text-xs">{b.guest_email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap max-w-[160px] truncate">{b.property_title}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkin_date)}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkout_date)}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-center">{b.nights}</td>
                        <td className="px-4 py-3 font-bold text-charcoal whitespace-nowrap">{fmt(b.total)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[b.status] ?? STATUS_COLORS.confirmed}`}>
                            {b.status ?? 'confirmed'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmtDate(b.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-xs text-gray-400">
                <span>Showing {filtered.length} of {bookings.length} bookings</span>
                <span className="font-bold text-charcoal">Filtered total: {fmt(filteredRevenue)}</span>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default OwnerDashboard;
