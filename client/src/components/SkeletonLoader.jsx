import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Banner Skeleton */}
      <div className="h-64 rounded-3xl skeleton-shimmer" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-3xl skeleton-shimmer" />
        ))}
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 h-96 rounded-3xl skeleton-shimmer" />
        <div className="lg:col-span-5 h-96 rounded-3xl skeleton-shimmer" />
      </div>
    </div>
  );
}

export function TripsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="h-14 rounded-2xl skeleton-shimmer" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 rounded-3xl skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}

export function DestinationsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="h-14 rounded-2xl skeleton-shimmer" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-80 rounded-3xl skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}

export function ItinerarySkeleton() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header bar */}
      <div className="h-16 rounded-3xl skeleton-shimmer" />

      {/* Trip selector and summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 rounded-3xl skeleton-shimmer" />
        <div className="h-28 rounded-3xl skeleton-shimmer" />
        <div className="h-28 rounded-3xl skeleton-shimmer" />
      </div>

      {/* Day timeline blocks */}
      <div className="space-y-4">
        {[1, 2, 3].map((d) => (
          <div key={d} className="p-6 rounded-3xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border space-y-3">
            <div className="h-6 w-36 rounded-xl skeleton-shimmer" />
            <div className="h-20 rounded-2xl skeleton-shimmer" />
            <div className="h-20 rounded-2xl skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BudgetSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header bar */}
      <div className="h-16 rounded-3xl skeleton-shimmer" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-3xl skeleton-shimmer" />
        ))}
      </div>

      {/* Charts & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-96 rounded-3xl skeleton-shimmer" />
        <div className="lg:col-span-7 h-96 rounded-3xl skeleton-shimmer" />
      </div>
    </div>
  );
}

export function TripDetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hero Cover */}
      <div className="h-72 sm:h-96 rounded-3xl skeleton-shimmer" />

      {/* Navigation tabs */}
      <div className="h-14 rounded-2xl skeleton-shimmer" />

      {/* Content blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-96 rounded-3xl skeleton-shimmer" />
        <div className="lg:col-span-4 h-96 rounded-3xl skeleton-shimmer" />
      </div>
    </div>
  );
}
