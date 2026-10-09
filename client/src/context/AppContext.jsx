import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState(null);
  const [prefilledDestination, setPrefilledDestination] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((current) => (current && current.message === message ? null : current));
    }, 4000);
  }, []);

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

  const formatCurrency = useCallback((amount) => {
    const num = parseFloat(amount || 0);
    const currency = user?.currency || 'PHP';
    let symbol = '₱';
    if (currency === 'USD') symbol = '$';
    if (currency === 'EUR') symbol = '€';
    if (currency === 'JPY') symbol = '¥';
    if (currency === 'SGD') symbol = 'S$';

    return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [user?.currency]);

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
        tripModalOpen,
        tripToEdit,
        prefilledDestination,
        openCreateTrip,
        openEditTrip,
        closeTripModal,
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
