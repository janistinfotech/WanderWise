import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  MapPin,
  CheckCircle2,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage({ onGoRegister, onGoLanding }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@wanderwise.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-ivory-100 dark:bg-dark-bg text-navy-900 dark:text-white transition-colors duration-300">
      {/* Left Column: Scenic Showcase (Hidden on Mobile, 7 cols on Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 relative bg-navy-950 overflow-hidden flex-col justify-between p-12">
        <img
          src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=80"
          alt="Palawan Tropical Escapade"
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

        {/* Center Quote / Feature highlights */}
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="flex items-center gap-1.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-amber-400" />
            ))}
            <span className="text-white text-xs font-extrabold ml-1">4.9 / 5 Traveler Rating</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            "The smartest way to plan Philippine island getaways, keep budgets intact, and remember every journey."
          </h2>

          <div className="flex items-center gap-3 pt-2 text-white/80 text-xs">
            <div className="w-8 h-8 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-300 font-bold border border-teal-400/40">
              PH
            </div>
            <div>
              <p className="font-bold text-white">Maria Santos</p>
              <p className="text-[11px] text-teal-200">Palawan & Siargao Explorer</p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/60">
          <span>DevOps Week 7 Platform Integration</span>
          <span className="font-semibold text-teal-300">Continuous Deployment Ready</span>
        </div>
      </div>

      {/* Right Column: Clean Form (5 cols on Desktop) */}
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

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1.5 font-medium">
              Sign in to access your travel itineraries and budget ledger
            </p>
          </div>

          {/* Quick 1-Click Demo Fill Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-teal-950 dark:text-teal-200">Demo Traveler Account</p>
                <p className="text-[10px] text-teal-700 dark:text-teal-400">demo@wanderwise.com</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-extrabold bg-white dark:bg-dark-card text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-dark-border px-3.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 transition shadow-sm"
            >
              Auto-fill
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3.5 rounded-2xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 text-coral-700 dark:text-coral-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@wanderwise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-border text-center">
            <p className="text-xs text-slate-500 dark:text-dark-muted">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={onGoRegister}
                className="text-teal-600 dark:text-teal-400 font-extrabold hover:underline"
              >
                Create Account
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
