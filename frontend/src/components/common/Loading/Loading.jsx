import React from 'react';
import { motion } from 'framer-motion';
import styles from './Loading.module.css';

const Loading = ({ fullScreen = false, size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  if (fullScreen) {
    return (
      <div className={styles.fullScreenContainer}>
        <div className={styles.fullScreenContent}>
          <motion.div
            className={`${styles.loader} ${sizeClasses[size]}`}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className={styles.spinner}>
              <div className={styles.spinnerSegment} style={{ '--segment': 0 }} />
              <div className={styles.spinnerSegment} style={{ '--segment': 1 }} />
              <div className={styles.spinnerSegment} style={{ '--segment': 2 }} />
              <div className={styles.spinnerSegment} style={{ '--segment': 3 }} />
              <div className={styles.spinnerSegment} style={{ '--segment': 4 }} />
              <div className={styles.spinnerSegment} style={{ '--segment': 5 }} />
              <div className={styles.spinnerSegment} style={{ '--segment': 6 }} />
              <div className={styles.spinnerSegment} style={{ '--segment': 7 }} />
            </div>
          </motion.div>
          <motion.p
            className={styles.loadingMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={`${styles.loader} ${sizeClasses[size]}`}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className={styles.spinner}>
          <div className={styles.spinnerSegment} style={{ '--segment': 0 }} />
          <div className={styles.spinnerSegment} style={{ '--segment': 1 }} />
          <div className={styles.spinnerSegment} style={{ '--segment': 2 }} />
          <div className={styles.spinnerSegment} style={{ '--segment': 3 }} />
          <div className={styles.spinnerSegment} style={{ '--segment': 4 }} />
          <div className={styles.spinnerSegment} style={{ '--segment': 5 }} />
          <div className={styles.spinnerSegment} style={{ '--segment': 6 }} />
          <div className={styles.spinnerSegment} style={{ '--segment': 7 }} />
        </div>
      </motion.div>
      {message && (
        <motion.p
          className={styles.loadingMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default Loading;