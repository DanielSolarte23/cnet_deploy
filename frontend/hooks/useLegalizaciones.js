// hooks/useLegalizaciones.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { legalizacionesAPI } from '../api/legalizaciones';
import { PAGINATION_CONFIG } from '../utils/constants';

export const useLegalizaciones = () => {
  const [legalizaciones, setLegalizaciones] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLegalizaciones = useCallback(async (page = 1, limit = PAGINATION_CONFIG.DEFAULT_LIMIT) => {
    setLoading(true);
    setError(null);

    try {
      const result = await legalizacionesAPI.getAll(page, limit);
      
      if (result.success) {
        setLegalizaciones(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message || 'Error al cargar las legalizaciones');
      }
    } catch (err) {
      setError(err.message);
      setLegalizaciones([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    const currentPage = pagination?.currentPage || 1;
    loadLegalizaciones(currentPage);
  }, [pagination?.currentPage, loadLegalizaciones]);

  return {
    legalizaciones,
    pagination,
    loading,
    error,
    loadLegalizaciones,
    refreshData,
  };
};

export const usePendientes = () => {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPendientes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await legalizacionesAPI.getPendientes();
      
      if (result.success) {
        setPendientes(result.data);
      } else {
        throw new Error(result.message || 'Error al cargar las legalizaciones pendientes');
      }
    } catch (err) {
      setError(err.message);
      setPendientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPendientes = useCallback(() => {
    loadPendientes();
  }, [loadPendientes]);

  return {
    pendientes,
    loading,
    error,
    loadLegalizaciones: loadPendientes,
    refreshPendientes,
  };
};

export const useApproval = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const approveItems = useCallback(async (legalizacionIds, almacenistaId, observaciones) => {
    setLoading(true);
    setError(null);

    try {
      const result = await legalizacionesAPI.approveMultiple(
        legalizacionIds,
        almacenistaId,
        observaciones
      );

      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || 'Error al aprobar las legalizaciones');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    approveItems,
  };
};

// Hook para manejar notificaciones
export const useNotifications = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success', duration = 5000) => {
    setNotification({ message, type, id: Date.now() });
    
    setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};

// Hook para manejar la selección de elementos
export const useSelection = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  const selectAll = useCallback((items) => {
    setSelectedItems(items);
  }, []);

  const selectItem = useCallback((item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }, []);

  const toggleSelection = useCallback((item, isSelected) => {
    setSelectedItems(prev => {
      if (isSelected) {
        return [...prev, item];
      } else {
        return prev.filter(selected => selected.id !== item.id);
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isSelected = useCallback((item) => {
    return selectedItems.some(selected => selected.id === item.id);
  }, [selectedItems]);

  const selectMultiple = useCallback((items, shouldSelect) => {
    if (shouldSelect) {
      setSelectedItems(items);
    } else {
      setSelectedItems([]);
    }
  }, []);

  return {
    selectedItems,
    selectAll,
    selectItem,
    toggleSelection,
    clearSelection,
    isSelected,
    selectMultiple,
    setSelectedItems,
  };
};