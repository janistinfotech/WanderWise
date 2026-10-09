import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { TripsSkeleton } from '../components/SkeletonLoader';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  Plane,
  Plus,
  Search,
  Calendar,
  DollarSign,
  MapPin,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TripsPage() {
  const { navigateTo, openCreateTrip, openEditTrip, formatCurrency, showToast, refreshKey, triggerRefresh } = useApp();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Deletion state
  const [tripToDelete, setTripToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadTrips() {
      setLoading(true);
      try {
        const res = await api.trips.getAll({ status: filterStatus, search: searchQuery });
        if (res.success) {
          setTrips(res.trips);
        }
      } catch (err) {
        showToast(err.message || 'Failed to fetch trips', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, [filterStatus, searchQuery, refreshKey]);

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;
    setDeleteLoading(true);
    try {
      await api.trips.delete(tripToDelete.id);
      showToast('Trip deleted successfully', 'success');
      setTripToDelete(null);
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete trip', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-extrabold mb-2 border border-teal-200/60 dark:border-teal-800/40">
            <Plane className="w-3.5 h-3.5" />
            <span>Travel Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-navy-900 dark:text-white tracking-tight">
            Trip Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Organize upcoming voyages, completed adventures, and ongoing Philippine itineraries
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openCreateTrip()}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md shadow-teal-500/25 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Trip</span>
        </motion.button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Trips' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'ongoing', label: 'Ongoing' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
                filterStatus === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by trip title or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
          />
        </div>
      </div>

      {/* Trips Content */}
      {loading ? (
        <TripsSkeleton />
      ) : trips.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border shadow-soft max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4 border border-teal-200/60 dark:border-teal-800/40">
            <Plane className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-navy-900 dark:text-white mb-1">No trips found</h3>
          <p className="text-xs text-slate-500 dark:text-dark-muted max-w-sm mx-auto mb-6">
            {searchQuery
              ? `No travel plans match "${searchQuery}". Try a different keyword.`
              : `You have no ${filterStatus !== 'all' ? filterStatus : ''} trips listed yet. Let's create one now!`}
          </p>
          <button
            onClick={() => openCreateTrip()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Trip</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const isCompleted = trip.status === 'completed';
            const isOngoing = trip.status === 'ongoing';
            const spent = parseFloat(trip.total_spent || 0);
            const budget = parseFloat(trip.estimated_budget || 0);
            const percentSpent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

            return (
              <motion.div
                key={trip.id}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group bg-white dark:bg-dark-surface rounded-3xl overflow-hidden border border-slate-200/90 dark:border-dark-border shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Banner */}
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
                    <img
                      src={trip.cover_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-black/20" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full backdrop-blur-md text-white border ${
                          isCompleted
                            ? 'bg-purple-600/80 border-purple-400/40'
                            : isOngoing
                            ? 'bg-amber-600/80 border-amber-400/40'
                            : 'bg-teal-600/80 border-teal-400/40'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>

                    {/* Menu Actions */}
                    <div className="absolute top-3 right-3">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === trip.id ? null : trip.id);
                          }}
                          className="p-1.5 rounded-full bg-white/80 dark:bg-navy-900/80 hover:bg-white text-slate-700 dark:text-slate-200 backdrop-blur-md transition shadow-sm"
                          aria-label="Trip actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === trip.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-1 w-36 bg-white dark:bg-dark-card rounded-2xl shadow-card border border-slate-200 dark:border-dark-border py-1.5 z-30 animate-fade-in"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigateTo('trip-detail', trip.id);
                              }}
                              className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-border flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                openEditTrip(trip);
                              }}
                              className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-border flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Details</span>
                            </button>
                            <div className="border-t border-slate-100 dark:border-dark-border my-1" />
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setTripToDelete(trip);
                              }}
                              className="w-full text-left px-3.5 py-1.5 text-xs text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-950/30 flex items-center gap-2 font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-coral-500" />
                              <span>Delete Trip</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 inset-x-3 text-white">
                      <p className="text-xs font-semibold flex items-center gap-1 text-teal-300 truncate">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{trip.destination}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5">
                    <h3
                      onClick={() => navigateTo('trip-detail', trip.id)}
                      className="text-base font-black text-navy-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition cursor-pointer line-clamp-1"
                    >
                      {trip.title}
                    </h3>

                    {trip.description && (
                      <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 line-clamp-2 leading-relaxed">
                        {trip.description}
                      </p>
                    )}

                    {/* Dates & Activities info */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-muted mt-4 pt-3 border-t border-slate-100 dark:border-dark-border">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {trip.start_date ? trip.start_date.split('T')[0] : ''}
                        </span>
                      </div>
                      <span className="font-extrabold text-teal-700 dark:text-teal-300 text-[11px] bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200/50 dark:border-teal-800/40">
                        {trip.activity_count || 0} activities
                      </span>
                    </div>

                    {/* Budget bar indicator */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-400 dark:text-dark-muted text-[11px]">Budget Consumption</span>
                        <span className="text-navy-900 dark:text-white text-[11px]">
                          {formatCurrency(spent)} / {formatCurrency(budget)}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-dark-card overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percentSpent > 100
                              ? 'bg-coral-500'
                              : percentSpent > 80
                              ? 'bg-amber-500'
                              : 'bg-teal-500'
                          }`}
                          style={{ width: `${percentSpent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => navigateTo('trip-detail', trip.id)}
                    className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-dark-card hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Itinerary</span>
                  </button>
                  <button
                    onClick={() => openEditTrip(trip)}
                    className="p-2.5 rounded-2xl text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card transition"
                    title="Edit trip"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTripToDelete(trip)}
                    className="p-2.5 rounded-2xl text-slate-400 hover:text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-950/30 transition"
                    title="Delete trip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Trip?"
        message={`Are you sure you want to permanently delete "${tripToDelete?.title}"? All associated itinerary activities and expense records will also be removed.`}
        loading={deleteLoading}
      />
    </div>
  );
}
