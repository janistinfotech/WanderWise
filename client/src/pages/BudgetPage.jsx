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
  MapPin
} from 'lucide-react';

export default function BudgetPage() {
  const { selectedTripId, setSelectedTripId, formatCurrency, showToast, refreshKey, triggerRefresh } = useApp();

  const [trips, setTrips] = useState([]);
  const [currentTripId, setCurrentTripId] = useState(selectedTripId || null);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const expenses = budget?.expenses || [];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Travel Budget Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor trip allocations, categorize receipts, and visualize spending
          </p>
        </div>

        {/* Trip Switcher */}
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
          <p className="text-sm font-semibold text-slate-500">Loading budget statistics...</p>
        </div>
      ) : !budgetData ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 max-w-md mx-auto my-8">
          <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">No trips available</h3>
          <p className="text-xs text-slate-500 mt-1">Please create a trip first to track travel expenses.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Estimated Budget
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(budget.estimatedBudget)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Target limit for this trip</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Expenses
              </span>
              <h3 className="text-2xl font-black text-ocean-600 mt-1">
                {formatCurrency(budget.totalSpent)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {budget.percentSpent}% utilized across {expenses.length} records
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Remaining Budget
              </span>
              <h3
                className={`text-2xl font-black mt-1 ${
                  budget.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {formatCurrency(budget.remainingBudget)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {budget.remainingBudget < 0 ? 'Budget exceeded!' : 'Available funds'}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Expense Analytics & Breakdown</h3>
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

          {/* Charts */}
          <BudgetCharts budget={budget} />

          {/* Expenses Ledger */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Logged Expenses ({expenses.length})
              </h4>
              <span className="text-xs font-bold text-slate-700">
                Trip: {trip?.title}
              </span>
            </div>

            {expenses.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs">
                No expenses logged for this trip yet. Click "Record Expense" to add your first receipt.
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
