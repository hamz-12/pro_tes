import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiSearch,
  FiMoon,
  FiSun,
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/data', label: 'Data', icon: '💾' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const userMenuItems = [
    { icon: <FiUser />, label: 'Profile', onClick: () => navigate('/settings/profile') },
    { icon: <FiSettings />, label: 'Settings', onClick: () => navigate('/settings') },
    { icon: <FiLogOut />, label: 'Logout', onClick: handleLogout },
  ];

  return (
    <motion.header
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <button
            className={styles.menuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          
          <Link to="/dashboard" className={styles.logo}>
            <motion.div
              className={styles.logoIcon}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              🍽️
            </motion.div>
            <div className={styles.logoText}>
              <span className={styles.logoPrimary}>Restaurant</span>
              <span className={styles.logoSecondary}>Analytics</span>
            </div>
          </Link>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navItems}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${
                  location.pathname === item.path ? styles.active : ''
                }`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {location.pathname === item.path && (
                  <motion.div
                    className={styles.navIndicator}
                    layoutId="nav-indicator"
                  />
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className={styles.actions}>
          <motion.button
            className={styles.searchButton}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Search"
          >
            <FiSearch size={20} />
          </motion.button>

          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <button className={styles.notificationButton}>
            <FiBell size={20} />
            <span className={styles.notificationBadge}>3</span>
          </button>

          <div className={styles.userMenuContainer}>
            <button
              className={styles.userButton}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label="User menu"
            >
              <div className={styles.userAvatar}>
                {user?.restaurant_name?.charAt(0) || 'U'}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {user?.restaurant_name || 'Restaurant'}
                </span>
                <span className={styles.userEmail}>
                  {user?.email || 'admin@restaurant.com'}
                </span>
              </div>
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  className={styles.userDropdown}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {userMenuItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      className={styles.dropdownItem}
                      onClick={item.onClick}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <span className={styles.dropdownIcon}>{item.icon}</span>
                      {item.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              className={styles.searchOverlay}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className={styles.searchInputWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search analytics, reports, data..."
                  className={styles.searchInput}
                  autoFocus
                />
                <button
                  className={styles.searchClose}
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Close search"
                >
                  <FiX size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.mobileNavItems}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.mobileNavItem} ${
                    location.pathname === item.path ? styles.mobileActive : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className={styles.mobileNavIcon}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;