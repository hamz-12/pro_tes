import api from './api';

export const authService = {
  login: (email, password) => {
    // const formData = new FormData();
    // formData.append('username', email);
    // formData.append('password', password);
    // return api.post('/auth/login', formData);

    const params = new URLSearchParams();
    params.append('username', email); // FastAPI OAuth2 expects 'username'
    params.append('password', password);
    
    // return api.post('/auth/login', params);
    return api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  register: (userData) => {
    return api.post('/auth/register', userData);
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