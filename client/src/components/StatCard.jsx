import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'teal', onClick, delay = 0 }) {
  const colorMap = {
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800/40',
      gradient: 'from-teal-600 to-teal-400',
      badge: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200'
    },
    coral: {
      bg: 'bg-coral-50 dark:bg-coral-950/40 text-coral-600 dark:text-coral-400 border-coral-100 dark:border-coral-800/40',
      gradient: 'from-coral-500 to-coral-400',
      badge: 'bg-coral-100 dark:bg-coral-900/50 text-coral-800 dark:text-coral-200'
    },
    navy: {
      bg: 'bg-navy-50 dark:bg-navy-900/40 text-navy-800 dark:text-slate-200 border-navy-100 dark:border-navy-700/40',
      gradient: 'from-navy-900 to-navy-700',
      badge: 'bg-navy-100 dark:bg-navy-800 text-navy-900 dark:text-white'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/40',
      gradient: 'from-amber-500 to-amber-400',
      badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/40',
      gradient: 'from-purple-500 to-indigo-500',
      badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
    }
  };

  const scheme = colorMap[color] || colorMap.teal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`bg-white dark:bg-dark-surface rounded-3xl p-6 border border-slate-200/90 dark:border-dark-border shadow-soft hover:shadow-card transition-all relative overflow-hidden group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-extrabold tracking-wider text-slate-400 dark:text-dark-muted uppercase">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white mt-2 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1 font-semibold">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl border ${scheme.bg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </motion.div>
  );
}
