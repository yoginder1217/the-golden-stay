import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import { getProperties } from '../lib/properties';
import PropertyCard from '../components/PropertyCard';
import MapView from '../components/MapView';
import { X, MapPin, SlidersHorizontal, LayoutGrid, Map, Clock, ChevronDown, ChevronUp, Calendar, Users } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const PROPERTY_TYPES = ['All', '1BHK', '2BHK', '3BHK', 'Villa', 'Cottage', 'Farmhouse', 'Studio', 'Penthouse', 'Bungalow'];

const Properties = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeCity, setActiveCity] = useState('All');
  const [showAllCities, setShowAllCities] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    getProperties()
      .then(data => {
        setAllProperties(data);
        setCities([...new Set(data.map(p => p.city).filter(Boolean))]);
      })
      .catch(() => {})
      .finally(() => setLoadingProps(false));
  }, []);

  // Load recently viewed from localStorage
  useEffect(() => {
    if (!allProperties.length) return;
    try {
      const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(ids.map(id => allProperties.find(p => p.id === id)).filter(Boolean));
    } catch {}
  }, [allProperties]);

  const allAmenities = useMemo(() => {
    const set = new Set();
    allProperties.forEach(p => p.amenities?.forEach(a => set.add(a)));
    return [...set].sort().slice(0, 16);
  }, [allProperties]);

  const locationQuery = searchParams.get('location') || '';
  const checkinQuery = searchParams.get('checkin') || '';
  const guestsQuery = searchParams.get('guests') || '';
  const hasSearchQuery = locationQuery || checkinQuery || guestsQuery;
  const clearSearch = () => { setSearchParams({}); setActiveCity('All'); };
  const guestCount = parseInt(guestsQuery, 10) || 0;

  const activeFilterCount = [
    minPrice, maxPrice,
    selectedAmenities.length > 0 ? 'a' : '',
  ].filter(Boolean).length;

  const filteredProperties = allProperties.filter(p => {
    const matchesType = activeFilter === 'All' || p.type === activeFilter;
    const matchesCity = activeCity === 'All' || p.city === activeCity;
    const matchesLocation = !locationQuery ||
      p.location?.toLowerCase().includes(locationQuery.toLowerCase()) ||
      p.title?.toLowerCase().includes(locationQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(locationQuery.toLowerCase());
    const matchesGuests = !guestCount || guestCount <= 12;
    const matchesMin = !minPrice || p.price >= parseInt(minPrice);
    const matchesMax = !maxPrice || p.price <= parseInt(maxPrice);
    const matchesAmenities = selectedAmenities.length === 0 ||
      selectedAmenities.every(a => p.amenities?.includes(a));
    return matchesType && matchesCity && matchesLocation && matchesGuests && matchesMin && matchesMax && matchesAmenities;
  });

  const toggleAmenity = (a) => setSelectedAmenities(prev =>
    prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
  );

  const clearAllFilters = () => {
    setMinPrice(''); setMaxPrice(''); setSelectedAmenities([]);
    setActiveFilter('All'); setActiveCity('All');
    setSearchParams({});
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 overflow-x-hidden">
      <Helmet>
        <title>All Properties | The Golden Stay</title>
        <meta name="description" content="Browse premium stays across India. Filter by city, type, price and amenities." />
        <link rel="canonical" href="https://the-golden-stay.vercel.app/properties" />
        <meta property="og:title" content="All Properties | The Golden Stay" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200" />
      </Helmet>

      {/* Header — compact */}
      <div className="relative h-[160px] flex items-end bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1920')" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/50 to-charcoal/30" />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 pb-5">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-white font-serif">
            Our Exclusive Collection
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-sm text-gray-300 font-light mt-1">
            Handpicked sanctuaries for the modern family.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">

        {/* Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl">

          {/* Row 1: Type filters + Map/Grid toggle + Filters button */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-wrap">
              {PROPERTY_TYPES.filter(f => f === 'All' || allProperties.some(p => p.type === f)).map(filter => (
                <button key={filter} onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full font-bold transition-all whitespace-nowrap text-sm ${activeFilter === filter
                    ? 'bg-golden text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Filters toggle */}
              <button onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all ${showFilters || activeFilterCount > 0
                  ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-gray-600 border-gray-200 hover:border-golden hover:text-golden'}`}>
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-golden text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* View toggle */}
              <div className="flex rounded-full border border-gray-200 overflow-hidden">
                <button onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1 px-3 py-2 text-sm transition ${viewMode === 'grid' ? 'bg-charcoal text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  <LayoutGrid size={14} /> Grid
                </button>
                <button onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1 px-3 py-2 text-sm transition ${viewMode === 'map' ? 'bg-charcoal text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  <Map size={14} /> Map
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: City filters */}
          <div className="flex gap-2 flex-wrap">
            {['All', ...(showAllCities ? cities : cities.slice(0, 5))].map(city => (
              <button key={city} onClick={() => setActiveCity(city)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap text-xs border ${activeCity === city
                  ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-gray-500 border-gray-200 hover:border-golden hover:text-golden'}`}>
                {city !== 'All' && <MapPin size={10} />} {city === 'All' ? 'All Cities' : city}
              </button>
            ))}
            {cities.length > 5 && (
              <button onClick={() => setShowAllCities(v => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-golden text-golden hover:bg-golden hover:text-white transition-all">
                {showAllCities ? <><ChevronUp size={10} /> Less</> : <><ChevronDown size={10} /> +{cities.length - 5} more</>}
              </button>
            )}
          </div>

          {/* Expandable filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="border-t border-gray-100 mt-3 pt-4 space-y-4">

                  {/* Price range */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price per Night (₹)</p>
                    <div className="flex items-center gap-3">
                      <input type="number" placeholder="Min" value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-golden/30" />
                      <span className="text-gray-400 text-sm">—</span>
                      <input type="number" placeholder="Max" value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-golden/30" />
                      {(minPrice || maxPrice) && (
                        <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                          className="text-xs text-gray-400 hover:text-red-500 transition">Clear</button>
                      )}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {allAmenities.map(a => (
                        <button key={a} onClick={() => toggleAmenity(a)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedAmenities.includes(a)
                            ? 'bg-golden text-white border-golden' : 'bg-white text-gray-600 border-gray-200 hover:border-golden hover:text-golden'}`}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear all */}
                  {(minPrice || maxPrice || selectedAmenities.length > 0) && (
                    <button onClick={clearAllFilters}
                      className="text-xs text-red-500 hover:underline font-bold">
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search result banner */}
        {hasSearchQuery && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-white rounded-xl border border-golden/20 shadow-sm flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 items-center">
            <span className="font-bold text-charcoal">Search results:</span>
            {locationQuery && <span className="flex items-center gap-1"><MapPin size={12} className="text-golden shrink-0" /> <strong>{locationQuery}</strong></span>}
            {checkinQuery && <span className="flex items-center gap-1"><Calendar size={12} className="text-golden shrink-0" /> <strong>{new Date(checkinQuery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>}
            {guestsQuery && <span className="flex items-center gap-1"><Users size={12} className="text-golden shrink-0" /> <strong>{guestsQuery} guests</strong></span>}
            <span className="text-golden font-bold">{filteredProperties.length} found</span>
            <button onClick={clearSearch} className="ml-auto flex items-center gap-1 text-golden-dark font-bold hover:underline text-xs">
              <X size={12} /> Clear
            </button>
          </motion.div>
        )}

        {/* Results count */}
        {!loadingProps && !hasSearchQuery && (
          <p className="mt-6 text-sm text-gray-400">
            Showing <strong className="text-charcoal">{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'property' : 'properties'}
            {activeFilter !== 'All' && ` · ${activeFilter}`}
            {activeCity !== 'All' && ` · ${activeCity}`}
          </p>
        )}

        {/* Map or Grid */}
        {loadingProps ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-9 bg-gray-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'map' ? (
          <MapView properties={filteredProperties} />
        ) : (
          <motion.div layout variants={containerVariants} initial="hidden" animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <AnimatePresence>
              {filteredProperties.length > 0 ? (
                filteredProperties.map(property => (
                  <motion.div layout key={property.id} variants={itemVariants}
                    initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.9 }}>
                    <PropertyCard property={property} />
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="col-span-full text-center py-20">
                  <h3 className="text-2xl text-gray-400 font-bold mb-2">No properties found.</h3>
                  <p className="text-gray-400 mb-4">
                    {locationQuery ? `No listings in "${locationQuery}" yet.` : 'Try adjusting your filters.'}
                  </p>
                  <button onClick={clearAllFilters} className="text-golden font-bold underline">
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && viewMode === 'grid' && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-charcoal mb-5 flex items-center gap-2">
              <Clock size={18} className="text-golden" /> Recently Viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recentlyViewed.slice(0, 5).map(p => (
                <Link key={p.id} to={`/property/${p.id}`}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-golden/30 transition group">
                  <div className="h-28 overflow-hidden">
                    <img src={p.image} alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-charcoal truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 truncate">{p.city}</p>
                    <p className="text-xs text-golden font-bold mt-1">₹{p.price.toLocaleString('en-IN')}/night</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
