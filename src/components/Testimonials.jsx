import React, { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    name: 'Sharma Family',
    initials: 'SF',
    location: 'Stayed in Noida · 3BHK',
    text: 'The 3BHK was absolutely perfect for our family reunion. Fully stocked kitchen, spotless rooms, and the host went above and beyond with local tips. Felt like home — but royally upgraded.',
    rating: 5,
  },
  {
    name: 'Rahul & Friends',
    initials: 'RK',
    location: 'Stayed in Gurugram · 2BHK',
    text: 'Better than any hotel we have stayed in. Our own living room, fast WiFi, and a kitchen where we cooked breakfast every morning. Will never go back to booking hotel rooms for group trips.',
    rating: 5,
  },
  {
    name: 'Priya Singh',
    initials: 'PS',
    location: 'Stayed in Delhi · Villa',
    text: 'Safe, impeccably clean, and the neighbourhood felt premium. The Golden Stay genuinely understands what families need. Booked again for next month already.',
    rating: 5,
  },
  {
    name: 'Mehta Household',
    initials: 'MH',
    location: 'Stayed in Jaipur · 3BHK',
    text: 'We came for a wedding and needed space for 6 people. The property handled it effortlessly — separate bedrooms, a grand living area, and parking for two cars. Exceptional value.',
    rating: 5,
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((dir) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(c => (c + dir + reviews.length) % reviews.length);
      setAnimating(false);
    }, 250);
  }, [animating]);

  useEffect(() => {
    const id = setInterval(() => go(1), 5000);
    return () => clearInterval(id);
  }, [go]);

  const r = reviews[current];

  return (
    <section className="bg-charcoal py-24 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-golden/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-golden/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

        {/* Eyebrow */}
        <p className="text-golden text-xs font-bold uppercase tracking-widest mb-3">Guest Stories</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-16">
          What Families Say
        </h2>

        {/* Card */}
        <div
          className="relative"
          style={{ transition: 'opacity 0.25s ease', opacity: animating ? 0 : 1 }}
        >
          {/* Giant quote mark */}
          <div className="text-[120px] leading-none text-golden/15 font-serif absolute -top-8 left-1/2 -translate-x-1/2 select-none pointer-events-none">
            "
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(r.rating)].map((_, i) => (
              <Star key={i} size={18} className="fill-golden text-golden" />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-lg md:text-xl text-white/85 leading-relaxed font-light max-w-2xl mx-auto mb-10 italic">
            "{r.text}"
          </blockquote>

          {/* Avatar + Name */}
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-golden flex items-center justify-center text-charcoal font-bold text-sm shrink-0 shadow-lg">
              {r.initials}
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">{r.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">{r.location}</p>
            </div>
            {/* Verified badge */}
            <span className="text-[10px] font-bold text-golden border border-golden/40 px-2 py-0.5 rounded-full ml-2">
              Verified Guest
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-12">
          <button
            onClick={() => go(-1)}
            className="w-10 h-10 rounded-full border border-white/20 text-white/60 hover:border-golden hover:text-golden flex items-center justify-center transition"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => { if (!animating) { setAnimating(true); setTimeout(() => { setCurrent(i); setAnimating(false); }, 250); } }}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'bg-golden w-6 h-2' : 'bg-white/20 hover:bg-white/40 w-2 h-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            className="w-10 h-10 rounded-full border border-white/20 text-white/60 hover:border-golden hover:text-golden flex items-center justify-center transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
