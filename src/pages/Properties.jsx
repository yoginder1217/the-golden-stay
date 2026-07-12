import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { properties, cities } from '../data/properties';
import PropertyCard from '../components/PropertyCard';
import { X, MapPin } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Properties = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeCity, setActiveCity] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();

  const locationQuery = searchParams.get('location') || '';
  const checkinQuery = searchParams.get('checkin') || '';
  const guestsQuery = searchParams.get('guests') || '';

  const hasSearchQuery = locationQuery || checkinQuery || guestsQuery;

  const clearSearch = () => { setSearchParams({}); setActiveCity('All'); };

  const filteredProperties = properties.filter(property => {
    const matchesType = activeFilter === 'All' || property.type === activeFilter;
    const matchesCity = activeCity === 'All' || property.city === activeCity;
    const matchesLocation = !locationQuery ||
      property.location.toLowerCase().includes(locationQuery.toLowerCase()) ||
      property.title.toLowerCase().includes(locationQuery.toLowerCase()) ||
      property.city?.toLowerCase().includes(locationQuery.toLowerCase());
    return matchesType && matchesCity && matchesLocation;
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20 overflow-x-hidden">
      <Helmet>
        <title>The Golden Stay | Luxury 3BHK Apartments & Homestays</title>
        <meta name="description" content="Book premium 2BHK and 3BHK family suites. Experience hotel luxury with the comfort of home. Revenue management services for property owners." />
      </Helmet>

      {/* --- Page Header with Parallax --- */}
      <div className="relative h-[400px] flex items-center justify-center bg-fixed bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1920')" }}>
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-4 font-serif"
          >
            Our Exclusive Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-gray-200 font-light"
          >
            Handpicked sanctuaries for the modern family.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">

        {/* --- Glass Filter Bar --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="flex gap-2 overflow-x-auto p-1 scrollbar-hide">
              {['All', '2BHK', '3BHK', 'Villa'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2 rounded-full font-bold transition-all whitespace-nowrap text-sm ${activeFilter === filter
                    ? 'bg-golden text-white shadow-lg'
                    : 'bg-white text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto p-1 scrollbar-hide">
              {['All', ...cities].map((city) => (
                <button
                  key={city}
                  onClick={() => setActiveCity(city)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-medium transition-all whitespace-nowrap text-xs border ${activeCity === city
                    ? 'bg-charcoal text-white border-charcoal'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-golden hover:text-golden'
                    }`}
                >
                  {city !== 'All' && <MapPin size={10} />} {city === 'All' ? 'All Cities' : city}
                </button>
              ))}
            </div>
          </div>

          {hasSearchQuery && (
            <button
              onClick={clearSearch}
              className="flex items-center gap-2 px-4 py-2 bg-golden/10 border border-golden/30 rounded-lg text-sm font-bold text-golden-dark hover:bg-golden/20 transition whitespace-nowrap"
            >
              <X size={16} /> Clear Search
            </button>
          )}
        </motion.div>

        {/* --- Active Search Banner --- */}
        {hasSearchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-white rounded-xl border border-golden/20 shadow-sm flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600"
          >
            <span className="font-bold text-charcoal">Showing results for:</span>
            {locationQuery && <span>📍 <strong>{locationQuery}</strong></span>}
            {checkinQuery && <span>📅 Check-in: <strong>{new Date(checkinQuery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>}
            {guestsQuery && <span>👥 <strong>{guestsQuery}</strong></span>}
            <span className="ml-auto text-golden-dark font-bold">{filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found</span>
          </motion.div>
        )}

        {/* --- Property Grid --- */}
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
        >
          <AnimatePresence>
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <motion.div
                  layout
                  key={property.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-20"
              >
                <h3 className="text-2xl text-gray-400 font-bold mb-2">No properties found.</h3>
                <p className="text-gray-400 mb-4">
                  {locationQuery ? `We don't have listings in "${locationQuery}" yet.` : 'Try selecting a different category.'}
                </p>
                {hasSearchQuery && (
                  <button onClick={clearSearch} className="text-golden font-bold underline">
                    Clear search and view all
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Properties;
