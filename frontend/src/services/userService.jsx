import api from './api';

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const getUserWithStats = async () => {
  const response = await api.get('/auth/me/stats');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const snakeCaseData = {
    email: profileData.email,
    username: profileData.username,
    first_name: profileData.firstName,
    last_name: profileData.lastName,
    phone: profileData.phone,
    bio: profileData.bio,
    location: profileData.location,
    website: profileData.website,
    job_title: profileData.jobTitle,
  };
  
  Object.keys(snakeCaseData).forEach(key => {
    if (snakeCaseData[key] === undefined || snakeCaseData[key] === null) {
      delete snakeCaseData[key];
    }
  });
  
  const response = await api.put('/auth/me', snakeCaseData);
  return response.data;
};


export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/auth/me/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
};


export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/auth/me/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const removeProfileImage = async () => {
  const response = await api.delete('/auth/me/remove-image');
  return response.data;
};

export const transformUserData = (userData) => {
  return {
    id: userData.id,
    email: userData.email,
    username: userData.username,
    isActive: userData.is_active,
    createdAt: userData.created_at,
    updatedAt: userData.updated_at,
    firstName: userData.first_name || '',
    lastName: userData.last_name || '',
    phone: userData.phone || '',
    bio: userData.bio || '',
    location: userData.location || '',
    website: userData.website || '',
    jobTitle: userData.job_title || '',
    profileImage: userData.profile_image || null,
    // Stats (if available)
    totalRestaurants: userData.total_restaurants || 0,
    totalUploads: userData.total_uploads || 0,
    totalRevenue: userData.total_revenue || 0,
  };
};

export default {
  getCurrentUser,
  getUserWithStats,
  updateProfile,
  changePassword,
  uploadProfileImage,
  removeProfileImage,
  transformUserData,
};