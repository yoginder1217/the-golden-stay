import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, MapPin, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContextUtils';
import { getUserWishlist, removeFromWishlist } from '../lib/wishlist';

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/wishlist' } });
      return;
    }
    getUserWishlist(user.id)
      .then(setWishlist)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleRemove = async (propertyId) => {
    setRemoving(propertyId);
    try {
      await removeFromWishlist(user.id, propertyId);
      setWishlist(w => w.filter(item => item.property_id !== propertyId));
    } catch {
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Helmet><title>My Wishlist | The Golden Stay</title></Helmet>

      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Heart size={24} className="text-golden fill-golden" />
          <h1 className="text-3xl font-bold text-charcoal">My Wishlist</h1>
          {wishlist.length > 0 && (
            <span className="bg-golden text-white text-xs font-bold px-2.5 py-1 rounded-full">{wishlist.length}</span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-golden" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <Heart size={48} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-charcoal mb-2">No saved properties yet</h2>
            <p className="text-gray-400 text-sm mb-6">Tap the heart icon on any property to save it here.</p>
            <Link to="/properties" className="inline-block bg-golden hover:bg-golden-dark text-white font-bold px-6 py-3 rounded-full transition text-sm">
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {wishlist.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                <div className="relative h-48">
                  <img
                    src={item.property_image}
                    alt={item.property_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => handleRemove(item.property_id)}
                    disabled={removing === item.property_id}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-red-50 transition shadow-sm disabled:opacity-50"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-charcoal shadow-sm">
                    ₹{item.property_price?.toLocaleString('en-IN')}/night
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-charcoal text-sm mb-1">{item.property_title}</h3>
                  <p className="text-gray-400 text-xs flex items-center gap-1 mb-4">
                    <MapPin size={11} /> {item.property_location}
                  </p>
                  <Link
                    to={`/property/${item.property_id}`}
                    className="block w-full text-center bg-golden hover:bg-golden-dark text-white font-bold py-2.5 rounded-xl transition text-sm"
                  >
                    View & Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
