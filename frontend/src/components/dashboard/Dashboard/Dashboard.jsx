import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiDownload, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import MetricCard from '../MetricCard/MetricCard';
import SalesChart from '../SalesChart/SalesChart';
import TopItems from '../TopItems/TopItems';
import SalesByCategory from '../SalesByCategory/SalesByCategory';
import SalesByHour from '../SalesByHour/SalesByHour';
import AnomalyAlert from '../AnomalyAlert/AnomalyAlert';
import styles from './Dashboard.module.css';
import { formatCurrency } from '../../../utils/formatters';

const Dashboard = ({
  dashboardData = {},
  anomalies = [],
  loading = false,
  onRefresh,
  onDateRangeChange,
  onExport,
}) => {
  const [dateRange, setDateRange] = useState('30d');
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, comparison

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
      value: 450,
      change: 15.8,
      changeType: 'positive',
      icon: FiRefreshCw,
      color: 'success',
      sparklineData: [38, 42, 45, 48, 50, 52, 55, 58, 60, 62],
      comparisonText: 'vs last period',
    },
  ];

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={styles.dashboard}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Real-time insights into your restaurant performance
          </p>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.dateRangeSelector}>
            <FiCalendar className={styles.calendarIcon} />
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className={styles.dateRangeSelect}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className={styles.viewModeSelector}>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'overview' ? styles.active : ''}`}
              onClick={() => setViewMode('overview')}
            >
              Overview
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'detailed' ? styles.active : ''}`}
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'comparison' ? styles.active : ''}`}
              onClick={() => setViewMode('comparison')}
            >
              Compare
            </button>
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.refreshButton} onClick={onRefresh}>
              <FiRefreshCw size={18} />
              Refresh
            </button>
            <button className={styles.exportButton} onClick={onExport}>
              <FiDownload size={18} />
              Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <motion.div variants={itemVariants}>
          <AnomalyAlert anomalies={anomalies} maxVisible={3} autoExpand={false} />
        </motion.div>
      )}

      {/* Metrics Grid */}
      <motion.div className={styles.metricsGrid} variants={itemVariants}>
        {metricCards.map((metric, index) => (
          <MetricCard
            key={index}
            {...metric}
            loading={loading}
            onClick={() => console.log(`View ${metric.title} details`)}
          />
        ))}
      </motion.div>

      {/* Main Charts Grid */}
      <div className={styles.mainGrid}>
        <motion.div className={styles.mainChart} variants={itemVariants}>
          <SalesChart
            data={dashboardData.daily_sales || []}
            title="Revenue Trends"
            height={350}
            loading={loading}
            compareData={viewMode === 'comparison' ? dashboardData.previous_period_sales : null}
          />
        </motion.div>
        
        <motion.div className={styles.sideChart} variants={itemVariants}>
          <TopItems
            items={dashboardData.top_items || []}
            loading={loading}
          />
        </motion.div>
      </div>

      {/* Bottom Charts Grid */}
      <div className={styles.bottomGrid}>
        <motion.div className={styles.bottomChart} variants={itemVariants}>
          <SalesByCategory
            data={dashboardData.sales_by_category || []}
            loading={loading}
            chartType="doughnut"
          />
        </motion.div>
        
        <motion.div className={styles.bottomChart} variants={itemVariants}>
          <SalesByHour
            data={dashboardData.sales_by_hour || []}
            loading={loading}
          />
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div className={styles.quickStats} variants={itemVariants}>
        <div className={styles.quickStatCard}>
          <div className={styles.quickStatIcon}>
            <FiPlus size={24} />
          </div>
          <div className={styles.quickStatContent}>
            <h4>Today's Performance</h4>
            <div className={styles.quickStatValues}>
              <div className={styles.quickStatValue}>
                <span className={styles.valueLabel}>Revenue:</span>
                <span className={styles.valueAmount}>{formatCurrency(1250.50)}</span>
                <span className={styles.valueChange}>+12.5%</span>
              </div>
              <div className={styles.quickStatValue}>
                <span className={styles.valueLabel}>Orders:</span>
                <span className={styles.valueAmount}>42</span>
                <span className={styles.valueChange}>+8.3%</span>
              </div>
              <div className={styles.quickStatValue}>
                <span className={styles.valueLabel}>Avg. Order:</span>
                <span className={styles.valueAmount}>{formatCurrency(29.77)}</span>
                <span className={styles.valueChange}>+3.9%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.quickStatCard}>
          <div className={styles.quickStatIcon}>
            <FiCalendar size={24} />
          </div>
          <div className={styles.quickStatContent}>
            <h4>This Week</h4>
            <div className={styles.quickStatValues}>
              <div className={styles.quickStatValue}>
                <span className={styles.valueLabel}>Revenue:</span>
                <span className={styles.valueAmount}>{formatCurrency(8450.25)}</span>
                <span className={styles.valueChange}>+15.2%</span>
              </div>
              <div className={styles.quickStatValue}>
                <span className={styles.valueLabel}>Orders:</span>
                <span className={styles.valueAmount}>284</span>
                <span className={styles.valueChange}>+12.7%</span>
              </div>
              <div className={styles.quickStatValue}>
                <span className={styles.valueLabel}>Best Day:</span>
                <span className={styles.valueAmount}>Saturday</span>
                <span className={styles.valueChange}>+25.3%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.quickStatCard}>
          <div className={styles.quickStatIcon}>
            <FiRefreshCw size={24} />
          </div>
          <div className={styles.quickStatContent}>
            <h4>Live Updates</h4>
            <div className={styles.liveUpdates}>
              <div className={styles.updateItem}>
                <div className={styles.updateDot} />
                <span className={styles.updateText}>Processing 5 new orders</span>
                <span className={styles.updateTime}>2 min ago</span>
              </div>
              <div className={styles.updateItem}>
                <div className={styles.updateDot} />
                <span className={styles.updateText}>New peak hour detected</span>
                <span className={styles.updateTime}>15 min ago</span>
              </div>
              <div className={styles.updateItem}>
                <div className={styles.updateDot} />
                <span className={styles.updateText}>Weekly report ready</span>
                <span className={styles.updateTime}>1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;