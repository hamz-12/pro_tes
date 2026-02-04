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
import { 
  FiMapPin, 
  FiTrendingUp, 
  FiShoppingBag,
  FiCreditCard,
  FiTruck
} from 'react-icons/fi';
import styles from './SalesByCity.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const SalesByCity = ({ data, loading, title = "Sales by City" }) => {
  const [viewMode, setViewMode] = useState('bars'); // 'bars' | 'cards' | 'chart'

  const cityColors = [
    { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)', light: 'rgba(59, 130, 246, 0.1)' },
    { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)', light: 'rgba(16, 185, 129, 0.1)' },
    { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)', light: 'rgba(245, 158, 11, 0.1)' },
    { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)', light: 'rgba(239, 68, 68, 0.1)' },
    { bg: 'rgba(139, 92, 246, 0.8)', border: 'rgba(139, 92, 246, 1)', light: 'rgba(139, 92, 246, 0.1)' },
    { bg: 'rgba(236, 72, 153, 0.8)', border: 'rgba(236, 72, 153, 1)', light: 'rgba(236, 72, 153, 0.1)' },
    { bg: 'rgba(6, 182, 212, 0.8)', border: 'rgba(6, 182, 212, 1)', light: 'rgba(6, 182, 212, 0.1)' },
  ];

  const processedData = useMemo(() => {
    if (!data || typeof data !== 'object') return [];
    
    return Object.entries(data).map(([city, stats], index) => ({
      city: city || 'Unknown',
      total_revenue: stats.total_revenue || 0,
      transaction_count: stats.transaction_count || 0,
      total_items: stats.total_items || 0,
      percentage: stats.percentage || 0,
      avg_order_value: stats.avg_order_value || 0,
      preferred_payment: stats.preferred_payment || 'N/A',
      preferred_purchase_type: stats.preferred_purchase_type || 'N/A',
      colors: cityColors[index % cityColors.length]
    })).sort((a, b) => b.total_revenue - a.total_revenue);
  }, [data]);

  const totalRevenue = useMemo(() => {
    return processedData.reduce((sum, city) => sum + city.total_revenue, 0);
  }, [processedData]);

  const topCity = processedData[0];

  const barChartData = useMemo(() => ({
    labels: processedData.map(c => c.city),
    datasets: [{
      label: 'Revenue',
      data: processedData.map(c => c.total_revenue),
      backgroundColor: processedData.map(c => c.colors.bg),
      borderColor: processedData.map(c => c.colors.border),
      borderWidth: 1,
      borderRadius: 8,
    }]
  }), [processedData]);

  const doughnutData = useMemo(() => ({
    labels: processedData.map(c => c.city),
    datasets: [{
      data: processedData.map(c => c.total_revenue),
      backgroundColor: processedData.map(c => c.colors.bg),
      borderColor: processedData.map(c => c.colors.border),
      borderWidth: 2,
      hoverOffset: 10,
    }]
  }), [processedData]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const city = processedData[context.dataIndex];
            return [
              `Revenue: $${city.total_revenue.toLocaleString()}`,
              `Orders: ${city.transaction_count}`,
              `Avg Order: $${city.avg_order_value.toFixed(2)}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 12,
          font: { size: 11 }
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
          <FiMapPin size={48} />
          <p>No city data available</p>
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
          <span className={styles.cityCount}>{processedData.length} locations</span>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'bars' ? styles.active : ''}`}
            onClick={() => setViewMode('bars')}
          >
            Bars
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'chart' ? styles.active : ''}`}
            onClick={() => setViewMode('chart')}
          >
            Chart
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'cards' ? styles.active : ''}`}
            onClick={() => setViewMode('cards')}
          >
            Cards
          </button>
        </div>
      </div>

      {/* Top City Highlight */}
      {topCity && (
        <div className={styles.topCityBanner} style={{ backgroundColor: topCity.colors.light, borderColor: topCity.colors.border }}>
          <div className={styles.topCityIcon} style={{ backgroundColor: topCity.colors.bg }}>
            <FiMapPin size={20} color="white" />
          </div>
          <div className={styles.topCityInfo}>
            <span className={styles.topCityLabel}>Top Performing Location</span>
            <span className={styles.topCityName}>{topCity.city}</span>
          </div>
          <div className={styles.topCityStats}>
            <span className={styles.topCityRevenue}>${topCity.total_revenue.toLocaleString()}</span>
            <span className={styles.topCityPercentage}>{topCity.percentage.toFixed(1)}% of total</span>
          </div>
        </div>
      )}

      <div className={styles.content}>
        {viewMode === 'bars' && (
          <div className={styles.barChartContainer}>
            <Bar data={barChartData} options={barOptions} />
          </div>
        )}

        {viewMode === 'chart' && (
          <div className={styles.doughnutContainer}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        )}

        {viewMode === 'cards' && (
          <div className={styles.cardsGrid}>
            {processedData.map((city, index) => (
              <motion.div
                key={city.city}
                className={styles.cityCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{ borderTopColor: city.colors.border }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon} style={{ backgroundColor: city.colors.bg }}>
                    <FiMapPin size={16} color="white" />
                  </div>
                  <h4 className={styles.cardTitle}>{city.city}</h4>
                  <span className={styles.cardRank}>#{index + 1}</span>
                </div>

                <div className={styles.cardRevenue}>
                  <FiTrendingUp size={14} />
                  <span>${city.total_revenue.toLocaleString()}</span>
                </div>

                <div className={styles.cardDetails}>
                  <div className={styles.cardDetail}>
                    <FiShoppingBag size={12} />
                    <span>{city.transaction_count} orders</span>
                  </div>
                  <div className={styles.cardDetail}>
                    <FiCreditCard size={12} />
                    <span>{city.preferred_payment}</span>
                  </div>
                  <div className={styles.cardDetail}>
                    <FiTruck size={12} />
                    <span>{city.preferred_purchase_type}</span>
                  </div>
                </div>

                <div className={styles.cardProgressWrapper}>
                  <div className={styles.cardProgress}>
                    <div 
                      className={styles.cardProgressFill}
                      style={{ 
                        width: `${city.percentage}%`,
                        backgroundColor: city.colors.border
                      }}
                    ></div>
                  </div>
                  <span className={styles.cardPercentage}>{city.percentage.toFixed(1)}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SalesByCity;