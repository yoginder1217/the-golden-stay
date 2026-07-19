import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { saveContactMessage } from '../lib/contact';
import { useSiteContent } from '../context/SiteContentContext';

const Contact = () => {
  const { c } = useSiteContent();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, sending, success, error

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await saveContactMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <Helmet>
        <title>Contact Us | The Golden Stay</title>
        <meta name="description" content="Get in touch with The Golden Stay. Book a property, ask about franchise opportunities, or simply say hello." />
        <link rel="canonical" href="https://the-golden-stay.vercel.app/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://the-golden-stay.vercel.app/contact" />
        <meta property="og:title" content="Contact Us | The Golden Stay" />
        <meta property="og:description" content="Get in touch with The Golden Stay for bookings, franchise enquiries, or support." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Us | The Golden Stay" />
        <meta name="twitter:description" content="Get in touch with The Golden Stay for bookings, franchise enquiries, or support." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200" />
      </Helmet>
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* --- Left Side: Info --- */}
        <div className="bg-charcoal text-white p-12 md:p-16 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-golden rounded-full blur-[100px] opacity-20"></div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h4 className="text-golden font-bold uppercase tracking-widest mb-2">Get in Touch</h4>
            <h1 className="text-4xl md:text-5xl font-bold mb-8 font-serif">
              {c('contact.hero.title').split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
              ))}
            </h1>
            <p className="text-gray-400 mb-12 text-lg">
              {c('contact.hero.subtitle')}
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="bg-white/10 p-4 rounded-xl text-golden">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Call Us</h3>
                  <p className="text-gray-300 text-lg">{c('contact.phone')}</p>
                  <p className="text-sm text-gray-500">{c('contact.hours')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="bg-white/10 p-4 rounded-xl text-golden">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Email Us</h3>
                  <p className="text-gray-300 text-lg">{c('contact.email')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="bg-white/10 p-4 rounded-xl text-golden">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Visit HQ</h3>
                  <p className="text-gray-300 text-lg">{c('contact.address')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-12 flex gap-4">
             <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-golden hover:text-charcoal transition text-white"><Facebook size={20} /></a>
             <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-golden hover:text-charcoal transition text-white"><Instagram size={20} /></a>
             <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-golden hover:text-charcoal transition text-white"><Twitter size={20} /></a>
          </div>
        </div>

        {/* --- Right Side: Form --- */}
        <div className="p-12 md:p-16 bg-white relative">
          <motion.form
             onSubmit={handleSubmit}
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6 }}
             className="space-y-8"
          >
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 uppercase tracking-wide">Your Name</label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50 border-b-2 border-gray-200 focus:border-golden outline-none transition text-lg"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2 uppercase tracking-wide">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-b-2 border-gray-200 focus:border-golden outline-none transition text-lg"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2 uppercase tracking-wide">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-b-2 border-gray-200 focus:border-golden outline-none transition text-lg"
                  placeholder="+91..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 uppercase tracking-wide">Message</label>
              <textarea
                name="message"
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50 border-b-2 border-gray-200 focus:border-golden outline-none transition text-lg resize-none"
                placeholder="I am looking for a 3BHK..."
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending' || status === 'success'}
              className={`w-full font-bold py-5 rounded-xl transition duration-300 shadow-xl text-lg flex items-center justify-center gap-2 ${
                status === 'success' ? 'bg-green-600 text-white' : 'bg-golden hover:bg-golden-dark text-white'
              } disabled:opacity-70`}
            >
              {status === 'idle' && <><Send size={20} /> Send Message</>}
              {status === 'sending' && 'Sending…'}
              {status === 'success' && <><CheckCircle size={20} /> Message Sent!</>}
              {status === 'error' && <><Send size={20} /> Try Again</>}
            </button>
          </motion.form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
