import React from 'react';
import { Link } from 'react-router-dom'; // FIX 1: Added missing import

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white pt-16 pb-8 border-t-4 border-golden">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <div>
          <h3 className="text-2xl font-bold text-golden mb-4 font-serif">The Golden Stay</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Premium serviced apartments and family stays. Experience the comfort of home with the luxury of a hotel.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4 font-serif">Quick Links</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/" className="hover:text-golden transition">Home</Link></li>
            <li><Link to="/properties" className="hover:text-golden transition">Properties</Link></li>
            <li><Link to="/about" className="hover:text-golden transition">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4 font-serif">Legal</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-golden transition">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-golden transition">Terms & Conditions</Link></li>
            <li><Link to="/refund-policy" className="hover:text-golden transition">Refund Policy</Link></li>
            <li><Link to="/contact" className="hover:text-golden transition">Partner Support</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4 font-serif">Contact</h4>
          <div className="space-y-2 text-gray-400 text-sm">
            <p>Khair, Aligarh, Uttar Pradesh</p>
            <p>Phone: <a href="tel:+917983914058" className="hover:text-golden transition">+91 79839 14058</a></p>
            <p>Email: <a href="mailto:info@goldenstay.com" className="hover:text-golden transition">info@goldenstay.com</a></p>
          </div>
        </div>

      </div>
      
      <div className="text-center text-gray-600 text-sm mt-12 pt-8 border-t border-gray-800">
        © 2026 The Golden Stay. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;