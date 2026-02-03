// components/dashboard/InsightsPanel/InsightsPanel.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiAlertTriangle, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import styles from './InsightsPanel.module.css';

const InsightsPanel = ({ 
  insights = [], 
  anomalies = [], 
  loading = false, 
  onRefresh 
}) => {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('insights'); // 'insights' or 'anomalies'

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonContent} />
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
        <div className={styles.titleSection}>
          <h3 className={styles.title}>AI-Powered Insights</h3>
          <p className={styles.subtitle}>
            Data-driven recommendations for your restaurant
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <button
            className={styles.refreshButton}
            onClick={handleRefresh}
            title="Refresh insights"
          >
            <FiRefreshCw size={16} />
          </button>
          
          <button
            className={styles.expandButton}
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse insights' : 'Expand insights'}
          >
            {expanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.tabNavigation}>
              <button
                className={`${styles.tabButton} ${activeTab === 'insights' ? styles.active : ''}`}
                onClick={() => setActiveTab('insights')}
              >
                <FiTrendingUp size={16} />
                <span>Insights ({insights.length})</span>
              </button>
              
              <button
                className={`${styles.tabButton} ${activeTab === 'anomalies' ? styles.active : ''}`}
                onClick={() => setActiveTab('anomalies')}
              >
                <FiAlertTriangle size={16} />
                <span>Anomalies ({anomalies.length})</span>
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'insights' && (
                <div className={styles.insightsList}>
                  {insights.length > 0 ? (
                    insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        className={styles.insightItem}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={styles.insightIcon}>
                          <FiTrendingUp />
                        </div>
                        <p className={styles.insightText}>{insight}</p>
                      </motion.div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <FiTrendingUp size={48} />
                      <h4>No insights available</h4>
                      <p>Upload more sales data to generate insights</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'anomalies' && (
                <div className={styles.anomaliesList}>
                  {anomalies.length > 0 ? (
                    anomalies.map((anomaly, index) => (
                      <motion.div
                        key={index}
                        className={`${styles.anomalyItem} ${styles[anomaly.impact?.toLowerCase() || 'medium']}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={styles.anomalyHeader}>
                          <div className={styles.anomalyIcon}>
                            <FiAlertTriangle />
                          </div>
                          <h4 className={styles.anomalyTitle}>{anomaly.description}</h4>
                        </div>
                        <p className={styles.anomalyExplanation}>{anomaly.explanation}</p>
                        <div className={styles.anomalyImpact}>
                          Impact: <span className={styles.impactValue}>{anomaly.impact || 'Unknown'}</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <FiAlertTriangle size={48} />
                      <h4>No anomalies detected</h4>
                      <p>Your sales data appears to be normal</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InsightsPanel;