import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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

  // In DashboardPage.jsx, update the fetchDashboardData function

    const fetchDashboardData = async () => {
      if (!selectedRestaurant) return;

      try {
        setRefreshing(true);
        const { startDate, endDate } = getDateRange(dateRange);
        console.log('Fetching dashboard data for restaurant:', selectedRestaurant, 'from', startDate, 'to', endDate);

        // Call the analytics endpoint
        const analyticsData = await dashboardService.getAnalytics(
          selectedRestaurant,
          startDate,
          endDate
        );

        console.log('Received analytics data:', analyticsData);

        // Ensure we have valid data with default values if empty
        if (analyticsData) {
          // Set default values for empty data
          const defaultData = {
            summary: {
              total_revenue: 0,
              total_transactions: 0,
              avg_transaction_value: 0
            },
            daily_sales: [],
            top_items: [],
            sales_by_category: {},
            sales_by_payment_method: {},
            sales_by_day_of_week: {},
            sales_by_hour: {},
            anomalies: [],
            insights: ["Upload sales data to see insights"]
          };
          
          // Merge with received data, using defaults for missing values
          const mergedData = {
            ...defaultData,
            ...analyticsData,
            summary: { ...defaultData.summary, ...analyticsData.summary }
          };
          
          setDashboardData(mergedData);
          setAnomalies(mergedData.anomalies || []);
          
          // Only show success message if we have actual data
          if (mergedData.summary.total_transactions > 0) {
            toast.success('Dashboard data refreshed');
          } else {
            // toast('No sales data found. Upload a CSV file to see analytics.');
            toast('No sales data found. Upload a CSV file to see analytics.', {
              icon: 'ℹ️',
            });
          }
        } else {
          console.error('Invalid analytics data:', analyticsData);
          toast.error('Invalid analytics data received');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty default data on error
        setDashboardData({
          summary: { total_revenue: 0, total_transactions: 0, avg_transaction_value: 0 },
          daily_sales: [],
          top_items: [],
          sales_by_category: {},
          sales_by_payment_method: {},
          sales_by_day_of_week: {},
          sales_by_hour: {},
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

  // Convert object to array for chart components
  const convertObjectToArray = (obj) => {
    if (!obj) return [];
    return Object.entries(obj).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? value : { value }
    }));
  };

  const metricCards = [
    {
      title: 'Total Revenue',
      value: dashboardData.summary?.total_revenue || 0,
      change: 12.5,
      changeType: 'positive',
      icon: FiPlus,
      color: 'primary',
      sparklineData: [45, 52, 38, 60, 55, 48, 62, 58, 55, 60],
      comparisonText: 'vs last period',
    },
    {
      title: 'Transactions',
      value: dashboardData.summary?.total_transactions || 0,
      change: 8.2,
      changeType: 'positive',
      icon: FiDownload,
      color: 'secondary',
      sparklineData: [120, 135, 128, 140, 142, 138, 145, 148, 150, 155],
      comparisonText: 'vs last period',
    },
    {
      title: 'Avg. Order Value',
      value: dashboardData.summary?.avg_transaction_value || 0,
      change: -2.3,
      changeType: 'negative',
      icon: FiCalendar,
      color: 'tertiary',
      sparklineData: [45.5, 46.2, 45.8, 44.9, 44.5, 43.8, 44.2, 43.5, 44.0, 43.8],
      comparisonText: 'vs last period',
    },
    {
      title: 'Top Item Sales',
      value: dashboardData.top_items?.[0]?.total_quantity || 0,
      change: 15.8,
      changeType: 'positive',
      icon: FiRefreshCw,
      color: 'success',
      sparklineData: [38, 42, 45, 48, 50, 52, 55, 58, 60, 62],
      comparisonText: 'vs last period',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

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

            <button
              className={styles.addRestaurantButton}
              onClick={() => navigate('/restaurants/new')}
              title="Add restaurant"
            >
              <FiPlus size={18} />
              Add
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

            {notificationMenuOpen && (
              <div className={styles.notificationMenu}>
                <div className={styles.notificationHeader}>
                  <h3>Notifications</h3>
                  <button className={styles.markAllRead}>Mark all as read</button>
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
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className={styles.userContainer}>
            <button
              className={styles.userButton}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className={styles.userAvatar}>
                <FiUser size={18} />
              </div>
              <span className={styles.userName}>{user?.username || 'User'}</span>
            </button>

            {userMenuOpen && (
              <div className={styles.userMenu}>
                <button className={styles.menuItem}>
                  <FiUser size={16} />
                  Profile
                </button>
                <button className={styles.menuItem}>
                  <FiSettings size={16} />
                  Settings
                </button>
                <div className={styles.menuDivider} />
                <button className={styles.menuItem} onClick={handleLogout}>
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
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
              />
            </div>

            <div className={styles.sideChart}>
              <TopItems
                items={dashboardData.top_items || []}
                loading={loading}
              />
            </div>
          </div>

          {/* Bottom Charts Grid */}
          <div className={styles.bottomCharts}>
            <div className={styles.bottomChart}>
              <SalesByCategory
                data={convertObjectToArray(dashboardData.sales_by_category || {})}
                loading={loading}
                chartType="doughnut"
              />
            </div>

            <div className={styles.bottomChart}>
              <SalesByHour
                data={convertObjectToArray(dashboardData.sales_by_hour || {})}
                loading={loading}
              />
            </div>
          </div>
        </motion.div>
      </main>

      {/* CSV Upload Modal */}
      {uploadModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;