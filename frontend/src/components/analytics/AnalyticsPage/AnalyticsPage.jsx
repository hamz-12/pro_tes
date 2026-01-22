import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAlertTriangle, FiPieChart, FiDownload, FiShare2, FiBookmark, FiFilter, FiCalendar } from 'react-icons/fi';
import TrendAnalysis from '../TrendAnalysis/TrendAnalysis';
import AnomalyDetection from '../AnomalyDetection/AnomalyDetection';
import ComparisonView from '../ComparisonView/ComparisonView';
import styles from './AnalyticsPage.module.css';

const AnalyticsPage = ({ data, loading = false, onDateRangeChange, onExport, onShare }) => {
  const [activeTab, setActiveTab] = useState('trends');
  const [dateRange, setDateRange] = useState('30d');
  const [aiInsights, setAiInsights] = useState([]);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    severity: 'all',
    confidence: 0.7,
  });

  useEffect(() => {
    // Simulate fetching AI insights
    const mockInsights = [
      {
        id: 1,
        title: 'Weekend Revenue Spike',
        description: 'Revenue increases by 35% on weekends compared to weekdays',
        confidence: 0.92,
        impact: 'high',
        trend: 'up',
        category: 'revenue',
      },
      {
        id: 2,
        title: 'Lunch Hour Optimization',
        description: 'Add 15% more staff between 12-2 PM to reduce wait times',
        confidence: 0.87,
        impact: 'medium',
        trend: 'neutral',
        category: 'operations',
      },
      {
        id: 3,
        title: 'MenuItem Popularity Shift',
        description: 'Vegetarian options increased by 22% in the last quarter',
        confidence: 0.78,
        impact: 'medium',
        trend: 'up',
        category: 'menu',
      },
    ];
    setAiInsights(mockInsights);
  }, []);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  const handleBookmark = (item) => {
    if (bookmarkedItems.some(bm => bm.id === item.id)) {
      setBookmarkedItems(bookmarkedItems.filter(bm => bm.id !== item.id));
    } else {
      setBookmarkedItems([...bookmarkedItems, item]);
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
      className={styles.analyticsPage}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Advanced Analytics</h1>
          <p className={styles.subtitle}>
            AI-powered insights and trend analysis for data-driven decisions
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
          
          <div className={styles.actionButtons}>
            <button className={styles.actionButton} onClick={onExport}>
              <FiDownload size={18} />
              <span>Export</span>
            </button>
            <button className={styles.actionButton} onClick={onShare}>
              <FiShare2 size={18} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div className={styles.navigationTabs} variants={itemVariants}>
        <button
          className={`${styles.tab} ${activeTab === 'trends' ? styles.active : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          <FiTrendingUp size={20} />
          <span>Trend Analysis</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'anomalies' ? styles.active : ''}`}
          onClick={() => setActiveTab('anomalies')}
        >
          <FiAlertTriangle size={20} />
          <span>Anomaly Detection</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'comparison' ? styles.active : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          <FiPieChart size={20} />
          <span>Comparison View</span>
        </button>
      </motion.div>

      {/* AI Insights Panel */}
      <motion.div className={styles.aiInsightsPanel} variants={itemVariants}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>
            <span className={styles.aiBadge}>AI</span> Generated Insights
          </h3>
          <div className={styles.panelActions}>
            <button className={styles.filterButton}>
              <FiFilter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        <div className={styles.insightsGrid}>
          {aiInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              className={styles.insightCard}
              variants={itemVariants}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={styles.insightHeader}>
                <div className={styles.insightMeta}>
                  <span className={`${styles.impactBadge} ${styles[insight.impact]}`}>
                    {insight.impact}
                  </span>
                  <span className={styles.confidence}>
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
                <button
                  className={`${styles.bookmarkButton} ${
                    bookmarkedItems.some(bm => bm.id === insight.id) ? styles.bookmarked : ''
                  }`}
                  onClick={() => handleBookmark(insight)}
                >
                  <FiBookmark size={18} />
                </button>
              </div>
              
              <h4 className={styles.insightTitle}>{insight.title}</h4>
              <p className={styles.insightDescription}>{insight.description}</p>
              
              <div className={styles.insightTrend}>
                <div className={styles.trendIndicator}>
                  <div className={`${styles.trendArrow} ${styles[insight.trend]}`} />
                  <span className={styles.trendText}>
                    {insight.trend === 'up' ? 'Increasing' : 
                     insight.trend === 'down' ? 'Decreasing' : 'Stable'}
                  </span>
                </div>
                <span className={styles.insightCategory}>{insight.category}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {activeTab === 'trends' && (
          <motion.div
            className={styles.tabContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TrendAnalysis
              data={data?.trends || []}
              loading={loading}
              filters={filters}
              onFilterChange={setFilters}
            />
          </motion.div>
        )}
        
        {activeTab === 'anomalies' && (
          <motion.div
            className={styles.tabContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnomalyDetection
              data={data?.anomalies || []}
              loading={loading}
              onActionTaken={(anomaly, action) => {
                console.log(`Action taken on anomaly ${anomaly.id}: ${action}`);
              }}
            />
          </motion.div>
        )}
        
        {activeTab === 'comparison' && (
          <motion.div
            className={styles.tabContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ComparisonView
              data={data?.comparison || []}
              loading={loading}
              compareMode="period"
              onComparisonChange={(mode) => console.log(`Comparison mode: ${mode}`)}
            />
          </motion.div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <motion.div className={styles.quickStats} variants={itemVariants}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiTrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <h4>Patterns Detected</h4>
            <p className={styles.statValue}>24</p>
            <p className={styles.statChange}>+3 this week</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiAlertTriangle size={24} />
          </div>
          <div className={styles.statContent}>
            <h4>Anomalies Found</h4>
            <p className={styles.statValue}>7</p>
            <p className={styles.statChange}>-2 this week</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiPieChart size={24} />
          </div>
          <div className={styles.statContent}>
            <h4>Accuracy Rate</h4>
            <p className={styles.statValue}>94.2%</p>
            <p className={styles.statChange}>+1.5% improvement</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiBookmark size={24} />
          </div>
          <div className={styles.statContent}>
            <h4>Saved Insights</h4>
            <p className={styles.statValue}>{bookmarkedItems.length}</p>
            <p className={styles.statChange}>
              {bookmarkedItems.length > 0 ? 'Ready for review' : 'No items saved'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsPage;