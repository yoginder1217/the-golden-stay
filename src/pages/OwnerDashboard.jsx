import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContextUtils';
import { getAllBookings, updateBookingStatus } from '../lib/adminBookings';
import { getContactMessages } from '../lib/contact';
import { getProperties, createProperty, updateProperty, deleteProperty, uploadPropertyImage } from '../lib/properties';
import { getBlockedDates, addBlockedDate, removeBlockedDate } from '../lib/availability';
import { supabase } from '../lib/supabase';
import { createNotification } from '../lib/notifications';
import { getAllQA, answerQuestion } from '../lib/qa';
import { saveSiteContentBatch, CONTENT_DEFAULTS } from '../lib/siteContent';
import { useSiteContent } from '../context/SiteContentContext';
import {
  TrendingUp, Calendar, Home, CreditCard,
  Search, RefreshCw, BarChart2, Users,
  Globe, ToggleLeft, ToggleRight, Mail,
  ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X,
  Download, Reply, CalendarX, Upload, ImageIcon,
  HelpCircle, Tag, Zap, CheckCircle, FileText, Save, PlusCircle,
  UserCheck, Banknote, Send, Clock, Star, MessageSquare, Package,
} from 'lucide-react';
import {
  getOwners, saveOwner, deleteOwner, getPayouts, savePayout, markPayoutPaid,
  getOwnerProperties, getOwnerBookings,
} from '../lib/owners';
import { getAllReviews, deleteReview } from '../lib/reviews';
import { getAllAddons, saveAddon, deleteAddon, toggleAddonActive } from '../lib/addons';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
if (!ADMIN_EMAIL) console.warn('[OwnerDashboard] VITE_ADMIN_EMAIL is not set — admin access will be denied for all users.');
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
  price: '', weekend_premium: 0, min_nights: 1, image: '', images: [], description: '',
  amenities: '', airbnb: '', mmt: '', goibibo: '',
  is_featured: false, discount_percent: 0, deal_label: '',
  owner_id: '',
};

const EMPTY_OWNER_FORM = {
  name: '', email: '', phone: '', commission_percent: '10',
  bank_name: '', account_number: '', ifsc_code: '', upi_id: '', notes: '', user_id: '',
};

