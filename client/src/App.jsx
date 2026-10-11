import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TripModal from './components/TripModal';
import DestinationDetailModal from './components/DestinationDetailModal';
import Toast from './components/Toast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import ItineraryPage from './pages/ItineraryPage';
import BudgetPage from './pages/BudgetPage';
import DestinationExplorerPage from './pages/DestinationExplorerPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentView, selectedTripId, toast, showToast, sidebarCollapsed } = useApp();

  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login' | 'register'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 animate-bounce flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/30">
          W
        </div>
        <p className="mt-4 text-xs font-bold text-slate-500 dark:text-dark-muted uppercase tracking-widest">
          Loading WanderWise...
        </p>
      </div>
    );
  }

  // Unauthenticated Views
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <LoginPage
          onGoRegister={() => setAuthView('register')}
          onGoLanding={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterPage
          onGoLogin={() => setAuthView('login')}
          onGoLanding={() => setAuthView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onGoLogin={() => setAuthView('login')}
        onGoRegister={() => setAuthView('register')}
      />
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col antialiased transition-colors duration-300">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className={`flex-1 transition-all duration-300 p-4 sm:p-8 max-w-7xl mx-auto w-full ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          {currentView === 'dashboard' && <DashboardPage />}
          {currentView === 'trips' && <TripsPage />}
          {currentView === 'trip-detail' && <TripDetailPage tripId={selectedTripId} />}
          {currentView === 'itinerary' && <ItineraryPage />}
          {currentView === 'budget' && <BudgetPage />}
          {currentView === 'destinations' && <DestinationExplorerPage />}
          {currentView === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Trip Creation / Editing Modal */}
      <TripModal />

      {/* Global Destination Detail Modal */}
      <DestinationDetailModal />

      {/* Global Toast Alert */}
      <Toast toast={toast} onClose={() => showToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
