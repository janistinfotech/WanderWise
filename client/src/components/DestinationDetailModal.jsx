import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Heart,
  Plane,
  Sparkles,
  Camera,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DestinationDetailModal({ onToggleFavorite }) {
  const { selectedDestination, closeDestinationDetail, openCreateTrip, formatCurrency } = useApp();

  if (!selectedDestination) return null;

  const dest = selectedDestination;
  const tagsList = (dest.tags || '').split(',').map((t) => t.trim()).filter(Boolean);

  const sampleHighlights = [
    'Breathtaking crystal clear waters & protected marine sanctuaries',
    'Scenic local dining featuring fresh seafood & regional delicacies',
    'Perfect for adventure seekers, couples, and photography lovers',
    'Eco-tourism compliant with accredited tour guides',
  ];

  const handlePlanTrip = () => {
    closeDestinationDetail();
    openCreateTrip(dest.name);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border border-slate-200 dark:border-dark-border w-full max-w-2xl overflow-hidden my-8"
        >
          {/* Hero Image Header */}
          <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-navy-900">
            <img
              src={dest.image_url}
              alt={dest.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />

            {/* Close Button */}
            <button
              onClick={closeDestinationDetail}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Region & Rating Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-600/90 text-white text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
                {dest.region}
              </span>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-bold backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{dest.rating || '4.9'}</span>
              </div>
            </div>

            {/* Destination Title on Hero */}
            <div className="absolute bottom-6 inset-x-6 text-white">
              <p className="text-xs font-semibold text-teal-300 flex items-center gap-1.5 mb-1">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>{dest.country || 'Philippines'}</span>
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{dest.name}</h2>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-navy-50/70 dark:bg-dark-card border border-navy-100 dark:border-dark-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-dark-muted block">
                  Best Season
                </span>
                <span className="text-xs font-bold text-navy-900 dark:text-slate-100 mt-1 block">
                  {dest.best_season || 'Year-Round'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-navy-50/70 dark:bg-dark-card border border-navy-100 dark:border-dark-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-dark-muted block">
                  Est. Daily Cost
                </span>
                <span className="text-xs font-black text-teal-600 dark:text-teal-400 mt-1 block">
                  {formatCurrency(dest.estimated_daily_cost)}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-navy-50/70 dark:bg-dark-card border border-navy-100 dark:border-dark-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-dark-muted block">
                  Travel Vibe
                </span>
                <span className="text-xs font-bold text-navy-900 dark:text-slate-100 mt-1 block truncate">
                  {tagsList[0] || 'Tropical Escapade'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-dark-muted mb-2">
                About this Destination
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {dest.description}
              </p>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-dark-muted mb-2">
                Highlights & Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {tagsList.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200/60 dark:border-teal-800/40"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Travel Highlights List */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-dark-muted mb-2.5">
                Why Travelers Love It
              </h4>
              <div className="space-y-2">
                {sampleHighlights.map((hl, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(dest.id)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border font-bold text-xs transition ${
                    dest.is_favorite
                      ? 'bg-coral-50 dark:bg-coral-950/30 border-coral-200 text-coral-600'
                      : 'border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-card'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${dest.is_favorite ? 'fill-coral-500 text-coral-500' : ''}`} />
                  <span>{dest.is_favorite ? 'Saved in Favorites' : 'Add to Favorites'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handlePlanTrip}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-teal-500/25 transition-all hover:scale-105"
              >
                <Plane className="w-4 h-4" />
                <span>Plan Trip to {dest.name.split(',')[0]}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
