import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextUtils';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, UserPlus, Mail } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      const data = await signup(form.name.trim(), form.email, form.password);
      if (data?.session) {
        navigate('/dashboard', { replace: true });
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google sign-up failed.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Helmet><title>Sign Up | The Golden Stay</title></Helmet>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">

        {emailSent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-golden/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-golden" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm mb-2">We sent a confirmation link to</p>
            <p className="font-bold text-charcoal mb-6">{form.email}</p>
            <p className="text-gray-400 text-xs mb-6">Click the link in the email to activate your account, then come back to log in.</p>
            <Link to="/login" className="block w-full text-center bg-golden hover:bg-golden-dark text-white font-bold py-3 rounded-xl transition">
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-charcoal mb-1">Create Account</h2>
              <p className="text-gray-500 text-sm">Join The Golden Stay family</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            {/* Google Sign Up */}
            <button
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition mb-5 disabled:opacity-60"
            >
              {googleLoading ? (
                <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <GoogleIcon />}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Yogendra Singh"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 transition" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 transition" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 transition" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Confirm Password</label>
                <input type="password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="Re-enter your password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 transition" />
              </div>
              <button
                type="submit" disabled={loading || googleLoading}
                className="w-full bg-golden hover:bg-golden-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : <><UserPlus size={18} /> Create Account</>}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-golden font-bold hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
