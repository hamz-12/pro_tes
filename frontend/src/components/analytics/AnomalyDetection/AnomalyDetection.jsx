import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiXCircle, 
  FiFilter,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiEye,
  FiRefreshCw,
  FiDownload,
  FiShare2
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './AnomalyDetection.module.css';

const AnomalyDetection = ({ data = [], loading = false, onActionTaken }) => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedAnomaly, setExpandedAnomaly] = useState(null);
  const [timelineRange, setTimelineRange] = useState('7d');

  // Mock anomalies data
  const anomalies = useMemo(() => [
    {
      id: 1,
      title: 'Revenue Drop Detected',
      description: 'Unexpected 45% revenue decrease on Tuesday afternoon',
      severity: 'high',
      status: 'pending',
      detectedAt: '2024-01-15T14:30:00Z',
      impact: 'Critical',
      confidence: 0.92,
      metric: 'revenue',
      value: -0.45,
      baseline: 12500,
      actual: 6875,
      suggestedAction: 'Check for system outages or review transaction logs',
      actionTaken: null,
      timestamp: '2024-01-15T14:30:00Z',
    },
    {
      id: 2,
      title: 'Transaction Spike',
      description: 'Unusual 200% increase in transactions at 2 AM',
      severity: 'medium',
      status: 'resolved',
      detectedAt: '2024-01-14T02:15:00Z',
      impact: 'Medium',
      confidence: 0.78,
      metric: 'transactions',
      value: 2.0,
      baseline: 25,
      actual: 75,
      suggestedAction: 'Verify system integrity and check for automated bots',
      actionTaken: 'Verified as legitimate customer activity',
      timestamp: '2024-01-14T02:15:00Z',
    },
    {
      id: 3,
      title: 'Average Order Value Drop',
      description: '25% decrease in average order value during peak hours',
      severity: 'low',
      status: 'investigating',
      detectedAt: '2024-01-13T19:45:00Z',
      impact: 'Low',
      confidence: 0.65,
      metric: 'avg_order_value',
      value: -0.25,
      baseline: 45.50,
      actual: 34.12,
      suggestedAction: 'Review menu pricing and promotional activities',
      actionTaken: 'Analysis in progress',
      timestamp: '2024-01-13T19:45:00Z',
    },
    {
      id: 4,
      title: 'Customer Count Anomaly',
      description: 'Unexpected pattern in new customer registrations',
      severity: 'medium',
      status: 'pending',
      detectedAt: '2024-01-12T10:15:00Z',
      impact: 'Medium',
      confidence: 0.81,
      metric: 'customers',
      value: -0.35,
      baseline: 120,
      actual: 78,
      suggestedAction: 'Check marketing campaign performance',
      actionTaken: null,
      timestamp: '2024-01-12T10:15:00Z',
    },
  ], []);

  // Mock timeline data
  const timelineData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      normal: Math.sin(i * 0.3) * 50 + 100,
      actual: Math.sin(i * 0.3) * 50 + 100 + (i === 14 ? -45 : i === 2 ? 200 : 0),
      anomaly: i === 14 || i === 2,
    }));
  }, []);

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (selectedSeverity !== 'all' && anomaly.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && anomaly.status !== selectedStatus) return false;
    return true;
  });

  const handleAction = (anomalyId, action) => {
    if (onActionTaken) {
      const anomaly = anomalies.find(a => a.id === anomalyId);
      onActionTaken(anomaly, action);
    }
  };

  const severityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };

  const statusColors = {
    pending: '#f59e0b',
    investigating: '#60a5fa',
    resolved: '#10b981',
    ignored: '#94a3b8',
  };

  return (
    <motion.div 
      className={styles.anomalyDetection}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Stats */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            <FiAlertTriangle className={styles.titleIcon} />
            Anomaly Detection
          </h2>
          <p className={styles.subtitle}>
            AI-powered detection of unusual patterns in your data
          </p>
        </div>
        
        <div className={styles.statsOverview}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{anomalies.length}</div>
            <div className={styles.statLabel}>Total Anomalies</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{anomalies.filter(a => a.status === 'pending').length}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {((anomalies.filter(a => a.status === 'resolved').length / anomalies.length) * 100).toFixed(1)}%
            </div>
            <div className={styles.statLabel}>Resolved</div>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className={styles.timelineSection}>
        <div className={styles.timelineHeader}>
          <h3 className={styles.timelineTitle}>Anomaly Timeline</h3>
          <select 
            value={timelineRange}
            onChange={(e) => setTimelineRange(e.target.value)}
            className={styles.timelineSelect}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
        
        <div className={styles.timelineChart}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="hour" 
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
              <Line 
                type="monotone" 
                dataKey="normal" 
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.anomaly) {
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={6} fill="#ef4444" />
                        <circle cx={cx} cy={cy} r={8} fill="#ef4444" opacity={0.3} />
                      </g>
                    );
                  }
                  return <circle cx={cx} cy={cy} r={3} fill="#8b5cf6" />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className={styles.timelineLegend}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: '#8b5cf6' }} />
            <span>Actual Values</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: 'rgba(255,255,255,0.3)' }} />
            <span>Expected Pattern</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: '#ef4444' }} />
            <span>Anomaly Detected</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Severity</label>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${selectedSeverity === 'all' ? styles.active : ''}`}
              onClick={() => setSelectedSeverity('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterButton} ${selectedSeverity === 'high' ? styles.active : ''}`}
              onClick={() => setSelectedSeverity('high')}
              style={{ '--severity-color': severityColors.high }}
            >
              High
            </button>
            <button
              className={`${styles.filterButton} ${selectedSeverity === 'medium' ? styles.active : ''}`}
              onClick={() => setSelectedSeverity('medium')}
              style={{ '--severity-color': severityColors.medium }}
            >
              Medium
            </button>
            <button
              className={`${styles.filterButton} ${selectedSeverity === 'low' ? styles.active : ''}`}
              onClick={() => setSelectedSeverity('low')}
              style={{ '--severity-color': severityColors.low }}
            >
              Low
            </button>
          </div>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Status</label>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${selectedStatus === 'all' ? styles.active : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterButton} ${selectedStatus === 'pending' ? styles.active : ''}`}
              onClick={() => setSelectedStatus('pending')}
              style={{ '--status-color': statusColors.pending }}
            >
              Pending
            </button>
            <button
              className={`${styles.filterButton} ${selectedStatus === 'investigating' ? styles.active : ''}`}
              onClick={() => setSelectedStatus('investigating')}
              style={{ '--status-color': statusColors.investigating }}
            >
              Investigating
            </button>
            <button
              className={`${styles.filterButton} ${selectedStatus === 'resolved' ? styles.active : ''}`}
              onClick={() => setSelectedStatus('resolved')}
              style={{ '--status-color': statusColors.resolved }}
            >
              Resolved
            </button>
          </div>
        </div>
        
        <div className={styles.filterActions}>
          <button className={styles.actionButton}>
            <FiFilter size={16} />
            <span>Advanced Filter</span>
          </button>
          <button className={styles.actionButton}>
            <FiRefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button className={styles.actionButton}>
            <FiDownload size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Anomalies List */}
      <div className={styles.anomaliesList}>
        <AnimatePresence>
          {filteredAnomalies.map((anomaly) => (
            <motion.div
              key={anomaly.id}
              className={styles.anomalyCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.anomalyHeader}>
                <div className={styles.anomalyTitle}>
                  <div 
                    className={styles.severityIndicator}
                    style={{ backgroundColor: severityColors[anomaly.severity] }}
                  />
                  <h4>{anomaly.title}</h4>
                  <span className={styles.confidenceBadge}>
                    {Math.round(anomaly.confidence * 100)}% confidence
                  </span>
                </div>
                
                <div className={styles.anomalyMeta}>
                  <span className={styles.timestamp}>
                    <FiClock size={14} />
                    {new Date(anomaly.detectedAt).toLocaleDateString()}
                  </span>
                  <span 
                    className={styles.statusBadge}
                    style={{ 
                      backgroundColor: `${statusColors[anomaly.status]}20`,
                      color: statusColors[anomaly.status],
                      borderColor: statusColors[anomaly.status]
                    }}
                  >
                    {anomaly.status}
                  </span>
                </div>
              </div>
              
              <p className={styles.anomalyDescription}>{anomaly.description}</p>
              
              <div className={styles.anomalyDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Impact:</span>
                  <span className={`${styles.detailValue} ${styles[anomaly.impact.toLowerCase()]}`}>
                    {anomaly.impact}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Metric:</span>
                  <span className={styles.detailValue}>{anomaly.metric}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Deviation:</span>
                  <span className={`${styles.detailValue} ${anomaly.value > 0 ? styles.positive : styles.negative}`}>
                    {anomaly.value > 0 ? '+' : ''}{(anomaly.value * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className={styles.anomalyActions}>
                <button
                  className={styles.expandButton}
                  onClick={() => setExpandedAnomaly(expandedAnomaly === anomaly.id ? null : anomaly.id)}
                >
                  <FiEye size={16} />
                  <span>{expandedAnomaly === anomaly.id ? 'Hide Details' : 'View Details'}</span>
                </button>
                
                <div className={styles.actionButtons}>
                  {anomaly.status !== 'resolved' && (
                    <>
                      <button
                        className={styles.resolveButton}
                        onClick={() => handleAction(anomaly.id, 'resolve')}
                      >
                        <FiCheckCircle size={16} />
                        <span>Resolve</span>
                      </button>
                      <button
                        className={styles.ignoreButton}
                        onClick={() => handleAction(anomaly.id, 'ignore')}
                      >
                        <FiXCircle size={16} />
                        <span>Ignore</span>
                      </button>
                    </>
                  )}
                  <button className={styles.shareButton}>
                    <FiShare2 size={16} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
              
              <AnimatePresence>
                {expandedAnomaly === anomaly.id && (
                  <motion.div
                    className={styles.expandedDetails}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.detailSection}>
                      <h5>Suggested Action</h5>
                      <p>{anomaly.suggestedAction}</p>
                    </div>
                    
                    <div className={styles.detailSection}>
                      <h5>Impact Analysis</h5>
                      <div className={styles.impactMetrics}>
                        <div className={styles.impactMetric}>
                          <span className={styles.metricLabel}>Baseline:</span>
                          <span className={styles.metricValue}>{anomaly.baseline.toLocaleString()}</span>
                        </div>
                        <div className={styles.impactMetric}>
                          <span className={styles.metricLabel}>Actual:</span>
                          <span className={styles.metricValue}>{anomaly.actual.toLocaleString()}</span>
                        </div>
                        <div className={styles.impactMetric}>
                          <span className={styles.metricLabel}>Difference:</span>
                          <span className={`${styles.metricValue} ${anomaly.value > 0 ? styles.positive : styles.negative}`}>
                            {anomaly.value > 0 ? '+' : ''}{((anomaly.actual - anomaly.baseline) / anomaly.baseline * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {anomaly.actionTaken && (
                      <div className={styles.detailSection}>
                        <h5>Action Taken</h5>
                        <p>{anomaly.actionTaken}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No Results State */}
      {filteredAnomalies.length === 0 && (
        <div className={styles.noResults}>
          <FiAlertTriangle size={48} className={styles.noResultsIcon} />
          <h3>No Anomalies Found</h3>
          <p>No anomalies match your current filters. Try adjusting your filter criteria.</p>
        </div>
      )}
    </motion.div>
  );
};

export default AnomalyDetection;