import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSettings,
  FiUser,
  FiHome,
  FiBell,
  FiShield,
  FiHelpCircle,
  FiMoon,
  FiGlobe,
  FiDatabase,
  FiLogOut
} from 'react-icons/fi';
import Profile from '../../components/settings/Profile/Profile';
import RestaurantSettings from '../../components/settings/RestaurantSettings/RestaurantSettings';
import NotificationSettings from '../../components/settings/NotificationSettings/NotificationSettings';
import styles from './SettingsPage.module.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user] = useState({
    name: 'John Restaurant',
    email: 'john@restaurant.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY',
    bio: 'Restaurant owner with 10+ years of experience in the food industry. Passionate about delivering exceptional dining experiences.',
    role: 'Owner/Manager',
    joinDate: 'January 15, 2023',
    avatar: null,
  });

  const [restaurant] = useState({
    name: 'Epicurean Delights',
    address: '456 Gourmet Avenue, San Francisco, CA',
    phone: '+1 (555) 987-6543',
    website: 'https://epicureandelights.com',
    email: 'info@epicureandelights.com',
    cuisine: 'Modern American Fusion',
    description: 'Award-winning restaurant offering innovative dishes with locally sourced ingredients.',
    taxRate: 8.5,
    serviceCharge: 10,
    currency: 'USD',
    timezone: 'UTC-08:00',
  });

  const [notificationSettings] = useState({
    emailNotifications: {
      marketing: true,
      security: true,
      updates: false,
      weeklyReports: true,
      dailyDigest: false,
    },
    pushNotifications: {
      newOrders: true,
      orderUpdates: true,
      systemAlerts: true,
      promotions: false,
      reminders: true,
    },
    smsNotifications: {
      criticalAlerts: true,
      twoFactorAuth: true,
      orderConfirmations: false,
      deliveryUpdates: false,
    },
    notificationPreferences: {
      sound: true,
      vibration: true,
      badge: true,
      priority: 'medium',
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
      },
    },
  });

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: FiUser, description: 'Personal information and account settings' },
    { id: 'restaurant', label: 'Restaurant', icon: FiHome, description: 'Business information and settings' },
    { id: 'notifications', label: 'Notifications', icon: FiBell, description: 'Notification preferences and alerts' },
    { id: 'security', label: 'Security', icon: FiShield, description: 'Password, 2FA, and security settings' },
    { id: 'appearance', label: 'Appearance', icon: FiMoon, description: 'Theme and display preferences' },
    { id: 'language', label: 'Language', icon: FiGlobe, description: 'Language and regional settings' },
    { id: 'data', label: 'Data & Privacy', icon: FiDatabase, description: 'Data management and privacy controls' },
    { id: 'help', label: 'Help & Support', icon: FiHelpCircle, description: 'Documentation and support resources' },
  ];

  const handleSaveProfile = (profileData) => {
    console.log('Saving profile:', profileData);
    // In a real app, this would make an API call
  };

  const handleSaveRestaurant = (restaurantData) => {
    console.log('Saving restaurant settings:', restaurantData);
    // In a real app, this would make an API call
  };

  const handleSaveNotifications = (notificationData) => {
    console.log('Saving notification settings:', notificationData);
    // In a real app, this would make an API call
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // In a real app, this would clear auth tokens and redirect
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile user={user} onSave={handleSaveProfile} />;
      case 'restaurant':
        return <RestaurantSettings restaurant={restaurant} onSave={handleSaveRestaurant} />;
      case 'notifications':
        return <NotificationSettings settings={notificationSettings} onSave={handleSaveNotifications} />;
      default:
        return (
          <div className={styles.placeholderContent}>
            <div className={styles.placeholderIcon}>
              <FiSettings size={48} />
            </div>
            <h3>Coming Soon</h3>
            <p>This section is under development. Please check back later.</p>
          </div>
        );
    }
  };

  return (
    <motion.div 
      className={styles.settingsPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <FiSettings className={styles.titleIcon} />
            Settings
          </h1>
          <p className={styles.subtitle}>
            Manage your account, restaurant, and application preferences
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Sidebar Menu */}
        <div className={styles.sidebar}>
          <div className={styles.menuHeader}>
            <h3>Settings Menu</h3>
            <p>Navigate through different settings sections</p>
          </div>
          
          <div className={styles.menuItems}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`${styles.menuItem} ${activeTab === item.id ? styles.active : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <div className={styles.menuItemIcon}>
                    <Icon size={20} />
                  </div>
                  <div className={styles.menuItemContent}>
                    <h4>{item.label}</h4>
                    <p>{item.description}</p>
                  </div>
                  {activeTab === item.id && (
                    <div className={styles.activeIndicator} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>
              {menuItems.find(item => item.id === activeTab)?.label || 'Settings'}
            </h2>
            <p className={styles.contentDescription}>
              {menuItems.find(item => item.id === activeTab)?.description || 'Manage your settings'}
            </p>
          </div>
          
          <div className={styles.contentBody}>
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className={styles.footer}>
        <div className={styles.footerStats}>
          <div className={styles.footerStat}>
            <div className={styles.footerStatValue}>v2.4.1</div>
            <div className={styles.footerStatLabel}>App Version</div>
          </div>
          <div className={styles.footerStat}>
            <div className={styles.footerStatValue}>Active</div>
            <div className={styles.footerStatLabel}>Status</div>
          </div>
          <div className={styles.footerStat}>
            <div className={styles.footerStatValue}>Premium</div>
            <div className={styles.footerStatLabel}>Plan</div>
          </div>
          <div className={styles.footerStat}>
            <div className={styles.footerStatValue}>30 Days</div>
            <div className={styles.footerStatLabel}>Renews In</div>
          </div>
        </div>
        
        <div className={styles.footerActions}>
          <button className={styles.footerButton}>
            View Documentation
          </button>
          <button className={styles.footerButton}>
            Contact Support
          </button>
          <button className={styles.footerButton}>
            Give Feedback
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;