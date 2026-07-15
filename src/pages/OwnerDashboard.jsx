import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContextUtils';
import { getAllBookings, updateBookingStatus } from '../lib/adminBookings';
import { getContactMessages } from '../lib/contact';
import { getProperties, createProperty, updateProperty, deleteProperty, uploadPropertyImage } from '../lib/properties';
import { getBlockedDates, addBlockedDate, removeBlockedDate } from '../lib/availability';
import { supabase } from '../lib/supabase';
import { createNotification } from '../lib/notifications';
import {
  TrendingUp, Calendar, Home, CreditCard,
  Search, RefreshCw, BarChart2, Users,
  Globe, ToggleLeft, ToggleRight, Mail,
  ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X,
  Download, Reply, CalendarX, Upload, ImageIcon,
} from 'lucide-react';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const PAGE_SIZE = 10;

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_COLORS = {
  confirmed: 'text-green-600 bg-green-50 border-green-200',
  pending:   'text-yellow-600 bg-yellow-50 border-yellow-200',
  cancelled: 'text-red-500 bg-red-50 border-red-200',
  completed: 'text-gray-500 bg-gray-50 border-gray-200',
};

const EMPTY_PROP_FORM = {
  title: '', type: '2BHK', city: '', location: '',
  price: '', weekend_premium: 0, image: '', images: [], description: '',
  amenities: '', airbnb: '', mmt: '', goibibo: '',
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
  const [activeTab, setActiveTab] = useState('bookings');
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);

  // Messages tab
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');

  // Properties tab
  const [propertiesData, setPropertiesData] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [showPropForm, setShowPropForm] = useState(false);
  const [editingProp, setEditingProp] = useState(null);
  const [propForm, setPropForm] = useState(EMPTY_PROP_FORM);
  const [propSaving, setPropSaving] = useState(false);
  const [propError, setPropError] = useState('');
  const [deletingPropId, setDeletingPropId] = useState(null);

  // Image upload
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  // Promo codes tab
  const [promos, setPromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: '', discount_type: 'percent', discount_value: '', min_booking: '0', uses_left: '-1', expires_at: '' });
  const [promoSaving, setPromoSaving] = useState(false);
  const [promoFormError, setPromoFormError] = useState('');
  const [showPromoForm, setShowPromoForm] = useState(false);

  // Date blocking
  const [blockingPropId, setBlockingPropId] = useState(null);
  const [blockedMap, setBlockedMap] = useState({});
  const [blockForm, setBlockForm] = useState({ start: '', end: '', reason: '' });
  const [blockSaving, setBlockSaving] = useState(false);
  const [blockError, setBlockError] = useState('');

  // Channel manager: per-property platform toggles
  const [channels, setChannels] = useState({});

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

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    setMessagesError('');
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch (err) {
      setMessagesError(err?.message || 'Failed to load messages.');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const fetchPropertiesData = useCallback(async () => {
    setPropertiesLoading(true);
    try {
      const data = await getProperties();
      setPropertiesData(data);
      setChannels(prev => {
        const next = { ...prev };
        data.forEach(p => {
          if (!next[p.id]) next[p.id] = { airbnb: !!p.links?.airbnb, mmt: !!p.links?.mmt, goibibo: !!p.links?.goibibo };
        });
        return next;
      });
    } catch {}
    finally { setPropertiesLoading(false); }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchBookings();
      fetchPropertiesData();
    } else {
      setLoading(false);
    }
  }, [isAdmin, fetchBookings, fetchPropertiesData]);

  useEffect(() => {
    if (isAdmin && activeTab === 'messages') fetchMessages();
  }, [isAdmin, activeTab, fetchMessages]);

  useEffect(() => { setPage(1); }, [search, statusFilter, propertyFilter]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch {
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleChannel = (propertyId, platform) => {
    setChannels(prev => ({
      ...prev,
      [propertyId]: { ...prev[propertyId], [platform]: !prev[propertyId]?.[platform] },
    }));
  };

  const openAddForm = () => {
    setEditingProp(null);
    setPropForm(EMPTY_PROP_FORM);
    setPropError('');
    setShowPropForm(true);
  };

  const handleEditProp = (p) => {
    setEditingProp(p);
    setPropForm({
      title: p.title,
      type: p.type,
      city: p.city,
      location: p.location,
      price: String(p.price),
      weekend_premium: p.weekend_premium || 0,
      image: p.image || '',
      images: p.images || [],
      description: p.description || '',
      amenities: (p.amenities || []).join(', '),
      airbnb: p.links?.airbnb || '',
      mmt: p.links?.mmt || '',
      goibibo: p.links?.goibibo || '',
    });
    setPropError('');
    setShowPropForm(true);
  };

  const handlePropFormSubmit = async (e) => {
    e.preventDefault();
    if (!propForm.title || !propForm.city || !propForm.location || !propForm.price) {
      setPropError('Title, city, location, and price are required.');
      return;
    }
    setPropError('');
    setPropSaving(true);
    try {
      const propertyData = {
        title: propForm.title.trim(),
        type: propForm.type,
        city: propForm.city.trim(),
        location: propForm.location.trim(),
        price: parseInt(propForm.price, 10),
        weekend_premium: Math.round(propForm.weekend_premium) || 0,
        image: propForm.image.trim() || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
        images: propForm.images.filter(Boolean),
        description: propForm.description.trim(),
        amenities: propForm.amenities.split(',').map(s => s.trim()).filter(Boolean),
        links: {
          ...(propForm.airbnb && { airbnb: propForm.airbnb.trim() }),
          ...(propForm.mmt && { mmt: propForm.mmt.trim() }),
          ...(propForm.goibibo && { goibibo: propForm.goibibo.trim() }),
          direct: '/checkout',
        },
      };
      if (editingProp) {
        const updated = await updateProperty(editingProp.id, propertyData);
        setPropertiesData(prev => prev.map(p => p.id === editingProp.id ? updated : p));
      } else {
        const created = await createProperty(propertyData);
        setPropertiesData(prev => [...prev, created]);
        // Broadcast to all users: user_id null = everyone sees it
        createNotification({
          user_id: null,
          title: 'New Property Available!',
          body: `"${created.title}" in ${created.location} is now live. Check it out!`,
          url: `/property/${created.id}`,
          type: 'property',
        }).catch(() => {});
      }
      setShowPropForm(false);
      setEditingProp(null);
      setPropForm(EMPTY_PROP_FORM);
    } catch (err) {
      setPropError(err?.message || 'Failed to save property. Check Supabase RLS permissions.');
    } finally {
      setPropSaving(false);
    }
  };

  const handleDeleteProp = async (id) => {
    if (!window.confirm('Delete this property? This action cannot be undone.')) return;
    setDeletingPropId(id);
    try {
      await deleteProperty(id);
      setPropertiesData(prev => prev.filter(p => p.id !== id));
    } catch {}
    finally { setDeletingPropId(null); }
  };

  const openBlockingPanel = async (propId) => {
    if (blockingPropId === propId) { setBlockingPropId(null); return; }
    setBlockingPropId(propId);
    setBlockForm({ start: '', end: '', reason: '' });
    setBlockError('');
    if (!blockedMap[propId]) {
      const data = await getBlockedDates(propId).catch(() => []);
      setBlockedMap(prev => ({ ...prev, [propId]: data }));
    }
  };

  const handleAddBlock = async (propId) => {
    if (!blockForm.start || !blockForm.end) { setBlockError('Select both start and end dates.'); return; }
    if (blockForm.end <= blockForm.start) { setBlockError('End date must be after start date.'); return; }
    setBlockSaving(true); setBlockError('');
    try {
      const newBlock = await addBlockedDate(propId, blockForm.start, blockForm.end, blockForm.reason);
      setBlockedMap(prev => ({ ...prev, [propId]: [...(prev[propId] || []), newBlock] }));
      setBlockForm({ start: '', end: '', reason: '' });
    } catch (err) {
      setBlockError(err?.message || 'Failed to block dates.');
    } finally {
      setBlockSaving(false);
    }
  };

  const handleRemoveBlock = async (blockId, propId) => {
    try {
      await removeBlockedDate(blockId);
      setBlockedMap(prev => ({ ...prev, [propId]: prev[propId].filter(b => b.id !== blockId) }));
    } catch {}
  };

  const fetchPromos = useCallback(async () => {
    setPromosLoading(true);
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    setPromos(data || []);
    setPromosLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin && activeTab === 'promos') fetchPromos();
  }, [isAdmin, activeTab, fetchPromos]);

  const handleAddPromo = async (e) => {
    e.preventDefault();
    if (!promoForm.code.trim()) { setPromoFormError('Code is required.'); return; }
    if (!promoForm.discount_value) { setPromoFormError('Discount value is required.'); return; }
    setPromoSaving(true); setPromoFormError('');
    const payload = {
      code: promoForm.code.toUpperCase().trim(),
      discount_type: promoForm.discount_type,
      discount_value: parseInt(promoForm.discount_value, 10),
      min_booking: parseInt(promoForm.min_booking, 10) || 0,
      uses_left: parseInt(promoForm.uses_left, 10),
      expires_at: promoForm.expires_at || null,
      is_active: true,
    };
    const { error } = await supabase.from('promo_codes').upsert(payload, { onConflict: 'code' });
    if (error) { setPromoFormError(error.message); setPromoSaving(false); return; }
    await fetchPromos();
    setPromoForm({ code: '', discount_type: 'percent', discount_value: '', min_booking: '0', uses_left: '-1', expires_at: '' });
    setShowPromoForm(false);
    setPromoSaving(false);
  };

  const togglePromoActive = async (code, current) => {
    await supabase.from('promo_codes').update({ is_active: !current }).eq('code', code);
    setPromos(prev => prev.map(p => p.code === code ? { ...p, is_active: !current } : p));
  };

  const deletePromo = async (code) => {
    if (!window.confirm(`Delete promo code ${code}?`)) return;
    await supabase.from('promo_codes').delete().eq('code', code);
    setPromos(prev => prev.filter(p => p.code !== code));
  };

  const totalRevenue = useMemo(() => bookings.reduce((s, b) => s + (b.total || 0), 0), [bookings]);
  const avgValue = bookings.length ? Math.round(totalRevenue / bookings.length) : 0;

  // Monthly revenue — last 6 months
  const monthlyRevenue = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      const revenue = bookings
        .filter(b => {
          if (!b.created_at) return false;
          const bd = new Date(b.created_at);
          return bd.getFullYear() === year && bd.getMonth() + 1 === month;
        })
        .reduce((s, b) => s + (b.total || 0), 0);
      months.push({ label, revenue });
    }
    return months;
  }, [bookings]);
  const maxMonthRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  // CSV Export
  const exportCSV = () => {
    const headers = ['Booking ID','Guest Name','Guest Email','Guest Phone','Property','Location','Check-in','Check-out','Nights','Guests','Total','Status','Payment ID','Booked On'];
    const rows = bookings.map(b => [
      b.booking_ref, b.guest_name, b.guest_email, b.guest_phone || '',
      b.property_title, b.property_location,
      b.checkin_date, b.checkout_date, b.nights, b.guests,
      b.total, b.status, b.payment_id || '',
      new Date(b.created_at).toLocaleDateString('en-IN'),
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `golden-stay-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    { label: 'Properties', value: propertiesData.length, icon: Home, color: 'text-purple-600 bg-purple-50' },
    { label: 'Avg Booking Value', value: fmt(avgValue), icon: CreditCard, color: 'text-golden bg-golden/10' },
  ];

  const tabs = [
    { id: 'bookings', label: 'All Bookings', icon: Users },
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'messages', label: `Messages${messages.length ? ` (${messages.length})` : ''}`, icon: Mail },
    { id: 'channels', label: 'Channel Manager', icon: Globe },
    { id: 'promos', label: 'Promo Codes', icon: CreditCard },
  ];

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-golden/40';
  const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1';

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

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-charcoal mb-5 flex items-center gap-2 text-base">
            <TrendingUp size={16} className="text-golden" /> Revenue — Last 6 Months
          </h2>
          {loading ? (
            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
          ) : (
            <div className="flex items-end gap-3 h-36">
              {monthlyRevenue.map(({ label, revenue }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-bold text-golden tabular-nums">
                    {revenue > 0 ? `₹${revenue >= 1000 ? `${Math.round(revenue / 1000)}k` : revenue}` : ''}
                  </span>
                  <div className="w-full flex items-end" style={{ height: '80px' }}>
                    <div
                      className="w-full bg-golden rounded-t-lg transition-all duration-700"
                      style={{ height: `${Math.max(revenue > 0 ? 6 : 2, (revenue / maxMonthRevenue) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
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

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {showPropForm && (
              <div className="bg-white rounded-2xl border border-golden/30 shadow-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-charcoal text-base">
                    {editingProp ? 'Edit Property' : 'Add New Property'}
                  </h2>
                  <button
                    onClick={() => { setShowPropForm(false); setEditingProp(null); setPropForm(EMPTY_PROP_FORM); }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
                <form onSubmit={handlePropFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Property Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Golden Heights 3BHK Family Suite"
                        value={propForm.title}
                        onChange={e => setPropForm(f => ({ ...f, title: e.target.value }))}
                        className={inputCls}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Type *</label>
                      <select
                        value={propForm.type}
                        onChange={e => setPropForm(f => ({ ...f, type: e.target.value }))}
                        className={inputCls}
                      >
                        <option value="1BHK">1BHK</option>
                        <option value="2BHK">2BHK</option>
                        <option value="3BHK">3BHK</option>
                        <option value="Villa">Villa</option>
                        <option value="Cottage">Cottage</option>
                        <option value="Farmhouse">Farmhouse</option>
                        <option value="Studio">Studio</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Bungalow">Bungalow</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Price per Night (₹) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 4500"
                        min="100"
                        value={propForm.price}
                        onChange={e => setPropForm(f => ({ ...f, price: e.target.value }))}
                        className={inputCls}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Weekend Premium (%)</label>
                      <input
                        type="number"
                        placeholder="e.g. 20"
                        min="0"
                        max="100"
                        value={propForm.weekend_premium}
                        onChange={e => setPropForm(f => ({ ...f, weekend_premium: e.target.valueAsNumber || 0 }))}
                        className={inputCls}
                      />
                      <p className="text-xs text-gray-400 mt-1">0 = flat rate. e.g. 20 = 20% more on Fri &amp; Sat nights.</p>
                    </div>
                    <div>
                      <label className={labelCls}>City *</label>
                      <input
                        type="text"
                        placeholder="e.g. Noida"
                        value={propForm.city}
                        onChange={e => setPropForm(f => ({ ...f, city: e.target.value }))}
                        className={inputCls}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Location / Area *</label>
                      <input
                        type="text"
                        placeholder="e.g. Sector 62, Noida"
                        value={propForm.location}
                        onChange={e => setPropForm(f => ({ ...f, location: e.target.value }))}
                        className={inputCls}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Cover Image</label>
                      <div className="flex gap-3 items-start">
                        {propForm.image && (
                          <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                            <img src={propForm.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 hover:border-golden rounded-xl px-4 py-3 transition text-sm text-gray-500 hover:text-golden">
                            {imageUploading ? (
                              <svg className="animate-spin h-4 w-4 text-golden" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                              </svg>
                            ) : <Upload size={15} />}
                            {imageUploading ? 'Uploading…' : 'Upload image'}
                            <input type="file" accept="image/*" className="sr-only" disabled={imageUploading}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 5 * 1024 * 1024) { setImageUploadError('Max file size is 5 MB.'); return; }
                                setImageUploading(true); setImageUploadError('');
                                try {
                                  const url = await uploadPropertyImage(file);
                                  setPropForm(f => ({ ...f, image: url }));
                                } catch (err) {
                                  setImageUploadError(err?.message || 'Upload failed.');
                                } finally {
                                  setImageUploading(false);
                                }
                              }}
                            />
                          </label>
                          <input
                            type="url"
                            placeholder="Or paste image URL"
                            value={propForm.image}
                            onChange={e => setPropForm(f => ({ ...f, image: e.target.value }))}
                            className={inputCls}
                          />
                          {imageUploadError && <p className="text-red-500 text-xs">{imageUploadError}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Additional Photos <span className="normal-case text-gray-400 font-normal">(gallery)</span></label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {propForm.images.map((url, i) => (
                          <div key={i} className="relative w-16 h-12 rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button type="button"
                              onClick={() => setPropForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                        <label className="w-16 h-12 border-2 border-dashed border-gray-200 hover:border-golden rounded-lg flex items-center justify-center cursor-pointer transition">
                          {imageUploading ? (
                            <svg className="animate-spin h-4 w-4 text-golden" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                          ) : <ImageIcon size={16} className="text-gray-300 group-hover:text-golden" />}
                          <input type="file" accept="image/*" multiple className="sr-only" disabled={imageUploading}
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []);
                              if (!files.length) return;
                              setImageUploading(true); setImageUploadError('');
                              try {
                                const urls = await Promise.all(files.map(f => uploadPropertyImage(f)));
                                setPropForm(f => ({ ...f, images: [...f.images, ...urls] }));
                              } catch (err) {
                                setImageUploadError(err?.message || 'Upload failed.');
                              } finally { setImageUploading(false); }
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-400">Upload up to 10 photos. First photo is the cover.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Description</label>
                      <textarea
                        placeholder="Describe the property, highlights, and nearby attractions…"
                        value={propForm.description}
                        onChange={e => setPropForm(f => ({ ...f, description: e.target.value }))}
                        rows={3}
                        className={inputCls + ' resize-none'}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Amenities (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="WiFi, AC, Kitchen, Parking, TV, Washer"
                        value={propForm.amenities}
                        onChange={e => setPropForm(f => ({ ...f, amenities: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Airbnb URL</label>
                      <input
                        type="url"
                        placeholder="https://www.airbnb.com/rooms/…"
                        value={propForm.airbnb}
                        onChange={e => setPropForm(f => ({ ...f, airbnb: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>MakeMyTrip URL</label>
                      <input
                        type="url"
                        placeholder="https://www.makemytrip.com/…"
                        value={propForm.mmt}
                        onChange={e => setPropForm(f => ({ ...f, mmt: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Goibibo URL</label>
                      <input
                        type="url"
                        placeholder="https://www.goibibo.com/…"
                        value={propForm.goibibo}
                        onChange={e => setPropForm(f => ({ ...f, goibibo: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>
                  {propError && <p className="text-red-500 text-sm">{propError}</p>}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={propSaving}
                      className="flex items-center gap-2 bg-golden hover:bg-golden-dark text-white font-bold px-6 py-2.5 rounded-xl transition text-sm disabled:opacity-60"
                    >
                      {propSaving && (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      )}
                      {propSaving ? 'Saving…' : editingProp ? 'Save Changes' : 'Add Property'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowPropForm(false); setEditingProp(null); setPropForm(EMPTY_PROP_FORM); }}
                      className="text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 px-6 py-2.5 rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                  <Home size={16} className="text-golden" /> Properties
                  {!propertiesLoading && (
                    <span className="ml-1 bg-golden text-white text-xs font-bold px-2 py-0.5 rounded-full">{propertiesData.length}</span>
                  )}
                </h2>
                {!showPropForm && (
                  <button
                    onClick={openAddForm}
                    className="flex items-center gap-2 bg-golden hover:bg-golden-dark text-white text-sm font-bold px-4 py-2 rounded-full transition"
                  >
                    <Plus size={14} /> Add Property
                  </button>
                )}
              </div>

              {propertiesLoading ? (
                <div className="p-14 flex items-center justify-center">
                  <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              ) : propertiesData.length === 0 ? (
                <div className="p-14 text-center">
                  <Home size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-medium mb-1">No properties yet</p>
                  <p className="text-gray-400 text-xs">Add your first property using the button above.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {propertiesData.map(p => (
                    <React.Fragment key={p.id}>
                    <div className="p-4 flex gap-4 hover:bg-gray-50/50 transition items-start">
                      <div className="w-20 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        {p.image && (
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-charcoal text-sm truncate">{p.title}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{p.location} · {p.type}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {(p.amenities || []).slice(0, 4).map(a => (
                                <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                              ))}
                              {(p.amenities || []).length > 4 && (
                                <span className="text-xs text-gray-400">+{p.amenities.length - 4} more</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                            <span className="text-sm font-bold text-golden">₹{Number(p.price).toLocaleString('en-IN')}/night</span>
                            {p.weekend_premium > 0 && (
                              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold">+{p.weekend_premium}% wknd</span>
                            )}
                            <button
                              onClick={() => handleEditProp(p)}
                              className="p-2 text-gray-400 hover:text-golden hover:bg-golden/10 rounded-lg transition"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => openBlockingPanel(p.id)}
                              className={`p-2 rounded-lg transition ${blockingPropId === p.id ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}
                              title="Block dates"
                            >
                              <CalendarX size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteProp(p.id)}
                              disabled={deletingPropId === p.id}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingPropId === p.id ? (
                                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                              ) : <Trash2 size={15} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Block Dates Panel */}
                    {blockingPropId === p.id && (
                      <div className="mx-4 mb-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                        <p className="text-xs font-bold text-orange-700 mb-3 flex items-center gap-1.5">
                          <CalendarX size={13} /> Block Dates — guests cannot book these periods
                        </p>
                        {/* Existing blocks */}
                        {(blockedMap[p.id] || []).length > 0 && (
                          <div className="mb-3 space-y-1.5">
                            {(blockedMap[p.id] || []).map(b => (
                              <div key={b.id} className="flex items-center justify-between bg-white border border-orange-200 rounded-lg px-3 py-1.5">
                                <span className="text-xs text-charcoal font-medium">
                                  {new Date(b.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  {' → '}
                                  {new Date(b.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  {b.reason && <span className="text-gray-400 ml-1.5">· {b.reason}</span>}
                                </span>
                                <button onClick={() => handleRemoveBlock(b.id, p.id)} className="text-red-400 hover:text-red-600 ml-3">
                                  <X size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Add new block */}
                        <div className="flex flex-wrap gap-2 items-end">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-medium">From</label>
                            <input type="date" value={blockForm.start} min={new Date().toISOString().split('T')[0]}
                              onChange={e => setBlockForm(f => ({ ...f, start: e.target.value }))}
                              className="text-xs border border-orange-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-medium">To</label>
                            <input type="date" value={blockForm.end} min={blockForm.start || new Date().toISOString().split('T')[0]}
                              onChange={e => setBlockForm(f => ({ ...f, end: e.target.value }))}
                              className="text-xs border border-orange-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1 flex-1 min-w-32">
                            <label className="text-xs text-gray-500 font-medium">Reason (optional)</label>
                            <input type="text" placeholder="e.g. Renovation" value={blockForm.reason}
                              onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))}
                              className="text-xs border border-orange-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                            />
                          </div>
                          <button
                            onClick={() => handleAddBlock(p.id)}
                            disabled={blockSaving}
                            className="text-xs font-bold px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-60"
                          >
                            {blockSaving ? 'Saving…' : 'Block'}
                          </button>
                        </div>
                        {blockError && <p className="text-red-500 text-xs mt-2">{blockError}</p>}
                      </div>
                    )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Channel Manager */}
        {activeTab === 'channels' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe size={16} className="text-golden" />
              <h2 className="font-bold text-charcoal text-base">Platform Sync Status</h2>
              <span className="ml-auto text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">UI preview — connect OTA API to enable live sync</span>
            </div>
            {propertiesLoading ? (
              <div className="h-20 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {propertiesData.map(p => (
                  <div key={p.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition">
                    <div className="relative h-28">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute bottom-0 left-0 p-3">
                        <p className="text-white font-bold text-xs leading-tight">{p.title}</p>
                        <p className="text-white/70 text-xs">{p.city}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { key: 'airbnb', label: 'Airbnb', color: 'text-[#FF5A5F]' },
                        { key: 'mmt', label: 'MakeMyTrip', color: 'text-[#E41F35]' },
                        { key: 'goibibo', label: 'Goibibo', color: 'text-[#2274E0]' },
                      ].map(({ key, label, color }) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${color}`}>{label}</span>
                          <button
                            onClick={() => toggleChannel(p.id, key)}
                            className="flex items-center gap-1.5 text-xs transition"
                          >
                            {channels[p.id]?.[key] ? (
                              <><ToggleRight size={22} className="text-green-500" /><span className="text-green-600 font-medium">Active</span></>
                            ) : (
                              <><ToggleLeft size={22} className="text-gray-300" /><span className="text-gray-400 font-medium">Off</span></>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact Messages */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                <Mail size={16} className="text-golden" /> Contact Messages
              </h2>
              <button onClick={fetchMessages} className="text-golden text-sm font-bold flex items-center gap-1 hover:underline">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
            {messagesLoading ? (
              <div className="p-14 flex items-center justify-center">
                <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : messagesError ? (
              <div className="p-10 text-center text-red-500 text-sm">{messagesError}</div>
            ) : messages.length === 0 ? (
              <div className="p-14 text-center text-gray-400 text-sm">No messages yet.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {messages.map(m => (
                  <div key={m.id} className="p-5 hover:bg-gray-50/50 transition">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-charcoal text-sm">{m.name}</p>
                        <p className="text-gray-400 text-xs">{m.email}{m.phone && ` · ${m.phone}`}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-gray-400 text-xs whitespace-nowrap">{fmtDate(m.created_at)}</p>
                        <a
                          href={`mailto:${m.email}?subject=Re: Your enquiry at The Golden Stay&body=Hi ${encodeURIComponent(m.name)},%0A%0AThank you for reaching out to The Golden Stay.%0A%0A----%0AYour original message:%0A${encodeURIComponent(m.message)}%0A----`}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-golden border border-golden rounded-lg hover:bg-golden hover:text-white transition-colors whitespace-nowrap"
                        >
                          <Reply size={12} /> Reply
                        </a>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Promo Codes */}
        {activeTab === 'promos' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                <CreditCard size={16} className="text-golden" /> Promo Codes
              </h2>
              <button
                onClick={() => { setShowPromoForm(f => !f); setPromoFormError(''); }}
                className="flex items-center gap-2 bg-golden hover:bg-golden-dark text-white text-sm font-bold px-4 py-2 rounded-full transition"
              >
                <Plus size={14} /> {showPromoForm ? 'Cancel' : 'Add Code'}
              </button>
            </div>

            {showPromoForm && (
              <form onSubmit={handleAddPromo} className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Code</label>
                    <input type="text" placeholder="e.g. SAVE20" value={promoForm.code}
                      onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      className={inputCls} required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Discount Type</label>
                    <select value={promoForm.discount_type}
                      onChange={e => setPromoForm(f => ({ ...f, discount_type: e.target.value }))}
                      className={inputCls}
                    >
                      <option value="percent">Percent (%)</option>
                      <option value="flat">Flat (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Discount Value</label>
                    <input type="number" min="1" placeholder={promoForm.discount_type === 'percent' ? '10' : '500'} value={promoForm.discount_value}
                      onChange={e => setPromoForm(f => ({ ...f, discount_value: e.target.value }))}
                      className={inputCls} required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Min Booking (₹)</label>
                    <input type="number" min="0" value={promoForm.min_booking}
                      onChange={e => setPromoForm(f => ({ ...f, min_booking: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Uses Left (−1 = unlimited)</label>
                    <input type="number" min="-1" value={promoForm.uses_left}
                      onChange={e => setPromoForm(f => ({ ...f, uses_left: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Expires At</label>
                    <input type="datetime-local" value={promoForm.expires_at}
                      onChange={e => setPromoForm(f => ({ ...f, expires_at: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>
                {promoFormError && <p className="text-red-500 text-sm mb-3">{promoFormError}</p>}
                <button type="submit" disabled={promoSaving}
                  className="bg-golden hover:bg-golden-dark text-white font-bold px-6 py-2.5 rounded-xl text-sm transition disabled:opacity-60"
                >
                  {promoSaving ? 'Saving…' : 'Save Code'}
                </button>
              </form>
            )}

            {promosLoading ? (
              <div className="p-14 flex items-center justify-center">
                <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : promos.length === 0 ? (
              <div className="p-14 text-center text-gray-400 text-sm">No promo codes yet. Add one above.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Code','Type','Value','Min Booking','Uses Left','Expires','Status',''].map(h => (
                        <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {promos.map(p => (
                      <tr key={p.code} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-charcoal font-mono">{p.code}</td>
                        <td className="px-4 py-3 text-gray-500 capitalize">{p.discount_type}</td>
                        <td className="px-4 py-3 font-bold text-golden">
                          {p.discount_type === 'flat' ? `₹${p.discount_value}` : `${p.discount_value}%`}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{p.min_booking > 0 ? fmt(p.min_booking) : '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{p.uses_left === -1 ? '∞' : p.uses_left}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {p.expires_at ? fmtDate(p.expires_at) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => togglePromoActive(p.code, p.is_active)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border transition ${p.is_active ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100' : 'text-gray-400 bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                          >
                            {p.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => deletePromo(p.code)} className="text-gray-300 hover:text-red-500 transition">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* All Bookings Table */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                  <Users size={16} className="text-golden" /> All Bookings
                </h2>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-golden border border-golden rounded-lg hover:bg-golden hover:text-white transition-colors"
                >
                  <Download size={13} /> Download CSV
                </button>
              </div>
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
                      {paginated.map(b => (
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
                            <select
                              value={b.status ?? 'confirmed'}
                              disabled={updatingId === b.id}
                              onChange={e => handleStatusChange(b.id, e.target.value)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none disabled:opacity-50 ${STATUS_COLORS[b.status] ?? STATUS_COLORS.confirmed}`}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmtDate(b.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-gray-400">
                  <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} bookings · <span className="font-bold text-charcoal">Filtered total: {fmt(filteredRevenue)}</span></span>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg border border-gray-200 hover:border-golden hover:text-golden transition disabled:opacity-30"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="font-bold text-charcoal">{page} / {totalPages}</span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-1.5 rounded-lg border border-gray-200 hover:border-golden hover:text-golden transition disabled:opacity-30"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default OwnerDashboard;
