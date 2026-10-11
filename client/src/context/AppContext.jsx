import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const CURRENCY_SYMBOLS = {
  PHP: '₱',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  SGD: 'S$',
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Dark Mode State with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('wanderwise_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('wanderwise_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('wanderwise_theme', 'light');
      }
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // Collapsible sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // Notifications State (real application notifications)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Upcoming Adventure in Palawan',
      message: 'Your 5-day island escapade departs soon. Check your Day 1 itinerary!',
      type: 'trip',
      time: 'Today',
      read: false,
    },
    {
      id: 2,
      title: 'Budget Alert',
      message: 'You have used 69% of your Palawan travel budget.',
      type: 'budget',
      time: 'Yesterday',
      read: false,
    },
    {
      id: 3,
      title: 'New Philippine Destination Added',
      message: 'Batanes and Siargao Island guides are ready for exploration.',
      type: 'info',
      time: '3 days ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Modals state
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState(null);
  const [prefilledDestination, setPrefilledDestination] = useState(null);

  // Destination Detail Drawer / Modal
  const [selectedDestination, setSelectedDestination] = useState(null);

  const openDestinationDetail = useCallback((dest) => {
    setSelectedDestination(dest);
  }, []);

  const closeDestinationDetail = useCallback(() => {
    setSelectedDestination(null);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((current) => (current && current.message === message ? null : current));
    }, 4000);
  }, []);

  const toggleFavoriteDestination = useCallback(async (destId) => {
    try {
      const res = await api.destinations.toggleFavorite(destId);
      if (res.success) {
        setSelectedDestination((prev) =>
          prev && prev.id === destId ? { ...prev, is_favorite: res.is_favorite } : prev
        );
        showToast(res.message, 'success');
        setRefreshKey((k) => k + 1);
        return res;
      }
    } catch (err) {
      showToast(err.message || 'Failed to update favorite', 'error');
      throw err;
    }
  }, [showToast]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const navigateTo = useCallback((view, tripId = null) => {
    if (tripId) {
      setSelectedTripId(tripId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openCreateTrip = useCallback((destName = null) => {
    setTripToEdit(null);
    setPrefilledDestination(destName);
    setTripModalOpen(true);
  }, []);

  const openEditTrip = useCallback((trip) => {
    setTripToEdit(trip);
    setPrefilledDestination(null);
    setTripModalOpen(true);
  }, []);

  const closeTripModal = useCallback(() => {
    setTripModalOpen(false);
    setTripToEdit(null);
    setPrefilledDestination(null);
  }, []);

  const formatCurrency = useCallback((amount, overrideCurrency = null) => {
    const num = parseFloat(amount || 0);
    const currency = overrideCurrency || user?.currency || 'PHP';
    const symbol = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.PHP;

    return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [user?.currency]);

  const currencySymbol = CURRENCY_SYMBOLS[user?.currency] || CURRENCY_SYMBOLS.PHP;

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedTripId,
        setSelectedTripId,
        navigateTo,
        toast,
        showToast,
        refreshKey,
        triggerRefresh,
        formatCurrency,
        currencySymbol,
        tripModalOpen,
        tripToEdit,
        prefilledDestination,
        openCreateTrip,
        openEditTrip,
        closeTripModal,
        // Dark Mode
        isDarkMode,
        toggleDarkMode,
        // Collapsible Sidebar
        sidebarCollapsed,
        toggleSidebarCollapse,
        // Notifications
        notifications,
        unreadCount,
        markAllNotificationsRead,
        clearNotification,
        // Destination Detail
        selectedDestination,
        openDestinationDetail,
        closeDestinationDetail,
        toggleFavoriteDestination,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
