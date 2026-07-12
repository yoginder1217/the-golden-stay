import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Users, Heart, Award } from 'lucide-react';

const stats = [
  { label: "Happy Families", value: "500+" },
  { label: "Luxury Apartments", value: "50+" },
  { label: "Cities Covered", value: "5" },
  { label: "Star Rating", value: "4.9" },
];

const About = () => {
  return (
    <div className="bg-gray-50 overflow-hidden">
      <Helmet>
        <title>About Us | The Golden Stay</title>
        <meta name="description" content="Learn about The Golden Stay — India's premium family homestay brand offering luxury 2BHK, 3BHK & Villa stays with hotel-grade service." />
        <link rel="canonical" href="https://the-golden-stay.vercel.app/about" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://the-golden-stay.vercel.app/about" />
        <meta property="og:title" content="About Us | The Golden Stay" />
        <meta property="og:description" content="India's premium family homestay brand. Hotel luxury with the comfort of home." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Us | The Golden Stay" />
        <meta name="twitter:description" content="India's premium family homestay brand. Hotel luxury with the comfort of home." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200" />
      </Helmet>
      {/* --- Royal Hero Section (Parallax) --- */}
      <div className="relative h-[60vh] flex items-center justify-center bg-fixed bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920')" }}>

        {/* Dark Overlay - Increased opacity slightly for better text contrast */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-7xl mx-auto px-4 text-center"
        >
          {/* FIX: Changed text-golden to text-white for better brightness */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white font-serif drop-shadow-2xl">
            Redefining <span className="text-golden">Family Travel</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md">
            The Golden Stay isn't just a hotel chain. It is a philosophy that family vacations should feel like home, but look like royalty.
          </p>
        </motion.div>
      </div>

      {/* --- Stats Counter Bar --- */}
      <div className="bg-golden shadow-xl relative z-20 -mt-10 mx-4 md:mx-auto max-w-6xl rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-charcoal/10">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="py-8 text-center bg-golden hover:bg-white hover:text-golden transition-colors duration-300 cursor-default group"
            >
              <h3 className="text-4xl md:text-5xl font-extrabold mb-1 text-charcoal group-hover:text-golden transition">{stat.value}</h3>
              <p className="text-xs uppercase tracking-widest font-bold text-charcoal/80">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- Main Content with Pattern Background --- */}
      <div className="relative py-24">

        {/* BACKGROUND PATTERN: Subtle geometric texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#AA8C2C 1px, transparent 1px)", backgroundSize: "30px 30px" }}>
        </div>

        {/* --- Our Story --- */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Image Border Decoration */}
            <div className="absolute inset-0 border-2 border-golden transform translate-x-4 translate-y-4 rounded-2xl"></div>
            <img
              src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80&w=800"
              alt="Luxury Living Room"
              className="relative rounded-2xl shadow-2xl z-10"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-golden font-bold tracking-widest uppercase mb-2 block">Our Origin</span>
            <h2 className="text-4xl font-bold text-charcoal mb-6 font-serif">A Gap in Hospitality</h2>
            <p className="text-gray-600 mb-6 leading-relaxed text-lg">
              Founded in 2024, The Golden Stay emerged from a simple frustration: hotels are too cramped for families, and typical homestays lack luxury.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg mb-8">
              We bridge this gap. We acquire premium properties, furnish them with royal aesthetics, and manage them with hotel-grade discipline. Whether you are here for a wedding, a medical visit, or a getaway, we provide the space you need with the service you deserve.
            </p>
            <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-golden/20 inline-block">
              <Award size={32} className="text-golden" />
              <p className="font-bold text-charcoal italic">"Best Family Stay 2025" <br /><span className="text-xs font-normal text-gray-500">Hospitality India Awards</span></p>
            </div>
          </motion.div>
        </div>

        {/* --- Core Values Cards --- */}
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-serif mb-4 text-charcoal">The Golden Standard</h2>
            <div className="h-1 w-24 bg-golden mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: ShieldCheck, title: "Uncompromised Safety", desc: "Every property is vetted for neighborhood safety, surveillance, and 24/7 support access." },
              { icon: Users, title: "Family Centric", desc: "No more splitting into separate rooms. Large living areas designed for togetherness." },
              { icon: Heart, title: "Warm Hospitality", desc: "From welcome drinks to personalized travel guides, we treat you like family, not just a booking ID." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-10 rounded-xl shadow-xl hover:-translate-y-2 transition duration-300 text-center border-t-4 border-golden"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-golden shadow-inner">
                  <item.icon size={36} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-charcoal">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;