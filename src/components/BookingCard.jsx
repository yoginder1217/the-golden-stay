import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Hash, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
  pending:   { label: 'Pending',   icon: Clock,        color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  cancelled: { label: 'Cancelled', icon: XCircle,      color: 'text-red-500 bg-red-50 border-red-200' },
  completed: { label: 'Completed', icon: CheckCircle,  color: 'text-gray-500 bg-gray-50 border-gray-200' },
};

const BookingCard = ({ booking }) => {
  const {
    property_title, property_location, property_image, property_id,
    checkin_date, checkout_date, guests, nights, total,
    booking_ref, payment_id, status,
  } = booking;

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.confirmed;
  const StatusIcon = cfg.icon;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkinDate = new Date(checkin_date);
  const checkoutDate = new Date(checkout_date);
  const isUpcoming = checkinDate >= today;
  const daysUntil = isUpcoming
    ? Math.ceil((checkinDate - today) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row">

        {/* Property Image */}
        <div className="sm:w-48 h-40 sm:h-auto shrink-0 relative">
          <img
            src={property_image}
            alt={property_title}
            className="w-full h-full object-cover"
          />
          {isUpcoming && daysUntil <= 7 && (
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

          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="text-xs text-gray-400 space-y-0.5">
              <p className="flex items-center gap-1"><Hash size={11} /> {booking_ref}</p>
              {payment_id && !payment_id.startsWith('DEMO') && (
                <p className="flex items-center gap-1"><CreditCard size={11} /> {payment_id}</p>
              )}
            </div>
            <Link
              to={`/property/${property_id}`}
              className="text-xs font-bold text-golden hover:text-golden-dark hover:underline transition"
            >
              View Property →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
