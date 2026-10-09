import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DestinationsSkeleton } from '../components/SkeletonLoader';
import DestinationDetailModal from '../components/DestinationDetailModal';
import {
  Compass,
  Search,
  Heart,
  Plus,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Loader2,
  Sparkles,
  Plane,
  Eye,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DestinationExplorerPage() {
  const { openCreateTrip, formatCurrency, showToast, openDestinationDetail } = useApp();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    async function loadDestinations() {
      setLoading(true);
      try {
        const res = await api.destinations.getAll({
          region: regionFilter,
          search: searchQuery,
        });
        if (res.success) {
          setDestinations(res.destinations);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load destinations', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadDestinations();
  }, [regionFilter, searchQuery]);

  const handleToggleFavorite = async (destId) => {
    try {
      const res = await api.destinations.toggleFavorite(destId);
      if (res.success) {
        setDestinations((prev) =>
          prev.map((d) => (d.id === destId ? { ...d, is_favorite: res.is_favorite } : d))
        );
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update favorite', 'error');
    }
  };

  const filtered = destinations.filter((d) => {
    if (showOnlyFavorites) return d.is_favorite;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-extrabold mb-2 border border-teal-200/60 dark:border-teal-800/40">
            <Compass className="w-3.5 h-3.5" />
            <span>Curated Philippines Travel Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-navy-900 dark:text-white tracking-tight">
            Destination Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Discover pristine archipelagos, pine-scented highlands, and coastal havens across the Philippines
          </p>
        </div>

        {/* Favorites Filter Toggle */}
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition border ${
            showOnlyFavorites
              ? 'bg-coral-50 dark:bg-coral-950/40 border-coral-200 dark:border-coral-800 text-coral-600 dark:text-coral-300 shadow-sm'
              : 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-card'
          }`}
        >
          <Heart className={`w-4 h-4 ${showOnlyFavorites ? 'fill-coral-500 text-coral-500' : 'text-slate-400'}`} />
          <span>{showOnlyFavorites ? 'Showing Saved Favorites' : 'View Saved Favorites'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Region Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Philippines' },
            { id: 'MIMAROPA', label: 'Palawan' },
            { id: 'Cordillera', label: 'Baguio City' },
            { id: 'CALABARZON', label: 'Batangas' },
            { id: 'Visayas', label: 'Cebu & Bohol' },
            { id: 'Caraga', label: 'Siargao' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setRegionFilter(pill.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
                regionFilter === pill.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search diving, lagoons, mountains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
          />
        </div>
      </div>

      {/* Destination Grid */}
      {loading ? (
        <DestinationsSkeleton />
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border max-w-md mx-auto my-8">
          <Compass className="w-12 h-12 text-slate-300 dark:text-dark-muted mx-auto mb-3" />
          <h3 className="font-bold text-navy-900 dark:text-white">No destinations found</h3>
          <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 mb-4">
            Try adjusting your search terms or selecting "All Philippines".
          </p>
          <button
            onClick={() => {
              setRegionFilter('all');
              setSearchQuery('');
              setShowOnlyFavorites(false);
            }}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-2xl text-xs font-bold shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((dest) => (
            <motion.div
              key={dest.id}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group bg-white dark:bg-dark-surface rounded-3xl overflow-hidden border border-slate-200/90 dark:border-dark-border shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo Card */}
                <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
                  <img
                    src={dest.image_url}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                  />

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-black/20" />

                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{dest.rating || '4.9'}</span>
                  </div>

                  {/* Animated Favorite Toggle Button */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(dest.id);
                    }}
                    className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition shadow-sm ${
                      dest.is_favorite
                        ? 'bg-coral-500 text-white'
                        : 'bg-white/80 dark:bg-navy-900/80 hover:bg-white text-slate-700 dark:text-slate-200 hover:text-coral-500'
                    }`}
                    aria-label="Save favorite"
                  >
                    <Heart className={`w-4 h-4 ${dest.is_favorite ? 'fill-white' : ''}`} />
                  </motion.button>

                  {/* Title overlay on image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 block">
                      {dest.region}
                    </span>
                    <h3 className="text-base font-black text-white leading-tight truncate mt-0.5">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {(dest.tags || '').split(',').slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-dark-card px-2.5 py-1 rounded-xl"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-dark-muted block font-semibold">Best Season</span>
                      <span className="font-bold text-navy-900 dark:text-white text-xs">{dest.best_season}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-dark-muted block font-semibold">Est. Daily Cost</span>
                      <span className="font-black text-teal-600 dark:text-teal-400 text-xs">
                        {formatCurrency(dest.estimated_daily_cost)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: View Details & Plan Trip */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openDestinationDetail(dest)}
                  className="py-2.5 rounded-2xl bg-slate-100 dark:bg-dark-card hover:bg-slate-200 dark:hover:bg-dark-border text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <button
                  type="button"
                  onClick={() => openCreateTrip(dest.name)}
                  className="py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Plan Trip</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Destination Detail Modal */}
      <DestinationDetailModal onToggleFavorite={handleToggleFavorite} />
    </div>
  );
}
