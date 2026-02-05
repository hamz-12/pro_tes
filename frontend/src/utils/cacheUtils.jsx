// utils/cacheUtils.jsx

// Local Storage Cache with TTL (Time To Live)
export const localCache = {
  set: (key, data, ttlMinutes = 30) => {
    const item = {
      data,
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    };
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (e) {
      console.warn('LocalStorage cache set failed:', e);
    }
  },

  get: (key) => {
    try {
      const itemStr = localStorage.getItem(`cache_${key}`);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      return item.data;
    } catch (e) {
      console.warn('LocalStorage cache get failed:', e);
      return null;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (e) {
      console.warn('LocalStorage cache remove failed:', e);
    }
  },

  clear: (prefix = 'cache_') => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(prefix))
        .forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.warn('LocalStorage cache clear failed:', e);
    }
  },
};

// Session Storage Cache (cleared on tab close)
export const sessionCache = {
  set: (key, data) => {
    try {
      sessionStorage.setItem(`session_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn('SessionStorage cache set failed:', e);
    }
  },

  get: (key) => {
    try {
      const item = sessionStorage.getItem(`session_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.warn('SessionStorage cache get failed:', e);
      return null;
    }
  },

  remove: (key) => {
    try {
      sessionStorage.removeItem(`session_${key}`);
    } catch (e) {
      console.warn('SessionStorage cache remove failed:', e);
    }
  },

  clear: () => {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('SessionStorage cache clear failed:', e);
    }
  },
};

// Memory Cache (fastest, but lost on page refresh)
const memoryCache = new Map();

export const memCache = {
  set: (key, data, ttlMinutes = 5) => {
    memoryCache.set(key, {
      data,
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    });
  },

  get: (key) => {
    const item = memoryCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return item.data;
  },

  remove: (key) => {
    memoryCache.delete(key);
  },

  clear: () => {
    memoryCache.clear();
  },

  has: (key) => {
    const item = memoryCache.get(key);
    if (!item) return false;
    if (Date.now() > item.expiry) {
      memoryCache.delete(key);
      return false;
    }
    return true;
  },
};

// Generate cache key from parameters
export const generateCacheKey = (...args) => {
  return args.map(arg => {
    if (arg === null || arg === undefined) return 'null';
    if (typeof arg === 'object') return JSON.stringify(arg);
    return String(arg);
  }).join('_');
};

// Debounce function for API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for limiting API calls
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};