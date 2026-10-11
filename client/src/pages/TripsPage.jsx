import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { TripsSkeleton } from '../components/SkeletonLoader';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Breadcrumb from '../components/Breadcrumb';
import EmptyState from '../components/EmptyState';
import {
  Plane,
  Plus,
  Search,
  Calendar,
  MapPin,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  ArrowUpDown,
  X,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TripsPage() {
  const { navigateTo, openCreateTrip, openEditTrip, formatCurrency, showToast, refreshKey, triggerRefresh } = useApp();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('departure-asc');
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Deletion state
  const [tripToDelete, setTripToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

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

  const getTripDuration = (start, end) => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? `${days} Day${days > 1 ? 's' : ''}` : null;
  };

  // Sort trips
  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === 'departure-asc') {
      return new Date(a.start_date || '9999-12-31') - new Date(b.start_date || '9999-12-31');
    }
    if (sortBy === 'departure-desc') {
      return new Date(b.start_date || '1970-01-01') - new Date(a.start_date || '1970-01-01');
    }
    if (sortBy === 'budget-desc') {
      return parseFloat(b.estimated_budget || 0) - parseFloat(a.estimated_budget || 0);
    }
    if (sortBy === 'budget-asc') {
      return parseFloat(a.estimated_budget || 0) - parseFloat(b.estimated_budget || 0);
    }
    if (sortBy === 'title-asc') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <Breadcrumb items={[{ label: 'Trips' }]} />

      {/* Header and Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-extrabold mb-2 border border-teal-200/60 dark:border-teal-800/40">
            <Plane className="w-3.5 h-3.5" />
            <span>Travel Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-navy-900 dark:text-white tracking-tight">
            Trip Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1 font-medium">
            Organize upcoming voyages, completed adventures, and ongoing Philippine itineraries
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openCreateTrip()}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-md shadow-teal-500/25 transition focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Trip</span>
        </motion.button>
      </div>

      {/* Filter, Sort & Search Toolbar */}
      <div className="bg-white dark:bg-dark-surface p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {[
            { id: 'all', label: 'All Trips' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'ongoing', label: 'Ongoing' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
                filterStatus === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              aria-label="Search trips"
              placeholder="Search destination or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-2.5 text-slate-400 hover:text-navy-900 dark:hover:text-white p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative w-full sm:w-auto flex items-center gap-2">
            <div className="relative w-full sm:w-48">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                aria-label="Sort trips by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card text-navy-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition"
              >
                <option value="departure-asc">Departure Soonest</option>
                <option value="departure-desc">Departure Latest</option>
                <option value="budget-desc">Budget: High to Low</option>
                <option value="budget-asc">Budget: Low to High</option>
                <option value="title-asc">Title: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Content */}
      {loading ? (
        <TripsSkeleton />
      ) : sortedTrips.length === 0 ? (
        <EmptyState
          icon={Plane}
          title={searchQuery || filterStatus !== 'all' ? 'No matching trips found' : 'No trips yet'}
          description={
            searchQuery || filterStatus !== 'all'
              ? `No travel plans match your current criteria ("${searchQuery || filterStatus}"). Reset filters or explore different keywords.`
              : 'You have no trips listed yet. Create your first Philippine journey to plan your daily activities and track expenses.'
          }
          actionLabel={searchQuery || filterStatus !== 'all' ? 'Reset Filters' : 'Create First Trip'}
          onAction={
            searchQuery || filterStatus !== 'all'
              ? () => {
                  setFilterStatus('all');
                  setSearchQuery('');
                }
              : () => openCreateTrip()
          }
          secondaryActionLabel={searchQuery || filterStatus !== 'all' ? 'Create New Trip' : 'Explore Destinations'}
          onSecondaryAction={
            searchQuery || filterStatus !== 'all'
              ? () => openCreateTrip()
              : () => navigateTo('destinations')
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrips.map((trip) => {
            const isCompleted = trip.status === 'completed';
            const isOngoing = trip.status === 'ongoing';
            const spent = parseFloat(trip.total_spent || 0);
            const budget = parseFloat(trip.estimated_budget || 0);
            const isOverBudget = budget > 0 && spent > budget;
            const percentSpent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
            const duration = getTripDuration(trip.start_date, trip.end_date);

            return (
              <motion.div
                key={trip.id}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group bg-white dark:bg-dark-surface rounded-3xl overflow-hidden border border-slate-200/90 dark:border-dark-border shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Banner */}
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-navy-900 cursor-pointer" onClick={() => navigateTo('trip-detail', trip.id)}>
                    <img
                      src={trip.cover_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
                      alt={trip.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-black/25" />

                    {/* Status & Overbudget Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md text-white border shadow-sm ${
                          isCompleted
                            ? 'bg-purple-600/85 border-purple-400/40'
                            : isOngoing
                            ? 'bg-amber-600/85 border-amber-400/40'
                            : 'bg-teal-600/85 border-teal-400/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCompleted ? 'bg-purple-300' : isOngoing ? 'bg-amber-200 animate-pulse' : 'bg-teal-200'
                          }`}
                        />
                        {trip.status}
                      </span>

                      {isOverBudget && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md bg-coral-600/90 text-white border border-coral-400/40 shadow-sm">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Over Budget</span>
                        </span>
                      )}
                    </div>

                    {/* Action Menu button */}
                    <div className="absolute top-3 right-3">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === trip.id ? null : trip.id);
                          }}
                          className="p-1.5 rounded-full bg-navy-950/60 hover:bg-navy-950/90 text-white backdrop-blur-md transition shadow-sm border border-white/20"
                          aria-label={`Options for ${trip.title}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === trip.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-1 w-40 bg-white dark:bg-dark-card rounded-2xl shadow-card border border-slate-200 dark:border-dark-border py-1.5 z-30 animate-fade-in"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigateTo('trip-detail', trip.id);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-border flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Itinerary</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                openEditTrip(trip);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-border flex items-center gap-2"
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
                              className="w-full text-left px-3.5 py-2 text-xs text-coral-600 dark:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-950/30 flex items-center gap-2 font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-coral-500" />
                              <span>Delete Trip</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Metadata on Image */}
                    <div className="absolute bottom-3 inset-x-3 text-white flex items-center justify-between">
                      <p className="text-xs font-bold flex items-center gap-1 text-teal-300 truncate">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{trip.destination}</span>
                      </p>
                      {duration && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-slate-200">
                          <Clock className="w-3 h-3" />
                          <span>{duration}</span>
                        </span>
                      )}
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
                      <p className="text-xs text-slate-500 dark:text-dark-muted mt-1.5 line-clamp-2 leading-relaxed font-medium">
                        {trip.description}
                      </p>
                    )}

                    {/* Dates & Activities info */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-muted mt-4 pt-3 border-t border-slate-100 dark:border-dark-border">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {trip.start_date ? trip.start_date.split('T')[0] : 'TBD'}
                          {trip.end_date ? ` to ${trip.end_date.split('T')[0]}` : ''}
                        </span>
                      </div>
                      <span className="font-extrabold text-teal-700 dark:text-teal-300 text-[11px] bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200/50 dark:border-teal-800/40">
                        {trip.activity_count || 0} activities
                      </span>
                    </div>

                    {/* Budget progress indicator */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-400 dark:text-dark-muted text-[11px]">
                          {budget > 0 ? `Budget (${percentSpent}%)` : 'Expenses Recorded'}
                        </span>
                        <span className={`text-[11px] font-black ${isOverBudget ? 'text-coral-600 dark:text-coral-400' : 'text-navy-900 dark:text-white'}`}>
                          {formatCurrency(spent)} {budget > 0 ? `/ ${formatCurrency(budget)}` : ''}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-dark-card overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverBudget
                              ? 'bg-coral-500'
                              : percentSpent > 80
                              ? 'bg-amber-500'
                              : 'bg-teal-500'
                          }`}
                          style={{ width: `${budget > 0 ? Math.min(100, percentSpent) : (spent > 0 ? 100 : 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Quick Action Buttons */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => navigateTo('trip-detail', trip.id)}
                    className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-dark-card hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 text-slate-700 dark:text-slate-300 text-xs font-extrabold transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Itinerary</span>
                  </button>
                  <button
                    onClick={() => openEditTrip(trip)}
                    className="p-2.5 rounded-2xl text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card transition focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    title="Edit trip"
                    aria-label={`Edit ${trip.title}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTripToDelete(trip)}
                    className="p-2.5 rounded-2xl text-slate-400 hover:text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-950/30 transition focus:outline-none focus:ring-2 focus:ring-coral-500/30"
                    title="Delete trip"
                    aria-label={`Delete ${trip.title}`}
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
