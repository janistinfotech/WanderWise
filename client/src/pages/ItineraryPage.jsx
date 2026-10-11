import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import ActivityModal from '../components/ActivityModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Breadcrumb from '../components/Breadcrumb';
import EmptyState from '../components/EmptyState';
import { ItinerarySkeleton } from '../components/SkeletonLoader';
import {
  CalendarCheck,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  MoveUp,
  MoveDown,
  Filter,
  Search,
  Compass,
  Check,
  Calendar,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ItineraryPage() {
  const { selectedTripId, setSelectedTripId, formatCurrency, showToast, refreshKey, triggerRefresh, openCreateTrip } = useApp();

  const [trips, setTrips] = useState([]);
  const [currentTripId, setCurrentTripId] = useState(selectedTripId || null);
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Filter controls
  const [activeDayFilter, setActiveDayFilter] = useState('all'); // 'all' or day number (e.g. 1, 2)
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);
  const [dayNumber, setDayNumber] = useState(1);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updatingActivityIds, setUpdatingActivityIds] = useState(new Set());

  useEffect(() => {
    if (selectedTripId) {
      setCurrentTripId(selectedTripId);
    }
  }, [selectedTripId]);

  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await api.trips.getAll();
        if (res.success) {
          const list = res.trips || [];
          setTrips(list);
          if (list.length > 0) {
            setCurrentTripId((prev) => (prev && list.some((t) => t.id === prev) ? prev : list[0].id));
          } else {
            setCurrentTripId(null);
            setTripData(null);
          }
        }
      } catch (err) {
        showToast(err.message || 'Failed to load trips', 'error');
      }
    }
    loadTrips();
  }, [refreshKey]);

  useEffect(() => {
    async function loadTripDetail() {
      if (!currentTripId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.trips.getById(currentTripId);
        if (res.success) {
          setTripData(res.trip);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load itinerary', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadTripDetail();
  }, [currentTripId, refreshKey]);

  const rawActivities = tripData?.activities || [];

  // Filter activities
  const filteredActivities = rawActivities.filter((act) => {
    if (activeDayFilter !== 'all' && Number(act.day_number) !== Number(activeDayFilter)) {
      return false;
    }
    if (categoryFilter !== 'all' && act.category !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (act.title || '').toLowerCase().includes(q);
      const matchLoc = (act.location || '').toLowerCase().includes(q);
      const matchNotes = (act.notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchNotes) return false;
    }
    return true;
  });

  const totalActivitiesCount = rawActivities.length;
  const completedActivitiesCount = rawActivities.filter((a) => a.is_completed).length;
  const overallProgressPct =
    totalActivitiesCount > 0 ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100) : 0;

  // Group filtered activities by day
  const activitiesByDay = filteredActivities.reduce((acc, act) => {
    const day = act.day_number || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(act);
    return acc;
  }, {});

  // Determine all existing days in trip
  const allDaysSet = new Set(rawActivities.map((a) => a.day_number || 1));
  if (allDaysSet.size === 0) allDaysSet.add(1);
  const allDayNumbers = Array.from(allDaysSet).sort((a, b) => a - b);

  const displayDayNumbers =
    activeDayFilter === 'all'
      ? Object.keys(activitiesByDay).map(Number).sort((a, b) => a - b)
      : [Number(activeDayFilter)];

  // Optimistic completion toggle with in-flight deduplication
  const handleToggle = async (act) => {
    if (updatingActivityIds.has(act.id)) return;
    setUpdatingActivityIds((prev) => new Set(prev).add(act.id));

    const previousState = act.is_completed;
    const newStatus = !previousState;

    // Optimistic UI update
    setTripData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        activities: prev.activities.map((a) => (a.id === act.id ? { ...a, is_completed: newStatus } : a)),
      };
    });

    try {
      await api.itinerary.updateActivity(act.id, { is_completed: newStatus });
      triggerRefresh();
    } catch (err) {
      // Revert on failure
      setTripData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          activities: prev.activities.map((a) => (a.id === act.id ? { ...a, is_completed: previousState } : a)),
        };
      });
      showToast(err.message || 'Failed to update activity status', 'error');
    } finally {
      setUpdatingActivityIds((prev) => {
        const next = new Set(prev);
        next.delete(act.id);
        return next;
      });
    }
  };

  const handleMoveDay = async (act, targetDay) => {
    if (targetDay < 1) return;
    try {
      await api.itinerary.updateActivity(act.id, { day_number: targetDay });
      showToast(`Activity shifted to Day ${targetDay}`, 'success');
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to move activity', 'error');
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return;
    setDeleteLoading(true);
    try {
      await api.itinerary.deleteActivity(activityToDelete.id);
      showToast('Activity removed from itinerary', 'success');
      setActivityToDelete(null);
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete activity', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const breadcrumbItems = tripData
    ? [
        { label: 'Trips', view: 'trips' },
        { label: tripData.title, view: 'trip-detail', tripId: tripData.id },
        { label: 'Itinerary' },
      ]
    : [{ label: 'Itinerary' }];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header and Trip Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-extrabold mb-2 border border-teal-200/60 dark:border-teal-800/40">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Timeline Organizer</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-navy-900 dark:text-white tracking-tight">
            Itinerary Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1 font-medium">
            Build day-by-day travel schedules, track completed stops, and organize Philippine adventures
          </p>
        </div>

        {/* Trip Switcher Dropdown */}
        {trips.length > 0 && (
          <div className="flex items-center gap-3">
            <label htmlFor="itinerary-trip-select" className="text-xs font-black text-slate-400 dark:text-dark-muted uppercase tracking-wider whitespace-nowrap">
              Active Trip:
            </label>
            <div className="relative">
              <select
                id="itinerary-trip-select"
                aria-label="Select trip for itinerary"
                value={currentTripId || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTripId(val);
                  setSelectedTripId(val);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs font-black text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-soft cursor-pointer transition"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.destination})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <ItinerarySkeleton />
      ) : trips.length === 0 || !tripData ? (
        <EmptyState
          icon={CalendarCheck}
          title="No travel itinerary available"
          description="Create your first trip to unlock the interactive day-by-day itinerary planner."
          actionLabel="Create New Trip"
          onAction={() => openCreateTrip()}
        />
      ) : (
        <div className="space-y-6">
          {/* Trip Summary & Progress Banner */}
          <div className="bg-white dark:bg-dark-surface p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-navy-900 flex-shrink-0 shadow-sm border border-slate-200 dark:border-dark-border">
                <img
                  src={tripData.cover_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'}
                  alt={tripData.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-black text-navy-900 dark:text-white tracking-tight">
                  {tripData.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-dark-muted font-bold">
                  <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{tripData.destination}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tripData.start_date ? tripData.start_date.split('T')[0] : 'TBD'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar & Add Stop CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:w-1/2 justify-end">
              <div className="bg-slate-50 dark:bg-dark-card p-3 rounded-2xl border border-slate-100 dark:border-dark-border/60 flex-1 max-w-sm">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500 dark:text-dark-muted text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                    <span>Itinerary Progress</span>
                  </span>
                  <span className="text-navy-900 dark:text-white font-extrabold text-[11px]">
                    {completedActivitiesCount} / {totalActivitiesCount} done ({overallProgressPct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-dark-border overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgressPct}%` }}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActivityToEdit(null);
                  setDayNumber(activeDayFilter !== 'all' ? Number(activeDayFilter) : 1);
                  setActivityModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-teal-600/20 transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Stop</span>
              </motion.button>
            </div>
          </div>

          {/* Day Tabs and Category Filter Toolbar */}
          <div className="bg-white dark:bg-dark-surface p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft space-y-4">
            {/* Day Selector Pills */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider">
                  Timeline Days:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveDayFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                    activeDayFilter === 'all'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card'
                  }`}
                >
                  All Days ({totalActivitiesCount})
                </button>
                {allDayNumbers.map((d) => {
                  const dayItems = rawActivities.filter((a) => (a.day_number || 1) === d);
                  const dayDone = dayItems.filter((a) => a.is_completed).length;
                  return (
                    <button
                      key={d}
                      onClick={() => setActiveDayFilter(d)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                        Number(activeDayFilter) === d
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card'
                      }`}
                    >
                      Day {d} ({dayDone}/{dayItems.length})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter by Category & Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs font-bold text-slate-400 dark:text-dark-muted mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Category:</span>
                </span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'sightseeing', label: 'Sightseeing' },
                  { id: 'food', label: 'Food & Dining' },
                  { id: 'transport', label: 'Transportation' },
                  { id: 'adventure', label: 'Adventure' },
                  { id: 'relaxation', label: 'Relaxation' },
                  { id: 'accommodation', label: 'Stay' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      categoryFilter === cat.id
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-navy-950 font-black'
                        : 'text-slate-500 dark:text-dark-muted hover:bg-slate-100 dark:hover:bg-dark-card'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Quick Search */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  aria-label="Filter itinerary activities"
                  placeholder="Filter schedule stops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card text-navy-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Timeline Content */}
          {filteredActivities.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No activities match your filters"
              description="Try resetting your category or day filters, or add a new scheduled stop to this trip."
              actionLabel="Add New Stop"
              onAction={() => {
                setActivityToEdit(null);
                setDayNumber(activeDayFilter !== 'all' ? Number(activeDayFilter) : 1);
                setActivityModalOpen(true);
              }}
              secondaryActionLabel="Reset Filters"
              onSecondaryAction={() => {
                setActiveDayFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="space-y-6">
              {displayDayNumbers.map((dNum) => {
                const dayActs = activitiesByDay[dNum] || [];
                if (dayActs.length === 0 && activeDayFilter === 'all') return null;

                const completedInDay = dayActs.filter((a) => a.is_completed).length;
                const pct = dayActs.length > 0 ? Math.round((completedInDay / dayActs.length) * 100) : 0;

                return (
                  <div
                    key={dNum}
                    className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-dark-border shadow-soft"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-dark-border mb-6 gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800/40 text-teal-800 dark:text-teal-200 font-black flex items-center justify-center text-sm shadow-sm">
                          D{dNum}
                        </span>
                        <div>
                          <h3 className="font-black text-navy-900 dark:text-white text-base">Day {dNum} Schedule</h3>
                          <p className="text-xs text-slate-400 dark:text-dark-muted font-medium">
                            {dayActs.length} {dayActs.length === 1 ? 'stop' : 'stops'} •{' '}
                            <span className="text-teal-600 dark:text-teal-400 font-bold">
                              {completedInDay} completed ({pct}%)
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 rounded-full bg-slate-100 dark:bg-dark-card overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <button
                          onClick={() => {
                            setActivityToEdit(null);
                            setDayNumber(dNum);
                            setActivityModalOpen(true);
                          }}
                          className="text-xs font-black text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Day {dNum}</span>
                        </button>
                      </div>
                    </div>

                    {dayActs.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 dark:text-dark-muted text-xs bg-slate-50/50 dark:bg-dark-card/50 rounded-2xl border border-dashed border-slate-200 dark:border-dark-border">
                        No activities scheduled for Day {dNum}. Click "Add to Day {dNum}" to add schedule items.
                      </div>
                    ) : (
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-dark-border">
                        {dayActs.map((act) => {
                          const isDone = !!act.is_completed;
                          const isExpanded = expandedIds.has(act.id);

                          return (
                            <div key={act.id} className="relative group">
                              {/* Toggle Checkmark */}
                              <button
                                onClick={() => handleToggle(act)}
                                disabled={updatingActivityIds.has(act.id)}
                                aria-label={isDone ? 'Mark activity incomplete' : 'Mark activity complete'}
                                title={isDone ? 'Mark activity incomplete' : 'Mark activity complete'}
                                className={`absolute -left-6 top-3 w-5 h-5 rounded-full flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isDone
                                    ? 'bg-teal-500 text-white shadow-sm ring-2 ring-teal-200 dark:ring-teal-900'
                                    : 'bg-white dark:bg-dark-surface border-2 border-slate-300 dark:border-dark-border text-transparent hover:border-teal-500 hover:text-teal-400'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </button>

                              <div
                                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                                  isDone
                                    ? 'bg-slate-50/70 dark:bg-dark-card/40 border-slate-200 dark:border-dark-border opacity-75'
                                    : 'bg-white dark:bg-dark-surface border-slate-200/90 dark:border-dark-border shadow-soft hover:shadow-card hover:border-teal-200 dark:hover:border-teal-800'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200/50 dark:border-teal-800/40">
                                        <Clock className="w-3 h-3" />
                                        <span>{act.time_slot}</span>
                                      </span>
                                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-dark-muted bg-slate-100 dark:bg-dark-card px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-dark-border">
                                        {act.category}
                                      </span>
                                      {act.estimated_cost > 0 && (
                                        <span className="text-[11px] font-black text-navy-900 dark:text-white bg-slate-50 dark:bg-dark-card px-2 py-0.5 rounded-lg">
                                          {formatCurrency(act.estimated_cost)}
                                        </span>
                                      )}
                                      {isDone && (
                                        <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 bg-teal-100/60 dark:bg-teal-950/40 px-2.5 py-0.5 rounded-full">
                                          Completed
                                        </span>
                                      )}
                                    </div>

                                    <h4
                                      className={`text-sm font-black text-navy-900 dark:text-white ${
                                        isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                                      }`}
                                    >
                                      {act.title}
                                    </h4>

                                    {act.location && (
                                      <p className="text-xs text-slate-500 dark:text-dark-muted flex items-center gap-1 font-medium">
                                        <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                                        <span className="truncate">{act.location}</span>
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {/* Quick Day shift buttons */}
                                    <div className="hidden sm:flex items-center gap-0.5 text-[10px] bg-slate-100 dark:bg-dark-card p-1 rounded-xl border border-slate-200/60 dark:border-dark-border">
                                      <button
                                        onClick={() => handleMoveDay(act, act.day_number - 1)}
                                        disabled={act.day_number <= 1}
                                        className="p-1 text-slate-500 hover:text-teal-600 disabled:opacity-25"
                                        title="Move to previous day"
                                        aria-label="Move to previous day"
                                      >
                                        <MoveUp className="w-3 h-3" />
                                      </button>
                                      <span className="px-1 font-black text-slate-600 dark:text-slate-300">
                                        D{act.day_number}
                                      </span>
                                      <button
                                        onClick={() => handleMoveDay(act, act.day_number + 1)}
                                        className="p-1 text-slate-500 hover:text-teal-600"
                                        title="Move to next day"
                                        aria-label="Move to next day"
                                      >
                                        <MoveDown className="w-3 h-3" />
                                      </button>
                                    </div>

                                    {act.notes && (
                                      <button
                                        onClick={() => toggleExpand(act.id)}
                                        className="p-1.5 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card transition"
                                        title={isExpanded ? 'Collapse notes' : 'Expand notes'}
                                        aria-label="Toggle notes"
                                      >
                                        {isExpanded ? (
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    )}

                                    <button
                                      onClick={() => {
                                        setActivityToEdit(act);
                                        setDayNumber(act.day_number);
                                        setActivityModalOpen(true);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-navy-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card transition"
                                      title="Edit activity"
                                      aria-label={`Edit ${act.title}`}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => setActivityToDelete(act)}
                                      className="p-1.5 text-slate-400 hover:text-coral-600 rounded-xl hover:bg-coral-50 dark:hover:bg-coral-950/30 transition"
                                      title="Delete activity"
                                      aria-label={`Delete ${act.title}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {isExpanded && act.notes && (
                                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-border text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-dark-card/60 p-3 rounded-xl leading-relaxed">
                                    <strong className="block text-slate-400 dark:text-dark-muted text-[10px] uppercase font-black tracking-wider mb-1">
                                      Traveler Notes:
                                    </strong>
                                    {act.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {tripData && (
        <ActivityModal
          isOpen={activityModalOpen}
          onClose={() => setActivityModalOpen(false)}
          tripId={tripData.id}
          activityToEdit={activityToEdit}
          defaultDay={dayNumber}
          onSaved={triggerRefresh}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!activityToDelete}
        onClose={() => setActivityToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Activity?"
        message={`Are you sure you want to remove "${activityToDelete?.title}" from the itinerary?`}
        loading={deleteLoading}
      />
    </div>
  );
}
