// hooks/useUserData.jsx
import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as userService from '../services/userService';
import { toast } from 'react-hot-toast';

export const USER_QUERY_KEYS = {
  currentUser: 'currentUser',
  userStats: 'userStats',
};

/**
 * Hook to fetch current user with caching
 */
export const useCurrentUser = (options = {}) => {
  return useQuery(
    USER_QUERY_KEYS.currentUser,
    async () => {
      const data = await userService.getCurrentUser();
      return userService.transformUserData(data);
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      ...options,
    }
  );
};

/**
 * Hook to fetch user with stats
 */
export const useUserWithStats = (options = {}) => {
  return useQuery(
    USER_QUERY_KEYS.userStats,
    async () => {
      const data = await userService.getUserWithStats();
      return userService.transformUserData(data);
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      ...options,
    }
  );
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (profileData) => userService.updateProfile(profileData),
    {
      onSuccess: (data) => {
        // Update both user caches
        const transformedData = userService.transformUserData(data);
        queryClient.setQueryData(USER_QUERY_KEYS.currentUser, transformedData);
        queryClient.invalidateQueries(USER_QUERY_KEYS.userStats);
        toast.success('Profile updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update profile');
      },
    }
  );
};

/**
 * Hook to change password
 */
export const useChangePassword = () => {
  return useMutation(
    ({ currentPassword, newPassword }) => 
      userService.changePassword(currentPassword, newPassword),
    {
      onSuccess: () => {
        toast.success('Password changed successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to change password');
      },
    }
  );
};

/**
 * Hook to upload profile image
 */
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (file) => userService.uploadProfileImage(file),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(USER_QUERY_KEYS.currentUser);
        queryClient.invalidateQueries(USER_QUERY_KEYS.userStats);
        toast.success('Profile image uploaded');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to upload image');
      },
    }
  );
};

/**
 * Hook to remove profile image
 */
export const useRemoveProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    () => userService.removeProfileImage(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(USER_QUERY_KEYS.currentUser);
        queryClient.invalidateQueries(USER_QUERY_KEYS.userStats);
        toast.success('Profile image removed');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to remove image');
      },
    }
  );
};