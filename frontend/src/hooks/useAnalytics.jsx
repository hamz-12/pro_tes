import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';

export const useAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getDashboardData(params);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSalesData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getSalesData(params);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch sales data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnomalies = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getAnomalies(params);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch anomalies');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrends = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getTrends(params);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch trends');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadCSV = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.uploadCSV(file);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to upload CSV');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchDashboardData,
    fetchSalesData,
    fetchAnomalies,
    fetchTrends,
    uploadCSV,
    resetData,
  };
};