import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import dashboardService from '../services/dashboardService';
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
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

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

  // Load restaurants
  const loadRestaurants = useCallback(async () => {
    try {
      const restaurantsData = await dashboardService.getRestaurants();
      setRestaurants(restaurantsData);
      
      // Select first restaurant by default if none is selected
      if (restaurantsData.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(restaurantsData[0].id);
      }
      
      return { success: true, data: restaurantsData };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load restaurants';
      setError(message);
      return { success: false, message };
    }
  }, [selectedRestaurant]);

  // Load dashboard data - updated to use the correct API
  const loadDashboardData = useCallback(async (restaurantId = null, range = null, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const restaurantToUse = restaurantId || selectedRestaurant;
      const dateRangeToUse = range || dateRange;
      
      if (!restaurantToUse) {
        setError('No restaurant selected');
        return { success: false, message: 'No restaurant selected' };
      }
      
      // Get date range in the format expected by the API
      const { startDate, endDate } = getDateRangeFromValue(dateRangeToUse);
      
      // Use the dashboardService to get analytics data
      const response = await dashboardService.getAnalytics(restaurantToUse, startDate, endDate);
      
      if (response) {
        setDashboardData(response);
        setAnalyticsData(response);
        setAnomalies(response.anomalies || []);
        setTrends(response.daily_sales || []);
        
        return { success: true, data: response };
      } else {
        setError('Failed to load dashboard data');
        return { success: false, message: 'Failed to load dashboard data' };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant, dateRange]);

  // Helper function to convert date range value to start and end dates
  const getDateRangeFromValue = (rangeValue) => {
    const now = new Date();
    let startDate, endDate = now;
    
    switch (rangeValue) {
      case '7d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Upload CSV and refresh data
  const uploadCSVAndRefresh = useCallback(async (file, restaurantId, columnMapping) => {
    try {
      setLoading(true);
      setError(null);
      
      // Upload the CSV file
      const uploadResponse = await dashboardService.uploadCSV(file, restaurantId, columnMapping);
      
      if (uploadResponse) {
        // Wait a moment for the backend to process the data
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Refresh the dashboard data
        const refreshResponse = await loadDashboardData(restaurantId);
        
        return { 
          success: true, 
          uploadData: uploadResponse,
          refreshData: refreshResponse.data
        };
      } else {
        setError('Failed to upload CSV');
        return { success: false, message: 'Failed to upload CSV' };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to upload CSV';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [loadDashboardData]);

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
  const loadAllData = useCallback(async (restaurantId = null, range = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const restaurantToUse = restaurantId || selectedRestaurant;
      const dateRangeToUse = range || dateRange;
      
      if (!restaurantToUse) {
        setError('No restaurant selected');
        return { success: false, message: 'No restaurant selected' };
      }
      
      // Load dashboard data which includes all the necessary information
      const dashboardResponse = await loadDashboardData(restaurantToUse, dateRangeToUse);
      
      if (dashboardResponse.success) {
        return { success: true, data: dashboardResponse.data };
      } else {
        setError(dashboardResponse.message || 'Failed to load analytics data');
        return { success: false, message: dashboardResponse.message };
      }
    } catch (err) {
      const message = err.message || 'Failed to load analytics data';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant, dateRange, loadDashboardData]);

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

  // Set restaurant and reload data
  const setRestaurantAndReload = useCallback(async (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    return await loadDashboardData(restaurantId);
  }, [loadDashboardData]);

  // Set date range and reload data
  const setDateRangeAndReload = useCallback(async (newDateRange) => {
    setDateRange(newDateRange);
    return await loadDashboardData(selectedRestaurant, newDateRange);
  }, [selectedRestaurant, loadDashboardData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get statistics
  const getStatistics = useCallback(() => {
    if (!dashboardData) return null;
    
    const totalRevenue = dashboardData.summary?.total_revenue || 0;
    const totalTransactions = dashboardData.summary?.total_transactions || 0;
    const avgOrderValue = dashboardData.summary?.avg_transaction_value || 0;
    const anomalyCount = anomalies.length;
    const trendCount = trends.length;
    
    return {
      totalRevenue,
      totalTransactions,
      avgOrderValue,
      anomalyCount,
      trendCount,
      dateRange,
      restaurantId: selectedRestaurant,
    };
  }, [dashboardData, anomalies.length, trends.length, dateRange, selectedRestaurant]);

  // Get chart data for metric
  const getChartData = useCallback((metric, chartType = 'line') => {
    if (!dashboardData || !dashboardData.daily_sales) return null;
    
    const metricData = dashboardData.daily_sales.map(sale => ({
      date: formatDate(sale.date, 'short'),
      value: sale[metric] || 0,
    }));
    
    return {
      data: metricData,
      type: chartType,
      metric,
      dateRange,
    };
  }, [dashboardData, dateRange]);

  // Check for alerts
  const checkAlerts = useCallback(() => {
    if (!dashboardData || !preferences?.alertThresholds) return [];
    
    const alerts = [];
    const thresholds = preferences.alertThresholds;
    
    // Check revenue alert
    const revenueChange = dashboardData.summary?.revenue_change || 0;
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
    const transactionsChange = dashboardData.summary?.transactions_change || 0;
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
  }, [dashboardData, preferences]);

  // Initialize restaurants on component mount
  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // Load dashboard data when restaurant or date range changes
  useEffect(() => {
    if (selectedRestaurant) {
      loadDashboardData(selectedRestaurant, dateRange);
    }
  }, [selectedRestaurant, dateRange, loadDashboardData]);

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
    selectedRestaurant,
    restaurants,
    
    // Actions
    loadDashboardData,
    loadTrends,
    loadAnomalies,
    loadComparisons,
    loadAllData,
    uploadCSVAndRefresh,
    trackEvent,
    updatePreferences,
    exportData,
    generateInsights,
    getMetricData,
    setRestaurantAndReload,
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