import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Calendar, Users, Hash, CreditCard,
  CheckCircle, Clock, XCircle, AlertTriangle,
  Printer, Pencil, X, Check,
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import BookingInvoice from './BookingInvoice';
import { updateBookingDates } from '../lib/bookings';
import { getPropertyAvailability, hasDateConflict } from '../lib/availability';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
  pending:   { label: 'Pending',   icon: Clock,        color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  cancelled: { label: 'Cancelled', icon: XCircle,      color: 'text-red-500 bg-red-50 border-red-200' },
  completed: { label: 'Completed', icon: CheckCircle,  color: 'text-gray-500 bg-gray-50 border-gray-200' },
};

const BookingCard = ({ booking, onCancel, onUpdateDates }) => {
  const {
    property_title, property_location, property_image, property_id,
    checkin_date, checkout_date, guests, nights, total, subtotal,
    cleaning_fee, service_fee, loyalty_discount,
    booking_ref, payment_id, status,
  } = booking;

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.confirmed;
  const StatusIcon = cfg.icon;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkinDate = new Date(checkin_date);
  const isUpcoming = checkinDate >= today;
  const daysUntil = isUpcoming ? Math.ceil((checkinDate - today) / (1000 * 60 * 60 * 24)) : null;
  const canCancel = isUpcoming && status !== 'cancelled' && status !== 'completed';
  const canEdit = isUpcoming && status !== 'cancelled' && status !== 'completed';

  // Refund eligibility based on days until check-in
  const refundInfo = canCancel
    ? daysUntil >= 7
      ? { label: 'Full refund', amount: total, color: 'text-green-600' }
      : daysUntil >= 3
        ? { label: '50% refund', amount: Math.round(total * 0.5), color: 'text-yellow-600' }
        : { label: 'No refund', amount: 0, color: 'text-red-500' }
    : null;

  // Cancel state
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const handleConfirmCancel = async () => {
    if (!onCancel) return;
    setCancelling(true);
    setCancelError('');
    try {
      await onCancel(booking.id);
    } catch {
      setCancelError('Could not cancel. Please try again.');
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  // Date edit state
  const todayStr = new Date().toISOString().split('T')[0];
  const [showEdit, setShowEdit] = useState(false);
  const [newCheckin, setNewCheckin] = useState(checkin_date);
  const [newCheckout, setNewCheckout] = useState(checkout_date);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const pricePerNight = subtotal && nights ? Math.round(subtotal / nights) : Math.round((total - (cleaning_fee || 500) - (service_fee || 300) + (loyalty_discount || 0)) / nights);
  const newNights = newCheckin && newCheckout
    ? Math.max(1, Math.ceil((new Date(newCheckout) - new Date(newCheckin)) / 86400000))
    : 0;
  const newSubtotal = pricePerNight * newNights;
  const newTotal = newSubtotal + (cleaning_fee || 500) + (service_fee || 300) - (loyalty_discount || 0);

  const minNewCheckout = newCheckin
    ? new Date(new Date(newCheckin).getTime() + 86400000).toISOString().split('T')[0]
    : todayStr;

  const handleSaveDates = async () => {
    if (!newCheckin || !newCheckout) { setEditError('Please select both dates.'); return; }
    if (newCheckin === checkin_date && newCheckout === checkout_date) { setShowEdit(false); return; }
    setSaving(true);
    setEditError('');
    try {
      // Check availability, excluding the current booking's own date range
      const allAvailability = await getPropertyAvailability(property_id);
      const otherBookings = allAvailability.filter(
        r => !(r.checkin_date === checkin_date && r.checkout_date === checkout_date)
      );
      if (hasDateConflict(otherBookings, newCheckin, newCheckout)) {
        setEditError('Those dates are already booked. Please choose different dates.');
        setSaving(false);
        return;
      }
      const updated = await updateBookingDates(booking.id, {
        checkin_date: newCheckin,
        checkout_date: newCheckout,
        nights: newNights,
        subtotal: newSubtotal,
        total: newTotal,
      });
      if (onUpdateDates) onUpdateDates(updated);
      setShowEdit(false);
    } catch (err) {
      setEditError(err?.message || 'Could not update dates. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Print invoice
  const invoiceRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef: invoiceRef });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
      {/* Hidden invoice for printing */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <BookingInvoice ref={invoiceRef} booking={booking} />
      </div>

      <div className="flex flex-col sm:flex-row">
        {/* Property Image */}
        <div className="sm:w-48 h-40 sm:h-auto shrink-0 relative">
          <img src={property_image} alt={property_title} className="w-full h-full object-cover" />
          {isUpcoming && daysUntil !== null && daysUntil <= 7 && (
            <div className="absolute top-2 left-2 bg-golden text-white text-xs font-bold px-2 py-1 rounded-full">
              {daysUntil === 0 ? 'Today!' : `${daysUntil}d away`}
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="flex-1 p-5">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
            <div>
              <h3 className="font-bold text-charcoal text-base">{property_title}</h3>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                <MapPin size={13} className="text-golden" /> {property_location}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.color}`}>
              <StatusIcon size={12} /> {cfg.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 mb-0.5 flex items-center gap-1"><Calendar size={11} /> Check-in</p>
              <p className="font-bold text-charcoal">{formatDate(checkin_date)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 mb-0.5 flex items-center gap-1"><Calendar size={11} /> Check-out</p>
              <p className="font-bold text-charcoal">{formatDate(checkout_date)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 mb-0.5 flex items-center gap-1"><Users size={11} /> Guests</p>
              <p className="font-bold text-charcoal">{guests} · {nights} {nights === 1 ? 'night' : 'nights'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 mb-0.5 flex items-center gap-1"><CreditCard size={11} /> Total Paid</p>
              <p className="font-bold text-charcoal">₹{total?.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Change Dates Panel */}
          {showEdit && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-charcoal mb-3">Change Your Dates</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">New Check-in</label>
                  <input
                    type="date" min={todayStr} value={newCheckin}
                    onChange={e => { setNewCheckin(e.target.value); setNewCheckout(''); setEditError(''); }}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-golden/40 [color-scheme:light]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">New Check-out</label>
                  <input
                    type="date" min={minNewCheckout} value={newCheckout} disabled={!newCheckin}
                    onChange={e => { setNewCheckout(e.target.value); setEditError(''); }}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-golden/40 [color-scheme:light] disabled:text-gray-300"
                  />
                </div>
              </div>
              {newNights > 0 && (
                <p className="text-xs text-gray-600 mb-3">
                  {newNights} {newNights === 1 ? 'night' : 'nights'} — New total:{' '}
                  <strong className="text-charcoal">₹{newTotal.toLocaleString('en-IN')}</strong>
                  {newTotal !== total && (
                    <span className={`ml-1 ${newTotal > total ? 'text-red-500' : 'text-green-600'}`}>
                      ({newTotal > total ? '+' : ''}₹{(newTotal - total).toLocaleString('en-IN')})
                    </span>
                  )}
                </p>
              )}
              {editError && <p className="text-red-500 text-xs mb-2">{editError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDates}
                  disabled={saving || !newCheckin || !newCheckout}
                  className="flex items-center gap-1.5 text-xs font-bold bg-golden hover:bg-golden-dark text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : <Check size={12} />}
                  {saving ? 'Saving…' : 'Confirm Change'}
                </button>
                <button
                  onClick={() => { setShowEdit(false); setNewCheckin(checkin_date); setNewCheckout(checkout_date); setEditError(''); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition"
                >
                  <X size={12} /> Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="text-xs text-gray-400 space-y-0.5">
              <p className="flex items-center gap-1"><Hash size={11} /> {booking_ref}</p>
              {payment_id && !payment_id.startsWith('DEMO') && (
                <p className="flex items-center gap-1"><CreditCard size={11} /> {payment_id}</p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {canEdit && !showEdit && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition"
                >
                  <Pencil size={12} /> Change Dates
                </button>
              )}
              {canCancel && (
                <div className="flex items-center gap-2">
                  {confirmCancel ? (
                    <div className="flex flex-col gap-2 items-end">
                      <div className="text-xs text-right">
                        <span className="text-gray-500">Cancel booking? </span>
                        <span className={`font-bold ${refundInfo?.color}`}>
                          {refundInfo?.amount > 0
                            ? `₹${refundInfo.amount.toLocaleString('en-IN')} ${refundInfo.label}`
                            : refundInfo?.label}
                        </span>
                        <span className="text-gray-400"> will be refunded.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleConfirmCancel}
                          disabled={cancelling}
                          className="text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-full transition disabled:opacity-50"
                        >
                          {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                        </button>
                        <button
                          onClick={() => setConfirmCancel(false)}
                          className="text-xs font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-full transition"
                        >
                          Keep Booking
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmCancel(true)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                    >
                      <AlertTriangle size={12} /> Cancel
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={handlePrint}
                className="text-xs font-bold text-gray-400 hover:text-charcoal flex items-center gap-1 transition"
              >
                <Printer size={12} /> Invoice
              </button>
              <Link
                to={`/property/${property_id}`}
                className="text-xs font-bold text-golden hover:text-golden-dark hover:underline transition"
              >
                View Property →
              </Link>
            </div>
          </div>

          {cancelError && <p className="text-red-500 text-xs mt-2">{cancelError}</p>}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
