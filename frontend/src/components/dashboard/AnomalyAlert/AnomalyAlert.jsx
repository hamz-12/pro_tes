// frontend/src/components/dashboard/AnomalyAlert/AnomalyAlert.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertTriangle,
  FiAlertCircle,
  FiAlertOctagon,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiX,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';
import styles from './AnomalyAlert.module.css';
import { formatDate, formatCurrency } from '../../../utils/formatters';

const AnomalyAlert = ({ anomalies = [], maxVisible = 2, autoExpand = false }) => {
  const [expanded, setExpanded] = useState(autoExpand);
  const [dismissed, setDismissed] = useState([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  // Ensure anomalies is an array even if undefined or null is passed
  const safeAnomalies = Array.isArray(anomalies) ? anomalies : [];
  
  const visibleAnomalies = safeAnomalies
    .filter(anomaly => anomaly && (anomaly.id || anomaly.date)) // Filter out null/undefined anomalies
    .filter(anomaly => !dismissed.includes(anomaly.id || anomaly.date))
    .slice(0, maxVisible);

  const getSeverityIcon = (severity) => {
    if (!severity) return <FiAlertCircle className={styles.iconMedium} />;
    
    switch (severity.toLowerCase()) {
      case 'high':
        return <FiAlertOctagon className={styles.iconHigh} />;
      case 'medium':
        return <FiAlertTriangle className={styles.iconMedium} />;
      case 'low':
        return <FiAlertCircle className={styles.iconLow} />;
      default:
        return <FiAlertCircle className={styles.iconMedium} />;
    }
  };

  const getSeverityColor = (severity) => {
    if (!severity) return '#f59e0b';
    
    switch (severity.toLowerCase()) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#f59e0b';
    }
  };

  const getTrendIcon = (type) => {
    if (!type) return null;
    
    switch (type) {
      case 'spike':
        return <FiTrendingUp className={styles.trendUp} />;
      case 'drop':
        return <FiTrendingDown className={styles.trendDown} />;
      default:
        return null;
    }
  };

  const handleDismiss = (anomalyId, e) => {
    e.stopPropagation();
    setDismissed([...dismissed, anomalyId]);
  };

  const handleDismissAll = () => {
    const allIds = visibleAnomalies.map(a => a.id || a.date).filter(Boolean);
    setDismissed([...dismissed, ...allIds]);
  };

  const handleResolve = (anomalyId, e) => {
    e.stopPropagation();
    // In a real app, this would mark as resolved in the backend
    setDismissed([...dismissed, anomalyId]);
  };

  // If there are no visible anomalies, don't render anything
  if (visibleAnomalies.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.alertIcon}>
            <FiAlertTriangle size={24} />
            <span className={styles.alertCount}>{visibleAnomalies.length}</span>
          </div>
          <div>
            <h3 className={styles.title}>Anomalies Detected</h3>
            <p className={styles.subtitle}>Review unusual patterns in your sales data</p>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <button
            className={styles.expandButton}
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse anomalies' : 'Expand anomalies'}
          >
            {expanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
          </button>
          
          {visibleAnomalies.length > 0 && (
            <button className={styles.dismissAllButton} onClick={handleDismissAll}>
              Dismiss All
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className={styles.anomalyList}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {visibleAnomalies.map((anomaly, index) => (
              <motion.div
                key={anomaly.id || anomaly.date || index}
                className={`${styles.anomalyCard} ${
                  selectedAnomaly === (anomaly.id || anomaly.date) ? styles.selected : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedAnomaly(
                  selectedAnomaly === (anomaly.id || anomaly.date) 
                    ? null 
                    : anomaly.id || anomaly.date
                )}
                whileHover={{ x: 4 }}
              >
                <div className={styles.anomalyHeader}>
                  <div className={styles.severityIndicator}>
                    {getSeverityIcon(anomaly.severity)}
                    <div
                      className={styles.severityDot}
                      style={{ backgroundColor: getSeverityColor(anomaly.severity) }}
                    />
                  </div>
                  
                  <div className={styles.anomalyInfo}>
                    <div className={styles.anomalyTitle}>
                      <h4>{anomaly.type === 'spike' ? 'Sales Spike' : 'Sales Drop'}</h4>
                      {getTrendIcon(anomaly.type)}
                    </div>
                    <div className={styles.anomalyMeta}>
                      <span className={styles.anomalyDate}>
                        <FiClock size={12} />
                        {formatDate(anomaly.date)}
                      </span>
                      <span className={styles.severityBadge} style={{ 
                        backgroundColor: getSeverityColor(anomaly.severity) + '20',
                        color: getSeverityColor(anomaly.severity)
                      }}>
                        {anomaly.severity || 'medium'} severity
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.anomalyActions}>
                    <button
                      className={styles.resolveButton}
                      onClick={(e) => handleResolve(anomaly.id || anomaly.date, e)}
                      title="Mark as resolved"
                    >
                      <FiCheck size={16} />
                    </button>
                    <button
                      className={styles.dismissButton}
                      onClick={(e) => handleDismiss(anomaly.id || anomaly.date, e)}
                      title="Dismiss alert"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.anomalyContent}>
                  <p className={styles.anomalyDescription}>
                    {anomaly.description || 'Unusual pattern detected in sales data.'}
                  </p>
                  
                  {anomaly.impact && (
                    <div className={styles.impactInfo}>
                      <span className={styles.impactLabel}>Estimated Impact:</span>
                      <span className={styles.impactValue}>
                        {anomaly.impact.value && formatCurrency(anomaly.impact.value)}
                        {anomaly.impact.percentage && ` (${anomaly.impact.percentage}%)`}
                      </span>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {selectedAnomaly === (anomaly.id || anomaly.date) && (
                    <motion.div
                      className={styles.anomalyDetail}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className={styles.detailContent}>
                        {anomaly.suggested_action && (
                          <div className={styles.suggestedAction}>
                            <h5>Suggested Action</h5>
                            <p>{anomaly.suggested_action}</p>
                          </div>
                        )}
                        
                        {anomaly.comparison && (
                          <div className={styles.comparison}>
                            <h5>Comparison</h5>
                            <div className={styles.comparisonGrid}>
                              <div className={styles.comparisonItem}>
                                <span className={styles.comparisonLabel}>Previous Period:</span>
                                <span className={styles.comparisonValue}>
                                  {formatCurrency(anomaly.comparison.previous)}
                                </span>
                              </div>
                              <div className={styles.comparisonItem}>
                                <span className={styles.comparisonLabel}>Current Period:</span>
                                <span className={styles.comparisonValue}>
                                  {formatCurrency(anomaly.comparison.current)}
                                </span>
                              </div>
                              <div className={styles.comparisonItem}>
                                <span className={styles.comparisonLabel}>Difference:</span>
                                <span className={styles.comparisonValue} style={{
                                  color: anomaly.type === 'spike' ? '#10b981' : '#ef4444'
                                }}>
                                  {anomaly.type === 'spike' ? '+' : '-'}
                                  {formatCurrency(Math.abs(anomaly.comparison.difference))}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className={styles.detailActions}>
                          <button className={styles.detailButton}>
                            View Detailed Report
                          </button>
                          <button className={styles.detailButton}>
                            Create Alert Rule
                          </button>
                          <button className={styles.detailButton}>
                            Export Analysis
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && (
        <div className={styles.summary}>
          <div className={styles.summaryList}>
            {visibleAnomalies.slice(0, 2).map((anomaly) => (
              <div key={anomaly.id || anomaly.date || Math.random()} className={styles.summaryItem}>
                <div
                  className={styles.summarySeverity}
                  style={{ backgroundColor: getSeverityColor(anomaly.severity) }}
                />
                <span className={styles.summaryText}>
                  {anomaly.type === 'spike' ? 'Spike' : 'Drop'} on {formatDate(anomaly.date)}
                </span>
              </div>
            ))}
            {visibleAnomalies.length > 2 && (
              <div className={styles.moreItems}>
                +{visibleAnomalies.length - 2} more anomalies
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Detected:</span>
            <span className={styles.statValue}>{safeAnomalies.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>High Severity:</span>
            <span className={styles.statValue}>
              {safeAnomalies.filter(a => a.severity && a.severity.toLowerCase() === 'high').length}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Resolved:</span>
            <span className={styles.statValue}>{dismissed.length}</span>
          </div>
        </div>
        
        <button className={styles.viewAllButton}>
          View All Anomalies
        </button>
      </div>
    </motion.div>
  );
};

export default AnomalyAlert;