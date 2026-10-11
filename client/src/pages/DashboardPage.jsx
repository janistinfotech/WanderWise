import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import {
  Plane,
  CalendarCheck,
  CheckCircle,
  Wallet,
  Clock,
  MapPin,
  Plus,
  ArrowRight,
  Compass,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Sun,
  Timer,
  CheckCircle2,
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuth();
  const { navigateTo, openCreateTrip, formatCurrency, refreshKey, openDestinationDetail, showToast, triggerRefresh } = useApp();

  const [stats, setStats] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingActivityIds, setUpdatingActivityIds] = useState(new Set());

  // Determine dynamic time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsRes, destRes] = await Promise.all([
          api.dashboard.getStats(),
          api.destinations.getAll().catch(() => ({ success: false, destinations: [] }))
        ]);

        if (statsRes.success) {
          setStats(statsRes.stats);
        }
        if (destRes.success) {
          setDestinations(destRes.destinations.slice(0, 4));
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshKey]);

  // Quick activity completion toggle from dashboard with in-flight deduplication
  const handleToggleActivity = async (e, act) => {
    e.stopPropagation();
    if (updatingActivityIds.has(act.id)) return;
    setUpdatingActivityIds((prev) => new Set(prev).add(act.id));
    try {
      await api.itinerary.updateActivity(act.id, { is_completed: !act.is_completed });
      showToast(act.is_completed ? 'Activity marked incomplete' : 'Activity marked complete!', 'success');
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update activity', 'error');
    } finally {
      setUpdatingActivityIds((prev) => {
        const next = new Set(prev);
        next.delete(act.id);
        return next;
      });
    }
  };

  if (loading && !stats) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-800 rounded-3xl text-coral-800 dark:text-coral-200 max-w-lg mx-auto my-12 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-coral-600 dark:text-coral-400" />
        <h3 className="font-bold text-base mb-1">Could not load dashboard</h3>
        <p className="text-xs text-coral-600 dark:text-coral-300 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-coral-600 text-white rounded-2xl text-xs font-extrabold shadow-md hover:bg-coral-700 transition"
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

  // Find next upcoming trip for countdown
  const nextTrip = recentTrips.find((t) => t.status === 'upcoming') || recentTrips[0];

  // Calculate days countdown
  let daysUntilNext = null;
  if (nextTrip && nextTrip.start_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripDate = new Date(nextTrip.start_date);
    tripDate.setHours(0, 0, 0, 0);
    const diffTime = tripDate - today;
    daysUntilNext = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const budgetUsagePercent = totalEstimatedBudget > 0
    ? Math.min(100, Math.round((totalSpent / totalEstimatedBudget) * 100))
    : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* 1. SCENIC HERO BENTO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-navy-900 border border-navy-800/80 shadow-card text-white">
        {/* Background Scenic Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1600&q=80"
            alt="Palawan Tropical Escapade"
            className="w-full h-full object-cover opacity-45 scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/75 to-navy-900/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-8 sm:p-10 lg:p-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 backdrop-blur-md text-teal-300 text-xs font-bold mb-4 border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>{getGreeting()}, {user?.name || 'Explorer'}! • {currentDateFormatted}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] text-white">
            Where will your next{' '}
            <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-coral-400 bg-clip-text text-transparent">
              story unfold?
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm mt-3.5 font-medium leading-relaxed max-w-xl">
            {totalTrips > 0 ? (
              <>
                You have <strong className="text-white font-bold">{upcomingTrips} upcoming journeys</strong> and{' '}
                <strong className="text-white font-bold">{upcomingActivities.length} scheduled itinerary checkpoints</strong>. Track spending and timeline milestones seamlessly.
              </>
            ) : (
              <>
                Welcome to your command center. Plan your first Philippine getaway, organize checkpoints day-by-day, and track every peso in real time.
              </>
            )}
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-7">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openCreateTrip()}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-teal-500/25 transition focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Trip</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigateTo('destinations')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold text-xs transition focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <Compass className="w-4 h-4 text-teal-300" />
              <span>Explore Philippine Islands</span>
            </motion.button>
          </div>
        </div>

        {/* Ambient Badge */}
        <div className="absolute right-6 top-6 hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-[11px] text-white/90 font-bold">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>{user?.travel_style || 'Tropical Travel Season'}</span>
        </div>
      </div>

      {/* 2. ONBOARDING GUIDANCE (Show when user has 0 trips) */}
      {totalTrips === 0 && (
        <div className="bg-gradient-to-br from-teal-50/80 via-white to-ivory-100 dark:from-teal-950/30 dark:via-dark-surface dark:to-dark-card rounded-3xl p-6 sm:p-8 border border-teal-200/80 dark:border-teal-800/60 shadow-soft">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-navy-900 dark:text-white">
              Quick Start Checklist: Plan in 3 Steps
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 max-w-xl">
            Get the most out of WanderWise by configuring your first trip, scheduling daily checkpoints, and establishing your budget target.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => openCreateTrip()}
              className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border hover:border-teal-500 cursor-pointer transition group shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-black text-xs flex items-center justify-center mb-2">
                1
              </div>
              <h4 className="text-xs font-bold text-navy-900 dark:text-white group-hover:text-teal-600 transition">
                Create Your Trip
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-1">
                Choose a destination, travel dates, and optional budget limit.
              </p>
            </div>

            <div
              onClick={() => navigateTo('destinations')}
              className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border hover:border-teal-500 cursor-pointer transition group shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-black text-xs flex items-center justify-center mb-2">
                2
              </div>
              <h4 className="text-xs font-bold text-navy-900 dark:text-white group-hover:text-teal-600 transition">
                Explore Destinations
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-1">
                Browse Palawan, Siargao, Baguio and save favorites with 1-click.
              </p>
            </div>

            <div
              onClick={() => navigateTo('settings')}
              className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border hover:border-teal-500 cursor-pointer transition group shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-black text-xs flex items-center justify-center mb-2">
                3
              </div>
              <h4 className="text-xs font-bold text-navy-900 dark:text-white group-hover:text-teal-600 transition">
                Set Preferences
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-1">
                Select currency (PHP, USD, EUR, etc.) and your travel style.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. BENTO STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Planned Trips"
          value={totalTrips}
          subtitle={`${upcomingTrips} upcoming • ${completedTrips} completed`}
          icon={Plane}
          color="teal"
          delay={0}
          onClick={() => navigateTo('trips')}
        />
        <StatCard
          title="Upcoming Departures"
          value={upcomingTrips}
          subtitle={ongoingTrips > 0 ? `${ongoingTrips} currently ongoing` : (totalTrips > 0 ? 'Ready for boarding' : 'Plan a trip to begin')}
          icon={CalendarCheck}
          color="coral"
          delay={0.05}
          onClick={() => navigateTo('trips')}
        />
        <StatCard
          title="Completed Journeys"
          value={completedTrips}
          subtitle="Precious travel memories"
          icon={CheckCircle}
          color="purple"
          delay={0.1}
          onClick={() => navigateTo('trips')}
        />
        <StatCard
          title="Travel Budget Cap"
          value={formatCurrency(totalEstimatedBudget)}
          subtitle={`${formatCurrency(totalSpent)} total spent recorded`}
          icon={Wallet}
          color="amber"
          delay={0.15}
          onClick={() => navigateTo('budget')}
        />
      </div>

      {/* 4. BENTO GRID: NEXT TRIP COUNTDOWN & ACTIVE SCHEDULE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Next Trip Countdown Showcase (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {nextTrip ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-dark-border shadow-soft relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Timer className="w-4 h-4" />
                  <span>Next Departure Countdown</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
                  {nextTrip.status}
                </span>
              </div>

              {/* Cover Card */}
              <div
                onClick={() => navigateTo('trip-detail', nextTrip.id)}
                className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-5 bg-navy-900 shadow-md cursor-pointer group"
                role="button"
                tabIndex={0}
                aria-label={`View details for ${nextTrip.title}`}
              >
                <img
                  src={nextTrip.cover_image || 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=600&q=80'}
                  alt={nextTrip.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />

                {/* Countdown Badge overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div>
                    <p className="text-[11px] text-teal-300 font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{nextTrip.destination}</span>
                    </p>
                    <h3 className="text-base font-black truncate">{nextTrip.title}</h3>
                  </div>

                  {daysUntilNext !== null && (
                    <div className="text-right bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                      <span className="text-xl font-black text-coral-400 block leading-tight">
                        {daysUntilNext > 0 ? daysUntilNext : 0}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/80 block">
                        Days Left
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trip stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-dark-muted block">
                    Departure Date
                  </span>
                  <span className="text-xs font-bold text-navy-900 dark:text-white mt-0.5 block">
                    {nextTrip.start_date ? nextTrip.start_date.split('T')[0] : 'TBD'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-dark-muted block">
                    Estimated Budget
                  </span>
                  <span className="text-xs font-black text-teal-600 dark:text-teal-400 mt-0.5 block">
                    {formatCurrency(nextTrip.estimated_budget)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigateTo('trip-detail', nextTrip.id)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-navy-900 dark:bg-teal-600 hover:bg-navy-800 dark:hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <span>View Full Itinerary & Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <EmptyState
              icon={Plane}
              title="No Upcoming Trips"
              description="Start by creating your first Philippine travel itinerary to unlock countdowns and timeline organizers."
              actionLabel="+ Plan New Trip"
              onAction={() => openCreateTrip()}
              secondaryActionLabel="Explore Destinations"
              onSecondaryAction={() => navigateTo('destinations')}
            />
          )}

          {/* Budget Health Card */}
          <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 border border-slate-200/90 dark:border-dark-border shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-navy-900 dark:text-white">
                Total Budget Utilization
              </h4>
              <span className={`text-xs font-bold ${budgetUsagePercent > 90 ? 'text-coral-500' : 'text-teal-600 dark:text-teal-400'}`}>
                {budgetUsagePercent}% Used
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-dark-card overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  budgetUsagePercent > 90 ? 'bg-coral-500' : 'bg-teal-500'
                }`}
                style={{ width: `${budgetUsagePercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-muted">
              <span>{formatCurrency(totalSpent)} spent</span>
              <span className="font-bold text-navy-900 dark:text-white">
                {formatCurrency(totalRemainingBudget)} remaining
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Activities Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-dark-border shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-black text-navy-900 dark:text-white tracking-tight">
                Upcoming Itinerary Checkpoints
              </h3>
              <p className="text-xs text-slate-400 dark:text-dark-muted mt-0.5">
                Next scheduled checkpoints across your trips
              </p>
            </div>
            <button
              onClick={() => navigateTo('itinerary')}
              className="text-xs font-extrabold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 group"
            >
              <span>View Itinerary</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {upcomingActivities.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-dark-card rounded-2xl border border-dashed border-slate-200 dark:border-dark-border">
              <CalendarCheck className="w-10 h-10 text-slate-300 dark:text-dark-muted mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No scheduled activities yet
              </p>
              <p className="text-[11px] text-slate-400 dark:text-dark-muted mt-1 max-w-xs mx-auto">
                Add daily tours, restaurant reservations, or beach excursions to your trip.
              </p>
              <button
                onClick={() => navigateTo('trips')}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-teal-700 transition"
              >
                Open Trips
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {upcomingActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => navigateTo('trip-detail', act.trip_id)}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card/50 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 hover:border-teal-200 dark:hover:border-teal-800 transition cursor-pointer group"
                >
                  <button
                    onClick={(e) => handleToggleActivity(e, act)}
                    disabled={updatingActivityIds.has(act.id)}
                    className="p-2.5 rounded-xl bg-white dark:bg-dark-surface text-slate-400 hover:text-teal-600 dark:text-slate-500 dark:hover:text-teal-400 border border-slate-200/80 dark:border-dark-border shadow-sm flex-shrink-0 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={act.is_completed ? 'Mark activity incomplete' : 'Mark activity complete'}
                    aria-label={act.is_completed ? 'Mark activity incomplete' : 'Mark activity complete'}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${act.is_completed ? 'text-teal-500 fill-teal-500/20' : ''}`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                        {act.title}
                      </h4>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-300 flex-shrink-0">
                        {act.time_slot}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-dark-muted">
                      <span className="font-semibold text-teal-600 dark:text-teal-400 truncate max-w-[160px]">
                        {act.trip_title}
                      </span>
                      {act.location && (
                        <span className="flex items-center gap-1 text-slate-400 dark:text-slate-400">
                          • <MapPin className="w-3 h-3" /> {act.location}
                        </span>
                      )}
                      {act.estimated_cost > 0 && (
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          • {formatCurrency(act.estimated_cost)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Destination Previews in Dashboard */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-navy-900 dark:text-white">
                Philippine Destinations Inspiration
              </h4>
              <button
                onClick={() => navigateTo('destinations')}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>View all ({destinations.length}+)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {destinations.map((d) => (
                <div
                  key={d.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Explore ${d.name}`}
                  onClick={() => openDestinationDetail(d)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openDestinationDetail(d); }}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-navy-900 cursor-pointer shadow-sm hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <img
                    src={d.image_url}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-transparent" />
                  <div className="absolute bottom-2 inset-x-2 text-white">
                    <p className="text-[11px] font-bold truncate leading-tight">{d.name.split(',')[0]}</p>
                    <span className="text-[9px] text-teal-300 block">{d.region}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
