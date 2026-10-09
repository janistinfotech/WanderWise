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
