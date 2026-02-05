// pages/DashboardPage/DashboardPage.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiLogOut,
  FiBell,
  FiUser,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiPlus,
  FiCalendar,
  FiCheck
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  useRestaurants, 
  useAnalytics, 
  useCreateRestaurant,
  useUploadCSV,
  usePreviewCSV,
  useRefreshDashboard 
} from '../../hooks/useDashboardData';
import { getDateRange } from '../../utils/dateUtils';
import MetricCard from '../../components/dashboard/MetricCard/MetricCard';
import SalesChart from '../../components/dashboard/SalesChart/SalesChart';
import TopItems from '../../components/dashboard/TopItems/TopItems';
import SalesByHour from '../../components/dashboard/SalesByHour/SalesByHour';
import InsightsPanel from '../../components/dashboard/InsightsPanel/InsightsPanel';
import SalesByPurchaseType from '../../components/dashboard/SalesByPurchaseType/SalesByPurchaseType';
import SalesByPaymentMethod from '../../components/dashboard/SalesByPaymentMethod/SalesByPaymentMethod';
import ManagerPerformance from '../../components/dashboard/ManagerPerformance/ManagerPerformance';
import SalesByCity from '../../components/dashboard/SalesByCity/SalesByCity';
import { toast } from 'react-hot-toast';
import styles from './DashboardPage.module.css';

