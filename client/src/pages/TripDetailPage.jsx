import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import ActivityModal from '../components/ActivityModal';
import ExpenseModal from '../components/ExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import BudgetCharts from '../components/BudgetCharts';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Plus,
  Clock,
  DollarSign,
  Tag,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  CalendarCheck,
  Wallet,
  FileText,
  Loader2,
  AlertCircle,
  Share2,
  Sparkles
} from 'lucide-react';

export default function TripDetailPage({ tripId }) {
  const { navigateTo, openEditTrip, formatCurrency, showToast, refreshKey, triggerRefresh } = useApp();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'budget' | 'overview'

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-ocean-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading trip itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 max-w-md mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-900">Trip not found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">The trip may have been removed or is unavailable.</p>
        <button
          onClick={() => navigateTo('trips')}
          className="px-4 py-2 bg-ocean-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  const { activities = [], expenses = [], budgetSummary = {} } = trip;

  // Group activities by day_number
  const activitiesByDay = activities.reduce((acc, act) => {
    const day = act.day_number || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(act);
    return acc;
  }, {});

  const dayNumbers = Object.keys(activitiesByDay).map(Number).sort((a, b) => a - b);
  if (dayNumbers.length === 0) dayNumbers.push(1);

  // Toggle activity completed status
  const handleToggleCompleted = async (act) => {
    try {
      await api.itinerary.updateActivity(act.id, { is_completed: !act.is_completed });
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update activity status', 'error');
    }
  };

  // Activity Delete
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

  // Expense Delete
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
      {/* Back button */}
      <div>
        <button
          onClick={() => navigateTo('trips')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Trips</span>
        </button>
      </div>

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-card border border-slate-200">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
          <img
            src={trip.cover_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'}
            alt={trip.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Top details */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
              {trip.status}
            </span>
          </div>

          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <button
              onClick={() => openEditTrip(trip)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-slate-900 text-xs font-bold transition border border-white/30 shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Trip</span>
            </button>
          </div>

          {/* Bottom Title & Details */}
          <div className="absolute bottom-6 inset-x-6 sm:inset-x-8 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-ocean-300 mb-1">
              <MapPin className="w-4 h-4 text-ocean-400" />
              <span>{trip.destination}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{trip.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-white/80">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-ocean-300" />
                {trip.start_date ? trip.start_date.split('T')[0] : ''} — {trip.end_date ? trip.end_date.split('T')[0] : ''}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Wallet className="w-4 h-4 text-ocean-300" />
                Budget: {formatCurrency(trip.estimated_budget)}
              </span>
              <span className="font-semibold text-white bg-white/20 px-2.5 py-0.5 rounded-full text-[11px]">
                {activities.length} Activities Planned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'itinerary'
              ? 'border-ocean-600 text-ocean-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Itinerary Timeline ({activities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'budget'
              ? 'border-ocean-600 text-ocean-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Budget & Expenses ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-ocean-600 text-ocean-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Overview & Notes</span>
        </button>
      </div>

      {/* TAB 1: ITINERARY TIMELINE */}
      {activeTab === 'itinerary' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Day-by-Day Schedule</h3>
              <p className="text-xs text-slate-500">Organize your daily activities and checkpoints</p>
            </div>
            <button
              onClick={() => {
                setActivityToEdit(null);
                setSelectedDayNumber(1);
                setActivityModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Activity</span>
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No itinerary activities yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Build your schedule day by day. Add boat tours, scenic spots, lunch destinations, and hotel check-ins.
              </p>
              <button
                onClick={() => {
                  setActivityToEdit(null);
                  setSelectedDayNumber(1);
                  setActivityModalOpen(true);
                }}
                className="px-4 py-2 bg-ocean-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                + Add Day 1 Activity
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {dayNumbers.map((dayNum) => {
                const dayActs = activitiesByDay[dayNum] || [];

                return (
                  <div key={dayNum} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft">
                    {/* Day Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-ocean-100 text-ocean-700 font-extrabold flex items-center justify-center text-sm">
                          D{dayNum}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            Day {dayNum}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {dayActs.length} {dayActs.length === 1 ? 'activity' : 'activities'} scheduled
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActivityToEdit(null);
                          setSelectedDayNumber(dayNum);
                          setActivityModalOpen(true);
                        }}
                        className="text-xs font-bold text-ocean-600 hover:text-ocean-700 flex items-center gap-1 p-1.5 hover:bg-ocean-50 rounded-lg transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Day {dayNum}</span>
                      </button>
                    </div>

                    {/* Timeline List */}
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                      {dayActs.map((act) => {
                        const isDone = !!act.is_completed;

                        return (
                          <div key={act.id} className="relative group">
                            {/* Checkbox Timeline Marker */}
                            <button
                              onClick={() => handleToggleCompleted(act)}
                              className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center transition ${
                                isDone
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : 'bg-white border-2 border-slate-300 text-transparent hover:border-ocean-500'
                              }`}
                              title={isDone ? 'Mark incomplete' : 'Mark completed'}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Activity Card */}
                            <div
                              className={`p-4 rounded-2xl border transition-all ${
                                isDone
                                  ? 'bg-slate-50/70 border-slate-200 opacity-70'
                                  : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-ocean-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[11px] font-extrabold text-ocean-700 bg-ocean-50 px-2.5 py-0.5 rounded-full">
                                      {act.time_slot}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                      {act.category}
                                    </span>
                                    {act.estimated_cost > 0 && (
                                      <span className="text-[11px] font-bold text-slate-700">
                                        {formatCurrency(act.estimated_cost)}
                                      </span>
                                    )}
                                  </div>

                                  <h5
                                    className={`text-sm font-bold text-slate-900 ${
                                      isDone ? 'line-through text-slate-500' : ''
                                    }`}
                                  >
                                    {act.title}
                                  </h5>

                                  {act.location && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{act.location}</span>
                                    </p>
                                  )}

                                  {act.notes && (
                                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl mt-2 border border-slate-100 leading-relaxed">
                                      {act.notes}
                                    </p>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setActivityToEdit(act);
                                      setSelectedDayNumber(act.day_number);
                                      setActivityModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                    title="Edit activity"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setActivityToDelete(act)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                    title="Delete activity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
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
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Budget & Expense Manager</h3>
              <p className="text-xs text-slate-500">Track and categorize every travel cost in real time</p>
            </div>
            <button
              onClick={() => {
                setExpenseToEdit(null);
                setExpenseModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Expense</span>
            </button>
          </div>

          {/* Interactive Visual Charts */}
          <BudgetCharts
            budget={{
              estimatedBudget: budgetSummary.estimatedBudget,
              totalSpent: budgetSummary.totalSpent,
              remainingBudget: budgetSummary.remainingBudget,
              percentSpent: budgetSummary.estimatedBudget > 0
                ? Math.round((budgetSummary.totalSpent / budgetSummary.estimatedBudget) * 100)
                : 0,
              categoryBreakdown: [
                'transportation',
                'accommodation',
                'food',
                'activities',
                'other',
              ].map((cat) => ({
                category: cat,
                amount: expenses
                  .filter((e) => (e.category || 'other').toLowerCase() === cat)
                  .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
              })),
            }}
          />

          {/* Expenses Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Expense Ledger ({expenses.length})
              </h4>
              <span className="text-xs font-bold text-slate-700">
                Total Recorded: {formatCurrency(budgetSummary.totalSpent)}
              </span>
            </div>

            {expenses.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No expenses logged yet. Click "Record Expense" above to add receipts.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {exp.expense_date ? exp.expense_date.split('T')[0] : ''}
                        </td>
                        <td className="py-3 px-4 text-slate-900 font-bold">
                          {exp.description}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {exp.notes || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setExpenseToEdit(exp);
                                setExpenseModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 transition"
                              title="Edit expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setExpenseToDelete(exp)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                              title="Delete expense"
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Trip Overview</h3>
            <p className="text-xs text-slate-500">Summary and travel preparation notes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Duration</span>
              <p className="text-sm font-extrabold text-slate-800 mt-1">
                {trip.start_date ? trip.start_date.split('T')[0] : ''} to {trip.end_date ? trip.end_date.split('T')[0] : ''}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Budget</span>
              <p className="text-sm font-extrabold text-slate-800 mt-1">
                {formatCurrency(trip.estimated_budget)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Activities</span>
              <p className="text-sm font-extrabold text-slate-800 mt-1">
                {activities.length} planned ({activities.filter(a => a.is_completed).length} completed)
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description & Notes</h4>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {trip.description || 'No description entered for this trip yet. Click "Edit Trip" above to add packing lists, flights, and companion notes.'}
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
