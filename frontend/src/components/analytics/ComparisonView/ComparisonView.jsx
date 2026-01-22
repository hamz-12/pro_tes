import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiPieChart, 
  FiBarChart2,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiMaximize,
  FiShare2,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import styles from './ComparisonView.module.css';

const ComparisonView = ({ data = [], loading = false, compareMode = 'period', onComparisonChange }) => {
  const [viewType, setViewType] = useState('bar');
  const [comparisonType, setComparisonType] = useState('period');
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'transactions', 'avg_order_value']);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const metrics = [
    { id: 'revenue', label: 'Revenue', color: '#8b5cf6' },
    { id: 'transactions', label: 'Transactions', color: '#60a5fa' },
    { id: 'avg_order_value', label: 'Avg Order Value', color: '#10b981' },
    { id: 'customers', label: 'Customers', color: '#f59e0b' },
    { id: 'items_sold', label: 'Items Sold', color: '#ec4899' },
    { id: 'profit_margin', label: 'Profit Margin', color: '#06b6d4' },
  ];

  // Mock comparison data
  const comparisonData = useMemo(() => {
    const periods = [
      { period: 'Current Period', color: '#8b5cf6' },
      { period: 'Previous Period', color: '#60a5fa' },
      { period: 'Same Period Last Year', color: '#10b981' },
    ];

    return metrics.map(metric => ({
      metric: metric.label,
      ...periods.reduce((acc, period, idx) => ({
        ...acc,
        [period.period]: Math.random() * 100000 + 50000 * (idx + 1),
      }), {}),
    }));
  }, [metrics]);

  // Mock time series data
  const timeSeriesData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        current: Math.random() * 10000 + 5000,
        previous: Math.random() * 10000 + 4500,
        lastYear: Math.random() * 10000 + 4000,
      };
    });
  }, []);

  // Mock category comparison data
  const categoryData = useMemo(() => {
    const categories = ['Main Course', 'Appetizers', 'Desserts', 'Beverages', 'Sides'];
    return categories.map(category => ({
      category,
      current: Math.random() * 50000 + 10000,
      previous: Math.random() * 45000 + 8000,
      growth: Math.random() * 100 - 30,
    }));
  }, []);

  const handleMetricToggle = (metricId) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const calculateSummary = () => {
    const currentTotal = comparisonData.reduce((sum, item) => sum + item['Current Period'], 0);
    const previousTotal = comparisonData.reduce((sum, item) => sum + item['Previous Period'], 0);
    const change = ((currentTotal - previousTotal) / previousTotal) * 100;
    
    return {
      total: currentTotal,
      change,
      direction: change >= 0 ? 'up' : 'down',
      formattedChange: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
    };
  };

  const summary = calculateSummary();

  const renderChart = () => {
    const dataToUse = comparisonData.filter(item => 
      selectedMetrics.includes(metrics.find(m => m.label === item.metric)?.id)
    );

    switch (viewType) {
      case 'radar':
        return (
          <RadarChart data={dataToUse}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis 
              dataKey="metric" 
              stroke="var(--color-text-secondary)"
              tick={{ fill: 'var(--color-text-tertiary)' }}
            />
            <PolarRadiusAxis 
              stroke="var(--color-text-secondary)"
              tick={{ fill: 'var(--color-text-tertiary)' }}
            />
            <Radar 
              name="Current Period" 
              dataKey="Current Period" 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              fillOpacity={0.3}
            />
            <Radar 
              name="Previous Period" 
              dataKey="Previous Period" 
              stroke="#60a5fa" 
              fill="#60a5fa" 
              fillOpacity={0.3}
            />
            <Legend />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
              }}
            />
          </RadarChart>
        );

      case 'line':
        return (
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-text-secondary)"
              tick={{ fill: 'var(--color-text-tertiary)' }}
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              tick={{ fill: 'var(--color-text-tertiary)' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="previous" 
              stroke="#60a5fa" 
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="lastYear" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
            />
          </LineChart>
        );

      default: // bar
        return (
          <BarChart data={dataToUse}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="metric" 
              stroke="var(--color-text-secondary)"
              tick={{ fill: 'var(--color-text-tertiary)' }}
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              tick={{ fill: 'var(--color-text-tertiary)' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Legend />
            <Bar 
              dataKey="Current Period" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
            <Bar 
              dataKey="Previous Period" 
              fill="#60a5fa" 
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
            <Bar 
              dataKey="Same Period Last Year" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        );
    }
  };

  return (
    <motion.div 
      className={`${styles.comparisonView} ${isFullscreen ? styles.fullscreen : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Comparison Analysis</h2>
          <p className={styles.subtitle}>
            Compare performance across different time periods and metrics
          </p>
        </div>
        
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>
            ${(summary.total / 1000).toFixed(1)}k
          </div>
          <div className={`${styles.summaryChange} ${styles[summary.direction]}`}>
            {summary.direction === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
            <span>{summary.formattedChange}</span>
          </div>
          <div className={styles.summaryLabel}>vs Previous Period</div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <h4 className={styles.controlLabel}>Comparison Type</h4>
          <div className={styles.comparisonTypeSelector}>
            <button
              className={`${styles.comparisonTypeButton} ${comparisonType === 'period' ? styles.active : ''}`}
              onClick={() => setComparisonType('period')}
            >
              <FiCalendar size={16} />
              <span>Time Period</span>
            </button>
            <button
              className={`${styles.comparisonTypeButton} ${comparisonType === 'category' ? styles.active : ''}`}
              onClick={() => setComparisonType('category')}
            >
              <FiPieChart size={16} />
              <span>Category</span>
            </button>
            <button
              className={`${styles.comparisonTypeButton} ${comparisonType === 'metric' ? styles.active : ''}`}
              onClick={() => setComparisonType('metric')}
            >
              <FiBarChart2 size={16} />
              <span>Metrics</span>
            </button>
          </div>
        </div>
        
        <div className={styles.controlGroup}>
          <h4 className={styles.controlLabel}>View Type</h4>
          <div className={styles.viewTypeSelector}>
            <button
              className={`${styles.viewTypeButton} ${viewType === 'bar' ? styles.active : ''}`}
              onClick={() => setViewType('bar')}
            >
              <FiBarChart2 size={16} />
              <span>Bar</span>
            </button>
            <button
              className={`${styles.viewTypeButton} ${viewType === 'line' ? styles.active : ''}`}
              onClick={() => setViewType('line')}
            >
              <FiTrendingUp size={16} />
              <span>Line</span>
            </button>
            <button
              className={`${styles.viewTypeButton} ${viewType === 'radar' ? styles.active : ''}`}
              onClick={() => setViewType('radar')}
            >
              <FiPieChart size={16} />
              <span>Radar</span>
            </button>
          </div>
        </div>
        
        <div className={styles.controlGroup}>
          <h4 className={styles.controlLabel}>Actions</h4>
          <div className={styles.actionButtons}>
            <button className={styles.actionButton}>
              <FiFilter size={16} />
              <span>Filter</span>
            </button>
            <button className={styles.actionButton}>
              <FiDownload size={16} />
              <span>Export</span>
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <FiMaximize size={16} />
              <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
            <button className={styles.actionButton}>
              <FiShare2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Selector */}
      <div className={styles.metricsSelector}>
        <h4 className={styles.metricsTitle}>Select Metrics</h4>
        <div className={styles.metricsGrid}>
          {metrics.map((metric) => (
            <button
              key={metric.id}
              className={`${styles.metricButton} ${selectedMetrics.includes(metric.id) ? styles.selected : ''}`}
              onClick={() => handleMetricToggle(metric.id)}
              style={{ '--metric-color': metric.color }}
            >
              <div className={styles.metricColor} style={{ backgroundColor: metric.color }} />
              <span className={styles.metricLabel}>{metric.label}</span>
              {selectedMetrics.includes(metric.id) && (
                <div className={styles.metricCheck} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Category Comparison */}
      {comparisonType === 'category' && (
        <div className={styles.categoryComparison}>
          <h3 className={styles.sectionTitle}>Category Performance</h3>
          <div className={styles.categoryGrid}>
            {categoryData.map((category) => (
              <motion.div
                key={category.category}
                className={styles.categoryCard}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.categoryHeader}>
                  <h4 className={styles.categoryName}>{category.category}</h4>
                  <div className={`${styles.growthIndicator} ${category.growth >= 0 ? styles.positive : styles.negative}`}>
                    {category.growth >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    <span>{category.growth >= 0 ? '+' : ''}{category.growth.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className={styles.categoryMetrics}>
                  <div className={styles.categoryMetric}>
                    <span className={styles.metricLabel}>Current</span>
                    <span className={styles.metricValue}>${(category.current / 1000).toFixed(1)}k</span>
                  </div>
                  <div className={styles.categoryMetric}>
                    <span className={styles.metricLabel}>Previous</span>
                    <span className={styles.metricValue}>${(category.previous / 1000).toFixed(1)}k</span>
                  </div>
                </div>
                
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${(category.current / (category.current + category.previous)) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className={styles.insights}>
        <h3 className={styles.sectionTitle}>Key Insights</h3>
        <div className={styles.insightsGrid}>
          <motion.div 
            className={styles.insightCard}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.insightIcon} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
              <FiTrendingUp size={24} color="#8b5cf6" />
            </div>
            <div className={styles.insightContent}>
              <h4>Revenue Growth</h4>
              <p>Revenue increased by 15.2% compared to previous period</p>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.insightCard}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.insightIcon} style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)' }}>
              <FiBarChart2 size={24} color="#60a5fa" />
            </div>
            <div className={styles.insightContent}>
              <h4>Transaction Volume</h4>
              <p>12.7% increase in transaction count with higher average value</p>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.insightCard}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.insightIcon} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <FiPieChart size={24} color="#10b981" />
            </div>
            <div className={styles.insightContent}>
              <h4>Category Mix</h4>
              <p>Main course category showing strongest growth at 22.3%</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Data Table */}
      <div className={styles.dataTable}>
        <h3 className={styles.sectionTitle}>Comparison Data</h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current Period</th>
                <th>Previous Period</th>
                <th>Last Year</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => {
                const change = ((row['Current Period'] - row['Previous Period']) / row['Previous Period']) * 100;
                return (
                  <tr key={index}>
                    <td className={styles.metricCell}>{row.metric}</td>
                    <td className={styles.valueCell}>${(row['Current Period'] / 1000).toFixed(1)}k</td>
                    <td className={styles.valueCell}>${(row['Previous Period'] / 1000).toFixed(1)}k</td>
                    <td className={styles.valueCell}>${(row['Same Period Last Year'] / 1000).toFixed(1)}k</td>
                    <td className={`${styles.changeCell} ${change >= 0 ? styles.positive : styles.negative}`}>
                      {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default ComparisonView;