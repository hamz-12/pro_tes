import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { 
  FiUser, 
  FiAward, 
  FiTrendingUp, 
  FiClock,
  FiStar,
  FiShoppingCart
} from 'react-icons/fi';
import styles from './ManagerPerformance.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

const ManagerPerformance = ({ data, loading, title = "Manager Performance" }) => {
  const [viewMode, setViewMode] = useState('leaderboard'); // 'leaderboard' | 'chart' | 'comparison'
  const [sortBy, setSortBy] = useState('revenue'); // 'revenue' | 'transactions' | 'avgOrder'

  const managerColors = [
    { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)', gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' },
    { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
    { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
    { bg: 'rgba(139, 92, 246, 0.8)', border: 'rgba(139, 92, 246, 1)', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' },
    { bg: 'rgba(236, 72, 153, 0.8)', border: 'rgba(236, 72, 153, 1)', gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)' },
  ];

  const processedData = useMemo(() => {
    if (!data || typeof data !== 'object') return [];
    
    return Object.entries(data).map(([manager, stats], index) => ({
      manager: manager || 'Unknown',
      total_revenue: stats.total_revenue || 0,
      transaction_count: stats.transaction_count || 0,
      total_items: stats.total_items || 0,
      percentage: stats.percentage || 0,
      avg_order_value: stats.avg_order_value || 0,
      busiest_hour: stats.busiest_hour || 0,
      top_item: stats.top_item || 'N/A',
      colors: managerColors[index % managerColors.length]
    })).sort((a, b) => {
      switch (sortBy) {
        case 'transactions':
          return b.transaction_count - a.transaction_count;
        case 'avgOrder':
          return b.avg_order_value - a.avg_order_value;
        default:
          return b.total_revenue - a.total_revenue;
      }
    });
  }, [data, sortBy]);

  const topManager = processedData[0];
  const totalRevenue = processedData.reduce((sum, m) => sum + m.total_revenue, 0);

  const chartData = useMemo(() => ({
    labels: processedData.map(m => m.manager),
    datasets: [
      {
        label: 'Revenue ($)',
        data: processedData.map(m => m.total_revenue),
        backgroundColor: processedData.map(m => m.colors.bg),
        borderColor: processedData.map(m => m.colors.border),
        borderWidth: 1,
        borderRadius: 8,
        yAxisID: 'y',
      },
      {
        label: 'Avg Order ($)',
        data: processedData.map(m => m.avg_order_value),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        borderRadius: 8,
        yAxisID: 'y1',
      }
    ]
  }), [processedData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          afterBody: (context) => {
            const manager = processedData[context[0].dataIndex];
            return [
              `Transactions: ${manager.transaction_count}`,
              `Top Item: ${manager.top_item}`,
              `Busiest Hour: ${manager.busiest_hour}:00`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Revenue ($)' },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Avg Order ($)' },
        grid: { drawOnChartArea: false },
        ticks: {
          callback: (value) => `$${value.toFixed(0)}`
        }
      },
    }
  };

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.skeleton}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeletonCard}></div>
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
          <FiUser size={48} />
          <p>No manager data available</p>
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
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>{title}</h3>
          {topManager && (
            <div className={styles.topBadge}>
              <FiAward size={14} />
              <span>Top: {topManager.manager}</span>
            </div>
          )}
        </div>
        <div className={styles.headerRight}>
          <select 
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="transactions">Sort by Orders</option>
            <option value="avgOrder">Sort by Avg Order</option>
          </select>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleBtn} ${viewMode === 'leaderboard' ? styles.active : ''}`}
              onClick={() => setViewMode('leaderboard')}
            >
              Board
            </button>
            <button
              className={`${styles.toggleBtn} ${viewMode === 'chart' ? styles.active : ''}`}
              onClick={() => setViewMode('chart')}
            >
              Chart
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {viewMode === 'leaderboard' && (
          <div className={styles.leaderboard}>
            {processedData.map((manager, index) => (
              <motion.div
                key={manager.manager}
                className={`${styles.managerCard} ${index === 0 ? styles.topManager : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={styles.rankBadge} style={{ background: manager.colors.gradient }}>
                  {index + 1}
                </div>
                
                <div className={styles.managerInfo}>
                  <div className={styles.managerAvatar} style={{ background: manager.colors.gradient }}>
                    <FiUser size={20} />
                  </div>
                  <div className={styles.managerDetails}>
                    <h4 className={styles.managerName}>
                      {manager.manager}
                      {index === 0 && <FiStar className={styles.starIcon} />}
                    </h4>
                    <span className={styles.topItemBadge}>
                      Top: {manager.top_item}
                    </span>
                  </div>
                </div>

                <div className={styles.managerStats}>
                  <div className={styles.statItem}>
                    <FiTrendingUp size={14} />
                    <span className={styles.statValue}>${manager.total_revenue.toLocaleString()}</span>
                    <span className={styles.statLabel}>Revenue</span>
                  </div>
                  <div className={styles.statItem}>
                    <FiShoppingCart size={14} />
                    <span className={styles.statValue}>{manager.transaction_count}</span>
                    <span className={styles.statLabel}>Orders</span>
                  </div>
                  <div className={styles.statItem}>
                    <FiClock size={14} />
                    <span className={styles.statValue}>{formatHour(manager.busiest_hour)}</span>
                    <span className={styles.statLabel}>Peak Hour</span>
                  </div>
                </div>

                <div className={styles.performanceBar}>
                  <div 
                    className={styles.performanceFill}
                    style={{ 
                      width: `${manager.percentage}%`,
                      background: manager.colors.gradient
                    }}
                  ></div>
                  <span className={styles.performanceLabel}>{manager.percentage.toFixed(1)}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {viewMode === 'chart' && (
          <div className={styles.chartContainer}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ManagerPerformance;