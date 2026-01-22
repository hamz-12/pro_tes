import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiBell,
  FiMail,
  FiMessageSquare,
  FiSmartphone,
  FiSave,
  FiCheckCircle,
  FiVolume2,
  FiCalendar,
  FiAlertTriangle,
  FiTrendingUp,
  FiShoppingBag,
  FiUsers
} from 'react-icons/fi';
import styles from './NotificationSettings.module.css';

const NotificationSettings = ({ settings = {}, onSave }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: settings.emailNotifications || {
      marketing: true,
      security: true,
      updates: false,
      weeklyReports: true,
      dailyDigest: false,
    },
    pushNotifications: settings.pushNotifications || {
      newOrders: true,
      orderUpdates: true,
      systemAlerts: true,
      promotions: false,
      reminders: true,
    },
    smsNotifications: settings.smsNotifications || {
      criticalAlerts: true,
      twoFactorAuth: true,
      orderConfirmations: false,
      deliveryUpdates: false,
    },
    notificationPreferences: settings.notificationPreferences || {
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

  const handleToggle = (category, key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: value,
      },
    }));
  };

  const handleQuietHoursChange = (field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        quietHours: {
          ...prev.notificationPreferences.quietHours,
          [field]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(notificationSettings);
    }
  };

  const notificationTypes = [
    {
      id: 'newOrders',
      title: 'New Orders',
      description: 'Get notified when new orders are placed',
      icon: FiShoppingBag,
      category: 'pushNotifications',
    },
    {
      id: 'orderUpdates',
      title: 'Order Updates',
      description: 'Updates on order status and delivery',
      icon: FiMessageSquare,
      category: 'pushNotifications',
    },
    {
      id: 'systemAlerts',
      title: 'System Alerts',
      description: 'Important system notifications and maintenance',
      icon: FiAlertTriangle,
      category: 'pushNotifications',
    },
    {
      id: 'promotions',
      title: 'Promotions & Offers',
      description: 'Special offers and promotional campaigns',
      icon: FiTrendingUp,
      category: 'pushNotifications',
    },
    {
      id: 'weeklyReports',
      title: 'Weekly Reports',
      description: 'Receive weekly performance reports',
      icon: FiCalendar,
      category: 'emailNotifications',
    },
    {
      id: 'dailyDigest',
      title: 'Daily Digest',
      description: 'Daily summary of restaurant activity',
      icon: FiMail,
      category: 'emailNotifications',
    },
    {
      id: 'criticalAlerts',
      title: 'Critical Alerts',
      description: 'Urgent notifications via SMS',
      icon: FiBell,
      category: 'smsNotifications',
    },
    {
      id: 'twoFactorAuth',
      title: '2FA Codes',
      description: 'Two-factor authentication codes',
      icon: FiUsers,
      category: 'smsNotifications',
    },
  ];

  const preferenceOptions = [
    { value: 'low', label: 'Low Priority', description: 'Only important notifications' },
    { value: 'medium', label: 'Medium Priority', description: 'Balanced notification frequency' },
    { value: 'high', label: 'High Priority', description: 'All notifications immediately' },
  ];

  return (
    <motion.div 
      className={styles.notificationSettings}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            <FiBell className={styles.titleIcon} />
            Notification Settings
          </h2>
          <p className={styles.subtitle}>
            Customize how and when you receive notifications
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.saveButton} onClick={handleSave}>
            <FiSave size={18} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Left Column - Notification Types */}
        <div className={styles.leftColumn}>
          {/* Push Notifications */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <FiSmartphone className={styles.sectionIcon} />
                <div>
                  <h4>Push Notifications</h4>
                  <p className={styles.sectionDescription}>
                    Notifications delivered to your device
                  </p>
                </div>
              </div>
              <div className={styles.sectionToggle}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={Object.values(notificationSettings.pushNotifications).some(v => v)}
                    onChange={() => {
                      const allEnabled = Object.values(notificationSettings.pushNotifications).every(v => v);
                      const newState = Object.keys(notificationSettings.pushNotifications)
                        .reduce((acc, key) => ({ ...acc, [key]: !allEnabled }), {});
                      setNotificationSettings(prev => ({
                        ...prev,
                        pushNotifications: newState,
                      }));
                    }}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
            
            <div className={styles.notificationList}>
              {notificationTypes
                .filter(type => type.category === 'pushNotifications')
                .map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.id} className={styles.notificationItem}>
                      <div className={styles.notificationInfo}>
                        <div className={styles.notificationIcon}>
                          <Icon size={20} />
                        </div>
                        <div className={styles.notificationDetails}>
                          <h5>{type.title}</h5>
                          <p>{type.description}</p>
                        </div>
                      </div>
                      <label className={styles.toggleLabel}>
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushNotifications[type.id]}
                          onChange={() => handleToggle('pushNotifications', type.id)}
                          className={styles.toggleInput}
                        />
                        <span className={styles.toggleSlider} />
                      </label>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Email Notifications */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <FiMail className={styles.sectionIcon} />
                <div>
                  <h4>Email Notifications</h4>
                  <p className={styles.sectionDescription}>
                    Notifications sent to your email address
                  </p>
                </div>
              </div>
              <div className={styles.sectionToggle}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={Object.values(notificationSettings.emailNotifications).some(v => v)}
                    onChange={() => {
                      const allEnabled = Object.values(notificationSettings.emailNotifications).every(v => v);
                      const newState = Object.keys(notificationSettings.emailNotifications)
                        .reduce((acc, key) => ({ ...acc, [key]: !allEnabled }), {});
                      setNotificationSettings(prev => ({
                        ...prev,
                        emailNotifications: newState,
                      }));
                    }}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
            
            <div className={styles.notificationList}>
              {notificationTypes
                .filter(type => type.category === 'emailNotifications')
                .map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.id} className={styles.notificationItem}>
                      <div className={styles.notificationInfo}>
                        <div className={styles.notificationIcon}>
                          <Icon size={20} />
                        </div>
                        <div className={styles.notificationDetails}>
                          <h5>{type.title}</h5>
                          <p>{type.description}</p>
                        </div>
                      </div>
                      <label className={styles.toggleLabel}>
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications[type.id]}
                          onChange={() => handleToggle('emailNotifications', type.id)}
                          className={styles.toggleInput}
                        />
                        <span className={styles.toggleSlider} />
                      </label>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* SMS Notifications */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <FiMessageSquare className={styles.sectionIcon} />
                <div>
                  <h4>SMS Notifications</h4>
                  <p className={styles.sectionDescription}>
                    Text message notifications for urgent alerts
                  </p>
                </div>
              </div>
              <div className={styles.sectionToggle}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={Object.values(notificationSettings.smsNotifications).some(v => v)}
                    onChange={() => {
                      const allEnabled = Object.values(notificationSettings.smsNotifications).every(v => v);
                      const newState = Object.keys(notificationSettings.smsNotifications)
                        .reduce((acc, key) => ({ ...acc, [key]: !allEnabled }), {});
                      setNotificationSettings(prev => ({
                        ...prev,
                        smsNotifications: newState,
                      }));
                    }}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
            
            <div className={styles.notificationList}>
              {notificationTypes
                .filter(type => type.category === 'smsNotifications')
                .map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.id} className={styles.notificationItem}>
                      <div className={styles.notificationInfo}>
                        <div className={styles.notificationIcon}>
                          <Icon size={20} />
                        </div>
                        <div className={styles.notificationDetails}>
                          <h5>{type.title}</h5>
                          <p>{type.description}</p>
                        </div>
                      </div>
                      <label className={styles.toggleLabel}>
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsNotifications[type.id]}
                          onChange={() => handleToggle('smsNotifications', type.id)}
                          className={styles.toggleInput}
                        />
                        <span className={styles.toggleSlider} />
                      </label>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column - Preferences */}
        <div className={styles.rightColumn}>
          {/* Notification Preferences */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <FiBell className={styles.sectionIcon} />
              Notification Preferences
            </h4>
            
            <div className={styles.preferencesGrid}>
              {/* Sound Toggle */}
              <div className={styles.preferenceItem}>
                <div className={styles.preferenceInfo}>
                  <div className={styles.preferenceIcon}>
                    <FiVolume2 size={20} />
                  </div>
                  <div>
                    <h5>Sound</h5>
                    <p>Play sound for notifications</p>
                  </div>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notificationPreferences.sound}
                    onChange={() => handlePreferenceChange('sound', !notificationSettings.notificationPreferences.sound)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              {/* Vibration Toggle */}
              <div className={styles.preferenceItem}>
                <div className={styles.preferenceInfo}>
                  <div className={styles.preferenceIcon}>
                    <FiSmartphone size={20} />
                  </div>
                  <div>
                    <h5>Vibration</h5>
                    <p>Vibrate for notifications</p>
                  </div>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notificationPreferences.vibration}
                    onChange={() => handlePreferenceChange('vibration', !notificationSettings.notificationPreferences.vibration)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              {/* Badge Toggle */}
              <div className={styles.preferenceItem}>
                <div className={styles.preferenceInfo}>
                  <div className={styles.preferenceIcon}>
                    <FiCheckCircle size={20} />
                  </div>
                  <div>
                    <h5>Badge Icon</h5>
                    <p>Show badge on app icon</p>
                  </div>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notificationPreferences.badge}
                    onChange={() => handlePreferenceChange('badge', !notificationSettings.notificationPreferences.badge)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
          </div>

          {/* Priority Settings */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Notification Priority</h4>
            
            <div className={styles.priorityOptions}>
              {preferenceOptions.map((option) => (
                <label
                  key={option.value}
                  className={styles.priorityOption}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={notificationSettings.notificationPreferences.priority === option.value}
                    onChange={() => handlePreferenceChange('priority', option.value)}
                    className={styles.priorityInput}
                  />
                  <div className={styles.priorityContent}>
                    <div className={styles.priorityHeader}>
                      <div className={styles.priorityIndicator} />
                      <h5>{option.label}</h5>
                      {notificationSettings.notificationPreferences.priority === option.value && (
                        <FiCheckCircle className={styles.selectedIcon} />
                      )}
                    </div>
                    <p>{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <FiCalendar className={styles.sectionIcon} />
              Quiet Hours
            </h4>
            
            <div className={styles.quietHours}>
              <div className={styles.quietHoursToggle}>
                <div className={styles.quietHoursInfo}>
                  <h5>Enable Quiet Hours</h5>
                  <p>Mute notifications during specified hours</p>
                </div>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notificationPreferences.quietHours.enabled}
                    onChange={() => handleQuietHoursChange('enabled', !notificationSettings.notificationPreferences.quietHours.enabled)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
              
              {notificationSettings.notificationPreferences.quietHours.enabled && (
                <div className={styles.quietHoursSchedule}>
                  <div className={styles.timeInputGroup}>
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={notificationSettings.notificationPreferences.quietHours.start}
                      onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      className={styles.timeInput}
                    />
                  </div>
                  <div className={styles.timeInputGroup}>
                    <label>End Time</label>
                    <input
                      type="time"
                      value={notificationSettings.notificationPreferences.quietHours.end}
                      onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      className={styles.timeInput}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notification Stats */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Notification Statistics</h4>
            
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {Object.values(notificationSettings.pushNotifications).filter(v => v).length}
                </div>
                <div className={styles.statLabel}>Push Notifications</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {Object.values(notificationSettings.emailNotifications).filter(v => v).length}
                </div>
                <div className={styles.statLabel}>Email Notifications</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {Object.values(notificationSettings.smsNotifications).filter(v => v).length}
                </div>
                <div className={styles.statLabel}>SMS Notifications</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {Object.values(notificationSettings.notificationPreferences).filter(v => typeof v === 'boolean' && v).length}
                </div>
                <div className={styles.statLabel}>Preferences</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Quick Actions</h4>
            
            <div className={styles.actionButtons}>
              <button className={styles.actionButton}>
                <FiBell size={18} />
                <span>Test Notifications</span>
              </button>
              <button className={styles.actionButton}>
                <FiCheckCircle size={18} />
                <span>Enable All</span>
              </button>
              <button className={styles.actionButton}>
                <FiAlertTriangle size={18} />
                <span>Disable All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationSettings;