import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { properties } from '../data/properties';
import { Wifi, Home, Star, MapPin, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const property = properties.find(p => p.id === parseInt(id));

  if (!property) return <div className="p-20 text-center">Property not found</div>;

  return (
    <div className="bg-white">
      {/* --- Image Gallery (Hero) --- */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 h-[50vh] md:h-[60vh] gap-1 md:gap-2 p-1 md:p-2"
      >
        {/* Main Image */}
        <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-xl">
          <img src={property.image} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Main" />
        </div>
        
        {/* Detail 1 */}
        <div className="overflow-hidden rounded-xl hidden md:block">
          <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Detail 1" />
        </div>
        
        {/* Detail 2 - FIXED: New Stable Link (Luxury Bedroom) */}
        <div className="overflow-hidden rounded-xl hidden md:block">
          <img src="https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Detail 2" />
        </div>
        
        {/* Detail 3 */}
        <div className="overflow-hidden rounded-xl hidden md:block">
          <img src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Detail 3" />
        </div>
        
        {/* Detail 4 (Clickable) */}
        <div className="relative overflow-hidden rounded-xl cursor-pointer group hidden md:block">
          <img src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Detail 4" />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
             <span className="text-white font-bold border border-white px-4 py-2 rounded-full backdrop-blur-sm">View Photos</span>
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
            <div className="text-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
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

        {/* --- Right Column: Multi-Platform Booking Widget --- */}
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 sticky top-24"
          >
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-3xl font-bold text-charcoal">₹{property.price}</span>
                <span className="text-gray-400"> / night</span>
              </div>
              <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded">Available</span>
            </div>
            
            <p className="text-gray-500 text-sm mb-4 font-bold uppercase tracking-wide">Book securely via:</p>

            <div className="space-y-3">
              {/* Airbnb Button */}
              {property.links?.airbnb && (
                <a 
                  href={property.links.airbnb} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex justify-between items-center bg-[#FF5A5F] hover:bg-[#E00007] text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl group"
                >
                  <span className="flex items-center gap-2">Book on Airbnb</span>
                  <ExternalLink size={18} className="opacity-70 group-hover:opacity-100" />
                </a>
              )}

              {/* MakeMyTrip Button */}
              {property.links?.mmt && (
                <a 
                  href={property.links.mmt} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex justify-between items-center bg-[#E41F35] hover:bg-[#C21025] text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl group"
                >
                  <span className="flex items-center gap-2">Book on MakeMyTrip</span>
                  <ExternalLink size={18} className="opacity-70 group-hover:opacity-100" />
                </a>
              )}

              {/* Goibibo Button */}
              {property.links?.goibibo && (
                <a 
                  href={property.links.goibibo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex justify-between items-center bg-[#2274E0] hover:bg-[#1959AD] text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl group"
                >
                  <span className="flex items-center gap-2">Book on Goibibo</span>
                  <ExternalLink size={18} className="opacity-70 group-hover:opacity-100" />
                </a>
              )}

              {/* Direct Booking (Optional) */}
              {property.links?.direct && (
                <Link 
                  to={property.links.direct}
                  className="w-full flex justify-between items-center bg-golden hover:bg-golden-dark text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl mt-4"
                >
                  <span>Book Direct (Best Price)</span>
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs mt-6">
              <CheckCircle size={12} /> Official Partner Verification
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;