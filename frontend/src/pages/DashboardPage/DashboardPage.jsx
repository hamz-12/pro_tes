// frontend/src/pages/DashboardPage/DashboardPage.jsx
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
import dashboardService from '../../services/dashboardService';
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
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State management
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
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
      const restaurantsData = await dashboardService.getRestaurants();
      setRestaurants(restaurantsData);
      
      // Select first restaurant by default
      if (restaurantsData.length > 0) {
        setSelectedRestaurant(restaurantsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!selectedRestaurant) return;
    
    try {
      setRefreshing(true);
      const { startDate, endDate } = getDateRange(dateRange);
      
      const analyticsData = await dashboardService.getAnalytics(
        selectedRestaurant,
        startDate,
        endDate
      );
      
      setDashboardData(analyticsData);
      setAnomalies(analyticsData.anomalies || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    // In a real implementation, this would call an export API
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
      setCsvFile(file);
      previewCSVColumns(file);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const previewCSVColumns = async (file) => {
    try {
      const response = await dashboardService.previewCSVColumns(file);
      setCsvColumns(response.columns);
      
      // Initialize default mapping (first column to date, second to revenue, etc.)
      const defaultMapping = {};
      if (response.columns.length >= 2) {
        defaultMapping[response.columns[0]] = 'date';
        defaultMapping[response.columns[1]] = 'total_sales';
        if (response.columns.length >= 3) {
          defaultMapping[response.columns[2]] = 'total_quantity';
        }
      }
      setColumnMapping(defaultMapping);
    } catch (error) {
      console.error('Error previewing CSV columns:', error);
      toast.error('Failed to preview CSV columns');
    }
  };

  const handleColumnMappingChange = (column, field) => {
    setColumnMapping(prev => ({
      ...prev,
      [column]: field
    }));
  };

  const handleUploadCSV = async () => {
    if (!csvFile || !selectedRestaurant) return;
    
    try {
      setUploading(true);
      await dashboardService.uploadCSV(csvFile, selectedRestaurant, columnMapping);
      toast.success('CSV uploaded successfully');
      setUploadModalOpen(false);
      setCsvFile(null);
      setCsvColumns([]);
      setColumnMapping({});
      
      // Refresh dashboard data after upload
      fetchDashboardData();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Failed to upload CSV');
    } finally {
      setUploading(false);
    }
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

  return (
    <div className={styles.dashboardPage}>
      {/* Header */}
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
              {restaurants.map(restaurant => (
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
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className={styles.headerActions}>
            <button
              className={styles.uploadButton}
              onClick={() => fileInputRef.current.click()}
              title="Upload CSV"
            >
              <FiUpload size={18} />
              Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
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
              {anomalies.filter(a => !a.acknowledged).length > 0 && (
                <span className={styles.notificationBadge}>
                  {anomalies.filter(a => !a.acknowledged).length}
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
                    anomalies.map(anomaly => (
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

      {/* Main Content */}
      <main className={styles.mainContent}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Anomaly Alerts */}
          {anomalies.length > 0 && (
            <AnomalyAlert anomalies={anomalies} maxVisible={3} autoExpand={false} />
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
                <p>Match your CSV columns to our data fields:</p>
                
                <div className={styles.columnMapping}>
                  {csvColumns.map(column => (
                    <div key={column} className={styles.mappingRow}>
                      <span className={styles.columnName}>{column}</span>
                      <select
                        value={columnMapping[column] || ''}
                        onChange={(e) => handleColumnMappingChange(column, e.target.value)}
                        className={styles.fieldSelect}
                      >
                        <option value="">-- Select Field --</option>
                        <option value="date">Date</option>
                        <option value="total_sales">Total Sales</option>
                        <option value="total_quantity">Total Quantity</option>
                        <option value="item_name">Item Name</option>
                        <option value="category">Category</option>
                      </select>
                    </div>
                  ))}
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
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.modalBody}>
                <div className={styles.fileDropArea}>
                  <FiUpload size={48} />
                  <h3>Drop your CSV file here or click to browse</h3>
                  <p>Supported format: CSV</p>
                  <input
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