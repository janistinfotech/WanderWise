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
  AlertCircle
} from 'lucide-react';

export default function ItineraryPage() {
  const { selectedTripId, setSelectedTripId, formatCurrency, showToast, refreshKey, triggerRefresh } = useApp();

  const [trips, setTrips] = useState([]);
  const [currentTripId, setCurrentTripId] = useState(selectedTripId || null);
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);
  const [dayNumber, setDayNumber] = useState(1);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load all user trips
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

  // Load details for current trip
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
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header and Trip Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Itinerary Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build day-by-day travel timelines and manage activity checkpoints
          </p>
        </div>

        {/* Trip Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Select Trip:
          </label>
          <select
            value={currentTripId || ''}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCurrentTripId(val);
              setSelectedTripId(val);
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 shadow-sm"
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
          <Loader2 className="w-8 h-8 text-ocean-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading itinerary builder...</p>
        </div>
      ) : !tripData ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 max-w-md mx-auto my-8">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">No trips available</h3>
          <p className="text-xs text-slate-500 mt-1">Please create a trip first to build its itinerary.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trip Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={tripData.cover_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'}
                  alt={tripData.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{tripData.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-ocean-500" />
                  <span>{tripData.destination}</span>
                  <span className="text-slate-300">•</span>
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
              className="flex items-center gap-1.5 px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Activity</span>
            </button>
          </div>

          {/* Days Container */}
          <div className="space-y-6">
            {dayNumbers.map((dNum) => {
              const dayActs = activitiesByDay[dNum] || [];

              return (
                <div key={dNum} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-ocean-100 text-ocean-700 font-extrabold flex items-center justify-center text-sm">
                        D{dNum}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Day {dNum} Schedule</h4>
                        <p className="text-xs text-slate-400">{dayActs.length} activities scheduled</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActivityToEdit(null);
                        setDayNumber(dNum);
                        setActivityModalOpen(true);
                      }}
                      className="text-xs font-bold text-ocean-600 hover:text-ocean-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Day {dNum}</span>
                    </button>
                  </div>

                  {dayActs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No activities planned for Day {dNum} yet. Click "Add to Day {dNum}" to add schedule items.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {dayActs.map((act) => {
                        const isDone = !!act.is_completed;
                        return (
                          <div key={act.id} className="relative group">
                            <button
                              onClick={() => handleToggle(act)}
                              className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center transition ${
                                isDone
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : 'bg-white border-2 border-slate-300 text-transparent hover:border-ocean-500'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="p-3.5 rounded-2xl border border-slate-200 hover:border-ocean-200 bg-white hover:bg-ocean-50/20 shadow-sm transition flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-[10px] font-extrabold text-ocean-700 bg-ocean-50 px-2 py-0.5 rounded-full">
                                    {act.time_slot}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {act.category}
                                  </span>
                                </div>
                                <h5 className={`text-sm font-bold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                                  {act.title}
                                </h5>
                                {act.location && (
                                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>{act.location}</span>
                                  </p>
                                )}
                                {act.notes && (
                                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl mt-2 border border-slate-100">
                                    {act.notes}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setActivityToEdit(act);
                                    setDayNumber(act.day_number);
                                    setActivityModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setActivityToDelete(act)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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
