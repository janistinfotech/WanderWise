import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Trip Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, customize, and track all your travel itineraries and budgets
          </p>
        </div>

        <button
          onClick={() => openCreateTrip()}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-sky-500 hover:from-ocean-700 hover:to-sky-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-ocean-500/20 transition hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Trip</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filterStatus === tab.id
                  ? 'bg-ocean-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
          />
        </div>
      </div>

      {/* Trips Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-ocean-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading trips...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-soft max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center mx-auto mb-4 border border-ocean-100">
            <Plane className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No trips found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            {searchQuery
              ? `No travel plans match "${searchQuery}". Try a different keyword.`
              : `You don't have any ${filterStatus !== 'all' ? filterStatus : ''} trips yet. Let's create one now!`}
          </p>
          <button
            onClick={() => openCreateTrip()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Trip</span>
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
              <div
                key={trip.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Banner */}
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    <img
                      src={trip.cover_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full backdrop-blur-md text-white border ${
                          isCompleted
                            ? 'bg-purple-600/80 border-purple-400/40'
                            : isOngoing
                            ? 'bg-amber-600/80 border-amber-400/40'
                            : 'bg-emerald-600/80 border-emerald-400/40'
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
                          className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 backdrop-blur-md transition shadow-sm"
                          aria-label="Trip actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === trip.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-card border border-slate-200 py-1 z-30 animate-fade-in"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigateTo('trip-detail', trip.id);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                openEditTrip(trip);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Details</span>
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setTripToDelete(trip);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete Trip</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 inset-x-3 text-white">
                      <p className="text-xs font-semibold flex items-center gap-1 text-white/90 truncate">
                        <MapPin className="w-3 h-3 text-ocean-400 flex-shrink-0" />
                        <span>{trip.destination}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5">
                    <h3
                      onClick={() => navigateTo('trip-detail', trip.id)}
                      className="text-base font-bold text-slate-900 group-hover:text-ocean-600 transition-colors cursor-pointer line-clamp-1"
                    >
                      {trip.title}
                    </h3>

                    {trip.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {trip.description}
                      </p>
                    )}

                    {/* Dates & Activities info */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {trip.start_date ? trip.start_date.split('T')[0] : ''} to{' '}
                          {trip.end_date ? trip.end_date.split('T')[0] : ''}
                        </span>
                      </div>
                      <span className="font-semibold text-ocean-600 text-[11px] bg-ocean-50 px-2 py-0.5 rounded-full">
                        {trip.activity_count || 0} activities
                      </span>
                    </div>

                    {/* Budget bar indicator */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-500 text-[11px]">Budget Progress</span>
                        <span className="text-slate-900 text-[11px]">
                          {formatCurrency(spent)} / {formatCurrency(budget)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percentSpent > 100
                              ? 'bg-rose-500'
                              : percentSpent > 80
                              ? 'bg-amber-500'
                              : 'bg-ocean-500'
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
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-ocean-50 hover:text-ocean-700 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Itinerary</span>
                  </button>
                  <button
                    onClick={() => openEditTrip(trip)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title="Edit trip"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTripToDelete(trip)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete trip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
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
