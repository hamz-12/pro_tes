import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import Profile from '../../components/profile/Profile/Profile';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      className={styles.profilePage}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Navigation Header */}
      <div className={styles.navigationHeader}>
        <motion.button
          className={styles.backButton}
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </motion.button>
        
        <nav className={styles.breadcrumb}>
          <button 
            className={styles.breadcrumbLink}
            onClick={() => navigate('/dashboard')}
          >
            <FiHome size={14} />
            <span>Dashboard</span>
          </button>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Profile</span>
        </nav>
      </div>
      
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Profile</h1>
        <p className={styles.pageSubtitle}>
          Manage your personal information and account settings
        </p>
      </div>
      
      <Profile />
    </motion.div>
  );
};

export default ProfilePage;