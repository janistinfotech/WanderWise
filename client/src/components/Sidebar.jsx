import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Plane,
  CalendarCheck,
  Wallet,
  Compass,
  Settings,
  X,
  LogOut,
  Sparkles,
  GitBranch
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { currentView, navigateTo } = useApp();
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trips', label: 'Trip Management', icon: Plane },
    { id: 'itinerary', label: 'Itinerary Builder', icon: CalendarCheck },
    { id: 'budget', label: 'Budget Planner', icon: Wallet },
    { id: 'destinations', label: 'Destination Explorer', icon: Compass },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    navigateTo(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200/90 flex flex-col z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ocean-600 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-800">WanderWise</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Brand for desktop */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ocean-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-ocean-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-slate-900 leading-tight">WanderWise</h1>
            <p className="text-[11px] font-semibold text-ocean-600">DevOps Week 7 Edition</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all text-left ${
                  isActive
                    ? 'bg-ocean-50 text-ocean-700 shadow-sm border border-ocean-100/80 font-bold'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-ocean-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* DevOps & Version Badge Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm mb-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-ocean-600" />
                <span>Build Status</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500">CI/CD & Docker Ready</p>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
