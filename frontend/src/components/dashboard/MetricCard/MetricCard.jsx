import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiChevronRight } from 'react-icons/fi';
import styles from './MetricCard.module.css';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = 'primary',
  onClick,
  loading = false,
  sparklineData,
  comparisonText,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!loading) {
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = easeOutQuad(step, 0, value, steps);
        setAnimatedValue(current);

        if (step === steps) {
          clearInterval(timer);
          setAnimatedValue(value);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value, loading]);

  const easeOutQuad = (t, b, c, d) => {
    t /= d;
    return -c * t * (t - 2) + b;
  };

  const getTrendIcon = () => {
    if (changeType === 'positive') {
      return <FiTrendingUp className={styles.trendIconPositive} />;
    } else if (changeType === 'negative') {
      return <FiTrendingDown className={styles.trendIconNegative} />;
    }
    return <FiActivity className={styles.trendIconNeutral} />;
  };

  const getGradient = () => {
    switch (color) {
      case 'primary':
        return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
      case 'secondary':
        return 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)';
      case 'tertiary':
        return 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)';
      case 'success':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      default:
        return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
    }
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonValue} />
        <div className={styles.skeletonFooter} />
      </div>
    );
  }

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.titleWrapper}>
          {Icon && (
            <div className={styles.iconWrapper} style={{ background: getGradient() }}>
              <Icon size={20} />
            </div>
          )}
          <span className={styles.title}>{title}</span>
        </div>
        <AnimatePresence>
          {isHovered && onClick && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={styles.chevron}
            >
              <FiChevronRight size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.valueWrapper}>
        <motion.span
          className={styles.value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {formatCurrency(animatedValue)}
        </motion.span>
        
        <AnimatePresence mode="wait">
          {change !== undefined && (
            <motion.div
              key={change}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`${styles.changeIndicator} ${
                changeType === 'positive' ? styles.positive : styles.negative
              }`}
            >
              {getTrendIcon()}
              <span className={styles.changeValue}>
                {formatPercentage(Math.abs(change))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {comparisonText && (
        <div className={styles.comparisonText}>
          {comparisonText}
        </div>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <div className={styles.sparklineContainer}>
          <svg
            width="100%"
            height="40"
            className={styles.sparkline}
          >
            <path
              d={generateSparklinePath(sparklineData)}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color === 'primary' ? '#6366f1' : '#8b5cf6'} />
                <stop offset="100%" stopColor={color === 'primary' ? '#8b5cf6' : '#d946ef'} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </motion.div>
  );
};

const generateSparklinePath = (data) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 200;
  const height = 40;
  const segmentWidth = width / (data.length - 1);

  return data
    .map((value, index) => {
      const x = index * segmentWidth;
      const y = height - ((value - min) / range) * (height - 10);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

export default MetricCard;