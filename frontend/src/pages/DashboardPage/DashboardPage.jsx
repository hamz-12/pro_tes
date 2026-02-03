import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Add AnimatePresence here
import { useNavigate } from 'react-router-dom';
import {
  FiLogOut,
  FiSettings,
  FiBell,
  FiUser,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiPlus,
  FiCalendar
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as dashboardService from '../../services/dashboardService';
import { getDateRange } from '../../utils/dateUtils';
import Dashboard from '../../components/dashboard/Dashboard/Dashboard';
import AnomalyAlert from '../../components/dashboard/AnomalyAlert/AnomalyAlert';
import MetricCard from '../../components/dashboard/MetricCard/MetricCard';
import SalesChart from '../../components/dashboard/SalesChart/SalesChart';
import TopItems from '../../components/dashboard/TopItems/TopItems';
import SalesByCategory from '../../components/dashboard/SalesByCategory/SalesByCategory';
import SalesByHour from '../../components/dashboard/SalesByHour/SalesByHour';
import InsightsPanel from '../../components/dashboard/InsightsPanel/InsightsPanel';
import { toast } from 'react-hot-toast';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State management
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('2y');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvColumns, setCsvColumns] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [uploading, setUploading] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Fetch restaurants on component mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Fetch dashboard data when restaurant or date range changes
  useEffect(() => {
    if (selectedRestaurant) {
      fetchDashboardData();
    }
  }, [selectedRestaurant, dateRange]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch restaurants...');
      const restaurantsData = await dashboardService.getRestaurants();
      console.log('Received restaurants data:', restaurantsData);
      
      // Check if we received valid data
      if (restaurantsData) {
        // If the data is not an array, check if it's wrapped in a response object
        let restaurantsArray = restaurantsData;
        if (!Array.isArray(restaurantsData)) {
          if (restaurantsData.data && Array.isArray(restaurantsData.data)) {
            restaurantsArray = restaurantsData.data;
          } else {
            console.error('Invalid restaurants data format:', restaurantsData);
            toast.error('Invalid restaurants data format received');
            return;
          }
        }
        
        console.log('Setting restaurants array:', restaurantsArray);
        setRestaurants(restaurantsArray);

        // Select first restaurant by default
        if (restaurantsArray.length > 0) {
          console.log('Selecting first restaurant:', restaurantsArray[0].id);
          setSelectedRestaurant(restaurantsArray[0].id);
        } else {
          console.log('No restaurants found, creating a default one');
          // Create a default restaurant if none exist
          handleCreateDefaultRestaurant();
        }
      } else {
        console.error('No restaurants data received');
        toast.error('No restaurants data received');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefaultRestaurant = async () => {
    try {
      console.log('Creating default restaurant...');
      
      // Create a default restaurant by calling the API
      const defaultRestaurantData = {
        name: 'Default Restaurant',
        address: '123 Main St',
        phone: '555-1234',
        email: 'default@restaurant.com',
        description: 'Default restaurant for analytics'
      };
      
      const createdRestaurant = await dashboardService.createRestaurant(defaultRestaurantData);
      console.log('Created restaurant:', createdRestaurant);
      
      // Add the new restaurant to the list and select it
      setRestaurants([createdRestaurant]);
      setSelectedRestaurant(createdRestaurant.id);
      toast.success('Created default restaurant');
    } catch (error) {
      console.error('Error creating default restaurant:', error);
      
      // If API call fails, create a local placeholder (for UI purposes only)
      const defaultRestaurant = {
        id: 1,
        name: 'Default Restaurant',
        address: '123 Main St',
        phone: '555-1234',
        email: 'default@restaurant.com'
      };
      setRestaurants([defaultRestaurant]);
      setSelectedRestaurant(defaultRestaurant.id);
      toast.error('Failed to create restaurant in database, showing placeholder');
    }
  };

  const fetchDashboardData = async () => {
    if (!selectedRestaurant) return;

    try {
      setRefreshing(true);
      const { startDate, endDate } = getDateRange(dateRange);
      console.log('Fetching dashboard data for restaurant:', selectedRestaurant, 'from', startDate, 'to', endDate);

      const analyticsData = await dashboardService.getAnalytics(
        selectedRestaurant,
        startDate,
        endDate
      );

      console.log('Received analytics data:', analyticsData);

      if (analyticsData) {
        // Transform sales_by_category from object to array format
        let salesByCategory = analyticsData.sales_by_category;
        if (salesByCategory && typeof salesByCategory === 'object' && !Array.isArray(salesByCategory)) {
          salesByCategory = Object.entries(salesByCategory).map(([category, revenue]) => ({
            category,
            total_revenue: typeof revenue === 'object' ? revenue.total_revenue || revenue : revenue
          }));
        }
        
        // Transform sales_by_hour from object to array format
        let salesByHour = analyticsData.sales_by_hour;
        if (salesByHour && typeof salesByHour === 'object' && !Array.isArray(salesByHour)) {
          salesByHour = Object.entries(salesByHour).map(([hour, values]) => {
            const hourNum = parseInt(hour, 10);
            if (typeof values === 'object' && values !== null) {
              return {
                hour: hourNum,
                total_revenue: values.total_revenue || values.revenue || 0,
                transaction_count: values.transaction_count || values.transactions || 0
              };
            } else {
              return {
                hour: hourNum,
                total_revenue: values || 0,
                transaction_count: 0
              };
            }
          });
        }
        
        // Set the transformed data
        setDashboardData({
          ...analyticsData,
          sales_by_category: salesByCategory,
          sales_by_hour: salesByHour
        });
        
        setAnomalies(analyticsData.anomalies || []);
        
        if (analyticsData.summary.total_transactions > 0) {
          toast.success('Dashboard data refreshed');
        } else {
          toast('No sales data found. Upload a CSV file to see analytics.', {
            icon: 'ℹ️',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        summary: { total_revenue: 0, total_transactions: 0, avg_transaction_value: 0 },
        daily_sales: [],
        top_items: [],
        sales_by_category: [],
        sales_by_hour: [],
        sales_by_payment_method: {},
        sales_by_day_of_week: {},
        anomalies: [],
        insights: ["Unable to load analytics. Please try again."]
      });
      toast.error('Failed to fetch dashboard data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleExport = () => {
    toast.success('Exporting dashboard data...');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // CSV Upload handlers
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      console.log('File selected:', file.name);
      setCsvFile(file);
      setUploadModalOpen(true);
      previewCSVColumns(file);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      console.log('File dropped:', file.name);
      setCsvFile(file);
      setUploadModalOpen(true);
      previewCSVColumns(file);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const previewCSVColumns = async (file) => {
    try {
      console.log('Previewing CSV columns for file:', file.name);
      const response = await dashboardService.previewCSVColumns(file);
      
      console.log('CSV preview response:', response);
      
      // Ensure we have valid data
      if (response && response.columns) {
        setCsvColumns(response.columns);

        // Use the suggested mapping from the backend if available
        if (response.suggested_mapping) {
          setColumnMapping(response.suggested_mapping);
        } else {
          // Initialize default mapping (first column to date, second to price, etc.)
          const defaultMapping = {};
          if (response.columns.length >= 1) {
            defaultMapping[response.columns[0]] = 'date';
            if (response.columns.length >= 2) {
              // Try to map the second column to price
              const secondCol = response.columns[1].toLowerCase();
              if (secondCol.includes('price') || secondCol.includes('cost') || secondCol.includes('amount')) {
                defaultMapping[response.columns[1]] = 'price';
              } else {
                defaultMapping[response.columns[1]] = 'price';
              }
              if (response.columns.length >= 3) {
                // Try to map the third column to quantity
                const thirdCol = response.columns[2].toLowerCase();
                if (thirdCol.includes('quantity') || thirdCol.includes('qty') || thirdCol.includes('count') || thirdCol.includes('number')) {
                  defaultMapping[response.columns[2]] = 'quantity';
                }
              }
            }
          }
          setColumnMapping(defaultMapping);
        }
      } else {
        console.error('Invalid CSV preview response:', response);
        toast.error('Invalid CSV preview response');
      }
    } catch (error) {
      console.error('Error previewing CSV columns:', error);
      toast.error('Failed to preview CSV columns');
    }
  };

  const handleColumnMappingChange = (column, field) => {
    setColumnMapping((prev) => ({
      ...prev,
      [column]: field,
    }));
  };

  // Validate required fields - only date is required now
  const validateRequiredFields = () => {
    if (!csvColumns.length) return false;
    
    // Only date is required now
    const hasDate = Object.values(columnMapping).includes('date');
    
    return hasDate;
  };

  const handleUploadCSV = async () => {
    if (!csvFile || !selectedRestaurant) return;

    // Validate required fields
    if (!validateRequiredFields()) {
      toast.error('Please map the Date field (required)');
      return;
    }

    try {
      setUploading(true);
      console.log('Uploading CSV file...');
      
      // Filter out unmapped columns
      const filteredMapping = {};
      Object.entries(columnMapping).forEach(([column, field]) => {
        if (field) {  // Only include mapped columns
          filteredMapping[column] = field;
        }
      });
      
      console.log('Filtered column mapping:', filteredMapping);
      
      await dashboardService.uploadCSV(csvFile, selectedRestaurant, filteredMapping);
      toast.success('CSV uploaded successfully');
      setUploadModalOpen(false);
      setCsvFile(null);
      setCsvColumns([]);
      setColumnMapping({});

      setDateRange('all');
      
      // Refresh dashboard data after upload with a small delay to ensure data is processed
      setTimeout(() => {
        fetchDashboardData();
      }, 1000);
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  const calculateRevenueChange = () => {
    if (!dashboardData.daily_sales || dashboardData.daily_sales.length < 2) return 0;
    
    const currentPeriod = dashboardData.daily_sales.slice(-7);
    const previousPeriod = dashboardData.daily_sales.slice(-14, -7); 
    
    if (previousPeriod.length === 0) return 0;
    
    const currentRevenue = currentPeriod.reduce((sum, day) => sum + (day.total_amount || 0), 0);
    const previousRevenue = previousPeriod.reduce((sum, day) => sum + (day.total_amount || 0), 0);
    
    return previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  };

  const calculateTransactionsChange = () => {
    if (!dashboardData.daily_sales || dashboardData.daily_sales.length < 2) return 0;
    
    const currentPeriod = dashboardData.daily_sales.slice(-7);
    const previousPeriod = dashboardData.daily_sales.slice(-14, -7);
    
    if (previousPeriod.length === 0) return 0;
    
    const currentTransactions = currentPeriod.reduce((sum, day) => sum + (day.transactions || 0), 0);
    const previousTransactions = previousPeriod.reduce((sum, day) => sum + (day.transactions || 0), 0);
    
    return previousTransactions > 0 ? ((currentTransactions - previousTransactions) / previousTransactions) * 100 : 0;
  };

  const calculateAvgOrderChange = () => {
    if (!dashboardData.daily_sales || dashboardData.daily_sales.length < 2) return 0;
    
    const currentPeriod = dashboardData.daily_sales.slice(-7);
    const previousPeriod = dashboardData.daily_sales.slice(-14, -7);
    
    if (previousPeriod.length === 0) return 0;
    
    const currentAvg = currentPeriod.reduce((sum, day) => {
      const avg = day.total_amount && day.transactions > 0 ? day.total_amount / day.transactions : 0;
      return sum + avg;
    }, 0) / currentPeriod.length;
    
    const previousAvg = previousPeriod.reduce((sum, day) => {
      const avg = day.total_amount && day.transactions > 0 ? day.total_amount / day.transactions : 0;
      return sum + avg;
    }, 0) / previousPeriod.length;
    
    return previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;
  };

  const calculateTopItemChange = () => {
    // This would require historical data for top items
    // For now, return a random value or 0
    return Math.random() * 20 - 10; // Random between -10 and 10
  };

  const getChangeType = (change) => {
    return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  };

  const generateSparklineData = (type) => {
    if (!dashboardData.daily_sales || dashboardData.daily_sales.length < 10) return [];
    
    return dashboardData.daily_sales.slice(-10).map(day => {
      switch (type) {
        case 'revenue':
          return day.total_amount || 0;
        case 'transactions':
          return day.transactions || 0;
        case 'avg_order':
          return day.total_amount && day.transactions > 0 ? day.total_amount / day.transactions : 0;
        case 'top_item':
          return Math.random() * 100;
        default:
          return 0;
      }
    });
  };

  const metricCards = [
    {
      title: 'Total Revenue',
      value: dashboardData.summary?.total_revenue || 0,
      change: calculateRevenueChange(),
      changeType: getChangeType(calculateRevenueChange()),
      icon: FiPlus,
      color: 'primary',
      sparklineData: generateSparklineData('revenue'),
      comparisonText: 'vs last period',
    },
    {
      title: 'Transactions',
      value: dashboardData.summary?.total_transactions || 0,
      change: calculateTransactionsChange(),
      changeType: getChangeType(calculateTransactionsChange()),
      icon: FiDownload,
      color: 'secondary',
      sparklineData: generateSparklineData('transactions'),
      comparisonText: 'vs last period',
    },
    {
      title: 'Avg. Order Value',
      value: dashboardData.summary?.avg_transaction_value || 0,
      change: calculateAvgOrderChange(),
      changeType: getChangeType(calculateAvgOrderChange()),
      icon: FiCalendar,
      color: 'tertiary',
      sparklineData: generateSparklineData('avg_order'),
      comparisonText: 'vs last period',
    },
    {
      title: 'Top Item Sales',
      value: dashboardData.top_items?.[0]?.total_quantity || 0,
      change: calculateTopItemChange(),
      changeType: getChangeType(calculateTopItemChange()),
      icon: FiRefreshCw,
      color: 'success',
      sparklineData: generateSparklineData('top_item'),
      comparisonText: 'vs last period',
    },
  ];

  // Add a loading state to prevent rendering when data is not ready
  if (loading && restaurants.length === 0) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading restaurants...</p>
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
            Welcome back, {user?.username || 'User'}! Here's what's happening with your restaurant today.
          </p>

          {/* Restaurant Selector */}
          <div className={styles.restaurantSelector}>
            <label htmlFor="restaurant-select" className={styles.selectorLabel}>
              Restaurant:
            </label>
            <select
              id="restaurant-select"
              className={styles.restaurantSelect}
              value={selectedRestaurant || ''}
              onChange={(e) => setSelectedRestaurant(Number(e.target.value))}
              disabled={loading}
            >
              {restaurants && restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Date Range Selector */}
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

          {/* Action Buttons */}
          <div className={styles.headerActions}>
            <button
              className={styles.uploadButton}
              onClick={() => setUploadModalOpen(true)}
              title="Upload CSV"
            >
              <FiUpload size={18} />
              Upload
            </button>

            <button
              className={styles.refreshButton}
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh data"
            >
              <FiRefreshCw size={18} className={refreshing ? styles.spinning : ''} />
              Refresh
            </button>

            <button
              className={styles.exportButton}
              onClick={handleExport}
              title="Export data"
            >
              <FiDownload size={18} />
              Export
            </button>

          </div>

          {/* Notifications */}
          <div className={styles.notificationContainer}>
            <button
              className={styles.notificationButton}
              onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
            >
              <FiBell size={20} />
              {anomalies.filter((a) => !a.acknowledged).length > 0 && (
                <span className={styles.notificationBadge}>
                  {anomalies.filter((a) => !a.acknowledged).length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationMenuOpen && (
                <motion.div
                  className={styles.notificationMenu}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.notificationHeader}>
                    <h3>Notifications</h3>
                    <button 
                      className={styles.markAllRead} 
                      onClick={() => {
                        const updatedAnomalies = anomalies.map(anomaly => ({
                          ...anomaly,
                          acknowledged: true
                        }));
                        setAnomalies(updatedAnomalies);
                        toast.success('All notifications marked as read');
                      }}
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className={styles.notificationList}>
                    {anomalies.length > 0 ? (
                      anomalies.map((anomaly) => (
                        <div key={anomaly.id || anomaly.date} className={styles.notificationItem}>
                          <div className={`${styles.notificationDot} ${styles[anomaly.severity]}`} />
                          <div className={styles.notificationContent}>
                            <h4>{anomaly.title}</h4>
                            <p>{anomaly.description}</p>
                            <span className={styles.notificationTime}>{anomaly.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noNotifications}>
                        No new notifications
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.userContainer}>
            <button
              className={styles.userButton}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className={styles.userAvatar}>
                <FiUser size={18} />
              </div>
              <span className={styles.userName}>
                {user?.username || localStorage.getItem('userData') ? 
                  JSON.parse(localStorage.getItem('userData') || '{}').username : 
                  'User'
                }
              </span>
            </button>
            
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  className={styles.userMenu}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <button 
                    className={styles.menuItem}
                    onClick={() => {
                      navigate('/profile');
                      setUserMenuOpen(false);
                    }}
                  >
                    <FiUser size={16} />
                    Profile
                  </button>
                  <div className={styles.menuDivider} />
                  <button className={styles.menuItem} onClick={handleLogout}>
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
          {dashboardData && (dashboardData.insights?.length > 0 || dashboardData.anomalies?.length > 0) && (
            <motion.div variants={itemVariants}>
              <InsightsPanel
                insights={dashboardData.insights || []}
                anomalies={dashboardData.anomalies || []}
                loading={loading}
                onRefresh={fetchDashboardData}
              />
            </motion.div>
          )}

          {/* Anomaly Alerts - Only render if we have valid data */}
          {dashboardData && Array.isArray(dashboardData.anomalies) && dashboardData.anomalies.length > 0 && (
            <AnomalyAlert 
              anomalies={dashboardData.anomalies} 
              maxVisible={3} 
              autoExpand={false} 
            />
          )}

          {/* Metrics Grid */}
          <div className={styles.metricsGrid}>
            {metricCards.map((metric, index) => (
              <MetricCard
                key={index}
                {...metric}
                loading={loading}
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
                loading={loading}
                compareData={dateRange === '30d' ? dashboardData.previous_period_sales : null}
                onDateRangeChange={handleDateRangeChange}
                onFilterClick={() => console.log('Filter clicked')}
              />
            </div>

            <div className={styles.sideChart}>
              <TopItems
                items={dashboardData.top_items || []}
                loading={loading}
                onViewAllItems={() => console.log('View all items clicked')}
              />
            </div>
          </div>

          {/* Bottom Charts Grid */}
          <div className={styles.bottomCharts}>
            <div className={styles.bottomChart}>
              <SalesByCategory
                data={dashboardData.sales_by_category || []}
                loading={loading}
                chartType="doughnut"
              />
            </div>

            <div className={styles.bottomChart}>
              <SalesByHour
                data={dashboardData.sales_by_hour || []}
                loading={loading}
              />
            </div>
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
          >
            <motion.div
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.modalHeader}>
                <h2>Upload Sales Data</h2>
                <button
                  className={styles.closeButton}
                  onClick={() => setUploadModalOpen(false)}
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
                            <option value="time">Time (optional, for hourly analysis)</option>
                          </optgroup>
                          <optgroup label="Recommended Fields">
                            <option value="price">Price (recommended)</option>
                            <option value="quantity">Quantity (recommended)</option>
                          </optgroup>
                          <optgroup label="Optional Fields">
                            <option value="total_amount">Total Amount (will be calculated if not provided)</option>
                            <option value="item_name">Item Name</option>
                            <option value="category">Category</option>
                            <option value="transaction_id">Transaction ID</option>
                            <option value="payment_method">Payment Method</option>
                            <option value="customer_id">Customer ID</option>
                            <option value="staff_id">Staff ID</option>
                            <option value="notes">Notes</option>
                          </optgroup>
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className={styles.mappingNote}>
                    <p>* Only the Date field is required. Total Amount will be calculated from Price × Quantity if not provided.</p>
                  </div>

                  <div className={styles.modalActions}>
                    <button
                      className={styles.cancelButton}
                      onClick={() => setUploadModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.uploadButton}
                      onClick={handleUploadCSV}
                      disabled={uploading || !validateRequiredFields()}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.modalBody}>
                  <div 
                    className={styles.fileDropArea}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current.click()}
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