// Helper to get acknowledged notifications from localStorage
const getAcknowledgedNotifications = () => {
  try {
    const stored = localStorage.getItem('acknowledged_notifications');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save acknowledged notifications to localStorage
const saveAcknowledgedNotifications = (ids) => {
  try {
    localStorage.setItem('acknowledged_notifications', JSON.stringify(ids));
  } catch (e) {
    console.warn('Failed to save acknowledged notifications:', e);
  }
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Local state
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvColumns, setCsvColumns] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  
  // Acknowledged notifications state - persisted in localStorage
  const [acknowledgedIds, setAcknowledgedIds] = useState(() => getAcknowledgedNotifications());

  // Calculate date range
  const { startDate, endDate } = useMemo(() => getDateRange(dateRange), [dateRange]);

  // React Query hooks - CACHED DATA FETCHING
  const { 
    data: restaurants = [], 
    isLoading: restaurantsLoading,
    error: restaurantsError 
  } = useRestaurants();

  const { 
    data: analyticsData, 
    isLoading: analyticsLoading,
    isFetching: analyticsRefreshing,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useAnalytics(selectedRestaurant, startDate, endDate, {
    enabled: !!selectedRestaurant,
  });

  // Mutations
  const createRestaurantMutation = useCreateRestaurant();
  const uploadCSVMutation = useUploadCSV();
  const previewCSVMutation = usePreviewCSV();
  const { refreshAnalytics } = useRefreshDashboard();

  // Set first restaurant as selected when restaurants load
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id);
    } else if (restaurants.length === 0 && !restaurantsLoading) {
      handleCreateDefaultRestaurant();
    }
  }, [restaurants, restaurantsLoading, selectedRestaurant]);

  // Memoized dashboard data with defaults
  const dashboardData = useMemo(() => {
    if (!analyticsData) {
      return {
        summary: { total_revenue: 0, total_transactions: 0, avg_transaction_value: 0 },
        daily_sales: [],
        top_items: [],
        sales_by_hour: [],
        sales_by_payment_method: {},
        sales_by_day_of_week: {},
        sales_by_purchase_type: {},
        sales_by_manager: {},
        sales_by_city: {},
        anomalies: [],
        insights: []
      };
    }
    return analyticsData;
  }, [analyticsData]);

  // Process anomalies with unique IDs and acknowledged status
  const notifications = useMemo(() => {
    const rawAnomalies = dashboardData.anomalies || [];
    
    return rawAnomalies.map((anomaly, index) => {
      // Generate a unique ID for each anomaly
      const id = anomaly.id || `anomaly_${index}_${anomaly.description?.substring(0, 20) || index}`;
      
      return {
        ...anomaly,
        id,
        acknowledged: acknowledgedIds.includes(id),
        title: anomaly.title || anomaly.description?.substring(0, 50) || 'Anomaly Detected',
        severity: anomaly.severity || 'info',
        time: anomaly.date || anomaly.time || 'Recently'
      };
    });
  }, [dashboardData.anomalies, acknowledgedIds]);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.acknowledged).length;
  }, [notifications]);

  // Mark single notification as read
  const handleMarkAsRead = useCallback((notificationId) => {
    setAcknowledgedIds(prev => {
      if (prev.includes(notificationId)) return prev;
      const updated = [...prev, notificationId];
      saveAcknowledgedNotifications(updated);
      return updated;
    });
  }, []);

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setAcknowledgedIds(allIds);
    saveAcknowledgedNotifications(allIds);
    toast.success('All notifications marked as read');
  }, [notifications]);

  // Clear all acknowledged (reset)
  const handleClearAcknowledged = useCallback(() => {
    setAcknowledgedIds([]);
    saveAcknowledgedNotifications([]);
  }, []);

  // Handlers
  const handleCreateDefaultRestaurant = useCallback(async () => {
    try {
      const result = await createRestaurantMutation.mutateAsync({
        name: 'Default Restaurant',
        address: '123 Main St',
        phone: '555-1234',
        email: 'default@restaurant.com',
        description: 'Default restaurant for analytics'
      });
      if (result?.id) {
        setSelectedRestaurant(result.id);
      }
    } catch (error) {
      console.error('Error creating default restaurant:', error);
    }
  }, [createRestaurantMutation]);

  const handleRefresh = useCallback(() => {
    if (selectedRestaurant) {
      refetchAnalytics();
      toast.success('Refreshing data...');
    }
  }, [selectedRestaurant, refetchAnalytics]);

  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range);
  }, []);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Dashboard data exported');
  }, [dashboardData]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  // CSV Upload handlers
  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setUploadModalOpen(true);
      
      try {
        const response = await previewCSVMutation.mutateAsync(file);
        if (response?.columns) {
          setCsvColumns(response.columns);
          setColumnMapping(response.suggested_mapping || {});
        }
      } catch (error) {
        console.error('Error previewing CSV:', error);
      }
    } else {
      toast.error('Please select a valid CSV file');
    }
  }, [previewCSVMutation]);

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setUploadModalOpen(true);
      
      try {
        const response = await previewCSVMutation.mutateAsync(file);
        if (response?.columns) {
          setCsvColumns(response.columns);
          setColumnMapping(response.suggested_mapping || {});
        }
      } catch (error) {
        console.error('Error previewing CSV:', error);
      }
    } else {
      toast.error('Please select a valid CSV file');
    }
  }, [previewCSVMutation]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleColumnMappingChange = useCallback((column, field) => {
    setColumnMapping((prev) => ({
      ...prev,
      [column]: field,
    }));
  }, []);

  const validateRequiredFields = useCallback(() => {
    if (!csvColumns.length) return false;
    return Object.values(columnMapping).includes('date');
  }, [csvColumns, columnMapping]);

  const handleUploadCSV = useCallback(async () => {
    if (!csvFile || !selectedRestaurant) return;

    if (!validateRequiredFields()) {
      toast.error('Please map the Date field (required)');
      return;
    }

    const filteredMapping = {};
    Object.entries(columnMapping).forEach(([column, field]) => {
      if (field) {
        filteredMapping[column] = field;
      }
    });

    try {
      await uploadCSVMutation.mutateAsync({
        file: csvFile,
        restaurantId: selectedRestaurant,
        columnsMapping: filteredMapping
      });
      
      setUploadModalOpen(false);
      setCsvFile(null);
      setCsvColumns([]);
      setColumnMapping({});
      setDateRange('all');
    } catch (error) {
      console.error('Error uploading CSV:', error);
    }
  }, [csvFile, selectedRestaurant, columnMapping, validateRequiredFields, uploadCSVMutation]);

  const closeUploadModal = useCallback(() => {
    setUploadModalOpen(false);
    setCsvFile(null);
    setCsvColumns([]);
    setColumnMapping({});
  }, []);

  // Memoized calculations
  const calculateRevenueChange = useMemo(() => {
    const dailySales = dashboardData.daily_sales || [];
    if (dailySales.length < 14) return 0;
    
    const currentPeriod = dailySales.slice(-7);
    const previousPeriod = dailySales.slice(-14, -7);
    
    const currentRevenue = currentPeriod.reduce((sum, day) => sum + (day.total_amount || 0), 0);
    const previousRevenue = previousPeriod.reduce((sum, day) => sum + (day.total_amount || 0), 0);
    
    return previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  }, [dashboardData.daily_sales]);

  const calculateTransactionsChange = useMemo(() => {
    const dailySales = dashboardData.daily_sales || [];
    if (dailySales.length < 14) return 0;
    
    const currentPeriod = dailySales.slice(-7);
    const previousPeriod = dailySales.slice(-14, -7);
    
    const currentTransactions = currentPeriod.reduce((sum, day) => sum + (day.transactions || 0), 0);
    const previousTransactions = previousPeriod.reduce((sum, day) => sum + (day.transactions || 0), 0);
    
    return previousTransactions > 0 ? ((currentTransactions - previousTransactions) / previousTransactions) * 100 : 0;
  }, [dashboardData.daily_sales]);

  const calculateAvgOrderChange = useMemo(() => {
    const dailySales = dashboardData.daily_sales || [];
    if (dailySales.length < 14) return 0;
    
    const currentPeriod = dailySales.slice(-7);
    const previousPeriod = dailySales.slice(-14, -7);
    
    const calcAvg = (period) => {
      const total = period.reduce((sum, day) => {
        return sum + (day.total_amount && day.transactions > 0 ? day.total_amount / day.transactions : 0);
      }, 0);
      return period.length > 0 ? total / period.length : 0;
    };
    
    const currentAvg = calcAvg(currentPeriod);
    const previousAvg = calcAvg(previousPeriod);
    
    return previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;
  }, [dashboardData.daily_sales]);

  const getChangeType = useCallback((change) => {
    return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  }, []);

  const generateSparklineData = useCallback((type) => {
    const dailySales = dashboardData.daily_sales || [];
    if (dailySales.length < 10) return [];
    
    return dailySales.slice(-10).map(day => {
      switch (type) {
        case 'revenue':
          return day.total_amount || 0;
        case 'transactions':
          return day.transactions || 0;
        case 'avg_order':
          return day.total_amount && day.transactions > 0 ? day.total_amount / day.transactions : 0;
        default:
          return 0;
      }
    });
  }, [dashboardData.daily_sales]);

  // Memoized metric cards
  const metricCards = useMemo(() => [
    {
      title: 'Total Revenue',
      value: dashboardData.summary?.total_revenue || 0,
      change: calculateRevenueChange,
      changeType: getChangeType(calculateRevenueChange),
      icon: FiPlus,
      color: 'primary',
      sparklineData: generateSparklineData('revenue'),
      comparisonText: 'vs last period',
    },
    {
      title: 'Transactions',
      value: dashboardData.summary?.total_transactions || 0,
      change: calculateTransactionsChange,
      changeType: getChangeType(calculateTransactionsChange),
      icon: FiDownload,
      color: 'secondary',
      sparklineData: generateSparklineData('transactions'),
      comparisonText: 'vs last period',
    },
    {
      title: 'Avg. Order Value',
      value: dashboardData.summary?.avg_transaction_value || 0,
      change: calculateAvgOrderChange,
      changeType: getChangeType(calculateAvgOrderChange),
      icon: FiCalendar,
      color: 'tertiary',
      sparklineData: generateSparklineData('avg_order'),
      comparisonText: 'vs last period',
    },
    {
      title: 'Top Item Sales',
      value: dashboardData.top_items?.[0]?.total_quantity || 0,
      change: 0,
      changeType: 'neutral',
      icon: FiRefreshCw,
      color: 'success',
      sparklineData: [],
      comparisonText: 'vs last period',
    },
  ], [dashboardData, calculateRevenueChange, calculateTransactionsChange, calculateAvgOrderChange, getChangeType, generateSparklineData]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Loading state
  const isLoading = restaurantsLoading || (analyticsLoading && !analyticsData);
  const isRefreshing = analyticsRefreshing;

  if (isLoading && restaurants.length === 0) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Restaurant Analytics</h1>
          <p className={styles.pageSubtitle}>
            Welcome back, {user?.data?.username || user?.username || 'User'}! Here's what's happening with your restaurant today.
          </p>

          <div className={styles.restaurantSelector}>
            <label htmlFor="restaurant-select" className={styles.selectorLabel}>
              Restaurant:
            </label>
            <select
              id="restaurant-select"
              className={styles.restaurantSelect}
              value={selectedRestaurant || ''}
              onChange={(e) => setSelectedRestaurant(Number(e.target.value))}
              disabled={restaurantsLoading}
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.dateRangeSelector}>
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className={styles.dateRangeSelect}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.uploadButton}
              onClick={() => setUploadModalOpen(true)}
              title="Upload CSV"
              type="button"
            >
              <FiUpload size={18} />
              <span>Upload</span>
            </button>

            <button
              className={styles.refreshButton}
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh data"
              type="button"
            >
              <FiRefreshCw size={18} className={isRefreshing ? styles.spinning : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <button
              className={styles.exportButton}
              onClick={handleExport}
              title="Export data"
              type="button"
            >
              <FiDownload size={18} />
              <span>Export</span>
            </button>
          </div>

          {/* Notifications */}
          <div className={styles.notificationContainer}>
            <button
              className={styles.notificationButton}
              onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              type="button"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className={styles.notificationBadge}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationMenuOpen && (
                <motion.div
                  className={styles.notificationMenu}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.notificationHeader}>
                    <h3>
                      Notifications
                      {unreadCount > 0 && (
                        <span className={styles.unreadBadge}>{unreadCount} new</span>
                      )}
                    </h3>
                    {notifications.length > 0 && unreadCount > 0 && (
                      <button 
                        className={styles.markAllRead}
                        onClick={handleMarkAllAsRead}
                        type="button"
                      >
                        <FiCheck size={14} />
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className={styles.notificationList}>
                    {notifications.length > 0 ? (
                      notifications.slice(0, 10).map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`${styles.notificationItem} ${notification.acknowledged ? styles.read : styles.unread}`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className={`${styles.notificationDot} ${styles[notification.severity || 'info']}`} />
                          <div className={styles.notificationContent}>
                            <h4>{notification.title}</h4>
                            <p>{notification.description}</p>
                            <span className={styles.notificationTime}>
                              {notification.time}
                            </span>
                          </div>
                          {notification.acknowledged && (
                            <div className={styles.readIndicator}>
                              <FiCheck size={14} />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className={styles.noNotifications}>
                        <FiBell size={32} />
                        <p>No notifications</p>
                        <span>You're all caught up!</span>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className={styles.notificationFooter}>
                      <span className={styles.notificationCount}>
                        {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className={styles.userContainer}>
            <button
              className={styles.userButton}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              type="button"
            >
              <div className={styles.userAvatar}>
                <FiUser size={18} />
              </div>
              <span className={styles.userName}>
                {user?.data?.username || user?.username || 'User'}
              </span>
            </button>
            
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  className={styles.userMenu}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <button 
                    className={styles.menuItem}
                    onClick={() => {
                      navigate('/profile');
                      setUserMenuOpen(false);
                    }}
                    type="button"
                  >
                    <FiUser size={16} />
                    Profile
                  </button>
                  <div className={styles.menuDivider} />
                  <button 
                    className={styles.menuItem} 
                    onClick={handleLogout}
                    type="button"
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
      
      <main className={styles.mainContent}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Insights Panel */}
          {(dashboardData.insights?.length > 0 || dashboardData.anomalies?.length > 0) && (
            <motion.div variants={itemVariants}>
              <InsightsPanel
                insights={dashboardData.insights || []}
                anomalies={dashboardData.anomalies || []}
                loading={isLoading}
                onRefresh={handleRefresh}
              />
            </motion.div>
          )}

          {/* Metrics Grid */}
          <div className={styles.metricsGrid}>
            {metricCards.map((metric, index) => (
              <MetricCard
                key={index}
                {...metric}
                loading={isLoading}
                onClick={() => console.log(`View ${metric.title} details`)}
              />
            ))}
          </div>

          {/* Main Charts Grid */}
          <div className={styles.chartsGrid}>
            <div className={styles.mainChart}>
              <SalesChart
                data={dashboardData.daily_sales || []}
                title="Revenue Trends"
                height={350}
                loading={isLoading}
                onDateRangeChange={handleDateRangeChange}
              />
            </div>

            <div className={styles.sideChart}>
              <TopItems
                items={dashboardData.top_items || []}
                loading={isLoading}
              />
            </div>
          </div>

          {/* Analytics Row 1 */}
          <div className={styles.analyticsRow}>
            <div className={styles.analyticsChart}>
              <SalesByPurchaseType
                data={dashboardData.sales_by_purchase_type || {}}
                loading={isLoading}
                title="Sales by Channel"
              />
            </div>

            <div className={styles.analyticsChart}>
              <SalesByPaymentMethod
                data={dashboardData.sales_by_payment_method || {}}
                loading={isLoading}
                title="Payment Methods"
              />
            </div>
          </div>

          {/* Analytics Row 2 */}
          <div className={styles.analyticsRow}>
            <div className={styles.analyticsChart}>
              <ManagerPerformance
                data={dashboardData.sales_by_manager || {}}
                loading={isLoading}
                title="Manager Performance"
              />
            </div>

            <div className={styles.analyticsChart}>
              <SalesByCity
                data={dashboardData.sales_by_city || {}}
                loading={isLoading}
                title="Sales by Location"
              />
            </div>
          </div>

          {/* Sales by Hour */}
          <div className={styles.fullWidthChart}>
            <SalesByHour
              data={dashboardData.sales_by_hour || []}
              loading={isLoading}
            />
          </div>
        </motion.div>
      </main>

      {/* CSV Upload Modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUploadModal}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Upload Sales Data</h2>
                <button
                  className={styles.closeButton}
                  onClick={closeUploadModal}
                  type="button"
                >
                  ×
                </button>
              </div>

              {csvColumns.length > 0 ? (
                <div className={styles.modalBody}>
                  <h3>Map Your Columns</h3>
                  <p>Match your CSV columns to our data fields. Unmapped columns will be ignored.</p>

                  <div className={styles.columnMapping}>
                    {csvColumns.map((column) => (
                      <div key={column} className={styles.mappingRow}>
                        <span className={styles.columnName}>{column}</span>
                        <select
                          value={columnMapping[column] || ''}
                          onChange={(e) => handleColumnMappingChange(column, e.target.value)}
                          className={styles.fieldSelect}
                        >
                          <option value="">-- Ignore Column --</option>
                          <optgroup label="Required Fields">
                            <option value="date">Date *</option>
                            <option value="time">Time</option>
                          </optgroup>
                          <optgroup label="Recommended Fields">
                            <option value="price">Price</option>
                            <option value="quantity">Quantity</option>
                          </optgroup>
                          <optgroup label="Transaction Details">
                            <option value="total_amount">Total Amount</option>
                            <option value="item_name">Item Name</option>
                            <option value="category">Category</option>
                            <option value="transaction_id">Transaction ID</option>
                          </optgroup>
                          <optgroup label="Sales Channels">
                            <option value="purchase_type">Purchase Type</option>
                            <option value="payment_method">Payment Method</option>
                          </optgroup>
                          <optgroup label="Location & Staff">
                            <option value="manager">Manager</option>
                            <option value="city">City/Location</option>
                            <option value="staff_id">Staff ID</option>
                          </optgroup>
                          <optgroup label="Other">
                            <option value="customer_id">Customer ID</option>
                            <option value="notes">Notes</option>
                          </optgroup>
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className={styles.mappingNote}>
                    <p>* Only the Date field is required.</p>
                    <p>💡 Map Purchase Type, Manager, and City for detailed analytics.</p>
                  </div>

                  <div className={styles.modalActions}>
                    <button
                      className={styles.cancelButton}
                      onClick={closeUploadModal}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.uploadButton}
                      onClick={handleUploadCSV}
                      disabled={uploadCSVMutation.isLoading || !validateRequiredFields()}
                      type="button"
                    >
                      {uploadCSVMutation.isLoading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.modalBody}>
                  <div 
                    className={styles.fileDropArea}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiUpload size={48} />
                    <h3>Drop your CSV file here or click to browse</h3>
                    <p>Supported format: CSV</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className={styles.fileInput}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;