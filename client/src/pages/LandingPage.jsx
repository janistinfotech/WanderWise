import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Wallet,
  Sparkles,
  MapPin,
  CheckCircle2,
  GitBranch,
  Layers
} from 'lucide-react';

export default function LandingPage({ onGoLogin, onGoRegister }) {
  const { loginAsDemo } = useAuth();

  const handleDemoClick = async () => {
    try {
      await loginAsDemo();
    } catch (e) {
      console.error(e);
    }
  };

  const previewDestinations = [
    {
      name: 'El Nido & Coron, Palawan',
      tag: 'Island Paradise',
      img: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=600&q=80',
      cost: '₱3,500/day'
    },
    {
      name: 'Baguio City',
      tag: 'Summer Capital',
      img: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80',
      cost: '₱2,200/day'
    },
    {
      name: 'Siargao Island',
      tag: 'Surfing Capital',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      cost: '₱2,900/day'
    },
    {
      name: 'Batangas Coast',
      tag: 'Diving & Heritage',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      cost: '₱2,600/day'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 via-white to-slate-50 text-slate-800">
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-ocean-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-ocean-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              WanderWise
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-ocean-50 text-ocean-700 border border-ocean-200">
              DevOps Week 7
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGoLogin}
            className="text-sm font-bold text-slate-700 hover:text-ocean-600 px-4 py-2 transition"
          >
            Sign In
          </button>
          <button
            onClick={onGoRegister}
            className="text-sm font-bold bg-ocean-600 hover:bg-ocean-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-ocean-500/20 transition hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ocean-100/80 text-ocean-800 text-xs font-bold mb-6 border border-ocean-200/60 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-ocean-600" />
          <span>Smart Travel Planner and Itinerary Management System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Craft unforgettable journeys with{' '}
          <span className="bg-gradient-to-r from-ocean-600 via-sky-500 to-teal-500 bg-clip-text text-transparent">
            intelligent itineraries
          </span>{' '}
          and effortless budget tracking.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          WanderWise organizes daily activities, manages trip expenses, and highlights top Philippine destinations in one sleek, containerized platform.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleDemoClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-ocean-600 to-sky-500 hover:from-ocean-700 hover:to-sky-600 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-ocean-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore 1-Click Live Demo</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onGoRegister}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base px-8 py-4 rounded-2xl border border-slate-200 shadow-soft transition hover:border-slate-300"
          >
            <span>Create New Account</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card transition">
            <div className="w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center mb-4 border border-ocean-100">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Interactive Itinerary Builder</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Organize activities day by day with custom time slots, categorized tags, location notes, and real-time completion checklists.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Budget Analytics</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track accommodation, dining, transportation, and tours. Gain instant insights with SVG donut charts and budget limit alerts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Philippine Destinations</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore curated gems across Batangas, Baguio, Palawan, Cebu, Bohol, and Siargao with instant trip generation.
            </p>
          </div>
        </div>

        {/* Destination Previews */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Philippine Destinations</h2>
            <p className="text-sm text-slate-500 mt-2">Discover breathtaking islands, highland getaways, and historic shores</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {previewDestinations.map((d) => (
              <div key={d.name} className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-soft hover:shadow-card transition text-left">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">
                    {d.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-slate-900 text-sm">{d.name}</h4>
                  <p className="text-xs text-ocean-600 font-semibold mt-1">Est. {d.cost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DevOps Banner */}
        <div className="mt-20 p-8 rounded-3xl bg-slate-900 text-white text-left relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-ocean-400 text-xs font-bold uppercase tracking-wider mb-2">
              <GitBranch className="w-4 h-4" />
              <span>DevOps Architecture Ready</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-2">
              Containerized with Docker • Automated with GitHub Actions CI/CD • Deployed on Render
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Built specifically for Week 7 DevOps evaluation with PostgreSQL migrations, multi-stage Docker builds, health monitoring, and automated test pipelines.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
            <Layers className="w-80 h-80 text-white" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <p>© 2026 WanderWise. Smart Travel Planner & Itinerary Management System. Version 1.0.0.</p>
      </footer>
    </div>
  );
}
