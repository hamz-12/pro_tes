import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import { ANALYTICS, STORAGE_KEYS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

// Create context
const AnalyticsContext = createContext(null);

// Custom hook to use analytics context
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [dateRange, setDateRange] = useState(ANALYTICS.DATE_RANGES.LAST_30_DAYS);

  // Load analytics preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedPrefs = localStorage.getItem(STORAGE_KEYS.ANALYTICS_PREFERENCES);
        if (storedPrefs) {
          setPreferences(JSON.parse(storedPrefs));
        } else {
          const defaultPrefs = {
            autoRefresh: true,
            refreshInterval: 300000, // 5 minutes
            defaultDateRange: ANALYTICS.DATE_RANGES.LAST_30_DAYS,
            favoriteMetrics: ['revenue', 'transactions', 'avg_order_value'],
            alertThresholds: {
              revenue: { warning: -0.1, critical: -0.2 },
              transactions: { warning: -0.15, critical: -0.25 },
              avg_order_value: { warning: -0.05, critical: -0.1 },
            },
            chartPreferences: {
              type: 'line',
              showGrid: true,
              showLegend: true,
              animate: true,
            },
          };
          setPreferences(defaultPrefs);
          localStorage.setItem(STORAGE_KEYS.ANALYTICS_PREFERENCES, JSON.stringify(defaultPrefs));
        }
      } catch (err) {
        console.error('Failed to load analytics preferences:', err);
      }
    };

    loadPreferences();
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async (range = null, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const dateRangeToUse = range || dateRange;
      const response = await analyticsService.getDashboardData(dateRangeToUse, forceRefresh);
      
      if (response.success && response.data) {
        setDashboardData(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to load dashboard data');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Load trends data
  const loadTrends = useCallback(async (metric = null, range = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const dateRangeToUse = range || dateRange;
      const response = await analyticsService.getTrends(metric, dateRangeToUse);
      
      if (response.success && response.data) {
        setTrends(response.data.trends || []);
        setAnalyticsData(prev => ({
          ...prev,
          trends: response.data.trends,
          summary: response.data.summary,
        }));
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to load trends');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load trends';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Load anomalies
  const loadAnomalies = useCallback(async (severity = null, range = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const dateRangeToUse = range || dateRange;
      const response = await analyticsService.getAnomalies(severity, dateRangeToUse);
      
      if (response.success && response.data) {
        setAnomalies(response.data.anomalies || []);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to load anomalies');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load anomalies';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Load comparisons
  const loadComparisons = useCallback(async (comparisonType = 'period', range = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const dateRangeToUse = range || dateRange;
      const response = await analyticsService.getComparisons(comparisonType, dateRangeToUse);
      
      if (response.success && response.data) {
        setComparisons(response.data.comparisons || []);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to load comparisons');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load comparisons';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Load all analytics data
  const loadAllData = useCallback(async (range = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const dateRangeToUse = range || dateRange;
      setDateRange(dateRangeToUse);
      
      const [dashboardResponse, trendsResponse, anomaliesResponse] = await Promise.all([
        loadDashboardData(dateRangeToUse),
        loadTrends(null, dateRangeToUse),
        loadAnomalies(null, dateRangeToUse),
      ]);
      
      if (dashboardResponse.success && trendsResponse.success && anomaliesResponse.success) {
        setAnalyticsData({
          dashboard: dashboardResponse.data,
          trends: trendsResponse.data?.trends,
          anomalies: anomaliesResponse.data?.anomalies,
          summary: trendsResponse.data?.summary,
        });
        return { success: true };
      } else {
        const errors = [
          dashboardResponse.message,
          trendsResponse.message,
          anomaliesResponse.message,
        ].filter(Boolean);
        
        setError(errors.join(', ') || 'Failed to load analytics data');
        return { success: false, message: errors.join(', ') };
      }
    } catch (err) {
      const message = err.message || 'Failed to load analytics data';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [dateRange, loadDashboardData, loadTrends, loadAnomalies]);

  // Track event
  const trackEvent = useCallback(async (eventType, eventData = {}) => {
    try {
      const response = await analyticsService.trackEvent(eventType, {
        ...eventData,
        timestamp: new Date().toISOString(),
        dateRange,
      });
      
      return response.success;
    } catch (err) {
      console.error('Failed to track event:', err);
      return false;
    }
  }, [dateRange]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      const updatedPrefs = { ...preferences, ...newPreferences };
      setPreferences(updatedPrefs);
      localStorage.setItem(STORAGE_KEYS.ANALYTICS_PREFERENCES, JSON.stringify(updatedPrefs));
      
      return { success: true, preferences: updatedPrefs };
    } catch (err) {
      console.error('Failed to update preferences:', err);
      return { success: false, message: err.message };
    }
  }, [preferences]);

  // Export data
  const exportData = useCallback(async (dataType, format = 'csv', options = {}) => {
    try {
      setLoading(true);
      
      const response = await analyticsService.exportData(dataType, format, {
        dateRange,
        ...options,
      });
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Export failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Export failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Generate insights
  const generateInsights = useCallback(async (data, options = {}) => {
    try {
      setLoading(true);
      
      const response = await analyticsService.generateInsights(data, {
        dateRange,
        ...options,
      });
      
      if (response.success && response.data) {
        return { success: true, insights: response.data.insights };
      } else {
        setError(response.message || 'Failed to generate insights');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to generate insights';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Get metric data
  const getMetricData = useCallback(async (metric, options = {}) => {
    try {
      setLoading(true);
      
      const response = await analyticsService.getMetricData(metric, {
        dateRange,
        ...options,
      });
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to load metric data');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load metric data';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Set date range
  const setDateRangeAndReload = useCallback(async (newDateRange) => {
    setDateRange(newDateRange);
    return await loadAllData(newDateRange);
  }, [loadAllData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get statistics
  const getStatistics = useCallback(() => {
    if (!analyticsData) return null;
    
    const totalRevenue = analyticsData.summary?.total_revenue || 0;
    const totalTransactions = analyticsData.summary?.total_transactions || 0;
    const avgOrderValue = analyticsData.summary?.avg_transaction_value || 0;
    const anomalyCount = anomalies.length;
    const trendCount = trends.length;
    
    return {
      totalRevenue,
      totalTransactions,
      avgOrderValue,
      anomalyCount,
      trendCount,
      dateRange,
    };
  }, [analyticsData, anomalies.length, trends.length, dateRange]);

  // Get chart data for metric
  const getChartData = useCallback((metric, chartType = 'line') => {
    if (!analyticsData || !analyticsData.trends) return null;
    
    const metricData = analyticsData.trends.map(trend => ({
      date: formatDate(trend.date, 'short'),
      value: trend[metric] || 0,
      previous: trend[`previous_${metric}`] || 0,
    }));
    
    return {
      data: metricData,
      type: chartType,
      metric,
      dateRange,
    };
  }, [analyticsData, dateRange]);

  // Check for alerts
  const checkAlerts = useCallback(() => {
    if (!analyticsData || !preferences?.alertThresholds) return [];
    
    const alerts = [];
    const thresholds = preferences.alertThresholds;
    
    // Check revenue alert
    const revenueChange = analyticsData.summary?.revenue_change || 0;
    if (revenueChange <= thresholds.revenue.critical) {
      alerts.push({
        type: 'critical',
        metric: 'revenue',
        message: `Critical revenue decrease: ${(revenueChange * 100).toFixed(1)}%`,
        value: revenueChange,
        threshold: thresholds.revenue.critical,
      });
    } else if (revenueChange <= thresholds.revenue.warning) {
      alerts.push({
        type: 'warning',
        metric: 'revenue',
        message: `Revenue warning: ${(revenueChange * 100).toFixed(1)}% decrease`,
        value: revenueChange,
        threshold: thresholds.revenue.warning,
      });
    }
    
    // Check transactions alert
    const transactionsChange = analyticsData.summary?.transactions_change || 0;
    if (transactionsChange <= thresholds.transactions.critical) {
      alerts.push({
        type: 'critical',
        metric: 'transactions',
        message: `Critical transactions decrease: ${(transactionsChange * 100).toFixed(1)}%`,
        value: transactionsChange,
        threshold: thresholds.transactions.critical,
      });
    } else if (transactionsChange <= thresholds.transactions.warning) {
      alerts.push({
        type: 'warning',
        metric: 'transactions',
        message: `Transactions warning: ${(transactionsChange * 100).toFixed(1)}% decrease`,
        value: transactionsChange,
        threshold: thresholds.transactions.warning,
      });
    }
    
    return alerts;
  }, [analyticsData, preferences]);

  // Context value
  const value = {
    // State
    analyticsData,
    dashboardData,
    trends,
    anomalies,
    comparisons,
    loading,
    error,
    preferences,
    dateRange,
    
    // Actions
    loadDashboardData,
    loadTrends,
    loadAnomalies,
    loadComparisons,
    loadAllData,
    trackEvent,
    updatePreferences,
    exportData,
    generateInsights,
    getMetricData,
    setDateRangeAndReload,
    clearError,
    
    // Utilities
    getStatistics,
    getChartData,
    checkAlerts,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Analytics provider wrapper with auto-refresh
export const AnalyticsProviderWithRefresh = ({ children, refreshInterval = 300000 }) => {
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(Date.now());
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <AnalyticsProvider>
      {children}
    </AnalyticsProvider>
  );
};

export default AnalyticsContext;