import { DATE_FORMATS, CURRENCY } from './constants';

/**
 * Debounce function to limit the rate at which a function can fire
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} immediate - Whether to trigger the function on the leading edge
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle function to ensure a function is only called at most once per specified period
 * @param {Function} func - The function to throttle
 * @param {number} limit - The number of milliseconds to throttle by
 * @returns {Function} - Throttled function
 */
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

/**
 * Deep clone an object or array
 * @param {any} obj - The object to clone
 * @returns {any} - Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.reduce((arr, item, i) => {
    arr[i] = deepClone(item);
    return arr;
  }, []);
  if (typeof obj === 'object') return Object.keys(obj).reduce((newObj, key) => {
    newObj[key] = deepClone(obj[key]);
    return newObj;
  }, {});
  return obj;
};

/**
 * Merge multiple objects deeply
 * @param {...Object} objects - Objects to merge
 * @returns {Object} - Merged object
 */
export const deepMerge = (...objects) => {
  const isObject = (obj) => obj && typeof obj === 'object';
  
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];
      
      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = deepMerge(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });
    
    return prev;
  }, {});
};

/**
 * Generate a unique ID
 * @param {number} length - Length of the ID
 * @returns {string} - Unique ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format a date string
 * @param {Date|string|number} date - The date to format
 * @param {string} format - The format string (from DATE_FORMATS)
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = DATE_FORMATS.MEDIUM) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const map = {
    M: d.getMonth() + 1,
    d: d.getDate(),
    h: d.getHours(),
    H: d.getHours() % 12 || 12,
    m: d.getMinutes(),
    s: d.getSeconds(),
    y: d.getFullYear().toString().substr(-2),
    Y: d.getFullYear(),
    a: d.getHours() < 12 ? 'am' : 'pm',
    A: d.getHours() < 12 ? 'AM' : 'PM',
  };
  
  return format.replace(/(M+|d+|h+|H+|m+|s+|y+|Y+|a|A)/g, (match) => {
    if (match === 'a' || match === 'A') return map[match];
    const value = map[match[0]];
    return match.length === 1 ? value : ('0' + value).slice(-2);
  });
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (default: 'USD')
 * @param {string} locale - The locale string (default: 'en-US')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'USD', locale = 'en-US') => {
  if (isNaN(amount)) return 'Invalid Amount';
  
  const currency = CURRENCY[currencyCode] || CURRENCY.USD;
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  });
  
  return formatter.format(amount);
};

/**
 * Format a number with commas
 * @param {number} number - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number string
 */
export const formatNumber = (number, decimals = 0) => {
  if (isNaN(number)) return 'Invalid Number';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Format bytes to human readable format
 * @param {number} bytes - The number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted string
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Calculate percentage
 * @param {number} value - The value
 * @param {number} total - The total value
 * @param {number} decimals - Number of decimal places
 * @returns {number} - Percentage
 */
export const calculatePercentage = (value, total, decimals = 1) => {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(decimals));
};

/**
 * Get the difference between two dates in various units
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @param {string} unit - Unit of difference ('days', 'hours', 'minutes', 'seconds')
 * @returns {number} - Difference in specified unit
 */
export const dateDiff = (date1, date2, unit = 'days') => {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  
  const units = {
    days: diff / (1000 * 60 * 60 * 24),
    hours: diff / (1000 * 60 * 60),
    minutes: diff / (1000 * 60),
    seconds: diff / 1000,
  };
  
  return units[unit] || units.days;
};

/**
 * Generate a random color
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} - RGBA color string
 */
export const randomColor = (opacity = 1) => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Generate a gradient color
 * @param {string} color1 - First color
 * @param {string} color2 - Second color
 * @param {number} angle - Gradient angle in degrees
 * @returns {string} - CSS gradient string
 */
export const gradient = (color1, color2, angle = 135) => {
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalize the first letter of each word
 * @param {string} text - The text to capitalize
 * @returns {string} - Capitalized text
 */
export const capitalizeWords = (text) => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Parse query string to object
 * @param {string} queryString - The query string
 * @returns {Object} - Parsed query object
 */
export const parseQueryString = (queryString) => {
  if (!queryString) return {};
  
  return queryString
    .replace(/^\?/, '')
    .split('&')
    .reduce((params, param) => {
      const [key, value] = param.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
      return params;
    }, {});
};

/**
 * Convert object to query string
 * @param {Object} obj - The object to convert
 * @returns {string} - Query string
 */
export const toQueryString = (obj) => {
  if (!obj || typeof obj !== 'object') return '';
  
  return Object.keys(obj)
    .filter(key => obj[key] != null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - The value to check
 * @returns {boolean} - True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Get nested property value from object using dot notation
 * @param {Object} obj - The object
 * @param {string} path - Dot notation path
 * @param {any} defaultValue - Default value if not found
 * @returns {any} - Value at path or default
 */
export const getNestedValue = (obj, path, defaultValue = undefined) => {
  const travel = (regexp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

/**
 * Set nested property value in object using dot notation
 * @param {Object} obj - The object
 * @param {string} path - Dot notation path
 * @param {any} value - Value to set
 * @returns {Object} - Updated object
 */
export const setNestedValue = (obj, path, value) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);
  
  target[lastKey] = value;
  return obj;
};

/**
 * Remove duplicates from array based on key
 * @param {Array} array - The array
 * @param {string} key - Key to check for duplicates
 * @returns {Array} - Array with duplicates removed
 */
export const removeDuplicates = (array, key = 'id') => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Group array by key
 * @param {Array} array - The array
 * @param {string} key - Key to group by
 * @returns {Object} - Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} array - The array
 * @param {string} key - Key to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} - Sorted array
 */
export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aValue = getNestedValue(a, key);
    const bValue = getNestedValue(b, key);
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Generate a range of numbers
 * @param {number} start - Start number
 * @param {number} end - End number
 * @param {number} step - Step size
 * @returns {Array} - Array of numbers
 */
export const range = (start, end, step = 1) => {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
};

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after delay
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {number} retries - Number of retry attempts
 * @param {number} delayMs - Initial delay in milliseconds
 * @returns {Promise} - Promise with function result
 */
export const retryWithBackoff = async (fn, retries = 3, delayMs = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    await delay(delayMs);
    return retryWithBackoff(fn, retries - 1, delayMs * 2);
  }
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone number
 */
export const isValidPhone = (phone) => {
  const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return regex.test(phone);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generate a CSV string from array of objects
 * @param {Array} data - Array of objects
 * @param {Array} columns - Column definitions
 * @returns {string} - CSV string
 */
export const generateCSV = (data, columns = null) => {
  if (!data || data.length === 0) return '';
  
  const headers = columns || Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Download a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} type - MIME type
 */
export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};