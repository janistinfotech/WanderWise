import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Compass,
  Plus,
  LogOut,
  User,
  Settings,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  MapPin,
  Sparkles,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { openCreateTrip, navigateTo, isDarkMode, toggleDarkMode, formatCurrency } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 glass-nav border-b border-slate-200/80 dark:border-dark-border px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-300">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-navy-900 via-teal-600 to-teal-400 dark:from-teal-500 dark:to-teal-300 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-navy-900 dark:text-white">
                WanderWise
              </span>
              <span className="hidden md:inline-block text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/60">
                Smart Planner
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-dark-muted hidden sm:block font-medium">
              Itinerary & Budget Management
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Quick Action, Theme Switcher, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Quick New Trip Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openCreateTrip()}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-teal-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Trip</span>
        </motion.button>

        {/* Currency Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
          <span className="text-slate-400 dark:text-dark-muted font-normal">Currency:</span>
          <span className="text-teal-600 dark:text-teal-400 font-extrabold">{user?.currency || 'PHP'}</span>
        </div>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-amber-400 hover:text-navy-900 transition shadow-sm"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Real Notifications Panel */}
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border hover:border-teal-500 transition shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-extrabold flex items-center justify-center text-xs overflow-hidden border border-teal-200 dark:border-teal-700">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>

            <div className="hidden xl:block text-left pr-1">
              <p className="text-xs font-bold text-navy-900 dark:text-white leading-tight truncate max-w-[110px]">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-dark-muted leading-tight truncate max-w-[110px]">
                {user?.travel_style || 'Explorer'}
              </p>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition" />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-60 bg-white dark:bg-dark-surface rounded-3xl shadow-card border border-slate-200 dark:border-dark-border py-2 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card">
                  <p className="text-xs font-black text-navy-900 dark:text-white">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-dark-muted truncate">{user?.email}</p>
                  <div className="mt-2 inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
                    {user?.travel_style || 'Smart Traveler'}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigateTo('settings');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-card flex items-center gap-2.5 transition"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigateTo('destinations');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-card flex items-center gap-2.5 transition"
                  >
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Saved Destinations</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-dark-border pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-950/30 flex items-center gap-2.5 transition"
                  >
                    <LogOut className="w-4 h-4 text-coral-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
