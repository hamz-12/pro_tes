import { DATE_FORMATS, CURRENCY } from './constants';

/**
 * Format a number as currency with custom options
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    currencyCode = 'USD',
    locale = 'en-US',
    showSymbol = true,
    decimalPlaces = 2,
    compact = false,
  } = options;

  if (isNaN(amount) || amount === null || amount === undefined) {
    return '—';
  }

  const currency = CURRENCY[currencyCode] || CURRENCY.USD;
  const places = decimalPlaces === 'auto' ? currency.decimalPlaces : decimalPlaces;

  if (compact && Math.abs(amount) >= 1000) {
    const formatter = new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currencyCode,
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
    return formatter.format(amount);
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: showSymbol ? currencyCode : undefined,
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  });

  return formatter.format(amount);
};

/**
 * Format a percentage value
 * @param {number} value - The percentage value (0-100 or decimal)
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, options = {}) => {
  const {
    decimalPlaces = 1,
    showSymbol = true,
    isDecimal = false,
  } = options;

  if (isNaN(value) || value === null || value === undefined) {
    return '—';
  }

  const percentageValue = isDecimal ? value * 100 : value;
  const formatter = new Intl.NumberFormat('en-US', {
    style: showSymbol ? 'percent' : 'decimal',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  if (showSymbol) {
    return formatter.format(percentageValue / 100);
  }

  return `${formatter.format(percentageValue)}${showSymbol ? '%' : ''}`;
};

/**
 * Format a number with custom options
 * @param {number} number - The number to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted number string
 */
