// hooks/useDashboardData.jsx
import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as dashboardService from '../services/dashboardService';
import { toast } from 'react-hot-toast';

// Query Keys - centralized for consistency
export const QUERY_KEYS = {
  restaurants: 'restaurants',
  analytics: (restaurantId, startDate, endDate) => ['analytics', restaurantId, startDate, endDate],
  csvPreview: 'csvPreview',
  userStats: 'userStats',
};

/**
 * Hook to fetch restaurants with caching
 */
export const useRestaurants = (options = {}) => {
  return useQuery(
    QUERY_KEYS.restaurants,
    async () => {
      console.log('🔄 Fetching restaurants from API...');
      const data = await dashboardService.getRestaurants();
      
      // Normalize data
      if (Array.isArray(data)) {
        return data;
      } else if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes - restaurants don't change often
      cacheTime: 60 * 60 * 1000, // 1 hour cache
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      ...options,
    }
  );
};

/**
 * Hook to fetch analytics data with caching
 */
export const useAnalytics = (restaurantId, startDate, endDate, options = {}) => {
  return useQuery(
    QUERY_KEYS.analytics(restaurantId, startDate, endDate),
    async () => {
      console.log(`🔄 Fetching analytics for restaurant ${restaurantId}...`);
      const data = await dashboardService.getAnalytics(restaurantId, startDate, endDate);
      
      // Transform sales_by_hour if needed
      if (data?.sales_by_hour && typeof data.sales_by_hour === 'object' && !Array.isArray(data.sales_by_hour)) {
        data.sales_by_hour = Object.entries(data.sales_by_hour).map(([hour, values]) => {
          const hourNum = parseInt(hour, 10);
          if (typeof values === 'object' && values !== null) {
            return {
              hour: hourNum,
              total_revenue: values.total_revenue || values.revenue || 0,
              transaction_count: values.transaction_count || values.transactions || 0
            };
          }
          return {
            hour: hourNum,
            total_revenue: values || 0,
            transaction_count: 0
          };
        });
      }
      
      return data;
    },
    {
      enabled: !!restaurantId, // Only fetch if restaurantId exists
      staleTime: 2 * 60 * 1000, // 2 minutes - analytics can change more frequently
      cacheTime: 15 * 60 * 1000, // 15 minutes cache
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      keepPreviousData: true,
      ...options,
    }
  );
};

/**
 * Hook to create a restaurant
 */
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (restaurantData) => dashboardService.createRestaurant(restaurantData),
    {
      onSuccess: (newRestaurant) => {
        // Update the restaurants cache
        queryClient.setQueryData(QUERY_KEYS.restaurants, (old) => {
          return old ? [...old, newRestaurant] : [newRestaurant];
        });
        toast.success('Restaurant created successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to create restaurant');
      },
    }
  );
};

/**
 * Hook to upload CSV with cache invalidation
 */
export const useUploadCSV = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ file, restaurantId, columnsMapping }) => 
      dashboardService.uploadCSV(file, restaurantId, columnsMapping),
    {
      onSuccess: (data, variables) => {
        // Invalidate analytics cache for this restaurant
        queryClient.invalidateQueries(['analytics', variables.restaurantId]);
        toast.success('CSV uploaded successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to upload CSV');
      },
    }
  );
};

/**
 * Hook to preview CSV columns
 */
export const usePreviewCSV = () => {
  return useMutation(
    (file) => dashboardService.previewCSVColumns(file),
    {
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to preview CSV');
      },
    }
  );
};

/**
 * Hook to manually refresh dashboard data
 */
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  
  return {
    refreshRestaurants: () => {
      queryClient.invalidateQueries(QUERY_KEYS.restaurants);
    },
    refreshAnalytics: (restaurantId) => {
      queryClient.invalidateQueries(['analytics', restaurantId]);
    },
    refreshAll: (restaurantId) => {
      queryClient.invalidateQueries(QUERY_KEYS.restaurants);
      if (restaurantId) {
        queryClient.invalidateQueries(['analytics', restaurantId]);
      }
    },
  };
};

/**
 * Hook to prefetch analytics data
 */
export const usePrefetchAnalytics = () => {
  const queryClient = useQueryClient();
  
  return (restaurantId, startDate, endDate) => {
    queryClient.prefetchQuery(
      QUERY_KEYS.analytics(restaurantId, startDate, endDate),
      () => dashboardService.getAnalytics(restaurantId, startDate, endDate),
      {
        staleTime: 2 * 60 * 1000,
      }
    );
  };
};