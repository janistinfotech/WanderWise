import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Plane,
  CalendarCheck,
  CheckCircle,
  Wallet,
  Clock,
  MapPin,
  Plus,
  ArrowRight,
  TrendingUp,
  Compass,
  Sparkles,
  ChevronRight,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { navigateTo, openCreateTrip, formatCurrency, refreshKey } = useApp();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await api.dashboard.getStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [refreshKey]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-ocean-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading your travel dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 max-w-lg mx-auto my-12 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
        <h3 className="font-bold text-base mb-1">Could not load dashboard</h3>
        <p className="text-xs text-rose-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    totalTrips = 0,
    upcomingTrips = 0,
    ongoingTrips = 0,
    completedTrips = 0,
    totalEstimatedBudget = 0,
    totalSpent = 0,
    totalRemainingBudget = 0,
    upcomingActivities = [],
    recentTrips = []
  } = stats || {};

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-ocean-700 via-sky-600 to-teal-600 p-8 sm:p-10 text-white shadow-xl shadow-ocean-500/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {user?.name || 'Traveler'}!</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Ready to explore your next horizon?
          </h1>
          <p className="text-white/85 text-xs sm:text-sm mt-2 font-medium leading-relaxed">
            You currently have <strong className="text-white font-bold">{upcomingTrips} upcoming</strong> trips and{' '}
            <strong className="text-white font-bold">{upcomingActivities.length} itinerary activities</strong> on your schedule.
          </p>

          {/* Quick CTA inside banner */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => openCreateTrip()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-ocean-800 hover:bg-slate-50 font-bold text-xs shadow-md transition hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Plan New Trip</span>
            </button>
            <button
              onClick={() => navigateTo('destinations')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ocean-800/40 hover:bg-ocean-800/60 text-white border border-white/25 font-bold text-xs transition"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Philippines</span>
            </button>
          </div>
        </div>

        {/* Decorative Compass watermark */}
        <Compass className="absolute right-[-20px] bottom-[-30px] w-64 h-64 text-white/10 pointer-events-none transform rotate-12" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Planned Trips"
          value={totalTrips}
          subtitle={`${upcomingTrips} upcoming • ${completedTrips} done`}
          icon={Plane}
          color="ocean"
          onClick={() => navigateTo('trips')}
        />
        <StatCard
          title="Upcoming Trips"
          value={upcomingTrips}
          subtitle={ongoingTrips > 0 ? `${ongoingTrips} currently ongoing` : 'Ready to depart'}
          icon={CalendarCheck}
          color="emerald"
          onClick={() => navigateTo('trips')}
        />
        <StatCard
          title="Completed Trips"
          value={completedTrips}
          subtitle="Memories captured"
          icon={CheckCircle}
          color="purple"
          onClick={() => navigateTo('trips')}
        />
        <StatCard
          title="Total Travel Budget"
          value={formatCurrency(totalEstimatedBudget)}
          subtitle={`${formatCurrency(totalSpent)} spent recorded`}
          icon={Wallet}
          color="amber"
          onClick={() => navigateTo('budget')}
        />
      </div>

      {/* Main Grid: Upcoming Activities & Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upcoming Activities Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Upcoming Itinerary Activities
              </h2>
              <p className="text-xs text-slate-500">Your scheduled plans across active trips</p>
            </div>
            <button
              onClick={() => navigateTo('itinerary')}
              className="text-xs font-bold text-ocean-600 hover:text-ocean-700 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {upcomingActivities.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No scheduled activities yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Add daily tours, restaurant visits, or travel stops to your trip itineraries.
              </p>
              <button
                onClick={() => navigateTo('trips')}
                className="mt-4 px-4 py-2 bg-ocean-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Go to Trips
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {upcomingActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => navigateTo('trip-detail', act.trip_id)}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-100 hover:border-ocean-200 bg-slate-50/50 hover:bg-ocean-50/30 transition-all cursor-pointer group"
                >
                  <div className="p-2.5 rounded-xl bg-white text-ocean-600 border border-slate-200/80 shadow-sm flex-shrink-0 group-hover:bg-ocean-600 group-hover:text-white transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-ocean-700 transition-colors">
                        {act.title}
                      </h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex-shrink-0">
                        {act.time_slot}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-semibold text-ocean-600 truncate max-w-[150px]">
                        {act.trip_title}
                      </span>
                      {act.location && (
                        <span className="flex items-center gap-1 text-slate-400">
                          • <MapPin className="w-3 h-3" /> {act.location}
                        </span>
                      )}
                      {act.estimated_cost > 0 && (
                        <span className="text-slate-600 font-semibold">
                          • {formatCurrency(act.estimated_cost)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Travel Plans (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Travel Plans
              </h2>
              <p className="text-xs text-slate-500">Overview of trips in progress</p>
            </div>
            <button
              onClick={() => navigateTo('trips')}
              className="text-xs font-bold text-ocean-600 hover:text-ocean-700 flex items-center gap-1 group"
            >
              <span>All Trips</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {recentTrips.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Plane className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No trips created yet</p>
              <p className="text-xs text-slate-500 mt-1">Start planning your first getaway!</p>
              <button
                onClick={() => openCreateTrip()}
                className="mt-4 px-4 py-2 bg-ocean-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                + Create Trip
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTrips.map((trip) => {
                const isCompleted = trip.status === 'completed';
                const isOngoing = trip.status === 'ongoing';

                return (
                  <div
                    key={trip.id}
                    onClick={() => navigateTo('trip-detail', trip.id)}
                    className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                      <img
                        src={trip.cover_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : isOngoing
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {trip.status}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {trip.destination}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 truncate mt-1 group-hover:text-ocean-600 transition-colors">
                        {trip.title}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {trip.start_date ? trip.start_date.split('T')[0] : ''}
                        </span>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {formatCurrency(trip.estimated_budget)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Explore Philippine Link */}
          <div className="mt-6 p-4 rounded-2xl bg-ocean-50/70 border border-ocean-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-ocean-600" />
              <div>
                <p className="text-xs font-bold text-ocean-900">Destination Inspiration</p>
                <p className="text-[10px] text-ocean-700">Explore Palawan, Batangas, Baguio & more</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('destinations')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white text-ocean-700 hover:bg-ocean-100 border border-ocean-200 shadow-sm transition"
            >
              Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
