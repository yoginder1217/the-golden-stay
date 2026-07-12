import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Star, Shield, Coffee, Wifi } from 'lucide-react';
import { properties } from '../data/properties';
import PropertyCard from '../components/PropertyCard';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import { Helmet } from 'react-helmet-async';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Home = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [search, setSearch] = useState({ location: '', checkin: '', guests: '2 Adults, 1 Child' });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.location.trim()) params.set('location', search.location.trim());
    if (search.checkin) params.set('checkin', search.checkin);
    if (search.guests) params.set('guests', search.guests);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="overflow-hidden bg-white">
      <Helmet>
        <title>The Golden Stay | Luxury Family Suites & Homestays in India</title>
        <meta name="description" content="Book premium 2BHK, 3BHK & Villa stays across Noida, Delhi, Gurugram, Mumbai, Goa, Jaipur and more. Hotel luxury with the comfort of home." />
        <link rel="canonical" href="https://the-golden-stay.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://the-golden-stay.vercel.app/" />
        <meta property="og:title" content="The Golden Stay | Luxury Family Suites & Homestays in India" />
        <meta property="og:description" content="Book premium 2BHK, 3BHK & Villa stays across India. Hotel luxury with the comfort of home." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The Golden Stay | Luxury Family Suites & Homestays in India" />
        <meta name="twitter:description" content="Book premium 2BHK, 3BHK & Villa stays across India. Hotel luxury with the comfort of home." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200" />
      </Helmet>
      
      {/* --- HERO SECTION --- */}
      <div className="relative min-h-[85vh] flex items-center justify-center py-20">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 z-0 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920')" }}
        >
          <div className="absolute inset-0 bg-black/50" /> {/* Dark Overlay */}
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto w-full">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-golden-light text-xs md:text-sm font-bold tracking-widest uppercase mb-4"
          >
            Welcome to The Golden Stay
          </motion.span>
          
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
          >
            Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-golden-light via-yellow-200 to-golden-light">Royalty</span> <br /> 
            Like Never Before
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-lg md:text-2xl text-gray-200 mb-10 font-light max-w-2xl mx-auto"
          >
            Premium 2BHK & 3BHK sanctuaries designed for families who demand excellence.
          </motion.p>

          {/* Glassmorphism Search Bar - RESPONSIVE FIX */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 p-2 rounded-3xl md:rounded-full shadow-2xl mx-auto flex flex-col md:flex-row items-center max-w-4xl w-full"
          >
            <div className="w-full md:flex-1 px-6 py-4 border-b md:border-b-0 md:border-r border-white/10 text-left">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1">Location</label>
              <input
                type="text"
                placeholder="Noida, Indirapuram..."
                value={search.location}
                onChange={(e) => setSearch(s => ({ ...s, location: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent outline-none text-white font-medium placeholder-gray-400"
              />
            </div>
            <div className="w-full md:flex-1 px-6 py-4 border-b md:border-b-0 md:border-r border-white/10 text-left">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1">Check-in</label>
              <input
                type="date"
                min={today}
                value={search.checkin}
                onChange={(e) => setSearch(s => ({ ...s, checkin: e.target.value }))}
                className="w-full bg-transparent outline-none text-white font-medium [color-scheme:dark]"
              />
            </div>
            <div className="w-full md:flex-1 px-6 py-4 text-left">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1">Guests</label>
              <select
                value={search.guests}
                onChange={(e) => setSearch(s => ({ ...s, guests: e.target.value }))}
                className="w-full bg-transparent outline-none text-white font-medium [&>option]:text-black"
              >
                <option>1 Adult</option>
                <option>2 Adults</option>
                <option>2 Adults, 1 Child</option>
                <option>2 Adults, 2 Children</option>
                <option>4 Adults</option>
                <option>4 Adults, 2 Children</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="w-full md:w-auto mt-2 md:mt-0 bg-gradient-to-r from-golden via-golden-dark to-golden text-white rounded-full p-4 md:px-10 transition-all duration-300 font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-golden/50"
            >
              <Search size={20} /> Search
            </button>
          </motion.div>
        </div>
      </div>

      {/* --- ROYAL SERVICES SECTION --- */}
      <div className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center"
          >
            <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition duration-300 border border-transparent hover:border-golden/20 group">
              <div className="w-16 h-16 mx-auto bg-golden/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-golden group-hover:text-white transition-colors duration-300 text-golden-dark">
                <Shield size={32} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-charcoal">Secure Sanctuaries</h3>
              <p className="text-gray-600 text-sm md:text-base">24/7 Gated security and premium neighborhoods ensure your family sleeps with total peace of mind.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition duration-300 border border-transparent hover:border-golden/20 group">
              <div className="w-16 h-16 mx-auto bg-golden/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-golden group-hover:text-white transition-colors duration-300 text-golden-dark">
                <Coffee size={32} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-charcoal">Chef's Kitchen</h3>
              <p className="text-gray-600 text-sm md:text-base">Why eat out? Our fully equipped modular kitchens let you cook your family's favorite healthy meals.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition duration-300 border border-transparent hover:border-golden/20 group">
              <div className="w-16 h-16 mx-auto bg-golden/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-golden group-hover:text-white transition-colors duration-300 text-golden-dark">
                <Wifi size={32} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-charcoal">Hyper-Connected</h3>
              <p className="text-gray-600 text-sm md:text-base">Blazing fast 5G WiFi and Smart TVs in every room. Work, play, and stream without buffering.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* --- FEATURED PROPERTIES --- */}
      <div className="bg-gray-50 py-16 md:py-24 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-golden to-transparent opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-2">The Collection</h2>
              <p className="text-gray-500 text-base md:text-lg">Curated stays for the discerning traveler.</p>
            </motion.div>
            <Link to="/properties" className="hidden md:flex items-center gap-2 text-golden-dark font-bold hover:text-golden transition tracking-wide uppercase text-sm border-b-2 border-transparent hover:border-golden pb-1">
              View All Suites <ArrowRight size={18} />
            </Link>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
          >
            {properties.slice(0, 3).map((property) => (
              <motion.div key={property.id} variants={fadeInUp}>
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-10 text-center md:hidden">
            <Link to="/properties" className="inline-block bg-white border border-golden text-golden-dark px-8 py-3 rounded-full font-bold shadow-sm">
              View All Properties
            </Link>
          </div>
        </div>
      </div>

      {/* --- EXPLORE BY CITY --- */}
      <div className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-charcoal mb-3">Explore by City</h2>
            <p className="text-gray-500 text-lg">Premium stays across India's finest destinations.</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              { city: 'Noida', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=400', count: 1 },
              { city: 'Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=400', count: 1 },
              { city: 'Gurugram', img: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=400', count: 1 },
              { city: 'Mumbai', img: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&q=80&w=400', count: 1 },
              { city: 'Jaipur', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=400', count: 1 },
              { city: 'Goa', img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=400', count: 1 },
            ].map(({ city, img, count }) => (
              <motion.div key={city} variants={fadeInUp}>
                <Link
                  to={`/properties?location=${city}`}
                  className="group block relative h-36 md:h-44 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <img src={img} alt={city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm">{city}</p>
                    <p className="text-white/70 text-xs">{count} property</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* --- TESTIMONIALS --- */}
      <Testimonials />

      {/* --- CTA / FRANCHISE SECTION (FIXED FOR MOBILE) --- */}
      <div className="relative py-16 md:py-32 bg-charcoal overflow-hidden">
        {/* Abstract Gold shapes - Hidden on mobile to prevent overflow */}
        <div className="hidden md:block absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-golden/10 rounded-full blur-3xl"></div>
        <div className="hidden md:block absolute bottom-[-50%] left-[-10%] w-[600px] h-[600px] bg-golden/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/2 text-center md:text-left"
          >
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="text-golden fill-golden" size={20} />
              ))}
            </div>
            
            <span className="text-golden font-bold tracking-wider uppercase mb-2 block text-sm md:text-base">Franchise Opportunities</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight font-serif">
              Open Your Own <br/> <span className="text-golden">Hospitality Company</span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed">
              Join The Golden Stay Franchise. We provide end-to-end <strong>Revenue Management</strong> for your property. 
              From listing on Airbnb to managing daily operations, we turn your asset into a profitable business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/contact" className="bg-golden hover:bg-white hover:text-charcoal text-white px-8 py-4 rounded-full font-bold text-lg transition duration-300 shadow-lg text-center">
                Start Your Franchise
              </Link>
              <Link to="/about" className="border border-gray-600 hover:border-golden text-gray-300 hover:text-golden px-8 py-4 rounded-full font-bold text-lg transition duration-300 text-center">
                Business Model
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 w-full"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-golden blur-2xl opacity-20 transform rotate-6 rounded-2xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" 
                alt="Business Handshake" 
                className="relative w-full rounded-2xl border border-gray-700 shadow-2xl transform hover:-translate-y-2 transition duration-500"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- FAQ SECTION --- */}
      <FAQ />

    </div>
  );
};

export default Home;