// frontend/src/components/dashboard/SalesByCategory/SalesByCategory.jsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Doughnut, Pie } from 'react-chartjs-2';
import { FiPieChart, FiBarChart2, FiChevronRight, FiFilter } from 'react-icons/fi';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import styles from './SalesByCategory.module.css';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const SalesByCategory = ({ data = [], loading = false, chartType = 'doughnut' }) => {
  const [type, setType] = useState(chartType);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('revenue');

  const processedData = useMemo(() => {
    // Handle different data structures
    let dataArray = [];
    
    if (Array.isArray(data)) {
      dataArray = data;
    } else if (data && typeof data === 'object') {
      // Convert object to array
      dataArray = Object.entries(data).map(([category, values]) => {
        if (typeof values === 'object' && values !== null) {
          return { category, ...values };
        }
        return { category, total_revenue: values };
      });
    }
    
    if (dataArray.length === 0) {
      return { chartData: null, totalRevenue: 0, sortedData: [] };
    }

    const validData = dataArray.filter(item => 
      item && item.category && (item.total_revenue > 0 || item.revenue > 0)
    );
    
    if (validData.length === 0) {
      return { chartData: null, totalRevenue: 0, sortedData: [] };
    }

    const sortedData = [...validData].sort((a, b) => {
      const aValue = a.total_revenue || a.revenue || 0;
      const bValue = b.total_revenue || b.revenue || 0;
      
      if (sortBy === 'revenue') return bValue - aValue;
      
      if (sortBy === 'percentage') {
        const aPercentage = totalRevenue > 0 ? (aValue / totalRevenue) * 100 : 0;
        const bPercentage = totalRevenue > 0 ? (bValue / totalRevenue) * 100 : 0;
        return bPercentage - aPercentage;
      }
      
      return 0;
    });

    const totalRevenue = sortedData.reduce((sum, item) => sum + (item.total_revenue || item.revenue || 0), 0);

    const colors = [
      '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
      '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
    ];

    const chartData = {
      labels: sortedData.map(item => item.category),
      datasets: [
        {
          data: sortedData.map(item => item.total_revenue || item.revenue || 0),
          backgroundColor: colors.slice(0, sortedData.length),
          borderColor: colors.slice(0, sortedData.length).map(color => color + '80'),
          borderWidth: 2,
          hoverOffset: 20,
        },
      ],
    };

    return { chartData, totalRevenue, sortedData };
  }, [data, sortBy]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: type === 'doughnut' ? '60%' : 0,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 33, 57, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = processedData.totalRevenue;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return [
              `${context.label}: ${formatCurrency(value)}`,
              `Percentage: ${percentage}%`,
            ];
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 33, 57, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(51, 65, 85, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Inter',
            size: 11,
          },
          callback: (value) => formatCurrency(value),
        },
      },
    },
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonChart} />
      </div>
    );
  }

  if (!processedData.chartData) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FiPieChart size={48} />
          </div>
          <h3>No Category Data</h3>
          <p>Upload sales data to see category breakdown</p>
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
          <h3 className={styles.title}>Sales by Category</h3>
          <div className={styles.totalRevenue}>
            Total: {formatCurrency(processedData.totalRevenue)}
          </div>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.sortControls}>
            <button
              className={`${styles.sortButton} ${sortBy === 'revenue' ? styles.active : ''}`}
              onClick={() => setSortBy('revenue')}
            >
              Revenue
            </button>
            <button
              className={`${styles.sortButton} ${sortBy === 'percentage' ? styles.active : ''}`}
              onClick={() => setSortBy('percentage')}
            >
              Percentage
            </button>
          </div>
          
          <div className={styles.chartTypeControls}>
            <button
              className={`${styles.chartTypeButton} ${type === 'doughnut' ? styles.active : ''}`}
              onClick={() => setType('doughnut')}
              title="Doughnut Chart"
            >
              <FiPieChart size={18} />
            </button>
            <button
              className={`${styles.chartTypeButton} ${type === 'pie' ? styles.active : ''}`}
              onClick={() => setType('pie')}
              title="Pie Chart"
            >
              <FiPieChart size={18} />
            </button>
            <button
              className={`${styles.chartTypeButton} ${type === 'bar' ? styles.active : ''}`}
              onClick={() => setType('bar')}
              title="Bar Chart"
            >
              <FiBarChart2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartContainer}>
          {type === 'bar' ? (
            <div className={styles.barChartWrapper}>
              {processedData.chartData && (
                <Bar
                  data={{
                    labels: processedData.chartData.labels,
                    datasets: [{
                      ...processedData.chartData.datasets[0],
                      borderRadius: 6,
                    }],
                  }}
                  options={barOptions}
                />
              )}
            </div>
          ) : (
            <div className={styles.pieChartWrapper}>
              {processedData.chartData && (
                type === 'doughnut' ? (
                  <Doughnut data={processedData.chartData} options={chartOptions} />
                ) : (
                  <Pie data={processedData.chartData} options={chartOptions} />
                )
              )}
            </div>
          )}
        </div>

        <div className={styles.legendContainer}>
          <div className={styles.legendHeader}>
            <h4>Categories</h4>
            <button className={styles.filterButton}>
              <FiFilter size={16} />
              Filter
            </button>
          </div>
          
          <div className={styles.legendList}>
            {processedData.sortedData.map((item, index) => {
              const revenue = item.total_revenue || item.revenue || 0;
              const percentage = processedData.totalRevenue > 0 ? (revenue / processedData.totalRevenue) * 100 : 0;
              const isSelected = selectedCategory === item.category;
              
              return (
                <motion.div
                  key={`category-${item.category}`} // Add key prop to fix React warning
                  className={`${styles.legendItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => setSelectedCategory(
                    isSelected ? null : item.category
                  )}
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={styles.legendColor}>
                    <div
                      className={styles.colorDot}
                      style={{
                        backgroundColor: processedData.chartData.datasets[0].backgroundColor[index],
                      }}
                    />
                  </div>
                  
                  <div className={styles.legendContent}>
                    <div className={styles.categoryInfo}>
                      <span className={styles.categoryName}>{item.category}</span>
                      <span className={styles.categoryRevenue}>
                        {formatCurrency(revenue)}
                      </span>
                    </div>
                    
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        <motion.div
                          className={styles.progressFill}
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${isNaN(percentage) ? 0 : percentage}%` // Fix NaN issue
                          }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                          style={{
                            backgroundColor: processedData.chartData.datasets[0].backgroundColor[index],
                          }}
                        />
                      </div>
                      <span className={styles.percentage}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <button className={styles.detailsButton}>
                    <FiChevronRight size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedCategory && (
        <motion.div
          className={styles.detailPanel}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className={styles.detailHeader}>
            <h4>{selectedCategory} Details</h4>
            <button
              className={styles.closeDetail}
              onClick={() => setSelectedCategory(null)}
            >
              ×
            </button>
          </div>
          <div className={styles.detailContent}>
            {processedData.sortedData.find(item => item.category === selectedCategory) && (
              <>
                <div className={styles.detailStat}>
                  <span className={styles.detailLabel}>Total Revenue</span>
                  <span className={styles.detailValue}>
                    {formatCurrency(
                      processedData.sortedData.find(item => item.category === selectedCategory).total_revenue || 
                      processedData.sortedData.find(item => item.category === selectedCategory).revenue
                    )}
                  </span>
                </div>
                <div className={styles.detailStat}>
                  <span className={styles.detailLabel}>Percentage of Total</span>
                  <span className={styles.detailValue}>
                    {formatPercentage(
                      ((processedData.sortedData.find(item => item.category === selectedCategory).total_revenue || 
                        processedData.sortedData.find(item => item.category === selectedCategory).revenue) / 
                       processedData.totalRevenue) * 100
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SalesByCategory;