import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiCall, options = {}) => {
    const {
      showLoading = true,
      showError = true,
      showSuccess = false,
      successMessage = 'Operation completed successfully',
      errorMessage = 'An error occurred',
    } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      
      if (showSuccess && successMessage) {
        toast.success(successMessage);
      }
      
      return { data: result, error: null };
    } catch (err) {
      const message = err.response?.data?.detail || errorMessage;
      
      if (showError) {
        toast.error(message);
      }
      
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    callApi,
    resetError,
  };
};