import api from './api';

export const getRestaurants = async () => {
  try {
    console.log('Fetching restaurants...');
    const response = await api.get('/restaurants/');
    console.log('Restaurants API response:', response);
    console.log('Restaurants data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};

export const getAnalytics = async (restaurantId, startDate, endDate) => {
  try {
    console.log('Fetching analytics for restaurant:', restaurantId, 'from', startDate, 'to', endDate);
    
    // Build query parameters for GET request
    const params = new URLSearchParams();
    params.append('restaurant_id', restaurantId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    // Use GET request instead of POST
    const response = await api.get(`/analytics/?${params.toString()}`);
    
    console.log('Analytics API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};

export const previewCSVColumns = async (file) => {
  try {
    console.log('Previewing CSV columns for file:', file.name);
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/preview-columns', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('CSV preview API response:', response);
    console.log('CSV preview data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in previewCSVColumns:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};

export const uploadCSV = async (file, restaurantId, columnMapping) => {
  try {
    console.log('Uploading CSV file:', file.name, 'for restaurant:', restaurantId);
    console.log('Column mapping:', columnMapping);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('restaurant_id', restaurantId);
    formData.append('columns_mapping', JSON.stringify(columnMapping));
    
    const response = await api.post('/upload/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('CSV upload API response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in uploadCSV:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};

// Add a function to create a restaurant
export const createRestaurant = async (restaurantData) => {
  try {
    console.log('Creating restaurant with data:', restaurantData);
    const response = await api.post('/restaurants/', restaurantData);
    console.log('Create restaurant API response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in createRestaurant:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};

