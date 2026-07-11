import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarPicker = ({ value, onChange, size = 28 }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={`transition-colors ${star <= (hovered || value) ? 'fill-golden text-golden' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );
};

export const StarDisplay = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <Star
        key={star}
        size={size}
        className={star <= Math.round(rating) ? 'fill-golden text-golden' : 'text-gray-200'}
      />
    ))}
  </div>
);
