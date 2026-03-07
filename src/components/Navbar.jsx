import React, { useState } from 'react';
import { useAuth } from '../context/AuthContextUtils';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react'; // Added 'X' for close icon

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to close menu when a link is clicked
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* --- LOGO --- */}
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <img
              src="/logo.png"
              alt="The Golden Stay Logo"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* --- DESKTOP NAVIGATION (Hidden on Mobile) --- */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-golden font-medium transition">Home</Link>
            <Link to="/properties" className="text-gray-700 hover:text-golden font-medium transition">Properties</Link>
            <Link to="/about" className="text-gray-700 hover:text-golden font-medium transition">About Us</Link>
            <Link to="/contact" className="text-gray-700 hover:text-golden font-medium transition">Contact</Link>
          </div>

          {/* --- DESKTOP USER ACTIONS --- */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/contact" className="bg-golden text-white px-5 py-2 rounded-full font-bold hover:bg-golden-dark transition shadow-md hover:shadow-lg text-sm">
              List Property
            </Link>
            {/* Login button hidden for now */}
          </div>

          {/* --- MOBILE MENU BUTTON (Hamburger) --- */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-charcoal hover:text-golden transition focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link 
              to="/" 
              onClick={closeMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-golden hover:bg-gray-50"
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              onClick={closeMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-golden hover:bg-gray-50"
            >
              Properties
            </Link>
            <Link 
              to="/about" 
              onClick={closeMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-golden hover:bg-gray-50"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              onClick={closeMenu}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-golden hover:bg-gray-50"
            >
              Contact
            </Link>
            
            <div className="border-t border-gray-100 my-2 pt-2">
              <Link 
                to="/contact" 
                onClick={closeMenu}
                className="block w-full text-center bg-golden text-white px-4 py-3 rounded-xl font-bold hover:bg-golden-dark transition shadow-md"
              >
                List Your Property
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;