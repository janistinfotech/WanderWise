import React from 'react';
import { useApp } from '../context/AppContext';
import { Car, Hotel, Utensils, Compass, MoreHorizontal } from 'lucide-react';

const CATEGORY_CONFIG = {
  transportation: { label: 'Transportation', color: '#0ea5e9', bg: 'bg-sky-500', icon: Car },
  accommodation: { label: 'Accommodation', color: '#8b5cf6', bg: 'bg-purple-500', icon: Hotel },
  food: { label: 'Food & Dining', color: '#f97316', bg: 'bg-orange-500', icon: Utensils },
  activities: { label: 'Activities & Tours', color: '#10b981', bg: 'bg-emerald-500', icon: Compass },
  other: { label: 'Miscellaneous', color: '#64748b', bg: 'bg-slate-500', icon: MoreHorizontal },
};

export default function BudgetCharts({ budget }) {
  const { formatCurrency } = useApp();

  if (!budget || !budget.categoryBreakdown) return null;

  const { estimatedBudget, totalSpent, remainingBudget, percentSpent, categoryBreakdown } = budget;

  // Calculate SVG Donut slices
  let accumulatedPercent = 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  const validCategories = categoryBreakdown.filter((c) => c.amount > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Donut Chart Visualizer */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-soft flex flex-col justify-between">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Spending by Category
        </h4>

        <div className="relative flex items-center justify-center py-4">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="text-slate-100"
              strokeWidth="20"
              stroke="currentColor"
              fill="transparent"
            />

            {/* Slices */}
            {validCategories.length === 0 ? (
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-200"
                strokeWidth="20"
                stroke="currentColor"
                strokeDasharray={`${circumference} ${circumference}`}
                fill="transparent"
              />
            ) : (
              validCategories.map((item) => {
                const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
                const slicePercent = totalSpent > 0 ? (item.amount / totalSpent) : 0;
                const strokeDashoffset = circumference - (circumference * slicePercent);
                const strokeOffset = circumference * (1 - accumulatedPercent);
                accumulatedPercent += slicePercent;

                return (
                  <circle
                    key={item.category}
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={config.color}
                    strokeWidth="20"
                    fill="transparent"
                    strokeDasharray={`${circumference * slicePercent} ${circumference * (1 - slicePercent)}`}
                    strokeDashoffset={-circumference * (accumulatedPercent - slicePercent)}
                    className="transition-all duration-500 ease-out hover:opacity-90 cursor-pointer"
                  />
                );
              })
            )}
          </svg>

          {/* Centered Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
            <span className="text-xl font-extrabold text-slate-900 leading-tight">
              {formatCurrency(totalSpent)}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
              remainingBudget < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {percentSpent}% of budget
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const item = categoryBreakdown.find((c) => c.category === key);
            const amount = item ? item.amount : 0;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-xs text-slate-600 truncate">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar Breakdown & Overall Progress */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-soft flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Budget Utilization
            </h4>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              remainingBudget < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {remainingBudget < 0 ? 'Over Budget' : `${formatCurrency(remainingBudget)} Remaining`}
            </span>
          </div>

          {/* Overall progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>{formatCurrency(totalSpent)} spent</span>
              <span>Budget: {formatCurrency(estimatedBudget)}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  percentSpent > 100
                    ? 'bg-rose-500'
                    : percentSpent > 80
                    ? 'bg-amber-500'
                    : 'bg-ocean-500'
                }`}
                style={{ width: `${Math.min(100, percentSpent)}%` }}
              />
            </div>
          </div>

          {/* Category-by-Category bars */}
          <div className="space-y-3.5">
            {categoryBreakdown.map((item) => {
              const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
              const Icon = config.icon;
              const pct = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;

              return (
                <div key={item.category} className="group">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-2 text-slate-700">
                      <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-ocean-600 transition-colors" />
                      <span>{config.label}</span>
                    </span>
                    <span className="text-slate-900 font-bold">
                      {formatCurrency(item.amount)} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: config.color,
                        width: `${pct}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Real-time budget analytics</span>
          <span className="font-semibold text-ocean-600">Smart Financial Tracking</span>
        </div>
      </div>
    </div>
  );
}
