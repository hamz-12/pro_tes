import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiXCircle,
  FiX,
  FiBell,
} from 'react-icons/fi';
import styles from './Notification.module.css';

const Notification = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  action,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === 0) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const decrement = (100 / duration) * 100;
        return Math.max(0, prev - decrement);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className={styles.iconSuccess} />;
      case 'error':
        return <FiXCircle className={styles.iconError} />;
      case 'warning':
        return <FiAlertCircle className={styles.iconWarning} />;
      case 'info':
        return <FiInfo className={styles.iconInfo} />;
      default:
        return <FiBell className={styles.iconInfo} />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          border: '1px solid rgba(16, 185, 129, 0.2)',
          background: 'rgba(16, 185, 129, 0.1)',
          progressColor: 'var(--color-success)',
        };
      case 'error':
        return {
          border: '1px solid rgba(239, 68, 68, 0.2)',
          background: 'rgba(239, 68, 68, 0.1)',
          progressColor: 'var(--color-error)',
        };
      case 'warning':
        return {
          border: '1px solid rgba(245, 158, 11, 0.2)',
          background: 'rgba(245, 158, 11, 0.1)',
          progressColor: 'var(--color-warning)',
        };
      default:
        return {
          border: '1px solid rgba(99, 102, 241, 0.2)',
          background: 'rgba(99, 102, 241, 0.1)',
          progressColor: 'var(--color-accent-primary)',
        };
    }
  };

  const stylesObj = getStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.notification}
          style={stylesObj}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          layout
        >
          <div className={styles.notificationContent}>
            <div className={styles.iconContainer}>{getIcon()}</div>
            
            <div className={styles.textContainer}>
              {title && <h4 className={styles.title}>{title}</h4>}
              <p className={styles.message}>{message}</p>
            </div>
            
            <button
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Close notification"
            >
              <FiX size={18} />
            </button>
          </div>

          {duration > 0 && (
            <div className={styles.progressBar}>
              <motion.div
                className={styles.progressFill}
                style={{
                  backgroundColor: stylesObj.progressColor,
                  width: `${progress}%`,
                }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            </div>
          )}

          {action && (
            <div className={styles.actionContainer}>
              <button
                className={styles.actionButton}
                onClick={() => {
                  action.onClick();
                  handleClose();
                }}
              >
                {action.label}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;