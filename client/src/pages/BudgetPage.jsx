import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import ExpenseModal from '../components/ExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import BudgetCharts from '../components/BudgetCharts';
import Breadcrumb from '../components/Breadcrumb';
import EmptyState from '../components/EmptyState';
import { BudgetSkeleton } from '../components/SkeletonLoader';
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  Car,
  Hotel,
  Utensils,
  Compass,
  MoreHorizontal,
  ChevronDown,
  AlertTriangle,
  Search,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  Receipt
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
  const { selectedTripId, setSelectedTripId, formatCurrency, showToast, refreshKey, triggerRefresh, openCreateTrip } = useApp();

  const [trips, setTrips] = useState([]);
  const [currentTripId, setCurrentTripId] = useState(selectedTripId || null);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Modals
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
            setBudgetData(null);
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

  // Filter & Search
  const filteredExpenses = allExpenses.filter((e) => {
    if (categoryFilter !== 'all' && (e.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = (e.description || '').toLowerCase().includes(q);
      const matchNotes = (e.notes || '').toLowerCase().includes(q);
      if (!matchDesc && !matchNotes) return false;
    }
    return true;
  });

  // Sort
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.expense_date || '1970-01-01') - new Date(a.expense_date || '1970-01-01');
    }
    if (sortBy === 'date-asc') {
      return new Date(a.expense_date || '9999-12-31') - new Date(b.expense_date || '9999-12-31');
    }
    if (sortBy === 'amount-desc') {
      return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
    }
    if (sortBy === 'amount-asc') {
      return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
    }
    return 0;
  });

  const hasBudgetCap = budget && parseFloat(budget.estimatedBudget || 0) > 0;
  const isOverBudget = hasBudgetCap && budget.remainingBudget < 0;

  const breadcrumbItems = trip
    ? [
        { label: 'Trips', view: 'trips' },
        { label: trip.title, view: 'trip-detail', tripId: currentTripId },
        { label: 'Budget' },
      ]
    : [{ label: 'Budget' }];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <Breadcrumb items={breadcrumbItems} />

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
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1 font-medium">
            Monitor real-time expense ledgers, track spending distribution, and avoid over-budget traps
          </p>
        </div>

        {/* Trip Switcher */}
        {trips.length > 0 && (
          <div className="flex items-center gap-3">
            <label htmlFor="budget-trip-select" className="text-xs font-black text-slate-400 dark:text-dark-muted uppercase tracking-wider whitespace-nowrap">
              Active Trip:
            </label>
            <div className="relative">
              <select
                id="budget-trip-select"
                aria-label="Select trip for budget tracking"
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
        <BudgetSkeleton />
      ) : trips.length === 0 || !budgetData ? (
        <EmptyState
          icon={Wallet}
          title="No travel budgets found"
          description="Create your first trip to log travel receipts and track spending breakdown."
          actionLabel="Create New Trip"
          onAction={() => openCreateTrip()}
        />
      ) : (
        <div className="space-y-6">
          {/* Over-budget Warning Banner */}
          {isOverBudget && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-5 rounded-3xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-800/60 shadow-sm flex items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-2xl bg-coral-100 dark:bg-coral-900/60 text-coral-600 dark:text-coral-300 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-coral-900 dark:text-coral-200">
                    Budget Exceeded by {formatCurrency(Math.abs(budget.remainingBudget))}
                  </h4>
                  <p className="text-xs text-coral-700 dark:text-coral-300 mt-0.5 font-medium">
                    You have spent {budget.percentSpent}% of your {formatCurrency(budget.estimatedBudget)} budget cap. Review the ledger below to adjust non-essential activities.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                  Estimated Budget Cap
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white mt-1.5 tracking-tight">
                  {hasBudgetCap ? formatCurrency(budget.estimatedBudget) : 'No Cap Set'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-dark-muted mt-3 font-semibold truncate">
                Trip: {trip?.title}
              </p>
            </div>

            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                    Total Expenses Logged
                  </span>
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 mt-1.5 tracking-tight">
                  {formatCurrency(budget.totalSpent)}
                </h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-dark-muted mt-3 font-semibold">
                {hasBudgetCap
                  ? `${budget.percentSpent}% utilized across ${allExpenses.length} receipts`
                  : `${allExpenses.length} receipts logged without cap`}
              </p>
            </div>

            <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                    {hasBudgetCap ? 'Remaining Funds' : 'Budget Status'}
                  </span>
                  {hasBudgetCap && (
                    budget.remainingBudget < 0 ? (
                      <TrendingDown className="w-4 h-4 text-coral-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )
                  )}
                </div>
                <h3
                  className={`text-2xl sm:text-3xl font-black mt-1.5 tracking-tight ${
                    !hasBudgetCap
                      ? 'text-slate-700 dark:text-slate-300'
                      : budget.remainingBudget < 0
                      ? 'text-coral-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {hasBudgetCap ? formatCurrency(budget.remainingBudget) : 'Uncapped'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-dark-muted mt-3 font-semibold">
                {!hasBudgetCap
                  ? 'No budget ceiling configured'
                  : budget.remainingBudget < 0
                  ? '⚠️ Budget limit exceeded!'
                  : 'Available for travel spend'}
              </p>
            </div>
          </div>

          {/* Action Header & Charts */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-navy-900 dark:text-white">Expense Analytics & Breakdown</h3>
              <p className="text-xs text-slate-400 dark:text-dark-muted font-medium">Categorized spending calculated from verified database receipts</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setExpenseToEdit(null);
                setExpenseModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-teal-600/20 transition focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Expense</span>
            </motion.button>
          </div>

          {/* Interactive Donut & Utilization Charts */}
          <BudgetCharts budget={budget} />

          {/* Expense Ledger Table Container */}
          <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft overflow-hidden">
            {/* Filter, Search & Sort Toolbar */}
            <div className="p-5 border-b border-slate-100 dark:border-dark-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider">
                  Logged Expenses Ledger ({sortedExpenses.length})
                </h4>
                <p className="text-xs text-slate-400 dark:text-dark-muted mt-0.5">Filter by category or search receipts</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    aria-label="Search expenses"
                    placeholder="Search receipt..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card text-navy-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>

                {/* Sort */}
                <div className="relative w-full sm:w-44">
                  <ArrowUpDown className="w-3 h-3 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    aria-label="Sort expenses"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card text-navy-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition"
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="amount-desc">Amount (Highest)</option>
                    <option value="amount-asc">Amount (Lowest)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-3 bg-slate-50/50 dark:bg-dark-card/50 border-b border-slate-100 dark:border-dark-border flex flex-wrap gap-1.5">
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
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                    categoryFilter === pill.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-dark-border'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {sortedExpenses.length === 0 ? (
              <div className="p-12 text-center text-slate-400 dark:text-dark-muted text-xs">
                <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-dark-border mb-2" />
                <p className="font-bold text-navy-900 dark:text-white text-sm">No expenses matched</p>
                <p className="mt-1">
                  {searchQuery || categoryFilter !== 'all'
                    ? 'Try clearing your search or category filter.'
                    : 'Click "Record Expense" to log your first receipt for this trip.'}
                </p>
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
                    {sortedExpenses.map((exp) => {
                      const Icon = CATEGORY_ICONS[(exp.category || '').toLowerCase()] || MoreHorizontal;

                      return (
                        <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-dark-card/50 transition">
                          <td className="py-3.5 px-5 text-slate-400 dark:text-dark-muted whitespace-nowrap font-semibold">
                            {exp.expense_date ? exp.expense_date.split('T')[0] : '—'}
                          </td>
                          <td className="py-3.5 px-5 text-navy-900 dark:text-white font-black">
                            {exp.description}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300 text-[10px] uppercase font-bold border border-slate-200/50 dark:border-dark-border">
                              <Icon className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              <span>{exp.category}</span>
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
