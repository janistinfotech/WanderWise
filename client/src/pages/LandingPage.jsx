import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Wallet,
  Sparkles,
  MapPin,
  CheckCircle2,
  GitBranch,
  Layers,
  Sun,
  Moon,
  Star,
  Globe,
  Plane
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage({ onGoLogin, onGoRegister }) {
  const { loginAsDemo } = useAuth();
  const { isDarkMode, toggleDarkMode } = useApp();

  const handleDemoClick = async () => {
    try {
      await loginAsDemo();
    } catch (e) {
      console.error(e);
    }
  };

  const previewDestinations = [
    {
      name: 'El Nido & Coron, Palawan',
      tag: 'Island Paradise',
      img: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=600&q=80',
      cost: '₱3,500/day'
    },
    {
      name: 'Baguio City',
      tag: 'Summer Capital',
      img: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80',
      cost: '₱2,200/day'
    },
    {
      name: 'Siargao Island',
      tag: 'Surfing Capital',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      cost: '₱2,900/day'
    },
    {
      name: 'Batangas Coast',
      tag: 'Diving Haven',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      cost: '₱2,600/day'
    }
  ];

  return (
    <div className="min-h-screen bg-ivory-100 dark:bg-dark-bg text-navy-900 dark:text-white transition-colors duration-300">
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-navy-900 via-teal-600 to-teal-400 dark:from-teal-500 dark:to-teal-300 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-navy-900 dark:text-white">
                WanderWise
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
                Week 7 DevOps
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-amber-400 hover:text-navy-900 transition shadow-sm"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={onGoLogin}
            className="text-xs font-bold text-navy-900 dark:text-slate-200 hover:text-teal-600 px-3 py-2 transition"
          >
            Sign In
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onGoRegister}
            className="text-xs font-extrabold bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white px-5 py-2.5 rounded-2xl shadow-md shadow-teal-500/25 transition"
          >
            Get Started Free
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100/70 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 text-xs font-extrabold mb-6 border border-teal-200/80 dark:border-teal-800/50 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Smart Travel Planner & Itinerary Management System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl mx-auto text-navy-900 dark:text-white">
          Craft unforgettable journeys with{' '}
          <span className="bg-gradient-to-r from-teal-600 via-teal-400 to-coral-500 bg-clip-text text-transparent">
            intelligent itineraries
          </span>{' '}
          and financial precision.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          WanderWise organizes daily activities, manages trip budgets in real-time, and showcases top Philippine destinations in one elegant, containerized platform.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleDemoClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl shadow-teal-500/30 transition"
          >
            <span>Explore 1-Click Live Demo</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onGoRegister}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-card text-navy-900 dark:text-white font-extrabold text-sm px-8 py-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-soft transition"
          >
            <span>Create Free Account</span>
          </motion.button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="bg-white dark:bg-dark-surface p-7 rounded-3xl border border-slate-200/80 dark:border-dark-border shadow-soft hover:shadow-card transition">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 border border-teal-100 dark:border-teal-800/40">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-navy-900 dark:text-white mb-2">Interactive Itinerary Builder</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Schedule activities day by day with custom time slots, categorized tags, location notes, and real-time completion checklists.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-surface p-7 rounded-3xl border border-slate-200/80 dark:border-dark-border shadow-soft hover:shadow-card transition">
            <div className="w-12 h-12 rounded-2xl bg-coral-50 dark:bg-coral-950/50 text-coral-600 dark:text-coral-400 flex items-center justify-center mb-4 border border-coral-100 dark:border-coral-800/40">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-navy-900 dark:text-white mb-2">Smart Budget Analytics</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Track accommodation, dining, transportation, and tours. Gain instant insights with SVG donut charts and budget limit alerts.
            </p>
          </div>

          <div className="bg-white dark:bg-dark-surface p-7 rounded-3xl border border-slate-200/80 dark:border-dark-border shadow-soft hover:shadow-card transition">
            <div className="w-12 h-12 rounded-2xl bg-navy-50 dark:bg-navy-900/50 text-navy-800 dark:text-teal-300 flex items-center justify-center mb-4 border border-navy-100 dark:border-navy-700/40">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-navy-900 dark:text-white mb-2">Philippine Destinations</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Explore curated gems across Batangas, Baguio, Palawan, Cebu, Bohol, and Siargao with instant trip generation.
            </p>
          </div>
        </div>

        {/* Destination Previews */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-black text-navy-900 dark:text-white tracking-tight">
              Featured Philippine Destinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-2">
              Discover turquoise lagoons, highland pine forests, and world-class surfing breaks
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {previewDestinations.map((d) => (
              <div
                key={d.name}
                className="group bg-white dark:bg-dark-surface rounded-3xl overflow-hidden border border-slate-200/90 dark:border-dark-border shadow-soft hover:shadow-card transition text-left"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={d.img}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <span className="absolute top-3 left-3 bg-navy-950/70 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full border border-white/20">
                    {d.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="font-extrabold text-navy-900 dark:text-white text-sm">{d.name}</h4>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-1">Est. {d.cost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DevOps Evaluation Banner */}
        <div className="mt-20 p-8 sm:p-10 rounded-3xl bg-navy-900 text-white text-left relative overflow-hidden border border-navy-800 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-black uppercase tracking-wider mb-2">
              <GitBranch className="w-4 h-4" />
              <span>DevOps Architecture & Continuous Deployment Ready</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black mb-3 text-white">
              Containerized with Docker • Automated with GitHub Actions CI/CD • Deployed on Render
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Built specifically for Week 7 DevOps evaluation with PostgreSQL migrations, multi-stage Docker builds, health monitoring, and automated test pipelines.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
            <Layers className="w-80 h-80 text-white" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-dark-border py-8 text-center text-xs text-slate-500 dark:text-dark-muted">
        <p>© 2026 WanderWise. Smart Travel Planner & Itinerary Management System. Version 1.0.0.</p>
      </footer>
    </div>
  );
}
