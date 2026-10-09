import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, DollarSign, Calendar, Tag, FileText, AlertCircle, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'transportation', label: 'Transportation' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'activities', label: 'Tours & Activities' },
  { value: 'other', label: 'Miscellaneous' },
];

export default function ExpenseModal({ isOpen, onClose, tripId, expenseToEdit, onSaved }) {
  const [formData, setFormData] = useState({
    trip_id: tripId,
    category: 'transportation',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        trip_id: tripId,
        category: expenseToEdit.category || 'transportation',
        amount: expenseToEdit.amount || '',
        expense_date: expenseToEdit.expense_date ? expenseToEdit.expense_date.split('T')[0] : new Date().toISOString().split('T')[0],
        description: expenseToEdit.description || '',
        notes: expenseToEdit.notes || '',
      });
    } else {
      setFormData({
        trip_id: tripId,
        category: 'transportation',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        description: '',
        notes: '',
      });
    }
    setError('');
  }, [expenseToEdit, tripId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please provide a valid expense amount.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide an expense description.');
      return;
    }

    setLoading(true);
    try {
      if (expenseToEdit) {
        await api.budget.updateExpense(expenseToEdit.id, formData);
      } else {
        await api.budget.addExpense(formData);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {expenseToEdit ? 'Edit Travel Expense' : 'Record New Expense'}
            </h2>
            <p className="text-xs text-slate-500">Track trip spending and receipts</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Ferry ticket, Seafood dinner, Hotel deposit"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Expense Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full pl-9 pr-2 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Notes / Receipt Details
            </label>
            <textarea
              rows="2"
              placeholder="e.g., Paid via GCash / shared with travel buddy"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-semibold text-xs shadow-md shadow-ocean-500/20 transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{expenseToEdit ? 'Save Expense' : 'Add Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
