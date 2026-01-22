import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import notificationService from '../services/notificationService';
import { NOTIFICATION } from '../utils/constants';

// Create context
const NotificationContext = createContext(null);

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(null);

  // Load notifications and preferences
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        
        // Load preferences
        const prefs = await notificationService.getPreferences();
        setPreferences(prefs);
        
        // Load notifications
        const response = await notificationService.getNotifications({
          limit: 50,
          unreadOnly: false,
        });
        
        if (response.success && response.data) {
          setNotifications(response.data.notifications || []);
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Add a notification
  const addNotification = useCallback((notification) => {
    const id = notification.id || uuidv4();
    const timestamp = notification.timestamp || new Date().toISOString();
    
    const newNotification = {
      id,
      ...notification,
      timestamp,
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
    setUnreadCount(prev => prev + 1);
    
    // Play sound if enabled
    if (preferences?.sound && notification.sound !== false) {
      notificationService.client.playSound(notification.type || 'info');
    }
    
    // Show browser notification if enabled and permission granted
    if (preferences?.browser && Notification.permission === 'granted') {
      notificationService.client.createBrowserNotification(
        notification.title,
        {
          body: notification.message,
          icon: '/notification-icon.png',
          tag: id,
        }
      );
    }
    
    return id;
  }, [preferences]);

  // Remove a notification
  const removeNotification = useCallback(async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Update unread count if notification was unread
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
      // Remove from local state even if API fails
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  }, [notifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  }, []);

  // Show a toast notification
  const showToast = useCallback((message, options = {}) => {
    const {
      type = 'info',
      duration = 5000,
      position = 'top-right',
      title,
      action,
    } = options;
    
    const id = addNotification({
      type,
      title: title || type.charAt(0).toUpperCase() + type.slice(1),
      message,
      action,
      dismissible: true,
      autoDismiss: duration > 0,
      duration,
    });
    
    // Auto dismiss if duration is set
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, [addNotification, removeNotification]);

  // Show success toast
  const showSuccess = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'success' });
  }, [showToast]);

  // Show error toast
  const showError = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'error' });
  }, [showToast]);

  // Show warning toast
  const showWarning = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'warning' });
  }, [showToast]);

  // Show info toast
  const showInfo = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'info' });
  }, [showToast]);

  // Show confirmation dialog
  const showConfirmation = useCallback(async (message, options = {}) => {
    return notificationService.client.showConfirmation(message, options);
  }, []);

  // Show loading indicator
  const showLoading = useCallback((message = 'Loading...') => {
    return notificationService.client.showLoading(message);
  }, []);

  // Hide loading indicator
  const hideLoading = useCallback((loadingElement) => {
    notificationService.client.hideLoading(loadingElement);
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      const response = await notificationService.updatePreferences(newPreferences);
      
      if (response.success) {
        setPreferences(newPreferences);
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (err) {
      console.error('Failed to update preferences:', err);
      return { success: false, message: err.message };
    }
  }, []);

  // Get filtered notifications
  const getFilteredNotifications = useCallback((filters = {}) => {
    const {
      type,
      read,
      priority,
      limit,
    } = filters;
    
    let filtered = [...notifications];
    
    if (type) {
      filtered = filtered.filter(n => n.type === type);
    }
    
    if (read !== undefined) {
      filtered = filtered.filter(n => n.read === read);
    }
    
    if (priority) {
      filtered = filtered.filter(n => n.priority === priority);
    }
    
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }, [notifications]);

  // Get notification statistics
  const getStatistics = useCallback(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const read = total - unread;
    
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});
    
    const byPriority = notifications.reduce((acc, n) => {
      const priority = n.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total,
      unread,
      read,
      byType,
      byPriority,
    };
  }, [notifications]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    return await notificationService.client.requestPermission();
  }, []);

  // Test notification
  const testNotification = useCallback(async (type = 'info') => {
    try {
      const response = await notificationService.createTestNotification(type);
      
      if (response.success) {
        addNotification({
          type,
          title: 'Test Notification',
          message: 'This is a test notification to verify your settings.',
          test: true,
        });
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (err) {
      console.error('Failed to create test notification:', err);
      return { success: false, message: err.message };
    }
  }, [addNotification]);

  // Context value
  const value = {
    notifications,
    unreadCount,
    loading,
    preferences,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    showLoading,
    hideLoading,
    updatePreferences,
    getFilteredNotifications,
    getStatistics,
    requestPermission,
    testNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification center component
export const NotificationCenter = ({ className = '', maxNotifications = 10 }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotification();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  }).slice(0, maxNotifications);
  
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.onClick) {
      notification.onClick();
    }
    
    if (notification.autoClose !== false) {
      setIsOpen(false);
    }
  };
  
  return (
    <div className={`notification-center ${className}`}>
      <button
        className="notification-center-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <span className="notification-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h3>Notifications</h3>
            <div className="notification-panel-actions">
              {unreadCount > 0 && (
                <button
                  className="notification-action"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
              <button
                className="notification-action"
                onClick={clearAll}
              >
                Clear all
              </button>
              <button
                className="notification-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="notification-filters">
            <button
              className={`notification-filter ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`notification-filter ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
            <button
              className={`notification-filter ${filter === 'success' ? 'active' : ''}`}
              onClick={() => setFilter('success')}
            >
              Success
            </button>
            <button
              className={`notification-filter ${filter === 'error' ? 'active' : ''}`}
              onClick={() => setFilter('error')}
            >
              Errors
            </button>
          </div>
          
          <div className="notification-list">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'} notification-${notification.type}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-header">
                    <span className="notification-type-icon">
                      {notification.type === 'success' && '✓'}
                      {notification.type === 'error' && '✗'}
                      {notification.type === 'warning' && '⚠'}
                      {notification.type === 'info' && 'ℹ'}
                    </span>
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  {notification.action && (
                    <div className="notification-actions">
                      <button
                        className="notification-action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          notification.action.onClick?.();
                        }}
                      >
                        {notification.action.label}
                      </button>
                    </div>
                  )}
                  
                  <button
                    className="notification-dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="notification-empty">
                <p>No notifications</p>
              </div>
            )}
          </div>
          
          {filteredNotifications.length > 0 && (
            <div className="notification-panel-footer">
              <a href="/notifications" className="notification-view-all">
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationContext;