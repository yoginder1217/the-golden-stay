import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContextUtils';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, ShieldCheck, Heart, UserCog, Bell, CalendarDays, Home } from 'lucide-react';
import { getNotifications, markAllRead, markRead } from '../lib/notifications';
import { supabase } from '../lib/supabase';

const formatTime = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const typeIcon = (type) => {
  if (type === 'booking') return <CalendarDays size={14} className="text-golden shrink-0 mt-0.5" />;
  if (type === 'property') return <Home size={14} className="text-blue-500 shrink-0 mt-0.5" />;
  return <Bell size={14} className="text-gray-400 shrink-0 mt-0.5" />;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const bellRef = useRef(null);

  const closeMenu = () => { setIsMobileMenuOpen(false); setIsUserMenuOpen(false); };
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account';
  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  // Load notifications and subscribe to real-time inserts
  useEffect(() => {
    if (!user) { setNotifications([]); return; }

    getNotifications(user.id).then(setNotifications).catch(() => {});

    const channel = supabase
      .channel(`notif-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => setNotifications(prev => [payload.new, ...prev].slice(0, 20))
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setIsBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openBell = async () => {
    const opening = !isBellOpen;
    setIsBellOpen(opening);
    setIsUserMenuOpen(false);
    if (opening && unreadCount > 0) {
      markAllRead(user.id).then(() =>
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      ).catch(() => {});
    }
  };

  const handleNotificationClick = async (n) => {
    setIsBellOpen(false);
    if (!n.read) {
      markRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
    navigate(n.url || '/');
  };

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
              Become a Host
            </Link>

            {/* Bell icon — logged-in users only */}
            {user && (
              <div className="relative" ref={bellRef}>
                <button
                  onClick={openBell}
                  aria-label="Notifications"
                  className="relative p-2 rounded-full hover:bg-gray-100 transition text-gray-600 hover:text-golden"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-0.5">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isBellOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-charcoal text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            markAllRead(user.id).catch(() => {});
                            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                          }}
                          className="text-xs text-golden hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map(n => (
                          <button
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition flex gap-2 ${!n.read ? 'bg-golden/5' : ''}`}
                          >
                            {typeIcon(n.type)}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-snug ${n.read ? 'text-gray-600' : 'font-semibold text-charcoal'}`}>{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                              <p className="text-[11px] text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                            </div>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-golden shrink-0 mt-1.5" />}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <Link to="/dashboard" onClick={() => setIsBellOpen(false)} className="text-xs text-golden hover:underline">
                        View all activity →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsBellOpen(false); }}
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
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-golden transition"
                    >
                      <UserCog size={16} /> Edit Profile
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

          {/* --- MOBILE HAMBURGER + BELL --- */}
          <div className="md:hidden flex items-center gap-1">
            {user && (
              <button
                onClick={openBell}
                className="relative p-2 text-gray-600 hover:text-golden"
                aria-label="Notifications"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] leading-none rounded-full min-w-[16px] h-[16px] flex items-center justify-center font-bold px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-charcoal hover:text-golden transition p-2">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE BELL DROPDOWN (full-width) --- */}
      {isBellOpen && user && (
        <div className="md:hidden absolute w-full left-0 bg-white border-t border-gray-100 shadow-xl z-40">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <span className="font-bold text-charcoal text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllRead(user.id).catch(() => {});
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                }}
                className="text-xs text-golden hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-gray-400 text-sm">No notifications yet</p>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-2 ${!n.read ? 'bg-golden/5' : ''}`}
                >
                  {typeIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.read ? 'text-gray-600' : 'font-semibold text-charcoal'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-golden shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}

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
                  <Link to="/profile" onClick={closeMenu} className="flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-golden hover:bg-gray-50">
                    <UserCog size={18} /> Edit Profile
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
                Become a Host
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
