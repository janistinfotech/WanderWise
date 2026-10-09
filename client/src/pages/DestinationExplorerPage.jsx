import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
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
  Plane
} from 'lucide-react';

export default function DestinationExplorerPage() {
  const { openCreateTrip, formatCurrency, showToast } = useApp();

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
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Destination Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover top Philippine travel spots, save favorites, and turn dream spots into trips
          </p>
        </div>

        {/* Favorites Filter Toggle */}
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
            showOnlyFavorites
              ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${showOnlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
          <span>{showOnlyFavorites ? 'Showing Favorites Only' : 'Show Saved Favorites'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Region Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Regions' },
            { id: 'MIMAROPA', label: 'Palawan' },
            { id: 'Cordillera', label: 'Baguio / CAR' },
            { id: 'CALABARZON', label: 'Batangas' },
            { id: 'Visayas', label: 'Visayas (Cebu/Bohol/Boracay)' },
            { id: 'Caraga', label: 'Siargao' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setRegionFilter(pill.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                regionFilter === pill.id
                  ? 'bg-ocean-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search beaches, mountains, cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
          />
        </div>
      </div>

      {/* Destination Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-ocean-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Exploring Philippine destinations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 max-w-md mx-auto my-8">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">No destinations match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the region filter or changing your search terms.</p>
          <button
            onClick={() => {
              setRegionFilter('all');
              setSearchQuery('');
              setShowOnlyFavorites(false);
            }}
            className="mt-4 px-4 py-2 bg-ocean-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((dest) => (
            <div
              key={dest.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={dest.image_url}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{dest.rating || '4.9'}</span>
                  </div>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={() => handleToggleFavorite(dest.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition shadow-sm ${
                      dest.is_favorite
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500'
                    }`}
                    aria-label="Save favorite"
                  >
                    <Heart className={`w-4 h-4 ${dest.is_favorite ? 'fill-white' : ''}`} />
                  </button>

                  {/* Region on Image */}
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ocean-300">
                      {dest.region}
                    </span>
                    <h3 className="text-base font-extrabold text-white leading-tight">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {dest.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {(dest.tags || '').split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Best Season</span>
                      <span className="font-bold text-slate-700">{dest.best_season}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Est. Daily Cost</span>
                      <span className="font-extrabold text-ocean-600">{formatCurrency(dest.estimated_daily_cost)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Plan Trip Here */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => openCreateTrip(dest.name)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ocean-50 hover:bg-ocean-600 text-ocean-700 hover:text-white font-bold text-xs transition duration-200 border border-ocean-200 hover:border-transparent shadow-sm"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Plan Trip Here</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
