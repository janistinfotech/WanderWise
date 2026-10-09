import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'ocean', onClick }) {
  const colorMap = {
    ocean: {
      bg: 'bg-ocean-50 text-ocean-600 border-ocean-100',
      gradient: 'from-ocean-500 to-sky-600',
      badge: 'bg-ocean-100 text-ocean-800'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'bg-emerald-100 text-emerald-800'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      gradient: 'from-amber-500 to-orange-500',
      badge: 'bg-amber-100 text-amber-800'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      gradient: 'from-purple-500 to-indigo-600',
      badge: 'bg-purple-100 text-purple-800'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      gradient: 'from-rose-500 to-pink-600',
      badge: 'bg-rose-100 text-rose-800'
    }
  };

  const scheme = colorMap[color] || colorMap.ocean;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-200 relative overflow-hidden group ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${scheme.bg} group-hover:scale-110 transition-transform`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
}
