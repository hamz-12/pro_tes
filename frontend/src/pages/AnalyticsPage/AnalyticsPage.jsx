import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnalyticsComponent from '../../components/analytics/AnalyticsPage/AnalyticsPage';
import styles from './AnalyticsPage.module.css';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching analytics data
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockData = {
          trends: [
            { date: '2024-01-01', revenue: 15000, transactions: 450, avgOrderValue: 33.33 },
            { date: '2024-01-02', revenue: 16500, transactions: 480, avgOrderValue: 34.38 },
            { date: '2024-01-03', revenue: 14200, transactions: 430, avgOrderValue: 33.02 },
            { date: '2024-01-04', revenue: 17800, transactions: 520, avgOrderValue: 34.23 },
            { date: '2024-01-05', revenue: 19200, transactions: 550, avgOrderValue: 34.91 },
            { date: '2024-01-06', revenue: 21000, transactions: 580, avgOrderValue: 36.21 },
            { date: '2024-01-07', revenue: 18500, transactions: 510, avgOrderValue: 36.27 },
          ],
          anomalies: [
            {
              id: 1,
              title: 'Revenue Spike Detected',
              description: 'Unusual 25% increase in revenue on Saturday',
              severity: 'high',
              status: 'investigating',
              detectedAt: '2024-01-06T14:30:00Z',
              impact: 'High',
              confidence: 0.92,
            },
            {
              id: 2,
              title: 'Transaction Pattern Change',
              description: 'Shift in transaction volume patterns detected',
              severity: 'medium',
              status: 'pending',
              detectedAt: '2024-01-05T10:15:00Z',
              impact: 'Medium',
              confidence: 0.78,
            },
          ],
          comparison: {
            current: 125000,
            previous: 108000,
            change: 15.7,
            metrics: ['revenue', 'transactions', 'avg_order_value'],
          },
        };
        
        setAnalyticsData(mockData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const handleDateRangeChange = (range) => {
    console.log('Date range changed:', range);
    // In a real app, this would trigger a new data fetch
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
    // In a real app, this would trigger data export
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing analytics insights...');
    // In a real app, this would open a share dialog
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h2>Error Loading Analytics</h2>
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={styles.analyticsPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnalyticsComponent
        data={analyticsData}
        loading={loading}
        onDateRangeChange={handleDateRangeChange}
        onExport={handleExport}
        onShare={handleShare}
      />
    </motion.div>
  );
};

export default AnalyticsPage;