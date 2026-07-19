import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContextUtils';
import { getUserBookings } from '../lib/bookings';
import { getOrCreateReferralCode } from '../lib/referrals';
import { Award, Copy, CheckCircle, Star, Gift, Zap, Crown } from 'lucide-react';

const TIERS = [
  { label: 'Bronze', min: 0,   max: 49,  color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '🥉' },
  { label: 'Silver', min: 50,  max: 149, color: 'text-gray-500 bg-gray-50 border-gray-200',     icon: '🥈' },
  { label: 'Gold',   min: 150, max: Infinity, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: '🥇' },
];

const getTier = (pts) => TIERS.find(t => pts >= t.min && pts <= t.max) || TIERS[0];

const Rewards = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referral, setReferral] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserBookings(user.id).then(setBookings).catch(() => {}).finally(() => setLoading(false));
    getOrCreateReferralCode(user.id, user.email).then(setReferral).catch(() => {});
  }, [user]);

  const totalPoints = useMemo(() =>
    bookings.reduce((s, b) => s + Math.floor((b.total || 0) / 100) - (b.points_redeemed || 0), 0),
  [bookings]);

  const tier = getTier(totalPoints);
  const nextTier = TIERS.find(t => t.min > totalPoints);
  const progressToNext = nextTier ? Math.min(100, Math.round((totalPoints / nextTier.min) * 100)) : 100;

  const copyCode = () => {
    if (!referral) return;
    navigator.clipboard.writeText(referral.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Award size={48} className="text-golden mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-2">Sign in to view your rewards</h2>
          <Link to="/login" className="inline-block bg-golden text-white font-bold px-6 py-3 rounded-xl hover:bg-golden-dark transition">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Helmet><title>My Rewards | The Golden Stay</title></Helmet>

      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Award size={32} className="text-golden" />
          <h1 className="text-3xl font-bold text-charcoal">Loyalty Rewards</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-6">

            {/* Tier card */}
            <div className={`bg-white rounded-2xl border-2 p-6 ${tier.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-60">Current Tier</p>
                  <h2 className="text-2xl font-bold mt-1">{tier.icon} {tier.label} Member</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60">Total Points</p>
                  <p className="text-3xl font-bold">{totalPoints.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {nextTier && (
                <>
                  <div className="h-2 bg-black/10 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-current rounded-full transition-all duration-700" style={{ width: `${progressToNext}%` }} />
                  </div>
                  <p className="text-xs opacity-70">
                    {nextTier.min - totalPoints} more points to <strong>{nextTier.label}</strong>
                  </p>
                </>
              )}
              {!nextTier && (
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Crown size={16} /> You've reached the highest tier!
                </div>
              )}
            </div>

            {/* How to earn points */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
                <Zap size={18} className="text-golden" /> How to Earn Points
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: '🏠', title: 'Book a Stay', desc: '1 point per ₹100 spent' },
                  { icon: '⭐', title: 'Leave a Review', desc: 'Bonus 50 points' },
                  { icon: '👥', title: 'Refer a Friend', desc: '200 points each' },
                ].map(item => (
                  <div key={item.title} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl mb-2">{item.icon}</p>
                    <p className="font-bold text-charcoal text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier benefits */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
                <Gift size={18} className="text-golden" /> Tier Benefits
              </h3>
              <div className="space-y-3">
                {TIERS.map(t => (
                  <div key={t.label} className={`flex items-center justify-between p-3 rounded-xl border ${t.label === tier.label ? t.color : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                    <span className="font-bold text-sm">{t.icon} {t.label} <span className="font-normal text-xs">({t.min}–{t.max === Infinity ? '∞' : t.max} pts)</span></span>
                    <span className="text-xs">
                      {t.label === 'Bronze' && 'Access to promo codes'}
                      {t.label === 'Silver' && '5% loyalty discount on bookings'}
                      {t.label === 'Gold' && '10% discount + priority support'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral code */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-charcoal mb-2 flex items-center gap-2">
                <Star size={18} className="text-golden" /> Your Referral Code
              </h3>
              <p className="text-sm text-gray-500 mb-4">Share your code — you both earn 200 bonus points when your friend completes their first booking.</p>
              {referral ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-golden/5 border-2 border-dashed border-golden/40 rounded-xl px-5 py-3 text-center">
                    <p className="text-xl font-bold tracking-widest text-golden">{referral.code}</p>
                    <p className="text-xs text-gray-400 mt-1">Used {referral.uses ?? 0} time{(referral.uses ?? 0) !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={copyCode}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition ${copied ? 'bg-green-500 text-white' : 'bg-golden text-white hover:bg-golden-dark'}`}>
                    {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Generating your referral code…</p>
              )}
            </div>

            {/* Booking history points */}
            {bookings.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-charcoal mb-4">Points History</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {bookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-charcoal">{b.property_title}</p>
                        <p className="text-xs text-gray-400">{b.checkin_date} · Ref {b.booking_ref}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">+{Math.floor((b.total || 0) / 100)} pts</p>
                        {b.points_redeemed > 0 && <p className="text-xs text-red-400">-{b.points_redeemed} redeemed</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <Link to="/properties" className="inline-flex items-center gap-2 bg-golden hover:bg-golden-dark text-white font-bold px-6 py-3 rounded-xl transition">
                Book a Stay to Earn More Points →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;
