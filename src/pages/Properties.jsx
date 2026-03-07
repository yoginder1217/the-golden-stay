import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { properties } from '../data/properties';
import PropertyCard from '../components/PropertyCard';
import { Filter, Map as MapIcon } from 'lucide-react';

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

  const filteredProperties = activeFilter === 'All'
    ? properties
    : properties.filter(property => property.type === activeFilter);

  return (
    // FIX 1: Added 'overflow-x-hidden' here to kill the scrollbar
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
            className="text-4xl md:text-6xl font-bold mb-4 font-serif" // Adjusted text size for mobile
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
          <div className="flex gap-2 overflow-x-auto p-1 w-full md:w-auto scrollbar-hide">
            {['All', '2BHK', '3BHK', 'Villa'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap ${activeFilter === filter
                  ? 'bg-golden text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:text-golden transition">
              <Filter size={18} /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:text-golden transition">
              <MapIcon size={18} /> Map View
            </button>
          </div>
        </motion.div>

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
              <div className="col-span-full text-center py-20">
                <h3 className="text-2xl text-gray-400 font-bold">No properties found.</h3>
                <p className="text-gray-400">Try selecting a different category.</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Properties;