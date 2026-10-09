import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Plus,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { openCreateTrip, navigateTo, currentView } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-ocean-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-ocean-700 via-sky-600 to-teal-500 bg-clip-text text-transparent">
              WanderWise
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-ocean-50 text-ocean-700 border border-ocean-200">
              Smart Travel Planner
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick New Trip Button */}
        <button
          onClick={() => openCreateTrip()}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-sky-500 hover:from-ocean-700 hover:to-sky-600 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-md shadow-ocean-500/25 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Trip</span>
        </button>

        {/* Currency badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
          <span className="text-slate-400">Currency:</span>
          <span className="text-ocean-600 font-bold">{user?.currency || 'PHP'}</span>
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
          >
            <div className="w-9 h-9 rounded-xl bg-ocean-100 text-ocean-700 font-bold flex items-center justify-center text-sm border border-ocean-200 overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user?.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{user?.travel_style || 'Explorer'}</p>
            </div>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card border border-slate-200/90 py-2 z-50 animate-fade-in"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-ocean-50 text-ocean-700">
                  {user?.travel_style || 'Smart Traveler'}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => navigateTo('settings')}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account & Preferences</span>
                </button>
                <button
                  onClick={() => navigateTo('destinations')}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Saved Destinations</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
