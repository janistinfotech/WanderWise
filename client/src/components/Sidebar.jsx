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
  ChevronLeft,
  ChevronRight,
  GitBranch,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { currentView, navigateTo, sidebarCollapsed, toggleSidebarCollapse } = useApp();
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'trips', label: 'Trip Management', icon: Plane, badge: null },
    { id: 'itinerary', label: 'Itinerary Builder', icon: CalendarCheck, badge: null },
    { id: 'budget', label: 'Budget Planner', icon: Wallet, badge: null },
    { id: 'destinations', label: 'Destination Explorer', icon: Compass, badge: 'Curated' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
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
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 bg-white dark:bg-dark-surface border-r border-slate-200/90 dark:border-dark-border flex flex-col z-40 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
        aria-label="Sidebar navigation"
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100 dark:border-dark-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-black text-navy-900 dark:text-white">WanderWise</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card transition focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            aria-label="Close sidebar navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Header */}
        <div className={`hidden lg:flex items-center justify-between px-5 py-6 border-b border-slate-100 dark:border-dark-border ${sidebarCollapsed ? 'justify-center px-2' : ''}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-navy-900 to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-base tracking-tight text-navy-900 dark:text-white leading-tight">
                  WanderWise
                </h1>
                <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                  Luxury Travel SaaS
                </p>
              </div>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleSidebarCollapse}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card transition focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            title={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {!sidebarCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-dark-muted">
              Main Menu
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all relative group focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 shadow-sm border border-teal-200/60 dark:border-teal-800/50'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-dark-card hover:text-navy-900 dark:hover:text-white'
                } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-dark-muted'
                  }`}
                />
                {!sidebarCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!sidebarCollapsed && item.badge && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100/80 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50">
                    {item.badge}
                  </span>
                )}

                {/* Glowing Active indicator */}
                {isActive && (
                  <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-teal-500 shadow-glow-teal" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Build Spec & Sign Out */}
        <div className="p-3 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card/50">
          {!sidebarCollapsed ? (
            <div className="p-3 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-soft mb-2">
              <div className="flex items-center justify-between text-xs font-bold text-navy-900 dark:text-white mb-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>DevOps Platform</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold text-[10px] border border-teal-200/60 dark:border-teal-800/40">
                  v1.1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-dark-muted">
                Docker & PostgreSQL Architecture
              </p>
            </div>
          ) : (
            <div className="flex justify-center mb-2" title="WanderWise v1.1.0 (Docker & PostgreSQL)">
              <span className="px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-black text-[9px]">
                v1.1.0
              </span>
            </div>
          )}

          <button
            onClick={logout}
            className={`w-full flex items-center gap-2 py-2.5 px-3 text-xs font-bold text-slate-500 hover:text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-950/30 rounded-2xl transition focus:outline-none focus:ring-2 focus:ring-coral-500/40 ${
              sidebarCollapsed ? 'justify-center px-2' : ''
            }`}
            title="Sign Out"
            aria-label="Sign Out of WanderWise"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
