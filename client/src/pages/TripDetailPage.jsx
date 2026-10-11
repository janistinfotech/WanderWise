import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import ActivityModal from '../components/ActivityModal';
import ExpenseModal from '../components/ExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import BudgetCharts from '../components/BudgetCharts';
import Breadcrumb from '../components/Breadcrumb';
import EmptyState from '../components/EmptyState';
import { TripDetailSkeleton } from '../components/SkeletonLoader';
import {
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CalendarCheck,
  Wallet,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MoveUp,
  MoveDown,
  Clock,
  Check,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TripDetailPage({ tripId }) {
  const { navigateTo, openEditTrip, formatCurrency, showToast, refreshKey, triggerRefresh } = useApp();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'budget' | 'overview'

  // Expandable activity IDs
  const [expandedActivityIds, setExpandedActivityIds] = useState(new Set());

  // Activity modal state
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [activityToDelete, setActivityToDelete] = useState(null);

  // Expense modal state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updatingActivityIds, setUpdatingActivityIds] = useState(new Set());

  useEffect(() => {
    async function fetchTripDetails() {
      if (!tripId) return;
      setLoading(true);
      try {
        const res = await api.trips.getById(tripId);
        if (res.success) {
          setTrip(res.trip);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load trip', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchTripDetails();
  }, [tripId, refreshKey]);

  if (loading && !trip) {
    return <TripDetailSkeleton />;
  }

  if (!trip) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Trip not found"
        description="The trip you requested may have been removed or is temporarily unavailable."
        actionLabel="Back to Trips"
        onAction={() => navigateTo('trips')}
      />
    );
  }

  const { activities = [], expenses = [], budgetSummary = {} } = trip;

  const isCompleted = trip.status === 'completed';
  const isOngoing = trip.status === 'ongoing';
  const spent = parseFloat(budgetSummary.totalSpent || 0);
  const budgetCap = parseFloat(trip.estimated_budget || 0);
  const isOverBudget = budgetCap > 0 && spent > budgetCap;

  const getTripDuration = (start, end) => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? `${days} Day${days > 1 ? 's' : ''}` : null;
  };
  const durationText = getTripDuration(trip.start_date, trip.end_date);

  // Group activities by day_number
  const activitiesByDay = activities.reduce((acc, act) => {
    const day = act.day_number || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(act);
    return acc;
  }, {});

  const dayNumbers = Object.keys(activitiesByDay).map(Number).sort((a, b) => a - b);
  if (dayNumbers.length === 0) dayNumbers.push(1);

  // Optimistic completion toggle with in-flight deduplication
  const handleToggleCompleted = async (act) => {
    if (updatingActivityIds.has(act.id)) return;
    setUpdatingActivityIds((prev) => new Set(prev).add(act.id));

    const previousState = act.is_completed;
    const newStatus = !previousState;

    setTrip((prev) => {
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
      setTrip((prev) => {
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

  const toggleExpand = (id) => {
    setExpandedActivityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  const handleDeleteActivityConfirm = async () => {
    if (!activityToDelete) return;
    setDeleteLoading(true);
    try {
      await api.itinerary.deleteActivity(activityToDelete.id);
      showToast('Activity removed from itinerary', 'success');
      setActivityToDelete(null);
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to remove activity', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteExpenseConfirm = async () => {
    if (!expenseToDelete) return;
    setDeleteLoading(true);
    try {
      await api.budget.deleteExpense(expenseToDelete.id);
      showToast('Expense record deleted', 'success');
      setExpenseToDelete(null);
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete expense', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <Breadcrumb items={[{ label: 'Trips', view: 'trips' }, { label: trip.title }]} />

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-card border border-slate-200/90 dark:border-dark-border">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-navy-900">
          <img
            src={trip.cover_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'}
            alt={trip.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-black/25" />

          {/* Top badges & Edit Action */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full backdrop-blur-md text-white border shadow-sm ${
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
              <span>{trip.status}</span>
            </span>

            {isOverBudget && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md bg-coral-600/90 text-white border border-coral-400/40 shadow-sm">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>Over Budget</span>
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <button
              onClick={() => openEditTrip(trip)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-navy-900 text-xs font-black transition border border-white/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Trip</span>
            </button>
          </div>

          {/* Bottom Title & Details */}
          <div className="absolute bottom-6 inset-x-6 sm:inset-x-8 text-white">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 mb-1">
              <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span className="truncate">{trip.destination}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight break-words line-clamp-2">{trip.title}</h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs text-white/90">
              <span className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-4 h-4 text-teal-300" />
                <span>
                  {trip.start_date ? trip.start_date.split('T')[0] : 'TBD'} —{' '}
                  {trip.end_date ? trip.end_date.split('T')[0] : 'TBD'}
                </span>
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <Wallet className="w-4 h-4 text-teal-300" />
                <span>Budget: {parseFloat(trip.estimated_budget) > 0 ? formatCurrency(trip.estimated_budget) : 'Uncapped'}</span>
              </span>
              {durationText && (
                <span className="font-extrabold text-white bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[11px] border border-white/20">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {durationText}
                </span>
              )}
              <span className="font-extrabold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px]">
                {activities.length} Activities Planned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 dark:border-dark-border gap-2 sm:gap-4">
        {[
          { id: 'itinerary', label: 'Itinerary Timeline', icon: CalendarCheck, count: activities.length },
          { id: 'budget', label: 'Budget & Expenses', icon: Wallet, count: expenses.length },
          { id: 'overview', label: 'Overview & Notes', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition ${
                isActive
                  ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 dark:text-dark-muted hover:text-navy-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200'
                      : 'bg-slate-100 dark:bg-dark-card text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ITINERARY TIMELINE */}
      {activeTab === 'itinerary' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-navy-900 dark:text-white">Day-by-Day Schedule</h2>
              <p className="text-xs text-slate-500 dark:text-dark-muted font-medium">Check off completed stops and organize daily checkpoints</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setActivityToEdit(null);
                setSelectedDayNumber(1);
                setActivityModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-teal-600/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Activity</span>
            </motion.button>
          </div>

          {activities.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No itinerary activities yet"
              description="Schedule boat tours, beach excursions, sunset dinners, and scenic spots day by day."
              actionLabel="Add Day 1 Activity"
              onAction={() => {
                setActivityToEdit(null);
                setSelectedDayNumber(1);
                setActivityModalOpen(true);
              }}
            />
          ) : (
            <div className="space-y-8">
              {dayNumbers.map((dayNum) => {
                const dayActs = activitiesByDay[dayNum] || [];
                const completedInDay = dayActs.filter((a) => a.is_completed).length;
                const progressPct = dayActs.length > 0 ? Math.round((completedInDay / dayActs.length) * 100) : 0;

                return (
                  <div key={dayNum} className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-dark-border shadow-soft">
                    {/* Day Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-dark-border mb-6 gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800/40 text-teal-800 dark:text-teal-200 font-black flex items-center justify-center text-sm shadow-sm">
                          D{dayNum}
                        </span>
                        <div>
                          <h3 className="font-black text-navy-900 dark:text-white text-base">Day {dayNum}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-dark-muted mt-0.5 font-medium">
                            <span>{dayActs.length} activities</span>
                            <span>•</span>
                            <span className="text-teal-600 dark:text-teal-400 font-bold">{completedInDay} completed ({progressPct}%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Day Progress bar & quick add */}
                      <div className="flex items-center gap-3">
                        <div className="w-28 h-2 rounded-full bg-slate-100 dark:bg-dark-card overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        <button
                          onClick={() => {
                            setActivityToEdit(null);
                            setSelectedDayNumber(dayNum);
                            setActivityModalOpen(true);
                          }}
                          className="text-xs font-black text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 rounded-xl transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Stop</span>
                        </button>
                      </div>
                    </div>

                    {/* Timeline List */}
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-dark-border">
                      {dayActs.map((act) => {
                        const isDone = !!act.is_completed;
                        const isExpanded = expandedActivityIds.has(act.id);

                        return (
                          <div key={act.id} className="relative group">
                            {/* Checkbox Timeline Marker */}
                            <button
                              onClick={() => handleToggleCompleted(act)}
                              disabled={updatingActivityIds.has(act.id)}
                              aria-label={isDone ? 'Mark incomplete' : 'Mark completed'}
                              className={`absolute -left-6 top-3 w-5 h-5 rounded-full flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isDone
                                  ? 'bg-teal-500 text-white shadow-sm ring-2 ring-teal-200 dark:ring-teal-900'
                                  : 'bg-white dark:bg-dark-surface border-2 border-slate-300 dark:border-dark-border text-transparent hover:border-teal-500 hover:text-teal-400'
                              }`}
                              title={isDone ? 'Mark incomplete' : 'Mark completed'}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            {/* Activity Card */}
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
                                      <span>{act.location}</span>
                                    </p>
                                  )}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-1.5 flex-shrink-0">
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
                                    <span className="px-1 font-black text-slate-600 dark:text-slate-300">D{act.day_number}</span>
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
                                      title={isExpanded ? 'Hide notes' : 'Show notes'}
                                      aria-label="Toggle notes"
                                    >
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      setActivityToEdit(act);
                                      setSelectedDayNumber(act.day_number);
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
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-border text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-dark-card/60 p-3 rounded-xl leading-relaxed"
                                >
                                  <strong className="block text-slate-400 dark:text-dark-muted text-[10px] uppercase font-black tracking-wider mb-1">
                                    Traveler Notes & Tips:
                                  </strong>
                                  {act.notes}
                                </motion.div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUDGET & EXPENSES */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-navy-900 dark:text-white">Budget & Expense Ledger</h2>
              <p className="text-xs text-slate-500 dark:text-dark-muted font-medium">Categorized expenditure and visual analytics for this trip</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setExpenseToEdit(null);
                setExpenseModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-teal-600/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Expense</span>
            </motion.button>
          </div>

          {/* Interactive Visual Charts */}
          <BudgetCharts
            budget={{
              estimatedBudget: budgetSummary.estimatedBudget,
              totalSpent: budgetSummary.totalSpent,
              remainingBudget: budgetSummary.remainingBudget,
              percentSpent:
                budgetSummary.estimatedBudget > 0
                  ? Math.round((budgetSummary.totalSpent / budgetSummary.estimatedBudget) * 100)
                  : 0,
              categoryBreakdown: ['transportation', 'accommodation', 'food', 'activities', 'other'].map((cat) => ({
                category: cat,
                amount: expenses
                  .filter((e) => (e.category || 'other').toLowerCase() === cat)
                  .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
              })),
            }}
          />

          {/* Expenses Table */}
          <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
              <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider">
                Logged Receipts ({expenses.length})
              </h4>
              <span className="text-xs font-black text-teal-600 dark:text-teal-400">
                Total Recorded: {formatCurrency(budgetSummary.totalSpent)}
              </span>
            </div>

            {expenses.length === 0 ? (
              <div className="p-12 text-center text-slate-400 dark:text-dark-muted text-xs">
                <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-dark-border mb-2" />
                <p className="font-bold text-navy-900 dark:text-white text-sm">No receipts logged yet</p>
                <p className="mt-1">Click "Record Expense" above to add receipts and calculate spending distribution.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-dark-card text-slate-400 dark:text-dark-muted font-bold uppercase tracking-wider border-b border-slate-100 dark:border-dark-border">
                    <tr>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Description</th>
                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-5">Notes</th>
                      <th className="py-3 px-5 text-right">Amount</th>
                      <th className="py-3 px-5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-border font-medium text-slate-700 dark:text-slate-300">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-dark-card/50 transition">
                        <td className="py-3.5 px-5 text-slate-400 dark:text-dark-muted whitespace-nowrap font-semibold">
                          {exp.expense_date ? exp.expense_date.split('T')[0] : '—'}
                        </td>
                        <td className="py-3.5 px-5 text-navy-900 dark:text-white font-black">
                          {exp.description}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300 text-[10px] uppercase font-bold border border-slate-200/50 dark:border-dark-border">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 dark:text-dark-muted max-w-xs truncate">
                          {exp.notes || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right font-black text-navy-900 dark:text-white whitespace-nowrap text-sm">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setExpenseToEdit(exp);
                                setExpenseModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-navy-900 dark:hover:text-white transition rounded-lg hover:bg-slate-100 dark:hover:bg-dark-card"
                              title="Edit expense"
                              aria-label={`Edit expense ${exp.description}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setExpenseToDelete(exp)}
                              className="p-1.5 text-slate-400 hover:text-coral-600 transition rounded-lg hover:bg-coral-50 dark:hover:bg-coral-950/30"
                              title="Delete expense"
                              aria-label={`Delete expense ${exp.description}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: OVERVIEW & NOTES */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-dark-border shadow-soft space-y-6">
          <div>
            <h2 className="text-base font-black text-navy-900 dark:text-white mb-1">Trip Overview & Logistics</h2>
            <p className="text-xs text-slate-400 dark:text-dark-muted font-medium">Summary and travel preparation notes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                Duration
              </span>
              <p className="text-sm font-black text-navy-900 dark:text-white mt-1">
                {trip.start_date ? trip.start_date.split('T')[0] : 'TBD'} to{' '}
                {trip.end_date ? trip.end_date.split('T')[0] : 'TBD'}
              </p>
              {durationText && <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-0.5">{durationText}</p>}
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                Budget Cap
              </span>
              <p className="text-sm font-black text-teal-600 dark:text-teal-400 mt-1">
                {parseFloat(trip.estimated_budget || 0) > 0 ? formatCurrency(trip.estimated_budget) : 'Uncapped'}
              </p>
              <p className="text-xs text-slate-400 dark:text-dark-muted font-medium mt-0.5">
                {formatCurrency(budgetSummary?.totalSpent || 0)} recorded
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                Activities Progress
              </span>
              <p className="text-sm font-black text-navy-900 dark:text-white mt-1">
                {activities.length} planned ({activities.filter((a) => a.is_completed).length} completed)
              </p>
              <p className="text-xs text-slate-400 dark:text-dark-muted font-medium mt-0.5">
                Across {dayNumbers.length} days
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-dark-muted mb-2">
              Description & Notes
            </h3>
            <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-dark-card border border-slate-100 dark:border-dark-border text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
              {trip.description ||
                'No description entered for this trip yet. Click "Edit Trip" above to add packing lists, flights, and companion notes.'}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ActivityModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        tripId={trip.id}
        activityToEdit={activityToEdit}
        defaultDay={selectedDayNumber}
        onSaved={triggerRefresh}
      />

      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        tripId={trip.id}
        expenseToEdit={expenseToEdit}
        onSaved={triggerRefresh}
      />

      <DeleteConfirmModal
        isOpen={!!activityToDelete}
        onClose={() => setActivityToDelete(null)}
        onConfirm={handleDeleteActivityConfirm}
        title="Delete Activity?"
        message={`Are you sure you want to remove "${activityToDelete?.title}" from the itinerary?`}
        loading={deleteLoading}
      />

      <DeleteConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteExpenseConfirm}
        title="Delete Expense?"
        message={`Are you sure you want to remove this expense of ${formatCurrency(expenseToDelete?.amount)} for "${expenseToDelete?.description}"?`}
        loading={deleteLoading}
      />
    </div>
  );
}
