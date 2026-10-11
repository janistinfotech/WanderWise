import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  User,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage({ onGoLogin, onGoLanding }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    travel_style: 'Cultural & Adventure',
    currency: 'PHP',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-ivory-100 dark:bg-dark-bg text-navy-900 dark:text-white transition-colors duration-300">
      {/* Left Column: Scenic Showcase */}
      <div className="hidden lg:flex lg:col-span-7 relative bg-navy-950 overflow-hidden flex-col justify-between p-12">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80"
          alt="Siargao Island Palms"
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-navy-950/20" />

        {/* Top Brand Tag */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-black text-xl text-white tracking-tight leading-none">WanderWise</h1>
            <p className="text-[11px] text-teal-300 font-bold tracking-widest uppercase">Smart Travel Platform</p>
          </div>
        </div>

        {/* Center Quote */}
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-teal-300 text-xs font-bold w-fit border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Join thousands of intelligent travelers</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Plan your next journey with crystal-clear itineraries and stress-free budget control.
          </h2>

          <div className="space-y-2 pt-2 text-white/80 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>Multi-tenant secure data isolation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>Day-by-day itinerary checkpoints & timeline</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>Interactive SVG donut charts & financial tracking</span>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/60">
          <span>DevOps Week 7 Activity</span>
          <span className="font-semibold text-teal-300">Docker & PostgreSQL Architecture</span>
        </div>
      </div>

      {/* Right Column: Clean Form */}
      <div className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-12 py-12 bg-white dark:bg-dark-surface shadow-xl">
        <div className="w-full max-w-md mx-auto">
          {/* Brand Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div
              onClick={onGoLanding}
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-md mb-3 cursor-pointer"
            >
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-navy-900 dark:text-white">WanderWise</h2>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white tracking-tight">
              Create an account
            </h2>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1.5 font-medium">
              Start building your travel adventures across the Philippines
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3.5 rounded-2xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 text-coral-700 dark:text-coral-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  id="register-name"
                  type="text"
                  required
                  placeholder="e.g., Juan dela Cruz"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  id="register-email"
                  type="email"
                  required
                  placeholder="juan@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Password (6+ characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="register-travel-style" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Travel Style
                </label>
                <select
                  id="register-travel-style"
                  value={formData.travel_style}
                  onChange={(e) => setFormData({ ...formData, travel_style: e.target.value })}
                  className="w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                >
                  <option value="Cultural & Adventure">Cultural & Adventure</option>
                  <option value="Island Hopping">Island Hopping</option>
                  <option value="Solo Backpacker">Solo Backpacker</option>
                  <option value="Luxury & Leisure">Luxury & Leisure</option>
                  <option value="Road Tripper">Road Tripper</option>
                </select>
              </div>

              <div>
                <label htmlFor="register-currency" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Currency
                </label>
                <select
                  id="register-currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-3 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                >
                  <option value="PHP">PHP (₱)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="SGD">SGD (S$)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-teal-500/25 transition disabled:opacity-50 mt-3"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-border text-center">
            <p className="text-xs text-slate-500 dark:text-dark-muted">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onGoLogin}
                className="text-teal-600 dark:text-teal-400 font-extrabold hover:underline"
              >
                Sign In
              </button>
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={onGoLanding}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ← Return to Platform Overview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
