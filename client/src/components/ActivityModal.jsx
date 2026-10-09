import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Calendar, Clock, MapPin, DollarSign, Tag, AlertCircle, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'sightseeing', label: 'Sightseeing' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transportation' },
  { value: 'adventure', label: 'Adventure / Sports' },
  { value: 'relaxation', label: 'Leisure & Wellness' },
  { value: 'accommodation', label: 'Accommodation' },
];

export default function ActivityModal({ isOpen, onClose, tripId, activityToEdit, defaultDay = 1, onSaved }) {
  const [formData, setFormData] = useState({
    trip_id: tripId,
    day_number: defaultDay,
    activity_date: '',
    time_slot: '09:00 AM',
    title: '',
    location: '',
    notes: '',
    estimated_cost: '',
    category: 'sightseeing',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activityToEdit) {
      setFormData({
        trip_id: tripId,
        day_number: activityToEdit.day_number || defaultDay,
        activity_date: activityToEdit.activity_date ? activityToEdit.activity_date.split('T')[0] : '',
        time_slot: activityToEdit.time_slot || '09:00 AM',
        title: activityToEdit.title || '',
        location: activityToEdit.location || '',
        notes: activityToEdit.notes || '',
        estimated_cost: activityToEdit.estimated_cost || '',
        category: activityToEdit.category || 'sightseeing',
      });
    } else {
      setFormData({
        trip_id: tripId,
        day_number: defaultDay,
        activity_date: '',
        time_slot: '09:00 AM',
        title: '',
        location: '',
        notes: '',
        estimated_cost: '',
        category: 'sightseeing',
      });
    }
    setError('');
  }, [activityToEdit, defaultDay, tripId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide an activity title.');
      return;
    }

    setLoading(true);
    try {
      if (activityToEdit) {
        await api.itinerary.updateActivity(activityToEdit.id, formData);
      } else {
        await api.itinerary.createActivity(formData);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save activity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {activityToEdit ? 'Edit Activity' : 'Add Activity to Itinerary'}
            </h2>
            <p className="text-xs text-slate-500">Plan day activities and schedules</p>
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
              Activity Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Kayaking in Big Lagoon"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Day Number
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.day_number}
                onChange={(e) => setFormData({ ...formData, day_number: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Time Slot
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g., 09:30 AM"
                  value={formData.time_slot}
                  onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Category
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
                Est. Cost
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g., Bacuit Bay, El Nido"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Notes & Tips
            </label>
            <textarea
              rows="2"
              placeholder="Bring dry bag, water shoes, reef-safe sunscreen..."
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
              <span>{activityToEdit ? 'Save Activity' : 'Add Activity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