export const formatNumber = (number, options = {}) => {
  const {
    decimalPlaces = 0,
    compact = false,
    locale = 'en-US',
    notation = 'standard',
  } = options;

  if (isNaN(number) || number === null || number === undefined) {
    return '—';
  }

  const formatter = new Intl.NumberFormat(locale, {
    notation: compact || notation !== 'standard' ? notation : 'standard',
    compactDisplay: 'short',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  return formatter.format(number);
};

/**
 * Format a date with custom options
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const {
    format = 'medium',
    locale = 'en-US',
    timeZone = 'UTC',
    includeTime = false,
    relative = false,
  } = options;

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '—';
  }

  if (relative) {
    return formatRelativeDate(d);
  }

  const dateFormats = {
    short: { dateStyle: 'short' },
    medium: { dateStyle: 'medium' },
    long: { dateStyle: 'long' },
    full: { dateStyle: 'full' },
  };

  const timeFormats = {
    short: { timeStyle: 'short' },
    medium: { timeStyle: 'medium' },
    long: { timeStyle: 'long' },
    full: { timeStyle: 'full' },
  };

  const formatConfig = dateFormats[format] || dateFormats.medium;
  
  if (includeTime) {
    Object.assign(formatConfig, timeFormats[format] || timeFormats.medium);
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    ...formatConfig,
    timeZone,
  });

  return formatter.format(d);
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string|number} date - The date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diffSec < 60) {
    return rtf.format(-diffSec, 'second');
  } else if (diffMin < 60) {
    return rtf.format(-diffMin, 'minute');
  } else if (diffHour < 24) {
    return rtf.format(-diffHour, 'hour');
  } else if (diffDay < 7) {
    return rtf.format(-diffDay, 'day');
  } else if (diffWeek < 4) {
    return rtf.format(-diffWeek, 'week');
  } else if (diffMonth < 12) {
    return rtf.format(-diffMonth, 'month');
  } else {
    return rtf.format(-diffYear, 'year');
  }
};

/**
 * Format duration in milliseconds to human readable format
 * @param {number} ms - Duration in milliseconds
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (ms, options = {}) => {
  const {
    compact = false,
    showMilliseconds = false,
    includeLabels = true,
  } = options;

  if (isNaN(ms) || ms === null || ms === undefined) {
    return '—';
  }

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  const remainingMilliseconds = ms % 1000;

  const parts = [];

  if (days > 0) {
    parts.push(`${days}${includeLabels ? 'd' : ''}`);
  }
  if (remainingHours > 0 || (compact && hours > 0)) {
    parts.push(`${remainingHours}${includeLabels ? 'h' : ''}`);
  }
  if (remainingMinutes > 0 || (compact && minutes > 0)) {
    parts.push(`${remainingMinutes}${includeLabels ? 'm' : ''}`);
  }
  if (remainingSeconds > 0 || (compact && seconds > 0)) {
    parts.push(`${remainingSeconds}${includeLabels ? 's' : ''}`);
  }
  if (showMilliseconds && remainingMilliseconds > 0) {
    parts.push(`${remainingMilliseconds}${includeLabels ? 'ms' : ''}`);
  }

  if (parts.length === 0) {
    return showMilliseconds ? '0ms' : '0s';
  }

  if (compact) {
    return parts.slice(0, 2).join(' ');
  }

  return parts.join(' ');
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted file size string
 */
export const formatFileSize = (bytes, options = {}) => {
  const {
    decimalPlaces = 2,
    base = 1024,
    compact = false,
  } = options;

  if (isNaN(bytes) || bytes === null || bytes === undefined) {
    return '—';
  }

  if (bytes === 0) return '0 Bytes';

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(base));
  const size = bytes / Math.pow(base, unitIndex);

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  const formattedSize = formatter.format(size);
  
  if (compact) {
    return `${formattedSize} ${units[unitIndex].charAt(0)}`;
  }

  return `${formattedSize} ${units[unitIndex]}`;
};

/**
 * Format a phone number
 * @param {string} phone - The phone number to format
 * @param {string} format - The format to use
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone, format = 'standard') => {
  if (!phone || typeof phone !== 'string') {
    return '—';
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    return '—';
  }

  const formats = {
    standard: (p) => {
      if (p.length === 10) {
        return `(${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`;
      } else if (p.length === 11 && p.startsWith('1')) {
        return `+1 (${p.slice(1, 4)}) ${p.slice(4, 7)}-${p.slice(7)}`;
      }
      return p;
    },
    international: (p) => {
      if (p.length === 10) {
        return `+1 ${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6)}`;
      }
      return `+${p}`;
    },
    compact: (p) => {
      if (p.length === 10) {
        return `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
      }
      return p;
    },
  };

  const formatter = formats[format] || formats.standard;
  return formatter(cleaned);
};

/**
 * Format a social security number
 * @param {string} ssn - The SSN to format
 * @returns {string} - Formatted SSN
 */
export const formatSSN = (ssn) => {
  if (!ssn || typeof ssn !== 'string') {
    return '—';
  }

  const cleaned = ssn.replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  
  return ssn;
};

/**
 * Format a credit card number
 * @param {string} cardNumber - The credit card number
 * @returns {string} - Formatted credit card number
 */
export const formatCreditCard = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return '—';
  }

  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length >= 13 && cleaned.length <= 19) {
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }
    return parts.join(' ');
  }
  
  return cardNumber;
};

/**
 * Mask sensitive information
 * @param {string} text - The text to mask
 * @param {Object} options - Masking options
 * @returns {string} - Masked text
 */
export const maskText = (text, options = {}) => {
  const {
    type = 'partial',
    visibleChars = 4,
    maskChar = '*',
  } = options;

  if (!text || typeof text !== 'string') {
    return '—';
  }

  if (type === 'email') {
    const [local, domain] = text.split('@');
    if (!local || !domain) return text;
    
    const visible = Math.min(visibleChars, local.length);
    return `${local.slice(0, visible)}${maskChar.repeat(local.length - visible)}@${domain}`;
  }

  if (type === 'phone') {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length < 10) return text;
    
    const lastFour = cleaned.slice(-4);
    return `${maskChar.repeat(cleaned.length - 4)}${lastFour}`;
  }

  if (type === 'full') {
    return maskChar.repeat(text.length);
  }

  // Partial mask (default)
  if (text.length <= visibleChars * 2) {
    return maskChar.repeat(text.length);
  }

  const firstPart = text.slice(0, visibleChars);
  const lastPart = text.slice(-visibleChars);
  const middlePart = maskChar.repeat(text.length - visibleChars * 2);
  
  return `${firstPart}${middlePart}${lastPart}`;
};

/**
 * Format a name with proper capitalization
 * @param {string} name - The name to format
 * @returns {string} - Formatted name
 */
