import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';

const PropertyCard = ({ property }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64">
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg text-sm font-bold shadow-sm">
          ₹{property.price}/night
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-charcoal">{property.title}</h3>
          <div className="flex items-center text-golden-dark font-semibold">
            <Star size={16} className="fill-current mr-1" />
            {property.rating}
          </div>
        </div>
        
        <div className="flex items-center text-gray-500 mb-4 text-sm">
          <MapPin size={16} className="mr-1" />
          {property.location}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
              {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>

        <Link 
          to={`/property/${property.id}`}
          className="block w-full text-center bg-golden hover:bg-golden-dark text-white font-medium py-2 rounded-lg transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;