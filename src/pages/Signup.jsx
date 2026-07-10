import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextUtils';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, UserPlus, CheckCircle, Mail } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

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
        // Email confirmation is OFF — user is immediately logged in
        navigate('/dashboard', { replace: true });
      } else {
        // Email confirmation is ON — show "check your email" screen
        setEmailSent(true);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Helmet><title>Sign Up | The Golden Stay</title></Helmet>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">

        {/* Email confirmation pending screen */}
        {emailSent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-golden/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-golden" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm mb-2">
              We sent a confirmation link to
            </p>
            <p className="font-bold text-charcoal mb-6">{form.email}</p>
            <p className="text-gray-400 text-xs mb-6">
              Click the link in the email to activate your account, then come back to log in.
            </p>
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Yogendra Singh"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden/40 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-golden hover:bg-golden-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
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
