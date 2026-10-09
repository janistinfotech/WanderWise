import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { X, Plane, Calendar, DollarSign, Image as ImageIcon, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COVER_IMAGE_PRESETS = [
  { label: 'Palawan Lagoon', url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Baguio Pines', url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Batangas Shore', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Siargao Palms', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Boracay Sunset', url: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Bohol Hills', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80' },
];

export default function TripModal() {
  const { tripModalOpen, tripToEdit, prefilledDestination, closeTripModal, showToast, triggerRefresh } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    description: '',
    estimated_budget: '',
    cover_image: COVER_IMAGE_PRESETS[0].url,
    status: 'upcoming',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tripToEdit) {
      setFormData({
        title: tripToEdit.title || '',
        destination: tripToEdit.destination || '',
        start_date: tripToEdit.start_date ? tripToEdit.start_date.split('T')[0] : '',
        end_date: tripToEdit.end_date ? tripToEdit.end_date.split('T')[0] : '',
        description: tripToEdit.description || '',
        estimated_budget: tripToEdit.estimated_budget || '',
        cover_image: tripToEdit.cover_image || COVER_IMAGE_PRESETS[0].url,
        status: tripToEdit.status || 'upcoming',
      });
    } else {
      setFormData({
        title: prefilledDestination ? `Trip to ${prefilledDestination}` : '',
        destination: prefilledDestination || '',
        start_date: '',
        end_date: '',
        description: '',
        estimated_budget: '',
        cover_image: COVER_IMAGE_PRESETS[0].url,
        status: 'upcoming',
      });
    }
    setError('');
  }, [tripToEdit, prefilledDestination, tripModalOpen]);

  if (!tripModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a trip title.');
      return;
    }
    if (!formData.destination.trim()) {
      setError('Please provide a destination.');
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      setError('Start date and end date are both required.');
      return;
    }
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    setLoading(true);
    try {
      if (tripToEdit) {
        await api.trips.update(tripToEdit.id, formData);
        showToast('Trip updated successfully!', 'success');
      } else {
        await api.trips.create(formData);
        showToast('New trip created successfully!', 'success');
      }
      triggerRefresh();
      closeTripModal();
    } catch (err) {
      setError(err.message || 'Failed to save trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border border-slate-200 dark:border-dark-border w-full max-w-xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-navy-900 dark:text-white">
                {tripToEdit ? 'Edit Trip Details' : 'Create New Trip'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-dark-muted">
                {tripToEdit ? 'Update destinations and schedule' : 'Configure your next Philippine journey'}
              </p>
            </div>
          </div>
          <button
            onClick={closeTripModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 text-coral-700 dark:text-coral-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Trip Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Summer Escapade in Palawan"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Destination *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="e.g., El Nido & Coron, Palawan"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Estimated Budget
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 25000"
                  value={formData.estimated_budget}
                  onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Trip Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows="2"
              placeholder="What makes this journey special? Notes, goals, companions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-navy-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Philippine Cover Image Preset
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
              {COVER_IMAGE_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setFormData({ ...formData, cover_image: p.url })}
                  className={`relative rounded-xl overflow-hidden border-2 aspect-video transition ${
                    formData.cover_image === p.url ? 'border-teal-600 ring-2 ring-teal-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 truncate px-1 font-bold">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="url"
              placeholder="Or paste custom image URL..."
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              className="w-full px-4 py-2 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-dark-border">
            <button
              type="button"
              onClick={closeTripModal}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-dark-card transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-xs shadow-md shadow-teal-500/25 transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{tripToEdit ? 'Save Changes' : 'Create Trip'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
