import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle, TrendingUp, Shield, Headphones, Star,
  ClipboardList, Eye, Layout, Banknote, ChevronRight,
  Home, MapPin, Users, BedDouble, Bath, IndianRupee, Image,
} from 'lucide-react';
import { useAuth } from '../context/AuthContextUtils';
import { submitHostApplication } from '../lib/hostApplications';

const PROPERTY_TYPES = ['Villa', 'Cottage', 'Farmhouse', 'Bungalow', '3BHK', '2BHK', '1BHK', 'Penthouse', 'Studio', 'Other'];

const AMENITIES_LIST = [
  'WiFi', 'Air Conditioning', 'Swimming Pool', 'Parking', 'Kitchen',
  'BBQ / Bonfire Area', 'Garden / Lawn', 'Mountain View', 'Pet Friendly',
  'Home Theatre', 'Gym', 'Hot Tub', 'Fireplace', 'Generator Backup', 'Security Camera',
];

const STATS = [
  { value: '₹2.4L+', label: 'Average annual earnings', icon: TrendingUp },
  { value: '10%', label: 'Our commission — you keep the rest', icon: Banknote },
  { value: '48 hrs', label: 'Application review turnaround', icon: CheckCircle },
];

const BENEFITS = [
  {
    icon: Shield,
    title: 'Verified Guests Only',
    desc: 'Every guest is ID-verified and reviewed before booking. No walk-ins, no surprises.',
  },
  {
    icon: Headphones,
    title: '24/7 Dedicated Support',
    desc: 'A dedicated relationship manager handles guest coordination, check-ins, and escalations for you.',
  },
  {
    icon: TrendingUp,
    title: 'Maximum Visibility',
    desc: 'Your property is professionally photographed and featured across our curated collection to premium travellers.',
  },
];

const STEPS = [
  { icon: ClipboardList, title: 'Submit Application', desc: 'Fill out this form — takes under 5 minutes.' },
  { icon: Eye, title: 'We Review', desc: 'Our team contacts you within 48 hours for a property assessment.' },
  { icon: Layout, title: 'Go Live', desc: 'We arrange photography and list your property on the platform.' },
  { icon: Banknote, title: 'Start Earning', desc: 'Receive weekly payouts directly to your bank account.' },
];

const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-golden/30 focus:border-golden transition bg-white';
const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5';

const SectionHead = ({ children }) => (
  <h3 className="text-sm font-bold text-golden uppercase tracking-widest mb-4 flex items-center gap-2">
    <span className="flex-1 h-px bg-golden/20" />
    {children}
    <span className="flex-1 h-px bg-golden/20" />
  </h3>
);

