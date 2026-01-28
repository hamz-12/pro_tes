import api from './api';

export const dashboardService = {
  getRestaurants: async () => {
    try {
      const response = await api.get('/restaurants/');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get analytics data
  getAnalytics: async (restaurantId, startDate, endDate) => {
    try {
      const response = await api.post('/analytics/', {
        restaurant_id: restaurantId,
        start_date: startDate,
        end_date: endDate,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload CSV and get column preview
  previewCSVColumns: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload/preview-columns', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  uploadCSV: async (file, restaurantId, columnsMapping) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('restaurant_id', restaurantId);
      formData.append('columns_mapping', JSON.stringify(columnsMapping));
      
      const response = await api.post('/upload/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default dashboardService;