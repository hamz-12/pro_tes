import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiPercent } from 'react-icons/fi';
import { SiGooglepay, SiApplepay } from 'react-icons/si';
import styles from './SalesByPaymentMethod.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const SalesByPaymentMethod = ({ data, loading, title = "Payment Methods" }) => {
  const [viewMode, setViewMode] = useState('horizontal'); // 'horizontal' | 'doughnut' | 'detailed'

  const paymentIcons = {
    'Credit Card': FiCreditCard,
    'Cash': FiDollarSign,
    'Google Pay': SiGooglepay,
    'Apple Pay': SiApplepay,
    'Debit Card': FiCreditCard,
    'Unknown': FiCreditCard,
  };

  const paymentColors = {
    'Credit Card': { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' },
    'Cash': { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' },
    'Google Pay': { bg: 'rgba(234, 67, 53, 0.8)', border: 'rgba(234, 67, 53, 1)' },
    'Apple Pay': { bg: 'rgba(0, 0, 0, 0.8)', border: 'rgba(0, 0, 0, 1)' },
    'Debit Card': { bg: 'rgba(139, 92, 246, 0.8)', border: 'rgba(139, 92, 246, 1)' },
    'Unknown': { bg: 'rgba(156, 163, 175, 0.8)', border: 'rgba(156, 163, 175, 1)' },
  };

  const processedData = useMemo(() => {
    if (!data || typeof data !== 'object') return [];
    
    return Object.entries(data).map(([method, stats]) => {
      const statsObj = typeof stats === 'object' ? stats : { total_revenue: stats, transaction_count: 0, percentage: 0 };
      return {
        method: method || 'Unknown',
        total_revenue: statsObj.total_revenue || 0,
        transaction_count: statsObj.transaction_count || 0,
        percentage: statsObj.percentage || 0,
        icon: paymentIcons[method] || FiCreditCard,
        colors: paymentColors[method] || paymentColors['Unknown']
      };
    }).sort((a, b) => b.total_revenue - a.total_revenue);
  }, [data]);

  const totalRevenue = useMemo(() => {
    return processedData.reduce((sum, item) => sum + item.total_revenue, 0);
  }, [processedData]);

  const totalTransactions = useMemo(() => {
    return processedData.reduce((sum, item) => sum + item.transaction_count, 0);
  }, [processedData]);

  const horizontalBarData = useMemo(() => ({
    labels: processedData.map(item => item.method),
    datasets: [{
      label: 'Revenue',
      data: processedData.map(item => item.total_revenue),
      backgroundColor: processedData.map(item => item.colors.bg),
      borderColor: processedData.map(item => item.colors.border),
      borderWidth: 1,
      borderRadius: 6,
      barThickness: 24,
    }]
  }), [processedData]);

  const doughnutData = useMemo(() => ({
    labels: processedData.map(item => item.method),
    datasets: [{
      data: processedData.map(item => item.total_revenue),
      backgroundColor: processedData.map(item => item.colors.bg),
      borderColor: processedData.map(item => item.colors.border),
      borderWidth: 2,
      hoverOffset: 8,
    }]
  }), [processedData]);

  const horizontalBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = processedData[context.dataIndex];
            return [
              `Revenue: $${item.total_revenue.toLocaleString()}`,
              `Transactions: ${item.transaction_count}`,
              `Share: ${item.percentage.toFixed(1)}%`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { display: false },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
        }
      },
      y: {
        grid: { display: false },
        ticks: {
          font: { size: 12, weight: 500 }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = processedData[context.dataIndex];
            return `$${item.total_revenue.toLocaleString()} (${item.percentage.toFixed(1)}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.skeleton}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.skeletonBar}></div>
          ))}
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
          <FiCreditCard size={48} />
          <p>No payment data available</p>
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
            className={`${styles.toggleBtn} ${viewMode === 'horizontal' ? styles.active : ''}`}
            onClick={() => setViewMode('horizontal')}
          >
            Bars
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'doughnut' ? styles.active : ''}`}
            onClick={() => setViewMode('doughnut')}
          >
            Chart
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'detailed' ? styles.active : ''}`}
            onClick={() => setViewMode('detailed')}
          >
            List
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.summaryStats}>
        <div className={styles.summaryStat}>
          <FiDollarSign className={styles.summaryIcon} />
          <div>
            <span className={styles.summaryValue}>${totalRevenue.toLocaleString()}</span>
            <span className={styles.summaryLabel}>Total Revenue</span>
          </div>
        </div>
        <div className={styles.summaryStat}>
          <FiCreditCard className={styles.summaryIcon} />
          <div>
            <span className={styles.summaryValue}>{totalTransactions.toLocaleString()}</span>
            <span className={styles.summaryLabel}>Transactions</span>
          </div>
        </div>
        <div className={styles.summaryStat}>
          <FiPercent className={styles.summaryIcon} />
          <div>
            <span className={styles.summaryValue}>{processedData.length}</span>
            <span className={styles.summaryLabel}>Methods</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {viewMode === 'horizontal' && (
          <div className={styles.horizontalChartContainer}>
            <Bar data={horizontalBarData} options={horizontalBarOptions} />
          </div>
        )}

        {viewMode === 'doughnut' && (
          <div className={styles.doughnutContainer}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className={styles.detailedList}>
            {processedData.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.method}
                  className={styles.listItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={styles.listItemLeft}>
                    <div 
                      className={styles.listItemIcon}
                      style={{ backgroundColor: item.colors.bg }}
                    >
                      <Icon size={18} color="white" />
                    </div>
                    <div className={styles.listItemInfo}>
                      <span className={styles.listItemMethod}>{item.method}</span>
                      <span className={styles.listItemTransactions}>
                        {item.transaction_count} transactions
                      </span>
                    </div>
                  </div>
                  <div className={styles.listItemRight}>
                    <span className={styles.listItemRevenue}>
                      ${item.total_revenue.toLocaleString()}
                    </span>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: item.colors.border
                        }}
                      ></div>
                    </div>
                    <span className={styles.listItemPercentage}>
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SalesByPaymentMethod;