import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border border-slate-200 dark:border-dark-border w-full max-w-md overflow-hidden p-6 sm:p-7 text-center my-8"
      >
        <div className="w-12 h-12 rounded-2xl bg-coral-50 dark:bg-coral-950/40 text-coral-600 dark:text-coral-400 flex items-center justify-center mx-auto mb-4 border border-coral-200 dark:border-coral-800/40">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-black text-navy-900 dark:text-white mb-2">
          {title || 'Confirm Deletion'}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed font-normal">
          {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-dark-card transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-coral-600 hover:bg-coral-700 text-white font-extrabold text-xs shadow-md shadow-coral-500/20 transition disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete Permanently</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
