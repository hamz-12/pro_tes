import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiActivity, 
  FiFilter, 
  FiDownload, 
  FiMaximize,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiMap
} from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
         AreaChart, Area } from 'recharts';
import styles from './TrendAnalysis.module.css';

const TrendAnalysis = ({ data = [], loading = false, filters = {}, onFilterChange }) => {
  const [chartType, setChartType] = useState('line');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [timeGranularity, setTimeGranularity] = useState('daily');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mock data for demonstration
  const mockData = useMemo(() => {
    const baseData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 10000 + 5000,
        transactions: Math.floor(Math.random() * 200) + 100,
        avgOrderValue: Math.random() * 50 + 20,
        customers: Math.floor(Math.random() * 150) + 50,
        previousRevenue: Math.random() * 10000 + 4500,
      };
    });
    return baseData;
  }, []);

  const metrics = [
    { id: 'revenue', label: 'Revenue', color: '#8b5cf6', icon: FiTrendingUp },
    { id: 'transactions', label: 'Transactions', color: '#60a5fa', icon: FiActivity },
    { id: 'avgOrderValue', label: 'Avg Order Value', color: '#10b981', icon: FiBarChart2 },
    { id: 'customers', label: 'Customers', color: '#f59e0b', icon: FiMap },
  ];

  const trends = [
    {
      id: 1,
      name: 'Weekend Revenue Boost',
      direction: 'up',
      strength: 'strong',
      confidence: 0.92,
      description: 'Revenue increases by 35% on weekends',
      impact: 'High',
      recommendation: 'Consider special weekend promotions',
    },
    {
      id: 2,
      name: 'Lunch Rush Decline',
      direction: 'down',
      strength: 'moderate',
      confidence: 0.78,
      description: 'Lunch hour transactions decreasing by 15%',
      impact: 'Medium',
      recommendation: 'Review lunch menu pricing',
    },
    {
      id: 3,
      name: 'Evening Surge',
      direction: 'up',
      strength: 'strong',
      confidence: 0.88,
      description: 'Evening orders increased by 25%',
      impact: 'High',
      recommendation: 'Extend evening hours',
    },
  ];

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Revenue,Transactions,AvgOrderValue,Customers\n"
      + mockData.map(row => 
          `${row.date},${row.revenue},${row.transactions},${row.avgOrderValue},${row.customers}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trend_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderChart = () => {
    const chartData = mockData.map(item => ({
      ...item,
      [selectedMetric]: item[selectedMetric],
    }));

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
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
            <Area 
              type="monotone" 
              dataKey={selectedMetric}
              stroke={metrics.find(m => m.id === selectedMetric)?.color}
              fill={metrics.find(m => m.id === selectedMetric)?.color}
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="previousRevenue"
              stroke="rgba(255,255,255,0.3)"
              fill="rgba(255,255,255,0.1)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
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
            <Bar 
              dataKey={selectedMetric}
              fill={metrics.find(m => m.id === selectedMetric)?.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
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
              dataKey={selectedMetric}
              stroke={metrics.find(m => m.id === selectedMetric)?.color}
              strokeWidth={3}
              dot={{ strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="previousRevenue"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
            />
          </LineChart>
        );
    }
  };

  return (
    <motion.div 
      className={`${styles.trendAnalysis} ${isFullscreen ? styles.fullscreen : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chart Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <div className={styles.metricSelector}>
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <button
                  key={metric.id}
                  className={`${styles.metricButton} ${selectedMetric === metric.id ? styles.active : ''}`}
                  onClick={() => setSelectedMetric(metric.id)}
                  style={{ '--metric-color': metric.color }}
                >
                  <Icon size={16} />
                  <span>{metric.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className={styles.controlGroup}>
          <div className={styles.chartTypeSelector}>
            <button
              className={`${styles.chartTypeButton} ${chartType === 'line' ? styles.active : ''}`}
              onClick={() => setChartType('line')}
            >
              <FiTrendingUp size={16} />
              <span>Line</span>
            </button>
            <button
              className={`${styles.chartTypeButton} ${chartType === 'area' ? styles.active : ''}`}
              onClick={() => setChartType('area')}
            >
              <FiActivity size={16} />
              <span>Area</span>
            </button>
            <button
              className={`${styles.chartTypeButton} ${chartType === 'bar' ? styles.active : ''}`}
              onClick={() => setChartType('bar')}
            >
              <FiBarChart2 size={16} />
              <span>Bar</span>
            </button>
          </div>
          
          <div className={styles.timeSelector}>
            <FiCalendar className={styles.calendarIcon} />
            <select
              value={timeGranularity}
              onChange={(e) => setTimeGranularity(e.target.value)}
              className={styles.timeSelect}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        
        <div className={styles.actionButtons}>
          <button className={styles.actionButton} onClick={() => onFilterChange?.({ ...filters })}>
            <FiFilter size={16} />
            <span>Filter</span>
          </button>
          <button className={styles.actionButton} onClick={handleExport}>
            <FiDownload size={16} />
            <span>Export</span>
          </button>
          <button 
            className={styles.actionButton} 
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <FiMaximize size={16} />
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Trend Insights */}
      <div className={styles.trendInsights}>
        <h3 className={styles.insightsTitle}>Detected Trends</h3>
        <div className={styles.trendsGrid}>
          {trends.map((trend) => (
            <motion.div
              key={trend.id}
              className={styles.trendCard}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.trendHeader}>
                <div className={styles.trendName}>
                  {trend.direction === 'up' ? (
                    <FiTrendingUp className={styles.trendIconUp} />
                  ) : (
                    <FiTrendingDown className={styles.trendIconDown} />
                  )}
                  <h4>{trend.name}</h4>
                </div>
                <div className={styles.trendMeta}>
                  <span className={`${styles.strengthBadge} ${styles[trend.strength]}`}>
                    {trend.strength}
                  </span>
                  <span className={styles.confidence}>
                    {Math.round(trend.confidence * 100)}%
                  </span>
                </div>
              </div>
              
              <p className={styles.trendDescription}>{trend.description}</p>
              
              <div className={styles.trendFooter}>
                <div className={styles.impact}>
                  <span className={styles.impactLabel}>Impact:</span>
                  <span className={`${styles.impactValue} ${styles[trend.impact.toLowerCase()]}`}>
                    {trend.impact}
                  </span>
                </div>
                <button className={styles.recommendationButton}>
                  View Recommendation
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Statistical Summary */}
      <div className={styles.statsSummary}>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Correlation Strength</div>
          <div className={styles.statValue}>0.87</div>
          <div className={styles.statBar}>
            <div 
              className={styles.statBarFill} 
              style={{ width: '87%' }}
            />
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Seasonality Score</div>
          <div className={styles.statValue}>0.92</div>
          <div className={styles.statBar}>
            <div 
              className={styles.statBarFill} 
              style={{ width: '92%' }}
            />
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Predictive Accuracy</div>
          <div className={styles.statValue}>0.78</div>
          <div className={styles.statBar}>
            <div 
              className={styles.statBarFill} 
              style={{ width: '78%' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrendAnalysis;