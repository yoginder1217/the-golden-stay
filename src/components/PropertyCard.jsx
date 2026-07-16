import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Zap } from 'lucide-react';
import WishlistButton from './WishlistButton';

const PropertyCard = ({ property }) => {
  const discountedPrice =
    property.is_featured && property.discount_percent > 0
      ? Math.round(property.price * (1 - property.discount_percent / 100))
      : null;

  return (
    <Link
      to={`/property/${property.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
    >
      {/* ── Image ── */}
      <div className="relative h-60 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Bottom gradient for price legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Flash deal badge */}
        {property.is_featured && property.discount_percent > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            <Zap size={10} />
            {property.deal_label || `${property.discount_percent}% OFF`}
          </div>
        )}

        {/* Wishlist heart */}
        <WishlistButton property={property} className="absolute top-3 right-3" />

        {/* Price pill — sits on bottom of image */}
        <div className="absolute bottom-3 left-3 flex items-baseline gap-1.5">
          <span className="bg-white/95 backdrop-blur-sm text-charcoal font-bold text-sm px-3 py-1 rounded-full shadow-sm">
            {discountedPrice
              ? <>₹{discountedPrice.toLocaleString('en-IN')}</>
              : <>₹{property.price.toLocaleString('en-IN')}</>}
            <span className="text-gray-400 font-normal text-xs ml-0.5">/night</span>
          </span>
          {discountedPrice && (
            <span className="text-white/70 text-xs line-through">
              ₹{property.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-4">
        {/* Title + Rating */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-charcoal text-[15px] leading-snug line-clamp-1 flex-1">
            {property.title}
          </h3>
          {property.rating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={12} className="fill-golden text-golden" />
              <span className="text-sm font-bold text-charcoal">{property.rating}</span>
              {property.review_count > 0 && (
                <span className="text-gray-400 text-xs">({property.review_count})</span>
              )}
            </div>
          )}
        </div>

        {/* Location + Type */}
        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{property.location}</span>
          <span className="text-gray-300">·</span>
          <span className="shrink-0 bg-golden/10 text-golden-dark text-[11px] font-semibold px-1.5 py-0.5 rounded">
            {property.type}
          </span>
        </div>

        {/* Amenity pills */}
        {property.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map((a, i) => (
              <span
                key={i}
                className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full"
              >
                {a}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[11px] text-gray-400 self-center">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PropertyCard;
