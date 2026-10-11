import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`p-10 sm:p-12 text-center bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft max-w-lg mx-auto ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4 border border-teal-200/60 dark:border-teal-800/40 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-black text-navy-900 dark:text-white tracking-tight mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted max-w-sm mx-auto leading-relaxed mb-6 font-medium">
          {description}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {actionLabel && onAction && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAction}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-teal-500/20 transition"
          >
            {actionLabel}
          </motion.button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-dark-card dark:hover:bg-dark-border text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl transition"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}