const BecomeHost = () => {
  const { user } = useAuth();
  const formRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    propertyName: '', propertyType: '', city: '', state: '', address: '',
    bedrooms: '', bathrooms: '', maxGuests: '', expectedPrice: '',
    description: '', imageUrl: '', notes: '',
    amenities: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        fullName: user.user_metadata?.full_name || f.fullName,
        email: user.email || f.email,
      }));
    }
  }, [user]);

  const upd = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const toggleAmenity = (a) => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a)
      ? f.amenities.filter(x => x !== a)
      : [...f.amenities, a],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await submitHostApplication({
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        property_name: form.propertyName.trim(),
        property_type: form.propertyType,
        city: form.city.trim(),
        state: form.state.trim() || null,
        address: form.address.trim() || null,
        bedrooms: parseInt(form.bedrooms) || null,
        bathrooms: parseInt(form.bathrooms) || null,
        max_guests: parseInt(form.maxGuests) || null,
        expected_price: parseInt(form.expectedPrice) || null,
        description: form.description.trim() || null,
        amenities: form.amenities.length ? form.amenities : null,
        image_url: form.imageUrl.trim() || null,
        notes: form.notes.trim() || null,
        user_id: user?.id || null,
      });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Become a Host | The Golden Stay</title>
        <meta name="description" content="List your villa, cottage or farmhouse on The Golden Stay and earn premium rental income with verified guests and dedicated support." />
      </Helmet>

      {/* ── Hero ── */}
      <div
        className="relative min-h-[520px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1920')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/60 to-charcoal/80" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-golden/20 border border-golden/40 text-golden text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              Property Owners
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight mb-4">
              Turn Your Property Into<br />a Premium Stay
            </h1>
            <p className="text-lg text-gray-200 max-w-xl mx-auto mb-8">
              Join The Golden Stay's curated collection. We handle the guests — you enjoy the earnings.
            </p>
            <button
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center gap-2 bg-golden hover:bg-amber-500 text-white font-bold px-8 py-4 rounded-full shadow-xl transition text-base"
            >
              Apply Now <ChevronRight size={18} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="bg-charcoal">
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-3 divide-x divide-white/10">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center px-4">
              <div className="text-2xl font-bold text-golden">{value}</div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* ── Benefits ── */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-serif text-charcoal">Why List With Us?</h2>
            <p className="text-gray-500 mt-2">We're not just another listing portal. We're your revenue partner.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:border-golden/30 transition">
                <div className="w-12 h-12 bg-golden/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-golden" />
                </div>
                <h3 className="font-bold text-charcoal mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── How it Works ── */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-serif text-charcoal">How It Works</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="text-center">
                <div className="relative inline-flex">
                  <div className="w-14 h-14 bg-golden text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Icon size={24} />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-charcoal text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h4 className="font-bold text-charcoal mt-3 mb-1 text-sm">{title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Application Form ── */}
        <motion.section
          ref={formRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-serif text-charcoal">Apply to List Your Property</h2>
            <p className="text-gray-500 mt-2 text-sm">Takes about 5 minutes. Our team will contact you within 48 hours.</p>
          </div>

          {success ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-lg mx-auto">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={44} className="text-green-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-3">Application Received!</h3>
              <p className="text-gray-500 mb-2">
                Thank you for your interest in listing with <strong>The Golden Stay</strong>.
              </p>
              <p className="text-gray-500 mb-6 text-sm">
                Our team will review your application and reach out to <strong>{form.email}</strong> within 48 hours.
              </p>
              <div className="bg-golden/5 border border-golden/20 rounded-xl p-4 text-left space-y-2 text-sm text-gray-600 mb-6">
                <p className="font-bold text-charcoal text-xs uppercase tracking-wide mb-2">What happens next?</p>
                <div className="flex items-start gap-2"><CheckCircle size={14} className="text-golden mt-0.5 shrink-0" /> Property assessment call from our team</div>
                <div className="flex items-start gap-2"><CheckCircle size={14} className="text-golden mt-0.5 shrink-0" /> Professional photography arranged (if approved)</div>
                <div className="flex items-start gap-2"><CheckCircle size={14} className="text-golden mt-0.5 shrink-0" /> Listing goes live within 5–7 working days</div>
              </div>
              <p className="text-xs text-gray-400">Questions? WhatsApp us at <strong>+91 79839 14058</strong></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 md:p-10 max-w-2xl mx-auto space-y-8">

              {/* Contact */}
              <div>
                <SectionHead>Your Details</SectionHead>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Full Name *</label>
                    <input type="text" required value={form.fullName} onChange={upd('fullName')}
                      placeholder="Rajesh Sharma" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input type="email" required value={form.email} onChange={upd('email')}
                      placeholder="you@example.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone *</label>
                    <input type="tel" required value={form.phone} onChange={upd('phone')}
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}" title="Enter a valid 10-digit mobile number"
                      className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Property basics */}
              <div>
                <SectionHead>Property Info</SectionHead>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}><span className="inline-flex items-center gap-1"><Home size={11} /> Property Name *</span></label>
                    <input type="text" required value={form.propertyName} onChange={upd('propertyName')}
                      placeholder="e.g. Himalayan Pine Cottage" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Property Type *</label>
                    <select required value={form.propertyType} onChange={upd('propertyType')} className={inputCls}>
                      <option value="">Select type</option>
                      {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}><span className="inline-flex items-center gap-1"><Users size={11} /> Max Guests</span></label>
                    <input type="number" min="1" max="50" value={form.maxGuests} onChange={upd('maxGuests')}
                      placeholder="e.g. 8" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><span className="inline-flex items-center gap-1"><BedDouble size={11} /> Bedrooms</span></label>
                    <input type="number" min="1" max="20" value={form.bedrooms} onChange={upd('bedrooms')}
                      placeholder="e.g. 3" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><span className="inline-flex items-center gap-1"><Bath size={11} /> Bathrooms</span></label>
                    <input type="number" min="1" max="20" value={form.bathrooms} onChange={upd('bathrooms')}
                      placeholder="e.g. 2" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <SectionHead>Location</SectionHead>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}><span className="inline-flex items-center gap-1"><MapPin size={11} /> City *</span></label>
                    <input type="text" required value={form.city} onChange={upd('city')}
                      placeholder="e.g. Manali" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <input type="text" value={form.state} onChange={upd('state')}
                      placeholder="e.g. Himachal Pradesh" className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Full Address</label>
                    <input type="text" value={form.address} onChange={upd('address')}
                      placeholder="Village / Sector / Landmark" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Pricing & Description */}
              <div>
                <SectionHead>Property Details</SectionHead>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}><span className="inline-flex items-center gap-1"><IndianRupee size={11} /> Expected Price per Night (₹)</span></label>
                    <input type="number" min="500" value={form.expectedPrice} onChange={upd('expectedPrice')}
                      placeholder="e.g. 8000" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Property Description</label>
                    <textarea rows={4} value={form.description} onChange={upd('description')}
                      placeholder="Tell guests what makes your property special — views, architecture, unique features…"
                      className={inputCls + ' resize-none'} />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <SectionHead>Amenities</SectionHead>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_LIST.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        form.amenities.includes(a)
                          ? 'bg-golden text-white border-golden'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-golden hover:text-golden'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional */}
              <div>
                <SectionHead>Optional</SectionHead>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}><span className="inline-flex items-center gap-1"><Image size={11} /> Property Photo URL</span></label>
                    <input type="url" value={form.imageUrl} onChange={upd('imageUrl')}
                      placeholder="https://… (link to a photo of your property)"
                      className={inputCls} />
                    <p className="text-xs text-gray-400 mt-1">Don't worry if you don't have one — we'll arrange professional photography after approval.</p>
                  </div>
                  <div>
                    <label className={labelCls}>Anything Else We Should Know?</label>
                    <textarea rows={3} value={form.notes} onChange={upd('notes')}
                      placeholder="Nearby attractions, restrictions, availability details, preferred rental season…"
                      className={inputCls + ' resize-none'} />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-golden hover:bg-amber-500 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition text-base shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting…</>
                ) : (
                  <><Star size={16} /> Submit Application</>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                By submitting, you agree to our{' '}
                <a href="/terms" className="text-golden hover:underline">Terms of Service</a>.
                We will never share your details with third parties.
              </p>
            </form>
          )}
        </motion.section>

        {/* ── Trust footer ── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center border-t border-gray-200 pt-10"
        >
          <p className="text-gray-500 text-sm mb-1">Have questions before applying?</p>
          <p className="text-gray-600">
            WhatsApp us at{' '}
            <a href="https://wa.me/917983914058" target="_blank" rel="noopener noreferrer"
              className="font-bold text-golden hover:underline">
              +91 79839 14058
            </a>{' '}
            or email{' '}
            <a href="mailto:concierge@goldenstay.com" className="font-bold text-golden hover:underline">
              concierge@goldenstay.com
            </a>
          </p>
        </motion.section>

      </div>
    </div>
  );
};

export default BecomeHost;
