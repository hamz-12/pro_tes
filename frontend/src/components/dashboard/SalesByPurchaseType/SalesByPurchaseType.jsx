import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FiShoppingBag, FiTruck, FiMonitor, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import styles from './SalesByPurchaseType.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const SalesByPurchaseType = ({ data, loading, title = "Sales by Purchase Type" }) => {
  const [viewMode, setViewMode] = useState('doughnut'); // 'doughnut' | 'bar' | 'cards'

  const purchaseTypeIcons = {
    'Drive-thru': FiTruck,
    'Online': FiMonitor,
    'In-store': FiShoppingBag,
    'Unknown': FiShoppingBag,
  };

  const purchaseTypeColors = {
    'Drive-thru': { bg: 'rgba(255, 159, 64, 0.8)', border: 'rgba(255, 159, 64, 1)' },
    'Online': { bg: 'rgba(54, 162, 235, 0.8)', border: 'rgba(54, 162, 235, 1)' },
    'In-store': { bg: 'rgba(75, 192, 192, 0.8)', border: 'rgba(75, 192, 192, 1)' },
    'Unknown': { bg: 'rgba(156, 163, 175, 0.8)', border: 'rgba(156, 163, 175, 1)' },
  };

  const processedData = useMemo(() => {
    if (!data || typeof data !== 'object') return [];
    
    return Object.entries(data).map(([type, stats]) => ({
      type,
      ...stats,
      icon: purchaseTypeIcons[type] || FiShoppingBag,
      colors: purchaseTypeColors[type] || purchaseTypeColors['Unknown']
    })).sort((a, b) => b.total_revenue - a.total_revenue);
  }, [data]);

  const totalRevenue = useMemo(() => {
    return processedData.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
  }, [processedData]);

  const chartData = useMemo(() => ({
    labels: processedData.map(item => item.type),
    datasets: [{
      data: processedData.map(item => item.total_revenue || 0),
      backgroundColor: processedData.map(item => item.colors.bg),
      borderColor: processedData.map(item => item.colors.border),
      borderWidth: 2,
      hoverOffset: 10,
    }]
  }), [processedData]);

  const barChartData = useMemo(() => ({
    labels: processedData.map(item => item.type),
    datasets: [
      {
        label: 'Revenue',
        data: processedData.map(item => item.total_revenue || 0),
        backgroundColor: processedData.map(item => item.colors.bg),
        borderColor: processedData.map(item => item.colors.border),
        borderWidth: 1,
        borderRadius: 8,
        yAxisID: 'y',
      },
      {
        label: 'Transactions',
        data: processedData.map(item => item.transaction_count || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        borderRadius: 8,
        yAxisID: 'y1',
      }
    ]
  }), [processedData]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = processedData[context.dataIndex];
            return [
              `Revenue: $${(item.total_revenue || 0).toLocaleString()}`,
              `Transactions: ${item.transaction_count || 0}`,
              `Avg Order: $${(item.avg_order_value || 0).toFixed(2)}`
            ];
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = processedData[context.dataIndex];
            if (context.dataset.label === 'Revenue') {
              return `Revenue: $${(context.raw || 0).toLocaleString()}`;
            }
            return `Transactions: ${context.raw || 0}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue ($)'
        },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Transactions'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.skeleton}>
          <div className={styles.skeletonCircle}></div>
        </div>
      </div>
    );
  }

  if (!processedData.length) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.noData}>
          <FiShoppingBag size={48} />
          <p>No purchase type data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.viewToggle}>
          <button 
            className={`${styles.toggleBtn} ${viewMode === 'doughnut' ? styles.active : ''}`}
            onClick={() => setViewMode('doughnut')}
          >
            Chart
          </button>
          <button 
            className={`${styles.toggleBtn} ${viewMode === 'bar' ? styles.active : ''}`}
            onClick={() => setViewMode('bar')}
          >
            Bar
          </button>
          <button 
            className={`${styles.toggleBtn} ${viewMode === 'cards' ? styles.active : ''}`}
            onClick={() => setViewMode('cards')}
          >
            Cards
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {viewMode === 'doughnut' && (
          <div className={styles.chartContainer}>
            <div className={styles.chartWrapper}>
              <Doughnut data={chartData} options={doughnutOptions} />
              <div className={styles.centerLabel}>
                <span className={styles.centerValue}>${totalRevenue.toLocaleString()}</span>
                <span className={styles.centerText}>Total Revenue</span>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'bar' && (
          <div className={styles.barChartContainer}>
            <Bar data={barChartData} options={barOptions} />
          </div>
        )}

        {viewMode === 'cards' && (
          <div className={styles.cardsGrid}>
            {processedData.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.type}
                  className={styles.card}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{ borderLeftColor: item.colors.border }}
                >
                  <div className={styles.cardIcon} style={{ backgroundColor: item.colors.bg }}>
                    <Icon size={24} />
                  </div>
                  <div className={styles.cardContent}>
                    <h4 className={styles.cardTitle}>{item.type}</h4>
                    <p className={styles.cardRevenue}>${(item.total_revenue || 0).toLocaleString()}</p>
                    <div className={styles.cardStats}>
                      <span>{item.transaction_count || 0} orders</span>
                      <span className={styles.cardPercentage}>
                        {(item.percentage || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles.cardAvg}>
                      Avg: ${(item.avg_order_value || 0).toFixed(2)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats Bar */}
      <div className={styles.quickStats}>
        {processedData.slice(0, 3).map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.type} className={styles.quickStat}>
              <Icon size={16} style={{ color: item.colors.border }} />
              <span className={styles.quickStatLabel}>{item.type}</span>
              <span className={styles.quickStatValue}>{(item.percentage || 0).toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SalesByPurchaseType;