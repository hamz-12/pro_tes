import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiBarChart2,
  FiDatabase,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiAlertCircle,
  FiUpload,
  FiUser
} from 'react-icons/fi';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard', color: '#6366f1' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics', color: '#8b5cf6' },
    { path: '/analytics/trends', icon: FiTrendingUp, label: 'Trends', color: '#06b6d4' },
    { path: '/analytics/anomalies', icon: FiAlertCircle, label: 'Anomalies', color: '#ef4444' },
    { path: '/data', icon: FiDatabase, label: 'Data', color: '#10b981' },
    { path: '/data/upload', icon: FiUpload, label: 'Upload', color: '#f59e0b' },
    { path: '/settings', icon: FiSettings, label: 'Settings', color: '#64748b' },
    { path: '/settings/profile', icon: FiUser, label: 'Profile', color: '#8b5cf6' },
  ];

  const navVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <motion.aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className={styles.sidebarHeader}>
        {!isCollapsed && (
          <motion.div
            className={styles.logo}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.logoIcon}>🍽️</div>
            <div className={styles.logoText}>
              <span className={styles.logoPrimary}>Restaurant</span>
              <span className={styles.logoSecondary}>Analytics</span>
            </div>
          </motion.div>
        )}
        <button
          className={styles.collapseButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map((item, index) => (
            <motion.li
              key={item.path}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={navVariants}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ''}`
                }
              >
                <div className={styles.menuIcon} style={{ color: item.color }}>
                  <item.icon size={20} />
                </div>
                {!isCollapsed && (
                  <motion.span
                    className={styles.menuLabel}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.label}
                  </motion.span>
                )}
                
                <AnimatePresence>
                  {hoveredItem === item.path && isCollapsed && (
                    <motion.div
                      className={styles.tooltip}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {item.label}
                    </motion.div>
                  )}
                </AnimatePresence>

                {location.pathname === item.path && (
                  <motion.div
                    className={styles.activeIndicator}
                    layoutId="active-indicator"
                    style={{ background: item.color }}
                  />
                )}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      {!isCollapsed && (
        <motion.div
          className={styles.sidebarFooter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Active Users</span>
              <span className={styles.statValue}>1,234</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Processing</span>
              <span className={styles.statValue}>98%</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default Sidebar;