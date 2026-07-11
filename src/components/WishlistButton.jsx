import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextUtils';
import { checkIsWishlisted, addToWishlist, removeFromWishlist } from '../lib/wishlist';

const WishlistButton = ({ property, className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id && property?.id) {
      checkIsWishlisted(user.id, property.id)
        .then(setIsWishlisted)
        .catch(() => {});
    }
  }, [user?.id, property?.id]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: `/property/${property.id}` } });
      return;
    }
    setLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(user.id, property.id);
        setIsWishlisted(false);
      } else {
        await addToWishlist(user.id, property);
        setIsWishlisted(true);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`p-2 rounded-full shadow-sm transition-all ${
        isWishlisted
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-400 hover:bg-white'
      } ${className}`}
    >
      <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
    </button>
  );
};

export default WishlistButton;
