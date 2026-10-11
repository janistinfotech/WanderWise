import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Breadcrumb({ items = [] }) {
  const { navigateTo } = useApp();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-dark-muted mb-4 font-semibold">
      <button
        onClick={() => navigateTo('dashboard')}
        className="flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition"
        title="Go to Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Dashboard</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            {item.view && !isLast ? (
              <button
                onClick={() => navigateTo(item.view, item.tripId || null)}
                className="hover:text-teal-600 dark:hover:text-teal-400 transition truncate max-w-[140px] sm:max-w-[200px]"
              >
                {item.label}
              </button>
            ) : (
              <span className={`truncate max-w-[160px] sm:max-w-[240px] ${isLast ? 'text-navy-900 dark:text-white font-extrabold' : ''}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
