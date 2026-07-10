import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { properties } from '../data/properties';
import { Wifi, Home, Star, MapPin, CheckCircle, ExternalLink, ArrowRight, Users, Calendar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const CLEANING_FEE = 500;
const SERVICE_FEE = 300;

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = properties.find(p => p.id === parseInt(id, 10));

  const today = new Date().toISOString().split('T')[0];

  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('2');
  const [dateError, setDateError] = useState('');

  const minCheckout = checkin
    ? new Date(new Date(checkin).getTime() + 86400000).toISOString().split('T')[0]
    : today;

  const nights =
    checkin && checkout
      ? Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)))
      : 0;

  const subtotal = property ? property.price * (nights || 1) : 0;
  const total = subtotal + CLEANING_FEE + SERVICE_FEE;

  const handleCheckinChange = (e) => {
    setCheckin(e.target.value);
    setCheckout('');
    setDateError('');
  };

  const handleCheckoutChange = (e) => {
    setCheckout(e.target.value);
    setDateError('');
  };

  const handleBookDirect = () => {
    if (!checkin || !checkout) {
      setDateError('Please select your check-in and check-out dates to continue.');
      return;
    }
    navigate('/checkout', {
      state: {
        property,
        checkin,
        checkout,
        guests: parseInt(guests, 10),
        nights,
        subtotal,
        cleaningFee: CLEANING_FEE,
        serviceFee: SERVICE_FEE,
        total,
      },
    });
  };

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-2">Property not found</h2>
          <button onClick={() => navigate('/properties')} className="text-golden font-bold underline">
            Browse all properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Helmet>
        <title>{property.title} | The Golden Stay</title>
        <meta name="description" content={property.description} />
      </Helmet>

      {/* --- Image Gallery (Hero) --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 h-[50vh] md:h-[60vh] gap-1 md:gap-2 p-1 md:p-2"
      >
        {/* Main Image */}
        <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-xl">
          <img src={property.image} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt={property.title} loading="eager" />
        </div>

        <div className="overflow-hidden rounded-xl hidden md:block">
          <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Kitchen" loading="lazy" />
        </div>

        <div className="overflow-hidden rounded-xl hidden md:block">
          <img src="https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Bedroom" loading="lazy" />
        </div>

        <div className="overflow-hidden rounded-xl hidden md:block">
          <img src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Living Room" loading="lazy" />
        </div>

        <div className="relative overflow-hidden rounded-xl hidden md:block">
          <img src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover transition-transform duration-700" alt="Bathroom" loading="lazy" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold border border-white px-4 py-2 rounded-full backdrop-blur-sm text-sm">
              +{property.amenities.length} Amenities
            </span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-16">

        {/* --- Left Column: Details --- */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-2"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-charcoal mb-2 font-serif">{property.title}</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <MapPin size={18} className="text-golden" /> {property.location} • {property.type}
              </p>
            </div>
            <div className="text-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shrink-0">
              <span className="text-2xl font-bold text-charcoal flex items-center gap-1 justify-center">
                {property.rating} <Star size={20} className="fill-golden text-golden" />
              </span>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rating</p>
            </div>
          </div>

          <div className="h-px w-full bg-gray-200 my-8"></div>

          <h2 className="text-2xl font-bold mb-6 font-serif">About this Homestay</h2>
          <p className="text-gray-600 leading-loose mb-10 text-lg">
            {property.description} Experience true hospitality with our premium bedding, soundproof windows, and a dedicated workspace. Perfect for families looking to disconnect from the chaos and reconnect with each other.
          </p>

          <h2 className="text-2xl font-bold mb-6 font-serif">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {property.amenities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 text-gray-700 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-golden/30 transition">
                <div className="p-2 bg-white rounded-full text-golden shadow-sm"><Home size={20} /></div>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* --- Right Column: Booking Widget --- */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 sticky top-24"
          >
            {/* Price Header */}
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-3xl font-bold text-charcoal">₹{property.price.toLocaleString('en-IN')}</span>
                <span className="text-gray-400"> / night</span>
              </div>
              <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded">Available</span>
            </div>

            {/* Date & Guest Pickers */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="grid grid-cols-2 divide-x divide-gray-200">
                <div className="p-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Check-in
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={checkin}
                    onChange={handleCheckinChange}
                    className="w-full text-sm font-medium text-charcoal outline-none [color-scheme:light]"
                  />
                </div>
                <div className="p-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Check-out
                  </label>
                  <input
                    type="date"
                    min={minCheckout}
                    value={checkout}
                    onChange={handleCheckoutChange}
                    disabled={!checkin}
                    className="w-full text-sm font-medium text-charcoal outline-none [color-scheme:light] disabled:text-gray-300"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 p-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Users size={12} /> Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full text-sm font-medium text-charcoal outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                  ))}
                </select>
              </div>
            </div>

            {dateError && (
              <p className="text-red-500 text-xs font-medium mb-3 flex items-center gap-1">
                ⚠ {dateError}
              </p>
            )}

            {/* Live Price Breakdown */}
            {nights > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-b border-gray-100 py-4 mb-4 space-y-2 text-sm"
              >
                <div className="flex justify-between text-gray-600">
                  <span>₹{property.price.toLocaleString('en-IN')} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cleaning fee</span>
                  <span>₹{CLEANING_FEE}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service fee</span>
                  <span>₹{SERVICE_FEE}</span>
                </div>
                <div className="flex justify-between font-bold text-charcoal pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </motion.div>
            )}

            {/* Book Direct CTA */}
            <button
              onClick={handleBookDirect}
              className="w-full flex justify-between items-center bg-golden hover:bg-golden-dark text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl mb-3"
            >
              <span>{nights > 0 ? `Reserve for ₹${total.toLocaleString('en-IN')}` : 'Book Direct (Best Price)'}</span>
              <ArrowRight size={18} />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">or book via</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* External Platform Buttons */}
            <div className="space-y-3">
              {property.links?.airbnb && (
                <a
                  href={property.links.airbnb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-between items-center bg-[#FF5A5F] hover:bg-[#E00007] text-white font-bold py-3 px-5 rounded-xl transition group text-sm"
                >
                  <span>Airbnb</span>
                  <ExternalLink size={16} className="opacity-70 group-hover:opacity-100" />
                </a>
              )}
              {property.links?.mmt && (
                <a
                  href={property.links.mmt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-between items-center bg-[#E41F35] hover:bg-[#C21025] text-white font-bold py-3 px-5 rounded-xl transition group text-sm"
                >
                  <span>MakeMyTrip</span>
                  <ExternalLink size={16} className="opacity-70 group-hover:opacity-100" />
                </a>
              )}
              {property.links?.goibibo && (
                <a
                  href={property.links.goibibo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-between items-center bg-[#2274E0] hover:bg-[#1959AD] text-white font-bold py-3 px-5 rounded-xl transition group text-sm"
                >
                  <span>Goibibo</span>
                  <ExternalLink size={16} className="opacity-70 group-hover:opacity-100" />
                </a>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs mt-5">
              <CheckCircle size={12} /> <span>No extra charges · Best price guaranteed</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
