import React from 'react';
import { motion } from 'framer-motion';
import Profile from '../../components/profile/Profile/Profile';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
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