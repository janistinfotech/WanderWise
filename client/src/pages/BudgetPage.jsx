import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import ExpenseModal from '../components/ExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import BudgetCharts from '../components/BudgetCharts';
import {
  Wallet,
  Plus,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Edit2,
  Trash2,
  Loader2,
  MapPin,
  Car,
  Hotel,
  Utensils,
  Compass,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_ICONS = {
  transportation: Car,
  accommodation: Hotel,
  food: Utensils,
  activities: Compass,
  other: MoreHorizontal,
};

export default function BudgetPage() {
  const { selectedTripId, setSelectedTripId, formatCurrency, showToast, refreshKey, triggerRefresh } = useApp();

  const [trips, setTrips] = useState([]);
  const [currentTripId, setCurrentTripId] = useState(selectedTripId || null);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
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
        showToast(err.message || 'Failed to fetch trips', 'error');
      }
    }
    loadTrips();
  }, [refreshKey]);

  useEffect(() => {
    async function loadBudget() {
      if (!currentTripId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.budget.getSummary(currentTripId);
        if (res.success) {
          setBudgetData(res);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load budget details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadBudget();
  }, [currentTripId, refreshKey]);

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    setDeleteLoading(true);
    try {
      await api.budget.deleteExpense(expenseToDelete.id);
      showToast('Expense removed', 'success');
      setExpenseToDelete(null);
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to remove expense', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const budget = budgetData?.budget;
  const trip = budgetData?.trip;
  const allExpenses = budget?.expenses || [];

  const filteredExpenses = allExpenses.filter((e) => {
    if (categoryFilter === 'all') return true;
    return (e.category || '').toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-extrabold mb-2 border border-teal-200/60 dark:border-teal-800/40">
            <Wallet className="w-3.5 h-3.5" />
            <span>Financial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-navy-900 dark:text-white tracking-tight">
            Travel Budget Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Monitor real-time expense ledgers, track spending distribution, and avoid over-budget traps
          </p>
        </div>

        {/* Trip Switcher */}
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
          <p className="text-sm font-semibold text-slate-500">Loading budget statistics...</p>
        </div>
      ) : !budgetData ? (
        <div className="p-12 text-center bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border max-w-md mx-auto my-8">
          <Wallet className="w-12 h-12 text-slate-300 dark:text-dark-muted mx-auto mb-3" />
          <h3 className="font-bold text-navy-900 dark:text-white">No trips available</h3>
          <p className="text-xs text-slate-500 dark:text-dark-muted mt-1">Please create a trip first to track travel expenses.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                Estimated Budget Cap
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white mt-1.5 tracking-tight">
                {formatCurrency(budget.estimatedBudget)}
              </h3>
              <p className="text-xs text-slate-400 dark:text-dark-muted mt-1 font-medium">Trip: {trip?.title}</p>
            </div>

            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                Total Expenses Logged
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 mt-1.5 tracking-tight">
                {formatCurrency(budget.totalSpent)}
              </h3>
              <p className="text-xs text-slate-400 dark:text-dark-muted mt-1 font-medium">
                {budget.percentSpent}% utilized across {allExpenses.length} receipts
              </p>
            </div>

            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                Remaining Funds
              </span>
              <h3
                className={`text-2xl sm:text-3xl font-black mt-1.5 tracking-tight ${
                  budget.remainingBudget < 0 ? 'text-coral-500' : 'text-emerald-500'
                }`}
              >
                {formatCurrency(budget.remainingBudget)}
              </h3>
              <p className="text-xs text-slate-400 dark:text-dark-muted mt-1 font-medium">
                {budget.remainingBudget < 0 ? '⚠️ Budget limit exceeded!' : 'Available for travel'}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-navy-900 dark:text-white">Expense Analytics & Breakdown</h3>
              <p className="text-xs text-slate-400 dark:text-dark-muted">Categorized spending calculated from real database entries</p>
            </div>

            <button
              onClick={() => {
                setExpenseToEdit(null);
                setExpenseModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-teal-600/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Expense</span>
            </button>
          </div>

          {/* Interactive Donut & Utilization Charts */}
          <BudgetCharts budget={budget} />

          {/* Category-based Filter Pills */}
          <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider">
                  Logged Expenses Ledger ({filteredExpenses.length})
                </h4>
                <p className="text-xs text-slate-400 dark:text-dark-muted">Filter by expenditure type</p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Receipts' },
                  { id: 'transportation', label: 'Transport' },
                  { id: 'accommodation', label: 'Stays' },
                  { id: 'food', label: 'Food' },
                  { id: 'activities', label: 'Tours' },
                  { id: 'other', label: 'Misc' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setCategoryFilter(pill.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      categoryFilter === pill.id
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="p-10 text-center text-slate-400 dark:text-dark-muted text-xs">
                No expenses logged under this category yet. Click "Record Expense" to add your first receipt.
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
                    {filteredExpenses.map((exp) => {
                      const Icon = CATEGORY_ICONS[(exp.category || '').toLowerCase()] || MoreHorizontal;

                      return (
                        <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-dark-card/50 transition">
                          <td className="py-3.5 px-5 text-slate-400 dark:text-dark-muted whitespace-nowrap">
                            {exp.expense_date ? exp.expense_date.split('T')[0] : ''}
                          </td>
                          <td className="py-3.5 px-5 text-navy-900 dark:text-white font-bold">
                            {exp.description}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300 text-[10px] uppercase font-bold">
                              <Icon className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              <span>{exp.category}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 dark:text-dark-muted max-w-xs truncate">
                            {exp.notes || '—'}
                          </td>
                          <td className="py-3.5 px-5 text-right font-black text-navy-900 dark:text-white whitespace-nowrap">
                            {formatCurrency(exp.amount)}
                          </td>
                          <td className="py-3.5 px-5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setExpenseToEdit(exp);
                                  setExpenseModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-navy-900 dark:hover:text-white transition"
                                title="Edit expense"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setExpenseToDelete(exp)}
                                className="p-1.5 text-slate-400 hover:text-coral-600 transition"
                                title="Delete expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {currentTripId && (
        <ExpenseModal
          isOpen={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          tripId={currentTripId}
          expenseToEdit={expenseToEdit}
          onSaved={triggerRefresh}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense?"
        message={`Are you sure you want to delete this expense of ${formatCurrency(expenseToDelete?.amount)} for "${expenseToDelete?.description}"?`}
        loading={deleteLoading}
      />
    </div>
  );
}
