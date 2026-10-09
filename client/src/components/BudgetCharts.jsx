import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Car, Hotel, Utensils, Compass, MoreHorizontal, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_CONFIG = {
  transportation: { label: 'Transportation', color: '#0D9488', bg: 'bg-teal-500', icon: Car },
  accommodation: { label: 'Accommodation', color: '#6366F1', bg: 'bg-indigo-500', icon: Hotel },
  food: { label: 'Food & Dining', color: '#FF8066', bg: 'bg-coral-500', icon: Utensils },
  activities: { label: 'Tours & Activities', color: '#10B981', bg: 'bg-emerald-500', icon: Compass },
  other: { label: 'Miscellaneous', color: '#94A3B8', bg: 'bg-slate-400', icon: MoreHorizontal },
};

export default function BudgetCharts({ budget }) {
  const { formatCurrency } = useApp();
  const [hoveredCategory, setHoveredCategory] = useState(null);

  if (!budget || !budget.categoryBreakdown) return null;

  const { estimatedBudget, totalSpent, remainingBudget, percentSpent, categoryBreakdown } = budget;

  let accumulatedPercent = 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const validCategories = categoryBreakdown.filter((c) => c.amount > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Donut Chart Visualizer */}
      <div className="lg:col-span-5 bg-white dark:bg-dark-surface p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider">
            Category Spending Distribution
          </h4>
          <span className="text-[10px] font-bold text-slate-400 dark:text-dark-muted">
            Interactive Breakdown
          </span>
        </div>

        <div className="relative flex items-center justify-center py-6">
          <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="text-slate-100 dark:text-dark-border"
              strokeWidth="20"
              stroke="currentColor"
              fill="transparent"
            />

            {/* Category Slices */}
            {validCategories.length === 0 ? (
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-200 dark:text-dark-card"
                strokeWidth="20"
                stroke="currentColor"
                strokeDasharray={`${circumference} ${circumference}`}
                fill="transparent"
              />
            ) : (
              validCategories.map((item) => {
                const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
                const slicePercent = totalSpent > 0 ? item.amount / totalSpent : 0;
                accumulatedPercent += slicePercent;
                const isHovered = hoveredCategory === item.category;

                return (
                  <circle
                    key={item.category}
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={config.color}
                    strokeWidth={isHovered ? '24' : '20'}
                    fill="transparent"
                    strokeDasharray={`${circumference * slicePercent} ${circumference * (1 - slicePercent)}`}
                    strokeDashoffset={-circumference * (accumulatedPercent - slicePercent)}
                    onMouseEnter={() => setHoveredCategory(item.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className="transition-all duration-300 ease-out cursor-pointer hover:opacity-90"
                  />
                );
              })
            )}
          </svg>

          {/* Centered Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-dark-muted">
              {hoveredCategory ? (CATEGORY_CONFIG[hoveredCategory]?.label || hoveredCategory) : 'Total Spent'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white leading-tight mt-0.5">
              {hoveredCategory
                ? formatCurrency(validCategories.find((c) => c.category === hoveredCategory)?.amount || 0)
                : formatCurrency(totalSpent)}
            </span>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-1.5 ${
                remainingBudget < 0
                  ? 'bg-coral-100 dark:bg-coral-950/60 text-coral-700 dark:text-coral-300'
                  : 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
              }`}
            >
              {remainingBudget < 0 ? 'Over Budget' : `${percentSpent}% utilized`}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100 dark:border-dark-border">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const item = categoryBreakdown.find((c) => c.category === key);
            const amount = item ? item.amount : 0;
            const isHovered = hoveredCategory === key;

            return (
              <div
                key={key}
                onMouseEnter={() => setHoveredCategory(key)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`flex items-center gap-2 p-1 rounded-xl cursor-pointer transition ${
                  isHovered ? 'bg-slate-100 dark:bg-dark-card' : ''
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-semibold">
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar Breakdown & Overall Progress */}
      <div className="lg:col-span-7 bg-white dark:bg-dark-surface p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-dark-border shadow-soft flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-black text-navy-900 dark:text-white uppercase tracking-wider">
                Budget Allocation & Consumption
              </h4>
              <p className="text-xs text-slate-400 dark:text-dark-muted mt-0.5">
                Target Cap: {formatCurrency(estimatedBudget)}
              </p>
            </div>

            <span
              className={`text-xs font-extrabold px-3 py-1.5 rounded-2xl flex items-center gap-1.5 ${
                remainingBudget < 0
                  ? 'bg-coral-100 dark:bg-coral-950/60 text-coral-700 dark:text-coral-300'
                  : 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
              }`}
            >
              {remainingBudget < 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{formatCurrency(Math.abs(remainingBudget))} Over Budget</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{formatCurrency(remainingBudget)} Remaining</span>
                </>
              )}
            </span>
          </div>

          {/* Overall progress bar */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
              <span>{formatCurrency(totalSpent)} spent</span>
              <span className="text-teal-600 dark:text-teal-400 font-extrabold">{percentSpent}% of total budget</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-200 dark:bg-dark-border overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  percentSpent > 100
                    ? 'bg-coral-500'
                    : percentSpent > 80
                    ? 'bg-amber-500'
                    : 'bg-teal-500'
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
              const isHovered = hoveredCategory === item.category;

              return (
                <div
                  key={item.category}
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`p-2 rounded-xl transition ${isHovered ? 'bg-slate-50 dark:bg-dark-card' : ''}`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="flex items-center gap-2 text-navy-900 dark:text-white">
                      <Icon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{config.label}</span>
                    </span>
                    <span className="text-slate-900 dark:text-slate-100 font-black">
                      {formatCurrency(item.amount)}{' '}
                      <span className="text-slate-400 dark:text-dark-muted font-normal text-[11px]">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-dark-card overflow-hidden">
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

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-xs text-slate-400 dark:text-dark-muted">
          <span>Real-time PostgreSQL ledger sync</span>
          <span className="font-bold text-teal-600 dark:text-teal-400">Financial Intelligence</span>
        </div>
      </div>
    </div>
  );
}