export const formatName = (name) => {
  if (!name || typeof name !== 'string') {
    return '—';
  }

  // Handle multiple names separated by spaces
  return name
    .toLowerCase()
    .split(' ')
    .map(part => {
      // Handle hyphenated names
      if (part.includes('-')) {
        return part
          .split('-')
          .map(subPart => subPart.charAt(0).toUpperCase() + subPart.slice(1))
          .join('-');
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
};

/**
 * Format an address
 * @param {Object} address - The address object
 * @returns {string} - Formatted address string
 */
export const formatAddress = (address) => {
  if (!address || typeof address !== 'object') {
    return '—';
  }

  const {
    street,
    street2,
    city,
    state,
    zipCode,
    country,
  } = address;

  const parts = [];
  
  if (street) parts.push(street);
  if (street2) parts.push(street2);
  if (city && state) {
    parts.push(`${city}, ${state} ${zipCode || ''}`.trim());
  } else {
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (zipCode) parts.push(zipCode);
  }
  if (country && country !== 'US') parts.push(country);

  return parts.join('\n');
};

/**
 * Format a list of items
 * @param {Array} items - The items to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted list string
 */
export const formatList = (items, options = {}) => {
  const {
    separator = ', ',
    maxItems = 3,
    andText = 'and',
    ellipsis = '...',
  } = options;

  if (!Array.isArray(items) || items.length === 0) {
    return '—';
  }

  if (items.length === 1) {
    return String(items[0]);
  }

  if (items.length <= maxItems) {
    const lastItem = items.pop();
    return `${items.join(separator)} ${andText} ${lastItem}`;
  }

  const firstItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;
  
  return `${firstItems.join(separator)} ${ellipsis} (${remainingCount} more)`;
};

/**
 * Format a data point with trend indicator
 * @param {number} value - The current value
 * @param {number} previousValue - The previous value
 * @param {Object} options - Formatting options
 * @returns {Object} - Formatted data with trend
 */
export const formatWithTrend = (value, previousValue, options = {}) => {
  const {
    format = 'number',
    formatOptions = {},
    showTrend = true,
    trendThreshold = 0.01,
  } = options;

  if (isNaN(value) || value === null || value === undefined) {
    return {
      value: '—',
      trend: null,
      trendDirection: 'neutral',
      trendPercentage: null,
    };
  }

  let formattedValue;
  switch (format) {
    case 'currency':
      formattedValue = formatCurrency(value, formatOptions);
      break;
    case 'percentage':
      formattedValue = formatPercentage(value, formatOptions);
      break;
    default:
      formattedValue = formatNumber(value, formatOptions);
  }

  if (!showTrend || isNaN(previousValue) || previousValue === null || previousValue === undefined || previousValue === 0) {
    return {
      value: formattedValue,
      trend: null,
      trendDirection: 'neutral',
      trendPercentage: null,
    };
  }

  const change = value - previousValue;
  const percentage = (change / previousValue) * 100;
  const absolutePercentage = Math.abs(percentage);

  let trendDirection = 'neutral';
  let trendSymbol = '';

  if (absolutePercentage < trendThreshold) {
    trendDirection = 'neutral';
    trendSymbol = '→';
  } else if (change > 0) {
    trendDirection = 'up';
    trendSymbol = '↑';
  } else {
    trendDirection = 'down';
    trendSymbol = '↓';
  }

  return {
    value: formattedValue,
    trend: `${trendSymbol} ${formatPercentage(absolutePercentage, { decimalPlaces: 1, showSymbol: false })}%`,
    trendDirection,
    trendPercentage: percentage,
    isPositive: change > 0,
    isNegative: change < 0,
    isNeutral: Math.abs(change) < trendThreshold,
  };
};

/**
 * Format a range of values
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted range string
 */
export const formatRange = (min, max, options = {}) => {
  const {
    format = 'number',
    formatOptions = {},
    separator = ' - ',
  } = options;

  if (isNaN(min) || isNaN(max) || min === null || max === null) {
    return '—';
  }

  const formatFn = format === 'currency' ? formatCurrency : 
                  format === 'percentage' ? formatPercentage : formatNumber;

  const formattedMin = formatFn(min, formatOptions);
  const formattedMax = formatFn(max, formatOptions);

  return `${formattedMin}${separator}${formattedMax}`;
};