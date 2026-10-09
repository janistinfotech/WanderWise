import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import ActivityModal from '../components/ActivityModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  CalendarCheck,
  Plane,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ItineraryPage() {
  const { selectedTripId, setSelectedTripId, formatCurrency, showToast, refreshKey, triggerRefresh } = useApp();

  const [trips, setTrips] = useState([]);
  const [currentTripId, setCurrentTripId] = useState(selectedTripId || null);
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Modals
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);
  const [dayNumber, setDayNumber] = useState(1);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await api.trips.getAll();
        if (res.success && res.trips.length > 0) {
          setTrips(res.trips);
          if (!currentTripId) {
            setCurrentTripId(res.trips[0].id);
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

  const activities = tripData?.activities || [];
  const activitiesByDay = activities.reduce((acc, act) => {
    const day = act.day_number || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(act);
    return acc;
  }, {});
  const dayNumbers = Object.keys(activitiesByDay).map(Number).sort((a, b) => a - b);
  if (dayNumbers.length === 0) dayNumbers.push(1);

  const handleToggle = async (act) => {
    try {
      await api.itinerary.updateActivity(act.id, { is_completed: !act.is_completed });
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update activity', 'error');
    }
  };

  const handleMoveDay = async (act, targetDay) => {
    if (targetDay < 1) return;
    try {
      await api.itinerary.updateActivity(act.id, { day_number: targetDay });
      showToast(`Activity moved to Day ${targetDay}`, 'success');
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

  return (
    <div className="space-y-8 animate-fade-in pb-16">
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
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Build day-by-day travel timelines and manage checkpoints for your journeys
          </p>
        </div>

        {/* Trip Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 dark:text-dark-muted uppercase tracking-wider whitespace-nowrap">
            Select Trip:
          </label>
          <select
            value={currentTripId || ''}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCurrentTripId(val);
              setSelectedTripId(val);
            }}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs font-bold text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.destination})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading itinerary builder...</p>
        </div>
      ) : !tripData ? (
        <div className="p-12 text-center bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border max-w-md mx-auto my-8">
          <CalendarCheck className="w-12 h-12 text-slate-300 dark:text-dark-muted mx-auto mb-3" />
          <h3 className="font-bold text-navy-900 dark:text-white">No trips available</h3>
          <p className="text-xs text-slate-500 dark:text-dark-muted mt-1">Please create a trip first to build its itinerary.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trip Summary Card */}
          <div className="bg-white dark:bg-dark-surface p-5 rounded-3xl border border-slate-200 dark:border-dark-border shadow-soft flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-navy-900 flex-shrink-0 shadow-sm">
                <img
                  src={tripData.cover_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'}
                  alt={tripData.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-black text-navy-900 dark:text-white">{tripData.title}</h3>
                <p className="text-xs text-slate-500 dark:text-dark-muted flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-500" />
                  <span>{tripData.destination}</span>
                  <span className="text-slate-300 dark:text-dark-border">•</span>
                  <span>{tripData.start_date ? tripData.start_date.split('T')[0] : ''}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActivityToEdit(null);
                setDayNumber(1);
                setActivityModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-teal-600/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Stop</span>
            </button>
          </div>

          {/* Days Container */}
          <div className="space-y-6">
            {dayNumbers.map((dNum) => {
              const dayActs = activitiesByDay[dNum] || [];
              const completedInDay = dayActs.filter((a) => a.is_completed).length;
              const pct = dayActs.length > 0 ? Math.round((completedInDay / dayActs.length) * 100) : 0;

              return (
                <div key={dNum} className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-dark-border shadow-soft">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-dark-border mb-6 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-black flex items-center justify-center text-sm">
                        D{dNum}
                      </span>
                      <div>
                        <h4 className="font-black text-navy-900 dark:text-white text-base">Day {dNum} Schedule</h4>
                        <p className="text-xs text-slate-400 dark:text-dark-muted">
                          {dayActs.length} stops • <span className="text-teal-600 dark:text-teal-400 font-bold">{completedInDay} completed ({pct}%)</span>
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
                        className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Day {dNum}</span>
                      </button>
                    </div>
                  </div>

                  {dayActs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 dark:text-dark-muted text-xs">
                      No activities planned for Day {dNum} yet. Click "Add to Day {dNum}" to add schedule items.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-dark-border">
                      {dayActs.map((act) => {
                        const isDone = !!act.is_completed;
                        const isExpanded = expandedIds.has(act.id);

                        return (
                          <div key={act.id} className="relative group">
                            <button
                              onClick={() => handleToggle(act)}
                              className={`absolute -left-6 top-2 w-5 h-5 rounded-full flex items-center justify-center transition ${
                                isDone
                                  ? 'bg-teal-500 text-white shadow-sm'
                                  : 'bg-white dark:bg-dark-surface border-2 border-slate-300 dark:border-dark-border text-transparent hover:border-teal-500'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>

                            <div
                              className={`p-4 rounded-2xl border transition-all ${
                                isDone
                                  ? 'bg-slate-50/70 dark:bg-dark-card/40 border-slate-200 dark:border-dark-border opacity-75'
                                  : 'bg-white dark:bg-dark-surface border-slate-200/90 dark:border-dark-border shadow-soft hover:shadow-card hover:border-teal-200 dark:hover:border-teal-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full">
                                      {act.time_slot}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-dark-muted bg-slate-100 dark:bg-dark-card px-2 py-0.5 rounded-md">
                                      {act.category}
                                    </span>
                                    {act.estimated_cost > 0 && (
                                      <span className="text-[11px] font-bold text-navy-900 dark:text-white">
                                        {formatCurrency(act.estimated_cost)}
                                      </span>
                                    )}
                                    {isDone && (
                                      <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 bg-teal-100/60 dark:bg-teal-950/40 px-2 py-0.5 rounded-full">
                                        ✓ Done
                                      </span>
                                    )}
                                  </div>

                                  <h5 className={`text-sm font-bold text-navy-900 dark:text-white ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                                    {act.title}
                                  </h5>

                                  {act.location && (
                                    <p className="text-xs text-slate-500 dark:text-dark-muted flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-teal-500" />
                                      <span>{act.location}</span>
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {/* Quick Day shift */}
                                  <div className="hidden sm:flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-dark-card p-1 rounded-xl">
                                    <button
                                      onClick={() => handleMoveDay(act, act.day_number - 1)}
                                      disabled={act.day_number <= 1}
                                      className="p-1 text-slate-500 hover:text-teal-600 disabled:opacity-30"
                                      title="Move to previous day"
                                    >
                                      <MoveUp className="w-3 h-3" />
                                    </button>
                                    <span className="px-1 font-bold text-slate-600 dark:text-slate-300">D{act.day_number}</span>
                                    <button
                                      onClick={() => handleMoveDay(act, act.day_number + 1)}
                                      className="p-1 text-slate-500 hover:text-teal-600"
                                      title="Move to next day"
                                    >
                                      <MoveDown className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {act.notes && (
                                    <button
                                      onClick={() => toggleExpand(act.id)}
                                      className="p-1.5 text-slate-400 hover:text-teal-600 rounded-xl"
                                    >
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      setActivityToEdit(act);
                                      setDayNumber(act.day_number);
                                      setActivityModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-navy-900 dark:hover:text-white rounded-xl"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => setActivityToDelete(act)}
                                    className="p-1.5 text-slate-400 hover:text-coral-600 rounded-xl"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {isExpanded && act.notes && (
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-border text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-dark-card/50 p-3 rounded-xl leading-relaxed">
                                  <strong className="block text-slate-400 dark:text-dark-muted text-[10px] uppercase font-bold mb-1">
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
