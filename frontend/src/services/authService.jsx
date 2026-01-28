import api from './api';


export const authService = {
  login: async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    
    try {
      const response = await api.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: () => {
    return api.get('/auth/me');
  },

  updateProfile: (userData) => {
    return api.put('/auth/me', userData);
  },

  getRestaurant: () => {
    return api.get('/restaurants/me');
  },

  updateRestaurant: (restaurantData) => {
    return api.put('/restaurants/me', restaurantData);
  },
};

export default authService;