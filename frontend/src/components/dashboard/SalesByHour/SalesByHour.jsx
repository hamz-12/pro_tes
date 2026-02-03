// In SalesByHour.jsx, update the component to handle button clicks
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiTrendingUp, FiTrendingDown, FiFilter } from 'react-icons/fi';
import styles from './SalesByHour.module.css';
import { formatCurrency, formatNumber } from '../../../utils/formatters';

const SalesByHour = ({ data = [], loading = false }) => {
  const [selectedHour, setSelectedHour] = useState(null);
  const [viewMode, setViewMode] = useState('revenue'); // 'revenue' or 'transactions'

  // Process hourly data
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      hourLabel: `${i}:00`,
      displayHour: i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`,
      total_revenue: 0,
      transaction_count: 0,
    }));

    // Fill in actual data
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        let hour = item.hour;
        
        // If hour is not directly available, try to extract from datetime
        if (hour === undefined && item.datetime) {
          const date = new Date(item.datetime);
          hour = date.getHours();
        }
        
        // Handle case where hour is a string
        if (typeof hour === 'string') {
          hour = parseInt(hour, 10);
        }
        
        if (hour >= 0 && hour <= 23) {
          hours[hour].total_revenue = item.total_revenue || 0;
          hours[hour].transaction_count = item.transaction_count || 0;
        }
      });
    } else if (data && typeof data === 'object') {
      // Handle case where data is an object with hour keys
      Object.entries(data).forEach(([hour, values]) => {
        const hourNum = parseInt(hour, 10);
        if (hourNum >= 0 && hourNum <= 23) {
          if (typeof values === 'object' && values !== null) {
            hours[hourNum].total_revenue = values.total_revenue || 0;
            hours[hourNum].transaction_count = values.transaction_count || 0;
          } else {
            hours[hourNum].total_revenue = values || 0;
          }
        }
      });
    }

    return hours;
  }, [data]);

  const maxRevenue = Math.max(...hourlyData.map(h => h.total_revenue));
  const maxTransactions = Math.max(...hourlyData.map(h => h.transaction_count));
  const totalRevenue = hourlyData.reduce((sum, h) => sum + h.total_revenue, 0);
  const totalTransactions = hourlyData.reduce((sum, h) => sum + h.transaction_count, 0);

  const peakHours = useMemo(() => {
    const sorted = [...hourlyData].sort((a, b) => b.total_revenue - a.total_revenue);
    return sorted.slice(0, 3);
  }, [hourlyData]);

  const getHourColor = (hour, value, maxValue) => {
    const percentage = maxValue > 0 ? (value / maxValue) : 0;
    
    if (percentage > 0.8) return '#10b981'; // Peak
    if (percentage > 0.5) return '#84cc16'; // High
    if (percentage > 0.3) return '#f59e0b'; // Medium
    if (percentage > 0.1) return '#f97316'; // Low
    return '#64748b'; // Very low
  };

  const getHourIntensity = (hour) => {
    if (hour >= 11 && hour <= 14) return 'Lunch Peak';
    if (hour >= 18 && hour <= 21) return 'Dinner Peak';
    if (hour >= 7 && hour <= 10) return 'Breakfast';
    if (hour >= 22 || hour <= 2) return 'Late Night';
    return 'Regular';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonChart} />
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FiClock size={48} />
          </div>
          <h3>No Hourly Data</h3>
          <p>Upload sales data to see hourly trends</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Sales by Hour</h3>
          <div className={styles.subtitle}>24-hour sales distribution</div>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Revenue</span>
            <span className={styles.statValue}>{formatCurrency(totalRevenue)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Transactions</span>
            <span className={styles.statValue}>{formatNumber(totalTransactions)}</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${viewMode === 'revenue' ? styles.active : ''}`}
            onClick={() => setViewMode('revenue')}
          >
            Revenue
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'transactions' ? styles.active : ''}`}
            onClick={() => setViewMode('transactions')}
          >
            Transactions
          </button>
        </div>
        
        <div className={styles.timeFilters}>
          <button className={styles.filterButton}>
            <FiFilter size={16} />
            Filter Hours
          </button>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.hourlyChart}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTimeLabels}>
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>12 AM</span>
            </div>
          </div>
          
          <div className={styles.chartBars}>
            {hourlyData.map((hourData) => {
              const value = viewMode === 'revenue' ? hourData.total_revenue : hourData.transaction_count;
              const maxValue = viewMode === 'revenue' ? maxRevenue : maxTransactions;
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const color = getHourColor(hourData.hour, value, maxValue);
              const isSelected = selectedHour === hourData.hour;
              const intensity = getHourIntensity(hourData.hour);
              
              return (
                <motion.div
                  key={hourData.hour} // Add key prop to fix React warning
                  className={`${styles.hourBarContainer} ${isSelected ? styles.selected : ''}`}
                  onClick={() => setSelectedHour(isSelected ? null : hourData.hour)}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: hourData.hour * 0.02, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                >
                  <div className={styles.hourLabel}>{hourData.hour}</div>
                  <div className={styles.barWrapper}>
                    <motion.div
                      className={styles.hourBar}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: hourData.hour * 0.02 + 0.2, duration: 0.8 }}
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <div className={styles.hourInfo}>
                    <span className={styles.hourTime}>{hourData.displayHour}</span>
                    <span className={styles.hourValue}>
                      {viewMode === 'revenue'
                        ? formatCurrency(value)
                        : formatNumber(value)
                      }
                    </span>
                    <span className={styles.hourIntensity}>{intensity}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className={styles.peakHours}>
          <h4 className={styles.peakTitle}>
            <FiTrendingUp /> Peak Hours
          </h4>
          <div className={styles.peakList}>
            {peakHours.map((peak, index) => (
              <motion.div
                key={`peak-${index}`} // Add key prop to fix React warning
                className={styles.peakItem}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={styles.peakRank}>
                  <span className={styles.rankNumber}>#{index + 1}</span>
                </div>
                <div className={styles.peakContent}>
                  <div className={styles.peakHour}>{peak.displayHour}</div>
                  <div className={styles.peakStats}>
                    <span className={styles.peakRevenue}>
                      {formatCurrency(peak.total_revenue)}
                    </span>
                    <span className={styles.peakTransactions}>
                      {peak.transaction_count} transactions
                    </span>
                  </div>
                </div>
                <div className={styles.peakPercentage}>
                  {totalRevenue > 0 ? ((peak.total_revenue / totalRevenue) * 100).toFixed(1) : 0}%
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className={styles.recommendations}>
            <h5>Recommendations</h5>
            <ul>
              {peakHours[0] && (
                <li>Focus marketing efforts around {peakHours[0].displayHour} peak hour</li>
              )}
              {hourlyData.slice(0, 6).some(h => h.total_revenue === 0) && (
                <li>Consider opening earlier or special promotions for slow morning hours</li>
              )}
              {hourlyData[21].total_revenue > hourlyData[22].total_revenue && (
                <li>Late night hours show potential for extended operations</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {selectedHour !== null && (
        <motion.div
          className={styles.detailPanel}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className={styles.detailHeader}>
            <h4>Hour {selectedHour}:00 Details</h4>
            <button
              className={styles.closeDetail}
              onClick={() => setSelectedHour(null)}
            >
              ×
            </button>
          </div>
          
          <div className={styles.detailContent}>
            <div className={styles.detailGrid}>
              <div className={styles.detailStat}>
                <span className={styles.detailLabel}>Revenue</span>
                <span className={styles.detailValue}>
                  {formatCurrency(hourlyData[selectedHour].total_revenue)}
                </span>
                <span className={styles.detailTrend}>
                  <FiTrendingUp /> +12.5% vs average
                </span>
              </div>
              
              <div className={styles.detailStat}>
                <span className={styles.detailLabel}>Transactions</span>
                <span className={styles.detailValue}>
                  {hourlyData[selectedHour].transaction_count}
                </span>
                <span className={styles.detailTrend}>
                  <FiTrendingUp /> +8.3% vs average
                </span>
              </div>
              
              <div className={styles.detailStat}>
                <span className={styles.detailLabel}>Avg. Transaction</span>
                <span className={styles.detailValue}>
                  {formatCurrency(
                    hourlyData[selectedHour].total_revenue /
                    Math.max(hourlyData[selectedHour].transaction_count, 1)
                  )}
                </span>
                <span className={styles.detailTrend}>
                  <FiTrendingUp /> +3.9% vs average
                </span>
              </div>
              
              <div className={styles.detailStat}>
                <span className={styles.detailLabel}>Hour Category</span>
                <span className={styles.detailValue}>
                  {getHourIntensity(selectedHour)}
                </span>
                <span className={styles.detailTrend}>
                  {getHourIntensity(selectedHour) === 'Peak' ? '🚀 High Demand' : '📊 Regular'}
                </span>
              </div>
            </div>
            
            <div className={styles.detailActions}>
              <button className={styles.actionButton}>
                Set Special Promotion
              </button>
              <button className={styles.actionButton}>
                Adjust Staffing
              </button>
              <button className={styles.actionButton}>
                View Hourly Menu Items
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SalesByHour;