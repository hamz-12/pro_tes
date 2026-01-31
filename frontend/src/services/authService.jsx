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

  createRestaurant: async (restaurantData) => {
    try {
      const response = await api.post('/restaurants/', restaurantData);
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

  getRestaurants: () => {
    return api.get('/restaurants/');
  },

  getRestaurant: (id) => {
    return api.get(`/restaurants/${id}`);
  },

  updateRestaurant: (id, restaurantData) => {
    return api.put(`/restaurants/${id}`, restaurantData);
  },

  deleteRestaurant: (id) => {
    return api.delete(`/restaurants/${id}`);
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
  }
  
};

export default authService;