const EMPTY_PAYOUT_FORM = {
  owner_id: '', period_label: '', period_start: '', period_end: '',
  gross_amount: '', commission_amount: '', net_amount: '', booking_count: '',
  notes: '',
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
  const editFormRef = useRef(null);
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

  // Q&A tab
  const [qaList, setQaList] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaAnswerMap, setQaAnswerMap] = useState({});
  const [qaAnsweringId, setQaAnsweringId] = useState(null);

  // Owners tab
  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [ownerForm, setOwnerForm] = useState(EMPTY_OWNER_FORM);
  const [ownerSaving, setOwnerSaving] = useState(false);
  const [ownerFormError, setOwnerFormError] = useState('');
  const [deletingOwnerId, setDeletingOwnerId] = useState(null);

  // Payouts tab
  const [allPayouts, setAllPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutForm, setPayoutForm] = useState(EMPTY_PAYOUT_FORM);
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutFormError, setPayoutFormError] = useState('');
  const [computingPayout, setComputingPayout] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState(null);
  const [markPaidForm, setMarkPaidForm] = useState({ payment_method: 'upi', transaction_ref: '', notes: '' });

  // Reviews moderation tab
  const [allReviews, setAllReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Addons management tab
  const EMPTY_ADDON_FORM = { title: '', description: '', price: '', category: 'experience', emoji: '✨', sort_order: '0' };
  const [addonsData, setAddonsData] = useState([]);
  const [addonsLoading, setAddonsLoading] = useState(false);
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [addonForm, setAddonForm] = useState(EMPTY_ADDON_FORM);
  const [addonSaving, setAddonSaving] = useState(false);
  const [addonFormError, setAddonFormError] = useState('');
  const [deletingAddonId, setDeletingAddonId] = useState(null);

  // Email reminder trigger
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderResult, setReminderResult] = useState(null);

  const handleSendReminders = async () => {
    setReminderSending(true);
    setReminderResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('send-checkin-reminder', { body: {} });
      if (error) throw error;
      setReminderResult({ ok: true, msg: `${data?.sent ?? 0} reminder${data?.sent !== 1 ? 's' : ''} sent for ${data?.date ?? 'tomorrow'}.` });
    } catch (err) {
      setReminderResult({ ok: false, msg: err?.message || 'Failed to trigger reminders.' });
    } finally {
      setReminderSending(false);
      setTimeout(() => setReminderResult(null), 6000);
    }
  };

  // Content CMS tab
  const { c, cJSON, setContent: setLiveContent, contentMap } = useSiteContent();
  const [draft, setDraft] = useState({});
  const [contentSaving, setContentSaving] = useState('');
  const [contentSaved, setContentSaved] = useState('');

  // Sync draft when contentMap loads or tab opens
  useEffect(() => {
    if (activeTab === 'content') {
      const merged = { ...CONTENT_DEFAULTS, ...contentMap };
      setDraft(merged);
    }
  }, [activeTab, contentMap]);

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
    } catch (err) { console.error('Failed to load properties:', err); setError(err?.message || 'Failed to load properties.'); }
    finally { setPropertiesLoading(false); }
  }, []);

  const fetchOwners = useCallback(async () => {
    setOwnersLoading(true);
    try { setOwners(await getOwners()); } catch (err) { console.error('Failed to load owners:', err); setError(err?.message || 'Failed to load owners.'); } finally { setOwnersLoading(false); }
  }, []);

  const fetchPayoutsAdmin = useCallback(async () => {
    setPayoutsLoading(true);
    try { setAllPayouts(await getPayouts()); } catch (err) { console.error('Failed to load payouts:', err); setError(err?.message || 'Failed to load payouts.'); } finally { setPayoutsLoading(false); }
  }, []);

  const fetchReviewsAdmin = useCallback(async () => {
    setReviewsLoading(true);
    try { setAllReviews(await getAllReviews()); } catch (err) { console.error('Failed to load reviews:', err); setError(err?.message || 'Failed to load reviews.'); } finally { setReviewsLoading(false); }
  }, []);

  const fetchAddonsAdmin = useCallback(async () => {
    setAddonsLoading(true);
    try { setAddonsData(await getAllAddons()); } catch (err) { console.error('Failed to load add-ons:', err); setError(err?.message || 'Failed to load add-ons.'); } finally { setAddonsLoading(false); }
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

  useEffect(() => {
    if (isAdmin && activeTab === 'qa') {
      setQaLoading(true);
      getAllQA().then(setQaList).catch(() => {}).finally(() => setQaLoading(false));
    }
  }, [isAdmin, activeTab]);

  // ── Owner handlers ──
  const handleOwnerFormSubmit = async (e) => {
    e.preventDefault();
    if (!ownerForm.name.trim() || !ownerForm.email.trim()) {
      setOwnerFormError('Name and email are required.'); return;
    }
    setOwnerFormError(''); setOwnerSaving(true);
    try {
      const payload = {
        ...(editingOwner?.id ? { id: editingOwner.id } : {}),
        name: ownerForm.name.trim(),
        email: ownerForm.email.trim().toLowerCase(),
        phone: ownerForm.phone.trim(),
        commission_percent: parseFloat(ownerForm.commission_percent) || 10,
        bank_name: ownerForm.bank_name.trim(),
        account_number: ownerForm.account_number.trim(),
        ifsc_code: ownerForm.ifsc_code.trim().toUpperCase(),
        upi_id: ownerForm.upi_id.trim(),
        notes: ownerForm.notes.trim(),
        user_id: ownerForm.user_id.trim() || null,
      };
      const saved = await saveOwner(payload);
      setOwners(prev => {
        const idx = prev.findIndex(o => o.id === saved.id);
        return idx >= 0 ? prev.map(o => o.id === saved.id ? saved : o) : [...prev, saved];
      });
      setShowOwnerForm(false); setEditingOwner(null); setOwnerForm(EMPTY_OWNER_FORM);
    } catch (err) {
      setOwnerFormError(err?.message || 'Failed to save owner.');
    } finally { setOwnerSaving(false); }
  };

  const handleEditOwner = (o) => {
    setEditingOwner(o);
    setOwnerForm({
      name: o.name, email: o.email, phone: o.phone || '',
      commission_percent: String(o.commission_percent),
      bank_name: o.bank_name || '', account_number: o.account_number || '',
      ifsc_code: o.ifsc_code || '', upi_id: o.upi_id || '',
      notes: o.notes || '', user_id: o.user_id || '',
    });
    setOwnerFormError(''); setShowOwnerForm(true);
  };

  const handleDeleteOwner = async (id) => {
    if (!window.confirm('Delete this owner? Their properties will be unlinked.')) return;
    setDeletingOwnerId(id);
    try { await deleteOwner(id); setOwners(prev => prev.filter(o => o.id !== id)); } catch {}
    finally { setDeletingOwnerId(null); }
  };

  // ── Payout handlers ──
  const computePayoutAmounts = async () => {
    const { owner_id, period_start, period_end } = payoutForm;
    if (!owner_id || !period_start || !period_end) return;
    setComputingPayout(true);
    try {
      const owner = owners.find(o => o.id === owner_id);
      const commission = owner?.commission_percent ?? 10;
      const props = await getOwnerProperties(owner_id);
      const bkgs = props.length ? await getOwnerBookings(props.map(p => p.id)) : [];
      const eligible = bkgs.filter(b => {
        if (b.status !== 'completed' || !b.checkout_date) return false;
        return b.checkout_date >= period_start && b.checkout_date <= period_end;
      });
      const gross = eligible.reduce((s, b) => s + (b.total || 0), 0);
      const commAmt = Math.round(gross * commission / 100);
      setPayoutForm(f => ({
        ...f,
        gross_amount: String(gross),
        commission_amount: String(commAmt),
        net_amount: String(gross - commAmt),
        booking_count: String(eligible.length),
      }));
    } catch {} finally { setComputingPayout(false); }
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    if (!payoutForm.owner_id || !payoutForm.period_label || !payoutForm.period_start || !payoutForm.period_end) {
      setPayoutFormError('Owner, period label, and dates are required.'); return;
    }
    setPayoutFormError(''); setPayoutSaving(true);
    try {
      const saved = await savePayout({
        owner_id: payoutForm.owner_id,
        period_label: payoutForm.period_label.trim(),
        period_start: payoutForm.period_start,
        period_end: payoutForm.period_end,
        gross_amount: parseFloat(payoutForm.gross_amount) || 0,
        commission_amount: parseFloat(payoutForm.commission_amount) || 0,
        net_amount: parseFloat(payoutForm.net_amount) || 0,
        booking_count: parseInt(payoutForm.booking_count) || 0,
        notes: payoutForm.notes.trim(),
        status: 'pending',
      });
      setAllPayouts(prev => [saved, ...prev]);
      setShowPayoutForm(false); setPayoutForm(EMPTY_PAYOUT_FORM);
    } catch (err) {
      setPayoutFormError(err?.message || 'Failed to save payout.');
    } finally { setPayoutSaving(false); }
  };

  const handleMarkPaid = async (payoutId) => {
    setMarkingPaidId(payoutId);
    try {
      const updated = await markPayoutPaid(payoutId, markPaidForm);
      setAllPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, ...updated } : p));
      setMarkingPaidId(null); setMarkPaidForm({ payment_method: 'upi', transaction_ref: '', notes: '' });
    } catch { setMarkingPaidId(null); }
  };

  // ── Review moderation handlers ──
  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    setDeletingReviewId(id);
    try {
      await deleteReview(id);
      setAllReviews(prev => prev.filter(r => r.id !== id));
    } catch {}
    finally { setDeletingReviewId(null); }
  };

  // ── Addon handlers ──
  const handleAddonFormSubmit = async (e) => {
    e.preventDefault();
    if (!addonForm.title.trim() || !addonForm.price) {
      setAddonFormError('Title and price are required.'); return;
    }
    setAddonFormError(''); setAddonSaving(true);
    try {
      const payload = {
        ...(editingAddon?.id ? { id: editingAddon.id } : {}),
        title: addonForm.title.trim(),
        description: addonForm.description.trim(),
        price: parseFloat(addonForm.price) || 0,
        category: addonForm.category,
        emoji: addonForm.emoji.trim() || '✨',
        sort_order: parseInt(addonForm.sort_order, 10) || 0,
        is_active: editingAddon ? editingAddon.is_active : true,
      };
      const saved = await saveAddon(payload);
      setAddonsData(prev => {
        const idx = prev.findIndex(a => a.id === saved.id);
        return idx >= 0 ? prev.map(a => a.id === saved.id ? saved : a) : [...prev, saved];
      });
      setShowAddonForm(false); setEditingAddon(null); setAddonForm(EMPTY_ADDON_FORM);
    } catch (err) {
      setAddonFormError(err?.message || 'Failed to save add-on.');
    } finally { setAddonSaving(false); }
  };

  const handleEditAddon = (a) => {
    setEditingAddon(a);
    setAddonForm({
      title: a.title, description: a.description || '',
      price: String(a.price), category: a.category || 'experience',
      emoji: a.emoji || '✨', sort_order: String(a.sort_order || 0),
    });
    setAddonFormError(''); setShowAddonForm(true);
  };

  const handleDeleteAddon = async (id) => {
    if (!window.confirm('Delete this add-on?')) return;
    setDeletingAddonId(id);
    try { await deleteAddon(id); setAddonsData(prev => prev.filter(a => a.id !== id)); } catch {}
    finally { setDeletingAddonId(null); }
  };

  const handleToggleAddonActive = async (addon) => {
    try {
      await toggleAddonActive(addon.id, !addon.is_active);
      setAddonsData(prev => prev.map(a => a.id === addon.id ? { ...a, is_active: !a.is_active } : a));
    } catch {}
  };

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

  const handleAnswerQA = async (id) => {
    const answer = qaAnswerMap[id]?.trim();
    if (!answer) return;
    setQaAnsweringId(id);
    try {
      const updated = await answerQuestion(id, answer);
      setQaList(prev => prev.map(q => q.id === id ? updated : q));
      setQaAnswerMap(prev => ({ ...prev, [id]: '' }));
    } catch {
    } finally {
      setQaAnsweringId(null);
    }
  };

  const saveContentSection = async (sectionId, keys, sectionLabel) => {
    setContentSaving(sectionId);
    try {
      const entries = keys.map(key => ({ key, value: draft[key] ?? CONTENT_DEFAULTS[key] ?? '', section: sectionId, label: key }));
      await saveSiteContentBatch(entries);
      entries.forEach(({ key, value }) => setLiveContent(key, value));
      setContentSaved(sectionId);
      setTimeout(() => setContentSaved(''), 2500);
    } catch (err) {
      alert('Save failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setContentSaving('');
    }
  };

  // Helper for JSON array fields in Content tab
  const draftJSON = (key) => {
    try { return JSON.parse(draft[key] ?? CONTENT_DEFAULTS[key] ?? '[]'); } catch { return []; }
  };
  const setDraftJSON = (key, arr) => setDraft(d => ({ ...d, [key]: JSON.stringify(arr) }));

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
      min_nights: p.min_nights || 1,
      image: p.image || '',
      images: p.images || [],
      description: p.description || '',
      amenities: (p.amenities || []).join(', '),
      airbnb: p.links?.airbnb || '',
      mmt: p.links?.mmt || '',
      goibibo: p.links?.goibibo || '',
      is_featured: p.is_featured || false,
      discount_percent: p.discount_percent || 0,
      deal_label: p.deal_label || '',
      owner_id: p.owner_id || '',
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
        min_nights: Math.max(1, parseInt(propForm.min_nights, 10) || 1),
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
        is_featured: propForm.is_featured,
        discount_percent: propForm.is_featured ? (parseInt(propForm.discount_percent, 10) || 0) : 0,
        deal_label: propForm.is_featured ? propForm.deal_label.trim() : '',
        owner_id: propForm.owner_id || null,
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
    try {
      const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPromos(data || []);
    } catch (err) {
      alert('Failed to load promo codes: ' + (err.message || 'Unknown error'));
    } finally {
      setPromosLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin && activeTab === 'promos') fetchPromos();
  }, [isAdmin, activeTab, fetchPromos]);

  useEffect(() => {
    if (isAdmin && activeTab === 'owners') fetchOwners();
  }, [isAdmin, activeTab, fetchOwners]);

  useEffect(() => {
    if (isAdmin && activeTab === 'payouts') {
      fetchPayoutsAdmin();
      if (!owners.length) fetchOwners();
    }
  }, [isAdmin, activeTab, fetchPayoutsAdmin, fetchOwners, owners.length]);

  useEffect(() => {
    if (isAdmin && activeTab === 'reviews') fetchReviewsAdmin();
  }, [isAdmin, activeTab, fetchReviewsAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === 'addons') fetchAddonsAdmin();
  }, [isAdmin, activeTab, fetchAddonsAdmin]);

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
    try {
      const { error } = await supabase.from('promo_codes').update({ is_active: !current }).eq('code', code);
      if (error) throw error;
      setPromos(prev => prev.map(p => p.code === code ? { ...p, is_active: !current } : p));
    } catch (err) {
      alert('Failed to update promo: ' + (err.message || 'Unknown error'));
    }
  };

  const deletePromo = async (code) => {
    if (!window.confirm(`Delete promo code ${code}?`)) return;
    try {
      const { error } = await supabase.from('promo_codes').delete().eq('code', code);
      if (error) throw error;
      setPromos(prev => prev.filter(p => p.code !== code));
    } catch (err) {
      alert('Failed to delete promo: ' + (err.message || 'Unknown error'));
    }
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
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'bookings', label: 'All Bookings', icon: Users },
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'guests', label: 'Guest History', icon: Calendar },
    { id: 'owners', label: 'Property Owners', icon: UserCheck },
    { id: 'payouts', label: 'Payouts', icon: Banknote },
    { id: 'reviews', label: `Reviews${allReviews.length ? ` (${allReviews.length})` : ''}`, icon: Star },
    { id: 'addons', label: 'Add-ons', icon: Package },
    { id: 'qa', label: 'Q&A', icon: HelpCircle },
    { id: 'messages', label: `Messages${messages.length ? ` (${messages.length})` : ''}`, icon: Mail },
    { id: 'channels', label: 'Channel Manager', icon: Globe },
    { id: 'promos', label: 'Promo Codes', icon: CreditCard },
    { id: 'content', label: 'Site Content', icon: FileText },
  ];

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-golden/40';
  const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1';

  // Scroll the inline edit form into view whenever a property is opened for editing
  useEffect(() => {
    if (editingProp) {
      setTimeout(() => editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
    }
  }, [editingProp?.id]);

  const renderPropFormContent = () => (
    <>
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
              value={propForm.weekend_premium || ''}
              onChange={e => setPropForm(f => ({ ...f, weekend_premium: parseInt(e.target.value, 10) || 0 }))}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">0 = flat rate. e.g. 20 = 20% more on Fri &amp; Sat nights.</p>
          </div>
          <div>
            <label className={labelCls}>Min Stay (nights)</label>
            <input
              type="number"
              placeholder="1"
              min="1"
              max="30"
              value={propForm.min_nights}
              onChange={e => setPropForm(f => ({ ...f, min_nights: e.target.valueAsNumber || 1 }))}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">Minimum nights a guest must book.</p>
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
          {/* Property Owner */}
          <div className="sm:col-span-2">
            <label className={labelCls}>Property Owner <span className="normal-case text-gray-400 font-normal">(optional — leave blank for platform-owned)</span></label>
            <select
              value={propForm.owner_id}
              onChange={e => setPropForm(f => ({ ...f, owner_id: e.target.value }))}
              className={inputCls}
            >
              <option value="">— Platform Owned (no commission split) —</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.email}) · {o.commission_percent}% commission</option>
              ))}
            </select>
          </div>
          {/* Flash Deal */}
          <div className="sm:col-span-2">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wide cursor-pointer">
                  <Zap size={14} className="text-amber-500" /> Flash Deal
                </label>
                <button
                  type="button"
                  onClick={() => setPropForm(f => ({ ...f, is_featured: !f.is_featured }))}
                  className="text-amber-600"
                >
                  {propForm.is_featured
                    ? <ToggleRight size={28} className="text-amber-500" />
                    : <ToggleLeft size={28} className="text-gray-400" />}
                </button>
              </div>
              {propForm.is_featured && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Discount (%)</label>
                    <input
                      type="number"
                      placeholder="e.g. 20"
                      min="1" max="99"
                      value={propForm.discount_percent || ''}
                      onChange={e => setPropForm(f => ({ ...f, discount_percent: parseInt(e.target.value, 10) || 0 }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Deal Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Weekend Special"
                      value={propForm.deal_label}
                      onChange={e => setPropForm(f => ({ ...f, deal_label: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </div>
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
    </>
  );

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
          <div className="flex flex-col items-start sm:items-end gap-2 self-start sm:self-auto">
            <div className="flex gap-2">
              <button
                onClick={fetchBookings}
                className="flex items-center gap-2 text-sm font-bold text-golden border border-golden/30 hover:bg-golden/5 px-4 py-2 rounded-full transition"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={handleSendReminders}
                disabled={reminderSending}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-full transition disabled:opacity-50"
                title="Send pre-stay reminder emails to guests checking in tomorrow"
              >
                {reminderSending
                  ? <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  : <Send size={13} />}
                {reminderSending ? 'Sending…' : "Tomorrow's Reminders"}
              </button>
            </div>
            {reminderResult && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${reminderResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {reminderResult.msg}
              </span>
            )}
          </div>
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
            {showPropForm && !editingProp && (
              <div className="bg-white rounded-2xl border border-golden/30 shadow-md p-6">
                {renderPropFormContent()}
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
                            {p.is_featured && p.discount_percent > 0 && (
                              <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Zap size={10} /> {p.discount_percent}% OFF
                              </span>
                            )}
                            {p.min_nights > 1 && (
                              <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                                {p.min_nights}n min
                              </span>
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
                    {/* Inline edit form — opens directly below this property row */}
                    {editingProp?.id === p.id && (
                      <div ref={editFormRef} className="border-t-2 border-golden/30 bg-golden/[0.03] px-5 sm:px-6 py-5">
                        {renderPropFormContent()}
                      </div>
                    )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Property Owners Tab ── */}
        {activeTab === 'owners' && (
          <div className="space-y-4">
            {showOwnerForm && (
              <div className="bg-white rounded-2xl border border-golden/30 shadow-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-charcoal text-base">
                    {editingOwner ? 'Edit Owner' : 'Add New Owner'}
                  </h2>
                  <button onClick={() => { setShowOwnerForm(false); setEditingOwner(null); setOwnerForm(EMPTY_OWNER_FORM); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
                <form onSubmit={handleOwnerFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input type="text" value={ownerForm.name} onChange={e => setOwnerForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. Rahul Sharma" required />
                    </div>
                    <div>
                      <label className={labelCls}>Email *</label>
                      <input type="email" value={ownerForm.email} onChange={e => setOwnerForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="owner@email.com" required />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input type="tel" value={ownerForm.phone} onChange={e => setOwnerForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className={labelCls}>Commission % *</label>
                      <input type="number" min="0" max="50" step="0.5" value={ownerForm.commission_percent} onChange={e => setOwnerForm(f => ({ ...f, commission_percent: e.target.value }))} className={inputCls} required />
                      <p className="text-xs text-gray-400 mt-1">Platform keeps this %. Owner receives the remainder.</p>
                    </div>
                    <div>
                      <label className={labelCls}>Supabase User ID <span className="normal-case text-gray-400 font-normal">(optional — for portal access)</span></label>
                      <input type="text" value={ownerForm.user_id} onChange={e => setOwnerForm(f => ({ ...f, user_id: e.target.value }))} className={inputCls} placeholder="UUID from auth.users" />
                      <p className="text-xs text-gray-400 mt-1">Link their login so they can access /owner-portal.</p>
                    </div>
                    <div>
                      <label className={labelCls}>Bank Name</label>
                      <input type="text" value={ownerForm.bank_name} onChange={e => setOwnerForm(f => ({ ...f, bank_name: e.target.value }))} className={inputCls} placeholder="e.g. HDFC Bank" />
                    </div>
                    <div>
                      <label className={labelCls}>Account Number</label>
                      <input type="text" value={ownerForm.account_number} onChange={e => setOwnerForm(f => ({ ...f, account_number: e.target.value }))} className={inputCls} placeholder="Bank account number" />
                    </div>
                    <div>
                      <label className={labelCls}>IFSC Code</label>
                      <input type="text" value={ownerForm.ifsc_code} onChange={e => setOwnerForm(f => ({ ...f, ifsc_code: e.target.value.toUpperCase() }))} className={inputCls} placeholder="e.g. HDFC0001234" />
                    </div>
                    <div>
                      <label className={labelCls}>UPI ID</label>
                      <input type="text" value={ownerForm.upi_id} onChange={e => setOwnerForm(f => ({ ...f, upi_id: e.target.value }))} className={inputCls} placeholder="e.g. rahul@upi" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Internal Notes</label>
                      <textarea rows={2} value={ownerForm.notes} onChange={e => setOwnerForm(f => ({ ...f, notes: e.target.value }))} className={inputCls + ' resize-none'} placeholder="Any notes about this owner or agreement…" />
                    </div>
                  </div>
                  {ownerFormError && <p className="text-red-500 text-sm">{ownerFormError}</p>}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={ownerSaving}
                      className="flex items-center gap-2 bg-golden hover:bg-golden-dark text-white font-bold px-6 py-2.5 rounded-xl transition text-sm disabled:opacity-60"
                    >
                      {ownerSaving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                      {ownerSaving ? 'Saving…' : editingOwner ? 'Save Changes' : 'Add Owner'}
                    </button>
                    <button type="button" onClick={() => { setShowOwnerForm(false); setEditingOwner(null); setOwnerForm(EMPTY_OWNER_FORM); }}
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
                  <UserCheck size={16} className="text-golden" /> Property Owners
                  {!ownersLoading && <span className="ml-1 bg-golden text-white text-xs font-bold px-2 py-0.5 rounded-full">{owners.length}</span>}
                </h2>
                {!showOwnerForm && (
                  <button onClick={() => { setShowOwnerForm(true); setEditingOwner(null); setOwnerForm(EMPTY_OWNER_FORM); setOwnerFormError(''); }}
                    className="flex items-center gap-2 bg-golden hover:bg-golden-dark text-white text-sm font-bold px-4 py-2 rounded-full transition"
                  >
                    <Plus size={14} /> Add Owner
                  </button>
                )}
              </div>
              {ownersLoading ? (
                <div className="p-14 flex items-center justify-center">
                  <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                </div>
              ) : owners.length === 0 ? (
                <div className="p-14 text-center">
                  <UserCheck size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No property owners yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Add owners to enable the commission marketplace system.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {owners.map(o => {
                    const ownerProps = propertiesData.filter(p => p.owner_id === o.id);
                    return (
                      <div key={o.id} className="p-5 hover:bg-gray-50/50 transition">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-charcoal">{o.name}</p>
                              <span className="text-xs font-bold text-golden bg-golden/10 border border-golden/20 px-2 py-0.5 rounded-full">{o.commission_percent}% commission</span>
                              {o.user_id && <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Portal Access</span>}
                            </div>
                            <p className="text-gray-400 text-xs">{o.email}{o.phone && ` · ${o.phone}`}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                              {o.bank_name && <span>🏦 {o.bank_name}</span>}
                              {o.upi_id && <span>📲 {o.upi_id}</span>}
                              {o.ifsc_code && <span>IFSC: {o.ifsc_code}</span>}
                            </div>
                            {ownerProps.length > 0 && (
                              <p className="text-xs text-blue-600 mt-2">
                                {ownerProps.length} propert{ownerProps.length !== 1 ? 'ies' : 'y'}: {ownerProps.map(p => p.title).join(', ')}
                              </p>
                            )}
                            {o.notes && <p className="text-xs text-gray-400 italic mt-1">{o.notes}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => handleEditOwner(o)} className="p-2 text-gray-400 hover:text-golden hover:bg-golden/10 rounded-lg transition" title="Edit">
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteOwner(o.id)}
                              disabled={deletingOwnerId === o.id}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingOwnerId === o.id
                                ? <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                : <Trash2 size={15} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Payouts Tab ── */}
        {activeTab === 'payouts' && (
          <div className="space-y-4">
            {/* Create payout form */}
            {showPayoutForm && (
              <div className="bg-white rounded-2xl border border-golden/30 shadow-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-charcoal text-base">Create Payout Record</h2>
                  <button onClick={() => { setShowPayoutForm(false); setPayoutForm(EMPTY_PAYOUT_FORM); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
                <form onSubmit={handlePayoutSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Owner *</label>
                      <select value={payoutForm.owner_id} onChange={e => setPayoutForm(f => ({ ...f, owner_id: e.target.value }))} className={inputCls} required>
                        <option value="">— Select Owner —</option>
                        {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.commission_percent}%)</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Period Label *</label>
                      <input type="text" placeholder="e.g. June 2025" value={payoutForm.period_label}
                        onChange={e => setPayoutForm(f => ({ ...f, period_label: e.target.value }))}
                        className={inputCls} required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Period Start *</label>
                      <input type="date" value={payoutForm.period_start}
                        onChange={e => setPayoutForm(f => ({ ...f, period_start: e.target.value }))}
                        className={inputCls} required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Period End *</label>
                      <input type="date" value={payoutForm.period_end}
                        onChange={e => setPayoutForm(f => ({ ...f, period_end: e.target.value }))}
                        className={inputCls} required
                      />
                    </div>
                  </div>
                  <button type="button" onClick={computePayoutAmounts} disabled={computingPayout || !payoutForm.owner_id || !payoutForm.period_start || !payoutForm.period_end}
                    className="flex items-center gap-2 text-sm font-bold text-golden border border-golden/30 hover:bg-golden/5 px-4 py-2 rounded-full transition disabled:opacity-50"
                  >
                    {computingPayout ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <RefreshCw size={14} />}
                    {computingPayout ? 'Computing…' : 'Auto-compute from completed bookings'}
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Gross Amount (₹)</label>
                      <input type="number" min="0" value={payoutForm.gross_amount}
                        onChange={e => setPayoutForm(f => ({ ...f, gross_amount: e.target.value }))}
                        className={inputCls} placeholder="0"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Commission Deducted (₹)</label>
                      <input type="number" min="0" value={payoutForm.commission_amount}
                        onChange={e => setPayoutForm(f => ({ ...f, commission_amount: e.target.value }))}
                        className={inputCls} placeholder="0"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Net to Owner (₹)</label>
                      <input type="number" min="0" value={payoutForm.net_amount}
                        onChange={e => setPayoutForm(f => ({ ...f, net_amount: e.target.value }))}
                        className={inputCls} placeholder="0"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Booking Count</label>
                      <input type="number" min="0" value={payoutForm.booking_count}
                        onChange={e => setPayoutForm(f => ({ ...f, booking_count: e.target.value }))}
                        className={inputCls} placeholder="0"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Notes</label>
                      <input type="text" value={payoutForm.notes}
                        onChange={e => setPayoutForm(f => ({ ...f, notes: e.target.value }))}
                        className={inputCls} placeholder="Optional notes…"
                      />
                    </div>
                  </div>
                  {payoutFormError && <p className="text-red-500 text-sm">{payoutFormError}</p>}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={payoutSaving}
                      className="flex items-center gap-2 bg-golden hover:bg-golden-dark text-white font-bold px-6 py-2.5 rounded-xl transition text-sm disabled:opacity-60"
                    >
                      {payoutSaving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                      {payoutSaving ? 'Saving…' : 'Create Payout Record'}
                    </button>
                    <button type="button" onClick={() => { setShowPayoutForm(false); setPayoutForm(EMPTY_PAYOUT_FORM); }}
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
                  <Banknote size={16} className="text-golden" /> Payout Records
                  {!payoutsLoading && <span className="ml-1 bg-golden text-white text-xs font-bold px-2 py-0.5 rounded-full">{allPayouts.length}</span>}
                </h2>
                {!showPayoutForm && (
                  <button onClick={() => { setShowPayoutForm(true); setPayoutFormError(''); setPayoutForm(EMPTY_PAYOUT_FORM); }}
                    className="flex items-center gap-2 bg-golden hover:bg-golden-dark text-white text-sm font-bold px-4 py-2 rounded-full transition"
                  >
                    <Plus size={14} /> New Payout
                  </button>
                )}
              </div>
              {payoutsLoading ? (
                <div className="p-14 flex items-center justify-center">
                  <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                </div>
              ) : allPayouts.length === 0 ? (
                <div className="p-14 text-center">
                  <Banknote size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No payouts yet.</p>
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-gray-50">
                  {allPayouts.map(p => (
                    <div key={p.id} className="p-5 hover:bg-gray-50/50 transition">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-bold text-charcoal">{p.property_owners?.name || '—'}</p>
                            <span className="text-xs text-gray-400">·</span>
                            <p className="text-sm font-semibold text-charcoal">{p.period_label}</p>
                            {p.status === 'paid' ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                <CheckCircle size={10} /> Paid
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
                                <Clock size={10} /> Pending
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
                            <span>Gross: <span className="font-semibold text-charcoal">₹{Number(p.gross_amount).toLocaleString('en-IN')}</span></span>
                            <span>Commission: <span className="font-semibold text-red-400">−₹{Number(p.commission_amount).toLocaleString('en-IN')}</span></span>
                            <span>Net: <span className="font-bold text-green-600">₹{Number(p.net_amount).toLocaleString('en-IN')}</span></span>
                            <span>{p.booking_count} booking{p.booking_count !== 1 ? 's' : ''}</span>
                          </div>
                          {p.status === 'paid' && p.payment_method && (
                            <p className="text-xs text-gray-400 mt-1">
                              via {p.payment_method}{p.transaction_ref && ` · Ref: ${p.transaction_ref}`}
                              {p.paid_at && ` · Paid on ${fmtDate(p.paid_at)}`}
                            </p>
                          )}
                          {p.notes && <p className="text-xs text-gray-400 italic mt-1">{p.notes}</p>}
                        </div>
                        {p.status === 'pending' && (
                          <div className="shrink-0">
                            {markingPaidId === p.id ? (
                              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 w-64">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mark as Paid</p>
                                <select value={markPaidForm.payment_method}
                                  onChange={e => setMarkPaidForm(f => ({ ...f, payment_method: e.target.value }))}
                                  className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-golden/40"
                                >
                                  <option value="upi">UPI</option>
                                  <option value="bank_transfer">Bank Transfer</option>
                                  <option value="cash">Cash</option>
                                </select>
                                <input type="text" placeholder="Transaction ref / UTR" value={markPaidForm.transaction_ref}
                                  onChange={e => setMarkPaidForm(f => ({ ...f, transaction_ref: e.target.value }))}
                                  className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-golden/40"
                                />
                                <input type="text" placeholder="Notes (optional)" value={markPaidForm.notes}
                                  onChange={e => setMarkPaidForm(f => ({ ...f, notes: e.target.value }))}
                                  className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-golden/40"
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => handleMarkPaid(p.id)}
                                    className="flex-1 flex items-center justify-center gap-1 text-xs font-bold bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg transition"
                                  >
                                    <Send size={11} /> Confirm
                                  </button>
                                  <button onClick={() => setMarkingPaidId(null)} className="text-xs text-gray-500 border border-gray-200 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => { setMarkingPaidId(p.id); setMarkPaidForm({ payment_method: 'upi', transaction_ref: '', notes: '' }); }}
                                className="flex items-center gap-2 text-sm font-bold text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-full transition"
                              >
                                <CheckCircle size={14} /> Mark Paid
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Guest History */}
        {activeTab === 'guests' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                <Calendar size={16} className="text-golden" /> Guest History
              </h2>
            </div>
            {loading ? (
              <div className="p-14 flex items-center justify-center">
                <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-14 text-center text-gray-400 text-sm">No bookings yet.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {Object.entries(
                  bookings.reduce((acc, b) => {
                    const key = b.property_title || 'Unknown Property';
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(b);
                    return acc;
                  }, {})
                ).map(([propTitle, propBookings]) => (
                  <div key={propTitle} className="p-5">
                    <h3 className="font-bold text-charcoal text-sm mb-3 flex items-center gap-2">
                      <Home size={14} className="text-golden" /> {propTitle}
                      <span className="ml-1 text-xs bg-golden text-white px-2 py-0.5 rounded-full font-bold">{propBookings.length}</span>
                    </h3>
                    <div className="space-y-2">
                      {propBookings.map(b => (
                        <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50 rounded-xl px-4 py-3">
                          <div>
                            <p className="font-semibold text-charcoal text-sm">{b.guest_name}</p>
                            <p className="text-xs text-gray-400">{b.guest_email}{b.guest_phone && ` · ${b.guest_phone}`}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span>{fmtDate(b.checkin_date)} → {fmtDate(b.checkout_date)}</span>
                            <span className="font-bold text-charcoal">{fmt(b.total)}</span>
                            <span className={`px-2 py-0.5 rounded-full border font-bold ${STATUS_COLORS[b.status] ?? STATUS_COLORS.confirmed}`}>
                              {b.status ?? 'confirmed'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Q&A Panel */}
        {activeTab === 'qa' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                <HelpCircle size={16} className="text-golden" /> Guest Q&amp;A
              </h2>
              <button
                onClick={() => { setQaLoading(true); getAllQA().then(setQaList).catch(() => {}).finally(() => setQaLoading(false)); }}
                className="text-golden text-sm font-bold flex items-center gap-1 hover:underline"
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
            {qaLoading ? (
              <div className="p-14 flex items-center justify-center">
                <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : qaList.length === 0 ? (
              <div className="p-14 text-center text-gray-400 text-sm">No questions yet.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {/* Unanswered first */}
                {[...qaList].sort((a, b) => (a.answer ? 1 : 0) - (b.answer ? 1 : 0)).map(q => (
                  <div key={q.id} className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-charcoal text-sm">{q.question}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          by <span className="font-medium">{q.asker_name || 'Guest'}</span>
                          {q.property_id && <span className="ml-2 text-gray-300">· Property {q.property_id.slice(0, 8)}</span>}
                          <span className="ml-2">{fmtDate(q.created_at)}</span>
                        </p>
                      </div>
                      {!q.answer && (
                        <span className="shrink-0 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">Unanswered</span>
                      )}
                      {q.answer && (
                        <span className="shrink-0 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={10} /> Answered
                        </span>
                      )}
                    </div>
                    {q.answer ? (
                      <div className="mt-2 bg-golden/5 border border-golden/20 rounded-xl px-4 py-3">
                        <p className="text-xs font-bold text-golden mb-1">Your Answer</p>
                        <p className="text-sm text-charcoal">{q.answer}</p>
                      </div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <textarea
                          rows={2}
                          placeholder="Type your answer…"
                          value={qaAnswerMap[q.id] || ''}
                          onChange={e => setQaAnswerMap(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-golden/40 resize-none"
                        />
                        <button
                          onClick={() => handleAnswerQA(q.id)}
                          disabled={qaAnsweringId === q.id || !qaAnswerMap[q.id]?.trim()}
                          className="px-4 py-2 bg-golden hover:bg-golden-dark text-white font-bold text-xs rounded-xl transition disabled:opacity-50 self-start"
                        >
                          {qaAnsweringId === q.id ? 'Saving…' : 'Answer'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

        {/* ── SITE CONTENT CMS ── */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={16} className="text-golden" />
                <h2 className="font-bold text-charcoal text-base">Site Content Manager</h2>
              </div>
              <p className="text-xs text-gray-400">Edit any text on the site here. Changes go live instantly — no redeploy needed.</p>
            </div>

            {/* Helper: save button */}
            {(() => {
              const SaveBtn = ({ sectionId, keys, label }) => (
                <button
                  onClick={() => saveContentSection(sectionId, keys, label)}
                  disabled={!!contentSaving}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition disabled:opacity-60 ${
                    contentSaved === sectionId
                      ? 'bg-green-500 text-white'
                      : 'bg-golden hover:bg-golden-dark text-white'
                  }`}
                >
                  {contentSaving === sectionId
                    ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving…</>
                    : contentSaved === sectionId
                    ? <><CheckCircle size={15} /> Saved!</>
                    : <><Save size={15} /> Save {label}</>}
                </button>
              );

              const F = ({ label: lbl, k, rows = 1 }) => (
                <div>
                  <label className={labelCls}>{lbl}</label>
                  {rows === 1
                    ? <input value={draft[k] ?? ''} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))} className={inputCls} />
                    : <textarea rows={rows} value={draft[k] ?? ''} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))} className={inputCls + ' resize-none'} />}
                </div>
              );

              return (
                <>
                  {/* ── Hero ── */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-charcoal flex items-center gap-2"><span className="text-golden text-lg">①</span> Home — Hero Section</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <F label="Badge Text" k="hero.badge" />
                      <div />
                      <F label="Title (use \\n for line break)" k="hero.title" rows={2} />
                      <F label="Subtitle" k="hero.subtitle" rows={2} />
                    </div>
                    <SaveBtn sectionId="hero" keys={['hero.badge','hero.title','hero.subtitle']} label="Hero" />
                  </div>

                  {/* ── Services / Feature Cards ── */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-charcoal flex items-center gap-2"><span className="text-golden text-lg">②</span> Home — Feature Cards</h3>
                    {[1,2,3].map(n => (
                      <div key={n} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="sm:col-span-1">
                          <F label={`Card ${n} — Title`} k={`services.${n}.title`} />
                        </div>
                        <div className="sm:col-span-2">
                          <F label={`Card ${n} — Description`} k={`services.${n}.desc`} rows={2} />
                        </div>
                      </div>
                    ))}
                    <SaveBtn sectionId="services" keys={['services.1.title','services.1.desc','services.2.title','services.2.desc','services.3.title','services.3.desc']} label="Services" />
                  </div>

                  {/* ── FAQ ── */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-charcoal flex items-center gap-2"><span className="text-golden text-lg">③</span> Home — FAQ</h3>
                    {draftJSON('faq.items').map((item, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                        <div>
                          <label className={labelCls}>Question {i+1}</label>
                          <input value={item.q} onChange={e => {
                            const arr = draftJSON('faq.items');
                            arr[i] = { ...arr[i], q: e.target.value };
                            setDraftJSON('faq.items', arr);
                          }} className={inputCls} />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className={labelCls}>Answer {i+1}</label>
                            <textarea rows={2} value={item.a} onChange={e => {
                              const arr = draftJSON('faq.items');
                              arr[i] = { ...arr[i], a: e.target.value };
                              setDraftJSON('faq.items', arr);
                            }} className={inputCls + ' resize-none'} />
                          </div>
                          <button onClick={() => {
                            const arr = draftJSON('faq.items').filter((_, j) => j !== i);
                            setDraftJSON('faq.items', arr);
                          }} className="mt-5 p-2 text-red-400 hover:text-red-600 transition self-start">
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => {
                      const arr = draftJSON('faq.items');
                      arr.push({ q: 'New question?', a: 'Answer here.' });
                      setDraftJSON('faq.items', arr);
                    }} className="flex items-center gap-2 text-sm text-golden font-bold hover:underline">
                      <PlusCircle size={15} /> Add Question
                    </button>
                    <SaveBtn sectionId="faq" keys={['faq.items']} label="FAQ" />
                  </div>

                  {/* ── About Page ── */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-charcoal flex items-center gap-2"><span className="text-golden text-lg">④</span> About Page</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <F label="Hero Title" k="about.hero.title" />
                      <F label="Hero Subtitle" k="about.hero.subtitle" rows={2} />
                      <F label="Story Eyebrow" k="about.story.eyebrow" />
                      <F label="Story Title" k="about.story.title" />
                      <F label="Story Paragraph 1" k="about.story.p1" rows={3} />
                      <F label="Story Paragraph 2" k="about.story.p2" rows={3} />
                      <F label="Award Text" k="about.award.text" />
                      <F label="Award Source" k="about.award.source" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-2">Stats Bar (4 items)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {draftJSON('about.stats').map((s, i) => (
                        <div key={i} className="space-y-2">
                          <div>
                            <label className={labelCls}>Value {i+1}</label>
                            <input value={s.value} onChange={e => {
                              const arr = draftJSON('about.stats');
                              arr[i] = { ...arr[i], value: e.target.value };
                              setDraftJSON('about.stats', arr);
                            }} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Label {i+1}</label>
                            <input value={s.label} onChange={e => {
                              const arr = draftJSON('about.stats');
                              arr[i] = { ...arr[i], label: e.target.value };
                              setDraftJSON('about.stats', arr);
                            }} className={inputCls} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-2">Core Values (3 cards)</p>
                    {draftJSON('about.values').map((v, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                        <div>
                          <label className={labelCls}>Value {i+1} Title</label>
                          <input value={v.title} onChange={e => {
                            const arr = draftJSON('about.values');
                            arr[i] = { ...arr[i], title: e.target.value };
                            setDraftJSON('about.values', arr);
                          }} className={inputCls} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Value {i+1} Description</label>
                          <textarea rows={2} value={v.desc} onChange={e => {
                            const arr = draftJSON('about.values');
                            arr[i] = { ...arr[i], desc: e.target.value };
                            setDraftJSON('about.values', arr);
                          }} className={inputCls + ' resize-none'} />
                        </div>
                      </div>
                    ))}
                    <SaveBtn sectionId="about" keys={['about.hero.title','about.hero.subtitle','about.story.eyebrow','about.story.title','about.story.p1','about.story.p2','about.award.text','about.award.source','about.stats','about.values']} label="About" />
                  </div>

                  {/* ── Contact Info ── */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-charcoal flex items-center gap-2"><span className="text-golden text-lg">⑤</span> Contact Info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <F label="Phone Number" k="contact.phone" />
                      <F label="Email Address" k="contact.email" />
                      <F label="Office Address" k="contact.address" />
                      <F label="Office Hours" k="contact.hours" />
                      <F label="Page Hero Title (use \\n for line break)" k="contact.hero.title" rows={2} />
                      <F label="Page Hero Subtitle" k="contact.hero.subtitle" rows={2} />
                    </div>
                    <SaveBtn sectionId="contact" keys={['contact.phone','contact.email','contact.address','contact.hours','contact.hero.title','contact.hero.subtitle']} label="Contact" />
                  </div>

                  {/* ── Footer ── */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-charcoal flex items-center gap-2"><span className="text-golden text-lg">⑥</span> Footer</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <F label="Tagline / About Blurb" k="footer.tagline" rows={2} />
                      <div className="space-y-4">
                        <F label="Footer Email" k="footer.email" />
                        <F label="Footer Address" k="footer.address" />
                        <F label="Copyright Text" k="footer.copyright" />
                      </div>
                    </div>
                    <SaveBtn sectionId="footer" keys={['footer.tagline','footer.email','footer.address','footer.copyright']} label="Footer" />
                  </div>
                </>
              );
            })()}
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

        {/* Reviews Moderation Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                <Star size={16} className="text-golden fill-golden" /> Guest Reviews
              </h2>
              <button onClick={fetchReviewsAdmin} className="flex items-center gap-1.5 text-xs font-bold text-golden border border-golden/30 hover:bg-golden/5 px-3 py-1.5 rounded-full transition">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            {reviewsLoading ? (
              <div className="p-14 flex items-center justify-center">
                <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : allReviews.length === 0 ? (
              <div className="p-14 text-center text-gray-400 text-sm">No reviews yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {['Property', 'Reviewer', 'Rating', 'Comment', 'Date', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allReviews.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-[160px] truncate font-medium">{r.property_title || `Property #${r.property_id}`}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-semibold text-charcoal">{r.reviewer_name}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={12} className={s <= r.rating ? 'text-golden fill-golden' : 'text-gray-200 fill-gray-200'} />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{r.rating}/5</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[260px]">
                          <p className="truncate text-xs">{r.comment}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{fmtDate(r.created_at)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            disabled={deletingReviewId === r.id}
                            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50 transition"
                          >
                            <Trash2 size={12} /> {deletingReviewId === r.id ? 'Deleting…' : 'Delete'}
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

        {/* Add-ons Management Tab */}
        {activeTab === 'addons' && (
          <div className="space-y-4">
            {showAddonForm && (
              <div className="bg-white rounded-2xl border border-golden/30 shadow-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-charcoal text-base">
                    {editingAddon ? 'Edit Add-on' : 'New Add-on'}
                  </h2>
                  <button
                    onClick={() => { setShowAddonForm(false); setEditingAddon(null); setAddonForm(EMPTY_ADDON_FORM); }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
                <form onSubmit={handleAddonFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Title *</label>
                      <input value={addonForm.title} onChange={e => setAddonForm(f => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="e.g. Candlelight Dinner" required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Description</label>
                      <textarea rows={2} value={addonForm.description} onChange={e => setAddonForm(f => ({ ...f, description: e.target.value }))} className={inputCls + ' resize-none'} placeholder="Brief description shown at checkout" />
                    </div>
                    <div>
                      <label className={labelCls}>Price (₹) *</label>
                      <input type="number" min="0" step="50" value={addonForm.price} onChange={e => setAddonForm(f => ({ ...f, price: e.target.value }))} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Emoji</label>
                      <input value={addonForm.emoji} onChange={e => setAddonForm(f => ({ ...f, emoji: e.target.value }))} className={inputCls} placeholder="✨" maxLength={4} />
                    </div>
                    <div>
                      <label className={labelCls}>Category</label>
                      <select value={addonForm.category} onChange={e => setAddonForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                        <option value="experience">Experience</option>
                        <option value="food">Food & Drink</option>
                        <option value="transport">Transport</option>
                        <option value="wellness">Wellness</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Sort Order</label>
                      <input type="number" min="0" value={addonForm.sort_order} onChange={e => setAddonForm(f => ({ ...f, sort_order: e.target.value }))} className={inputCls} />
                    </div>
                  </div>
                  {addonFormError && <p className="text-red-500 text-xs">{addonFormError}</p>}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={addonSaving} className="bg-golden hover:bg-golden-dark disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm flex items-center gap-2">
                      <Save size={14} /> {addonSaving ? 'Saving…' : editingAddon ? 'Update Add-on' : 'Create Add-on'}
                    </button>
                    <button type="button" onClick={() => { setShowAddonForm(false); setEditingAddon(null); setAddonForm(EMPTY_ADDON_FORM); }} className="border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold px-5 py-2.5 rounded-xl transition text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-charcoal flex items-center gap-2 text-base">
                  <Package size={16} className="text-golden" /> Add-on Packages
                </h2>
                <button
                  onClick={() => { setShowAddonForm(true); setEditingAddon(null); setAddonForm(EMPTY_ADDON_FORM); setAddonFormError(''); }}
                  className="flex items-center gap-1.5 bg-golden hover:bg-golden-dark text-white font-bold px-4 py-2 rounded-full transition text-sm"
                >
                  <Plus size={14} /> New Add-on
                </button>
              </div>
              {addonsLoading ? (
                <div className="p-14 flex items-center justify-center">
                  <svg className="animate-spin h-7 w-7 text-golden" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              ) : addonsData.length === 0 ? (
                <div className="p-14 text-center text-gray-400 text-sm">
                  No add-ons yet. Run <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">supabase/addons_setup.sql</code> first.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        {['', 'Title', 'Category', 'Price', 'Order', 'Active', ''].map(h => (
                          <th key={h} className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {addonsData.map(a => (
                        <tr key={a.id} className={`hover:bg-gray-50/50 transition ${!a.is_active ? 'opacity-50' : ''}`}>
                          <td className="px-4 py-3 text-xl">{a.emoji}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-charcoal">{a.title}</p>
                            <p className="text-gray-400 text-xs truncate max-w-[200px]">{a.description}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-500 capitalize whitespace-nowrap">{a.category}</td>
                          <td className="px-4 py-3 font-bold text-charcoal whitespace-nowrap">₹{Number(a.price).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-gray-400 text-center">{a.sort_order}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleAddonActive(a)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${a.is_active ? 'bg-golden' : 'bg-gray-200'}`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${a.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <button onClick={() => handleEditAddon(a)} className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition">
                                <Pencil size={12} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddon(a.id)}
                                disabled={deletingAddonId === a.id}
                                className="text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-1 transition"
                              >
                                <Trash2 size={12} /> {deletingAddonId === a.id ? '…' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            bookings={bookings}
            propertiesData={propertiesData}
            loading={loading}
          />
        )}

      </div>
    </div>
  );
};

export default OwnerDashboard;
