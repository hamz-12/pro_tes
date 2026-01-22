import api from './api';

const notificationService = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Clear all notifications
  clearAll: async () => {
    try {
      const response = await api.delete('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  },

  // Get notification preferences
  getPreferences: async () => {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },

  // Create a test notification
  createTestNotification: async (type = 'info') => {
    try {
      const response = await api.post('/notifications/test', { type });
      return response.data;
    } catch (error) {
      console.error('Error creating test notification:', error);
      throw error;
    }
  },

  // Subscribe to push notifications
  subscribeToPush: async (subscription) => {
    try {
      const response = await api.post('/notifications/push/subscribe', subscription);
      return response.data;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  },

  // Unsubscribe from push notifications
  unsubscribeFromPush: async (subscriptionId) => {
    try {
      const response = await api.delete(`/notifications/push/subscribe/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  },

  // Get notification statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/notifications/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification statistics:', error);
      throw error;
    }
  },

  // Client-side notification functions
  client: {
    // Show a toast notification
    showToast: (message, options = {}) => {
      const { type = 'info', duration = 5000, position = 'top-right' } = options;
      
      const toast = document.createElement('div');
      toast.className = `notification-toast notification-${type} notification-${position}`;
      toast.innerHTML = `
        <div class="notification-content">
          <div class="notification-icon">
            ${type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : 'ℹ'}
          </div>
          <div class="notification-message">${message}</div>
          <button class="notification-close">&times;</button>
        </div>
      `;

      document.body.appendChild(toast);

      // Add close functionality
      const closeBtn = toast.querySelector('.notification-close');
      closeBtn.addEventListener('click', () => {
        toast.remove();
      });

      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, duration);
      }

      return toast;
    },

    // Show a confirmation dialog
    showConfirmation: (message, options = {}) => {
      return new Promise((resolve) => {
        const {
          title = 'Confirmation',
          confirmText = 'Confirm',
          cancelText = 'Cancel',
          type = 'warning',
        } = options;

        const dialog = document.createElement('div');
        dialog.className = 'notification-dialog';
        dialog.innerHTML = `
          <div class="dialog-overlay"></div>
          <div class="dialog-content">
            <div class="dialog-header">
              <h3>${title}</h3>
              <button class="dialog-close">&times;</button>
            </div>
            <div class="dialog-body">
              <div class="dialog-icon dialog-icon-${type}">
                ${type === 'warning' ? '⚠' : type === 'danger' ? '☠' : 'ℹ'}
              </div>
              <p>${message}</p>
            </div>
            <div class="dialog-footer">
              <button class="dialog-button dialog-button-cancel">${cancelText}</button>
              <button class="dialog-button dialog-button-confirm">${confirmText}</button>
            </div>
          </div>
        `;

        document.body.appendChild(dialog);

        const closeDialog = (result) => {
          dialog.remove();
          resolve(result);
        };

        // Add event listeners
        dialog.querySelector('.dialog-close').addEventListener('click', () => closeDialog(false));
        dialog.querySelector('.dialog-overlay').addEventListener('click', () => closeDialog(false));
        dialog.querySelector('.dialog-button-cancel').addEventListener('click', () => closeDialog(false));
        dialog.querySelector('.dialog-button-confirm').addEventListener('click', () => closeDialog(true));
      });
    },

    // Show a loading indicator
    showLoading: (message = 'Loading...') => {
      const loading = document.createElement('div');
      loading.className = 'notification-loading';
      loading.innerHTML = `
        <div class="loading-overlay"></div>
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-message">${message}</div>
        </div>
      `;

      document.body.appendChild(loading);
      return loading;
    },

    // Hide loading indicator
    hideLoading: (loadingElement) => {
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.remove();
      }
    },

    // Play notification sound
    playSound: (type = 'info') => {
      const audio = new Audio();
      
      // These would be actual sound files in production
      const sounds = {
        success: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
        error: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
        warning: 'https://assets.mixkit.co/sfx/preview/mixkit-warning-alarm-buzzer-1551.mp3',
        info: 'https://assets.mixkit.co/sfx/preview/mixkit-info-notification-alert-2354.mp3',
      };

      if (sounds[type]) {
        audio.src = sounds[type];
        audio.volume = 0.3;
        audio.play().catch(console.error);
      }
    },

    // Check if browser supports notifications
    supportsNotifications: () => {
      return 'Notification' in window && 'serviceWorker' in navigator;
    },

    // Request notification permission
    requestPermission: async () => {
      if (!('Notification' in window)) {
        return 'unsupported';
      }

      if (Notification.permission === 'granted') {
        return 'granted';
      }

      if (Notification.permission === 'denied') {
        return 'denied';
      }

      try {
        const permission = await Notification.requestPermission();
        return permission;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
      }
    },

    // Create a browser notification
    createBrowserNotification: (title, options = {}) => {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return null;
      }

      const notification = new Notification(title, {
        icon: '/notification-icon.png',
        badge: '/notification-badge.png',
        ...options,
      });

      return notification;
    },
  },
};

// Add CSS for client notifications
const addNotificationStyles = () => {
  if (document.getElementById('notification-styles')) return;

  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    .notification-toast {
      position: fixed;
      z-index: 9999;
      padding: 16px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
    }

    .notification-toast.notification-top-right {
      top: 20px;
      right: 20px;
    }

    .notification-toast.notification-top-left {
      top: 20px;
      left: 20px;
    }

    .notification-toast.notification-bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .notification-toast.notification-bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .notification-toast.notification-success {
      border-left: 4px solid #10b981;
    }

    .notification-toast.notification-error {
      border-left: 4px solid #ef4444;
    }

    .notification-toast.notification-warning {
      border-left: 4px solid #f59e0b;
    }

    .notification-toast.notification-info {
      border-left: 4px solid #60a5fa;
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .notification-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      flex-shrink: 0;
    }

    .notification-message {
      flex: 1;
      color: #f1f5f9;
      font-size: 14px;
      line-height: 1.4;
    }

    .notification-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .notification-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
    }

    .notification-dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
    }

    .dialog-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }

    .dialog-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 64px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(20px);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .dialog-header h3 {
      margin: 0;
      color: #f1f5f9;
      font-size: 18px;
      font-weight: 600;
    }

    .dialog-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .dialog-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
    }

    .dialog-body {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .dialog-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .dialog-icon-warning {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .dialog-icon-danger {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .dialog-body p {
      margin: 0;
      color: #cbd5e1;
      font-size: 14px;
      line-height: 1.6;
    }

    .dialog-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .dialog-button {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid;
    }

    .dialog-button-cancel {
      background: transparent;
      border-color: rgba(255, 255, 255, 0.1);
      color: #94a3b8;
    }

    .dialog-button-cancel:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
    }

    .dialog-button-confirm {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .dialog-button-confirm:hover {
      background: rgba(239, 68, 68, 0.3);
      transform: translateY(-1px);
    }

    .notification-loading {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9998;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(4px);
    }

    .loading-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      min-width: 200px;
      backdrop-filter: blur(20px);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      border-top-color: #60a5fa;
      animation: spin 1s linear infinite;
    }

    .loading-message {
      color: #cbd5e1;
      font-size: 14px;
      text-align: center;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  document.head.appendChild(style);
};

// Initialize styles when module is loaded
addNotificationStyles();

export default notificationService;