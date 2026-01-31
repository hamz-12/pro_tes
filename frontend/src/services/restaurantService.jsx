import api from './api';

export const restaurantService = {
  createRestaurant: async (restaurantData) => {
    try {
      const response = await api.post('/restaurants/', restaurantData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to create restaurant';
      return { success: false, message: errorMessage };
    }
  },

  getRestaurants: async () => {
    try {
      const response = await api.get('/restaurants/');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch restaurants';
      return { success: false, message: errorMessage };
    }
  },

  getRestaurant: async (id) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch restaurant';
      return { success: false, message: errorMessage };
    }
  },

  updateRestaurant: async (id, restaurantData) => {
    try {
      const response = await api.put(`/restaurants/${id}`, restaurantData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update restaurant';
      return { success: false, message: errorMessage };
    }
  },

  deleteRestaurant: async (id) => {
    try {
      await api.delete(`/restaurants/${id}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete restaurant';
      return { success: false, message: errorMessage };
    }
  }
};
export default restaurantService;