import React, { useState } from 'react';
import { useAuth } from '../context/AuthContextUtils';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, ShieldCheck, Heart } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const closeMenu = () => { setIsMobileMenuOpen(false); setIsUserMenuOpen(false); };

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account';
  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* --- LOGO --- */}
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <img src="/logo.png" alt="The Golden Stay Logo" className="h-10 md:h-12 w-auto object-contain" />
          </Link>

          {/* --- DESKTOP NAV --- */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-golden font-medium transition">Home</Link>
            <Link to="/properties" className="text-gray-700 hover:text-golden font-medium transition">Properties</Link>
            <Link to="/about" className="text-gray-700 hover:text-golden font-medium transition">About Us</Link>
            <Link to="/contact" className="text-gray-700 hover:text-golden font-medium transition">Contact</Link>
          </div>

          {/* --- DESKTOP USER ACTIONS --- */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/contact" className="bg-golden text-white px-5 py-2 rounded-full font-bold hover:bg-golden-dark transition shadow-md text-sm">
              List Property
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:border-golden transition text-sm font-bold text-charcoal"
                >
                  <div className="w-7 h-7 rounded-full bg-golden text-white flex items-center justify-center text-xs font-bold">
                    {displayName[0].toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown size={14} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-bold text-charcoal truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={closeMenu}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-golden transition"
                    >
                      <LayoutDashboard size={16} /> My Bookings
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={closeMenu}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-golden transition"
                    >
                      <Heart size={16} /> Wishlist
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/owner"
                        onClick={closeMenu}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-golden font-bold hover:bg-golden/5 transition border-t border-gray-100"
                      >
                        <ShieldCheck size={16} /> Owner Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-700 hover:text-golden font-bold text-sm transition px-3 py-2">
                  Log In
                </Link>
                <Link to="/signup" className="border border-golden text-golden hover:bg-golden hover:text-white px-4 py-2 rounded-full font-bold text-sm transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* --- MOBILE HAMBURGER --- */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-charcoal hover:text-golden transition p-2">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-xl z-40">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {[['/', 'Home'], ['/properties', 'Properties'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([to, label]) => (
              <Link key={to} to={to} onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-golden hover:bg-gray-50">
                {label}
              </Link>
            ))}

            <div className="border-t border-gray-100 pt-3 mt-2 space-y-2">
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-bold text-charcoal truncate">{user.email}</p>
                  </div>
                  <Link to="/dashboard" onClick={closeMenu} className="flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-golden hover:bg-gray-50">
                    <LayoutDashboard size={18} /> My Bookings
                  </Link>
                  <Link to="/wishlist" onClick={closeMenu} className="flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-golden hover:bg-gray-50">
                    <Heart size={18} /> Wishlist
                  </Link>
                  {isAdmin && (
                    <Link to="/owner" onClick={closeMenu} className="flex items-center gap-2 px-3 py-3 rounded-md text-base font-bold text-golden hover:bg-golden/5">
                      <ShieldCheck size={18} /> Owner Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-golden hover:bg-gray-50">
                    Log In
                  </Link>
                  <Link to="/signup" onClick={closeMenu} className="block w-full text-center bg-golden text-white px-4 py-3 rounded-xl font-bold hover:bg-golden-dark transition">
                    Sign Up Free
                  </Link>
                </>
              )}
              <Link to="/contact" onClick={closeMenu} className="block w-full text-center border border-golden text-golden px-4 py-3 rounded-xl font-bold hover:bg-golden/5 transition">
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
