import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContextUtils';
import { getAllBookings, updateBookingStatus } from '../lib/adminBookings';
import { getContactMessages } from '../lib/contact';
import { getProperties, createProperty, updateProperty, deleteProperty } from '../lib/properties';
import {
  TrendingUp, Calendar, Home, CreditCard,
  Search, RefreshCw, BarChart2, Users,
  Globe, ToggleLeft, ToggleRight, Mail,
  ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X,
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
  price: '', image: '', description: '',
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
      image: p.image || '',
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
        image: propForm.image.trim() || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
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
                        <option value="2BHK">2BHK</option>
                        <option value="3BHK">3BHK</option>
                        <option value="Villa">Villa</option>
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
                      <label className={labelCls}>Cover Image URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/…"
                        value={propForm.image}
                        onChange={e => setPropForm(f => ({ ...f, image: e.target.value }))}
                        className={inputCls}
                      />
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
                    <div key={p.id} className="p-4 flex gap-4 hover:bg-gray-50/50 transition items-start">
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
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-bold text-golden">₹{Number(p.price).toLocaleString('en-IN')}/night</span>
                            <button
                              onClick={() => handleEditProp(p)}
                              className="p-2 text-gray-400 hover:text-golden hover:bg-golden/10 rounded-lg transition"
                              title="Edit"
                            >
                              <Pencil size={15} />
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
                      <p className="text-gray-400 text-xs whitespace-nowrap">{fmtDate(m.created_at)}</p>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Bookings Table */}
        {activeTab === 'bookings' && (
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
