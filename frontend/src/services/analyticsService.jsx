import api from './api';

export const analyticsService = {
  getDashboardData: (params = {}) => {
    return api.get('/analytics/dashboard', { params });
  },

  getSalesData: (params = {}) => {
    return api.get('/analytics/sales', { params });
  },

  getAnomalies: (params = {}) => {
    return api.get('/analytics/anomalies', { params });
  },

  getTrends: (params = {}) => {
    return api.get('/analytics/trends', { params });
  },

  uploadCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/sales', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getUploadedFiles: () => {
    return api.get('/upload/files');
  },
};