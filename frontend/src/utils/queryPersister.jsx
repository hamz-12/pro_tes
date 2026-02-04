// utils/queryPersister.js

const CACHE_KEY = 'REACT_QUERY_CACHE';
const CACHE_VERSION = 'v1';
const MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Save query cache to localStorage
 */
export const persistQueryCache = (queryClient) => {
  try {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const serializedCache = queries
      .filter(query => {
        // Only persist successful queries with data
        return query.state.status === 'success' && query.state.data;
      })
      .map(query => ({
        queryKey: query.queryKey,
        data: query.state.data,
        dataUpdatedAt: query.state.dataUpdatedAt,
      }));
    
    const cacheData = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      queries: serializedCache,
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('💾 Cache persisted to localStorage');
  } catch (error) {
    console.warn('Failed to persist cache:', error);
  }
};

/**
 * Restore query cache from localStorage
 */
export const restoreQueryCache = (queryClient) => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;
    
    const cacheData = JSON.parse(cached);
    
    // Check version
    if (cacheData.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY);
      return false;
    }
    
    // Check age
    if (Date.now() - cacheData.timestamp > MAX_AGE) {
      localStorage.removeItem(CACHE_KEY);
      console.log('🗑️ Cache expired, cleared');
      return false;
    }
    
    // Restore queries
    cacheData.queries.forEach(({ queryKey, data, dataUpdatedAt }) => {
      // Only restore if data is not too old (e.g., 30 minutes for analytics)
      const age = Date.now() - dataUpdatedAt;
      const maxStaleTime = queryKey[0] === 'analytics' ? 5 * 60 * 1000 : 30 * 60 * 1000;
      
      if (age < maxStaleTime) {
        queryClient.setQueryData(queryKey, data);
        console.log(`✅ Restored cache for: ${JSON.stringify(queryKey)}`);
      } else {
        console.log(`⏭️ Skipped stale cache for: ${JSON.stringify(queryKey)}`);
      }
    });
    
    return true;
  } catch (error) {
    console.warn('Failed to restore cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return false;
  }
};

/**
 * Clear persisted cache
 */
export const clearPersistedCache = () => {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ Persisted cache cleared');
};

/**
 * Setup auto-persist on cache updates
 */
export const setupCachePersistence = (queryClient) => {
  // Persist cache periodically and on visibility change
  let persistTimeout = null;
  
  const debouncedPersist = () => {
    if (persistTimeout) clearTimeout(persistTimeout);
    persistTimeout = setTimeout(() => {
      persistQueryCache(queryClient);
    }, 1000);
  };
  
  // Listen to cache changes
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    debouncedPersist();
  });
  
  // Persist when user leaves page
  window.addEventListener('beforeunload', () => {
    persistQueryCache(queryClient);
  });
  
  // Persist when tab becomes hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      persistQueryCache(queryClient);
    }
  });
  
  return unsubscribe;
};