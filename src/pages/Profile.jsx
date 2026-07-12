import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContextUtils';
import { supabase } from '../lib/supabase';
import { User, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [nameStatus, setNameStatus] = useState('idle');
  const [nameError, setNameError] = useState('');

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [passStatus, setPassStatus] = useState('idle');
  const [passError, setPassError] = useState('');

  const handleNameSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setNameError('Name cannot be empty.'); return; }
    setNameStatus('loading');
    setNameError('');
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      if (error) throw error;
      setNameStatus('success');
      setTimeout(() => setNameStatus('idle'), 3000);
    } catch (err) {
      setNameError(err.message || 'Failed to update name.');
      setNameStatus('idle');
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPassError('');
    if (passwords.newPass.length < 6) { setPassError('Password must be at least 6 characters.'); return; }
    if (passwords.newPass !== passwords.confirm) { setPassError('Passwords do not match.'); return; }
    setPassStatus('loading');
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.newPass });
      if (error) throw error;
      setPassStatus('success');
      setPasswords({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setPassStatus('idle'), 3000);
    } catch (err) {
      setPassError(err.message || 'Failed to update password.');
      setPassStatus('idle');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Helmet><title>Edit Profile | The Golden Stay</title></Helmet>

      <div className="max-w-2xl mx-auto px-4">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-golden font-bold hover:underline mb-6">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-charcoal mb-8">Edit Profile</h1>

        {/* Name */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="font-bold text-charcoal mb-5 flex items-center gap-2">
            <User size={16} className="text-golden" /> Personal Details
          </h2>
          <form onSubmit={handleNameSave} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            {nameError && (
              <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{nameError}</p>
            )}
            <button
              type="submit"
              disabled={nameStatus === 'loading'}
              className="flex items-center gap-2 bg-golden hover:bg-golden-dark disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
            >
              {nameStatus === 'loading' ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : nameStatus === 'success' ? (
                <><CheckCircle size={14} /> Saved!</>
              ) : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-charcoal mb-5 flex items-center gap-2">
            <Lock size={16} className="text-golden" /> Change Password
          </h2>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwords.newPass}
                onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 text-sm"
              />
            </div>
            {passError && (
              <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{passError}</p>
            )}
            <button
              type="submit"
              disabled={passStatus === 'loading'}
              className="flex items-center gap-2 bg-charcoal hover:bg-black disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
            >
              {passStatus === 'loading' ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : passStatus === 'success' ? (
                <><CheckCircle size={14} /> Password Updated!</>
              ) : <><Lock size={14} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
