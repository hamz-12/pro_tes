// In TopItems.jsx, update the component to handle button clicks
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiStar, FiChevronRight } from 'react-icons/fi';
import styles from './TopItems.module.css';
import { formatCurrency, formatNumber } from '../../../utils/formatters';

const TopItems = ({ items = [], loading = false, limit = 5, onViewAllItems }) => {
  const [sortBy, setSortBy] = useState('revenue');
  const [viewMode, setViewMode] = useState('list');

  const sortedItems = [...items]
    .sort((a, b) => {
      if (sortBy === 'revenue') return b.total_revenue - a.total_revenue;
      if (sortBy === 'quantity') return b.total_quantity - a.total_quantity;
      return 0;
    })
    .slice(0, limit);

  const totalRevenue = sortedItems.reduce((sum, item) => sum + item.total_revenue, 0);
  const totalQuantity = sortedItems.reduce((sum, item) => sum + item.total_quantity, 0);

  const getTrendIcon = (item) => {
    const trend = item.trend || 'stable';
    if (trend === 'up') return <FiTrendingUp className={styles.trendIconUp} />;
    if (trend === 'down') return <FiTrendingDown className={styles.trendIconDown} />;
    return <FiStar className={styles.trendIconStable} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Main Course': '#6366f1',
      'Beverages': '#06b6d4',
      'Appetizers': '#10b981',
      'Desserts': '#8b5cf6',
      'Sides': '#f59e0b',
    };
    return colors[category] || '#64748b';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonList}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonItem} />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <h3>No Items Data</h3>
          <p>Upload your sales data to see top performing items</p>
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
          <h3 className={styles.title}>Top Performing Items</h3>
          <div className={styles.stats}>
            <span className={styles.stat}>
              <span className={styles.statLabel}>Revenue:</span>
              <span className={styles.statValue}>
                {formatCurrency(totalRevenue)}
              </span>
            </span>
            <span className={styles.stat}>
              <span className={styles.statLabel}>Units:</span>
              <span className={styles.statValue}>
                {formatNumber(totalQuantity)}
              </span>
            </span>
          </div>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.sortButtons}>
            <button
              className={`${styles.sortButton} ${sortBy === 'revenue' ? styles.active : ''}`}
              onClick={() => setSortBy('revenue')}
            >
              Revenue
            </button>
            <button
              className={`${styles.sortButton} ${sortBy === 'quantity' ? styles.active : ''}`}
              onClick={() => setSortBy('quantity')}
            >
              Quantity
            </button>
          </div>
          
          <div className={styles.viewButtons}>
            <button
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              📋
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ▦
            </button>
          </div>
        </div>
      </div>

      <div className={viewMode === 'grid' ? styles.gridView : styles.listView}>
        {sortedItems.map((item, index) => (
          <motion.div
            key={item.item_name}
            className={`${styles.itemCard} ${viewMode === 'grid' ? styles.gridItem : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className={styles.itemRank}>
              <span className={styles.rankNumber}>#{index + 1}</span>
              {index < 3 && (
                <div className={styles.rankBadge}>
                  <FiStar size={12} />
                </div>
              )}
            </div>

            <div className={styles.itemContent}>
              <div className={styles.itemHeader}>
                <h4 className={styles.itemName}>{item.item_name}</h4>
                <div className={styles.trendIndicator}>
                  {getTrendIcon(item)}
                </div>
              </div>

              <div className={styles.itemCategory}>
                <span
                  className={styles.categoryBadge}
                  style={{ backgroundColor: getCategoryColor(item.category) }}
                >
                  {item.category}
                </span>
              </div>

              <div className={styles.itemStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Revenue</span>
                  <span className={styles.statValue}>
                    {formatCurrency(item.total_revenue  || 0)}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Units Sold</span>
                  <span className={styles.statValue}>
                    {formatNumber(item.total_quantity || 0)}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Avg. Price</span>
                  <span className={styles.statValue}>
                    {item.total_quantity > 0 
                      ? formatCurrency((item.total_revenue || 0) / item.total_quantity)
                      : formatCurrency(0)
                    }
                  </span>
                </div>
              </div>

              {viewMode === 'list' && (
                <div className={styles.itemProgress}>
                  <div className={styles.progressBar}>
                    <motion.div
                      className={styles.progressFill}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${totalRevenue > 0 ? ((item.total_revenue || 0) / totalRevenue) * 100 : 0}%`,
                      }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      style={{ backgroundColor: getCategoryColor(item.category) }}
                    />
                  </div>
                  <span className={styles.progressPercentage}>
                    {totalRevenue > 0 ? (((item.total_revenue || 0) / totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              )}
            </div>

            <button className={styles.itemAction}>
              <FiChevronRight size={20} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className={styles.footer}>
        <button 
          className={styles.viewAllButton} 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onViewAllItems) {
              onViewAllItems();
            } else {
              console.log('View all items clicked - no handler provided');
            }
          }}
        >
          View All Items
          <FiChevronRight className={styles.buttonIcon} />
        </button>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#6366f1' }} />
            <span>Main Course</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#06b6d4' }} />
            <span>Beverages</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }} />
            <span>Appetizers</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TopItems;