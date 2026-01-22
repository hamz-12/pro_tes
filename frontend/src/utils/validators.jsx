import { VALIDATION } from './constants';

/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {Object} - Validation result
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'Email is required',
    };
  }

  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    return {
      isValid: false,
      message: 'Email is required',
    };
  }

  if (!VALIDATION.EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address',
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

/**
 * Validate a password
 * @param {string} password - The password to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = VALIDATION.PASSWORD_MIN_LENGTH,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options;

  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required',
      strength: 0,
      requirements: {
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        specialChars: false,
      },
    };
  }

  const requirements = {
    length: password.length >= minLength,
    uppercase: !requireUppercase || /[A-Z]/.test(password),
    lowercase: !requireLowercase || /[a-z]/.test(password),
    numbers: !requireNumbers || /\d/.test(password),
    specialChars: !requireSpecialChars || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const totalRequirements = Object.keys(requirements).length;
  const strength = Math.round((metRequirements / totalRequirements) * 100);

  if (!requirements.length) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`,
      strength,
      requirements,
    };
  }

  const missingRequirements = [];
  if (!requirements.uppercase && requireUppercase) missingRequirements.push('uppercase letter');
  if (!requirements.lowercase && requireLowercase) missingRequirements.push('lowercase letter');
  if (!requirements.numbers && requireNumbers) missingRequirements.push('number');
  if (!requirements.specialChars && requireSpecialChars) missingRequirements.push('special character');

  if (missingRequirements.length > 0) {
    return {
      isValid: false,
      message: `Password must contain at least one ${missingRequirements.join(', ')}`,
      strength,
      requirements,
    };
  }

  return {
    isValid: true,
    message: '',
    strength,
    requirements,
  };
};

/**
 * Validate a phone number
 * @param {string} phone - The phone number to validate
 * @returns {Object} - Validation result
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      message: 'Phone number is required',
    };
  }

  const trimmedPhone = phone.trim();
  
  if (trimmedPhone.length === 0) {
    return {
      isValid: false,
      message: 'Phone number is required',
    };
  }

  if (!VALIDATION.PHONE_REGEX.test(trimmedPhone)) {
    return {
      isValid: false,
      message: 'Please enter a valid phone number',
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

/**
 * Validate a URL
 * @param {string} url - The URL to validate
 * @returns {Object} - Validation result
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      message: 'URL is required',
    };
  }

  const trimmedUrl = url.trim();
  
  if (trimmedUrl.length === 0) {
    return {
      isValid: false,
      message: 'URL is required',
    };
  }

  try {
    new URL(trimmedUrl);
    return {
      isValid: true,
      message: '',
    };
  } catch {
    return {
      isValid: false,
      message: 'Please enter a valid URL',
    };
  }
};

/**
 * Validate a required field
 * @param {any} value - The value to validate
 * @param {string} fieldName - The name of the field
 * @returns {Object} - Validation result
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }

  if (Array.isArray(value) && value.length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }

  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

/**
 * Validate a number
 * @param {any} value - The value to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateNumber = (value, options = {}) => {
  const {
    min = -Infinity,
    max = Infinity,
    integer = false,
    required = true,
    fieldName = 'This field',
  } = options;

  if (value === null || value === undefined || value === '') {
    if (required) {
      return {
        isValid: false,
        message: `${fieldName} is required`,
      };
    }
    return {
      isValid: true,
      message: '',
    };
  }

  const num = Number(value);
  
  if (isNaN(num)) {
    return {
      isValid: false,
      message: `${fieldName} must be a valid number`,
    };
  }

  if (integer && !Number.isInteger(num)) {
    return {
      isValid: false,
      message: `${fieldName} must be an integer`,
    };
  }

  if (num < min) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${min}`,
    };
  }

  if (num > max) {
    return {
      isValid: false,
      message: `${fieldName} must be at most ${max}`,
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

/**
 * Validate a date
 * @param {any} value - The value to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateDate = (value, options = {}) => {
  const {
    min = null,
    max = null,
    required = true,
    fieldName = 'This field',
  } = options;

  if (value === null || value === undefined || value === '') {
    if (required) {
      return {
        isValid: false,
        message: `${fieldName} is required`,
      };
    }
    return {
      isValid: true,
      message: '',
    };
  }

  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      message: `${fieldName} must be a valid date`,
    };
  }

  if (min) {
    const minDate = new Date(min);
    if (date < minDate) {
      return {
        isValid: false,
        message: `${fieldName} must be on or after ${minDate.toLocaleDateString()}`,
      };
    }
  }

  if (max) {
    const maxDate = new Date(max);
    if (date > maxDate) {
      return {
        isValid: false,
        message: `${fieldName} must be on or before ${maxDate.toLocaleDateString()}`,
      };
    }
  }

  return {
    isValid: true,
    message: '',
  };
};

/**
 * Validate a username
 * @param {string} username - The username to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateUsername = (username, options = {}) => {
  const {
    minLength = VALIDATION.USERNAME_MIN_LENGTH,
    maxLength = VALIDATION.USERNAME_MAX_LENGTH,
    allowSpaces = false,
    allowedChars = /^[a-zA-Z0-9_.-]+$/,
  } = options;

  if (!username || typeof username !== 'string') {
    return {
      isValid: false,
      message: 'Username is required',
    };
  }

  const trimmedUsername = username.trim();
  
  if (trimmedUsername.length === 0) {
    return {
      isValid: false,
      message: 'Username is required',
    };
  }

  if (trimmedUsername.length < minLength) {
    return {
      isValid: false,
      message: `Username must be at least ${minLength} characters long`,
    };
  }

  if (trimmedUsername.length > maxLength) {
    return {
      isValid: false,
      message: `Username must be at most ${maxLength} characters long`,
    };
  }

  if (!allowSpaces && trimmedUsername.includes(' ')) {
    return {
      isValid: false,
      message: 'Username cannot contain spaces',
    };
  }

  if (allowedChars && !allowedChars.test(trimmedUsername)) {
    return {
      isValid: false,
      message: 'Username contains invalid characters',
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

/**
 * Validate a credit card number
 * @param {string} cardNumber - The credit card number to validate
 * @returns {Object} - Validation result
 */
export const validateCreditCard = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return {
      isValid: false,
      message: 'Credit card number is required',
    };
  }

  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    return {
      isValid: false,
      message: 'Credit card number is required',
    };
  }

  // Luhn algorithm for credit card validation
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  const isValidLuhn = sum % 10 === 0;
  
  if (!isValidLuhn) {
    return {
      isValid: false,
      message: 'Invalid credit card number',
    };
  }

  // Identify card type
  let cardType = 'unknown';
  
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cleaned)) {
    cardType = 'visa';
  } else if (/^5[1-5][0-9]{14}$/.test(cleaned)) {
    cardType = 'mastercard';
  } else if (/^3[47][0-9]{13}$/.test(cleaned)) {
    cardType = 'amex';
  } else if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(cleaned)) {
    cardType = 'discover';
  }

  return {
    isValid: true,
    message: '',
    cardType,
  };
};

/**
 * Validate a credit card expiry date
 * @param {string} month - The expiry month
 * @param {string} year - The expiry year
 * @returns {Object} - Validation result
 */
export const validateExpiryDate = (month, year) => {
  if (!month || !year) {
    return {
      isValid: false,
      message: 'Expiry date is required',
    };
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (isNaN(monthNum) || isNaN(yearNum)) {
    return {
      isValid: false,
      message: 'Invalid expiry date',
    };
  }

  if (monthNum < 1 || monthNum > 12) {
    return {
      isValid: false,
      message: 'Invalid month',
    };
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
    return {
      isValid: false,
      message: 'Card has expired',
    };
  }

  if (yearNum > currentYear + 20) {
    return {
      isValid: false,
      message: 'Invalid year',
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

/**
 * Validate a CSV file
 * @param {File} file - The CSV file to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateCSVFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['.csv', 'text/csv', 'application/vnd.ms-excel'],
    requiredColumns = [],
  } = options;

  if (!file) {
    return {
      isValid: false,
      message: 'File is required',
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: `File size must be less than ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  const isValidType = allowedTypes.some(type => 
    type.startsWith('.') ? fileExtension === type : file.type === type
  );

  if (!isValidType) {
    return {
      isValid: false,
      message: 'File must be a CSV',
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

/**
 * Validate form data
 * @param {Object} formData - The form data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} - Validation result
 */
export const validateForm = (formData, schema) => {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach(field => {
    const fieldSchema = schema[field];
    const value = formData[field];
    
    // Skip validation if field is not required and empty
    if (!fieldSchema.required && (value === null || value === undefined || value === '')) {
      return;
    }

    let validationResult;

    switch (fieldSchema.type) {
      case 'email':
        validationResult = validateEmail(value);
        break;
      case 'password':
        validationResult = validatePassword(value, fieldSchema.options);
        break;
      case 'phone':
        validationResult = validatePhone(value);
        break;
      case 'url':
        validationResult = validateUrl(value);
        break;
      case 'number':
        validationResult = validateNumber(value, fieldSchema.options);
        break;
      case 'date':
        validationResult = validateDate(value, fieldSchema.options);
        break;
      case 'required':
        validationResult = validateRequired(value, fieldSchema.fieldName);
        break;
      case 'custom':
        validationResult = fieldSchema.validator(value, formData);
        break;
      default:
        validationResult = validateRequired(value, fieldSchema.fieldName);
    }

    if (!validationResult.isValid) {
      errors[field] = validationResult.message;
      isValid = false;
    }
  });

  return {
    isValid,
    errors,
  };
};

/**
 * Validate business logic for data
 * @param {Object} data - The data to validate
 * @param {Array} rules - Validation rules
 * @returns {Object} - Validation result
 */
export const validateBusinessRules = (data, rules) => {
  const errors = [];
  let isValid = true;

  rules.forEach(rule => {
    const {
      condition,
      message,
      field,
      severity = 'error',
    } = rule;

    const shouldValidate = typeof condition === 'function' ? condition(data) : condition;

    if (shouldValidate) {
      errors.push({
        field,
        message,
        severity,
      });
      
      if (severity === 'error') {
        isValid = false;
      }
    }
  });

  return {
    isValid,
    errors,
    hasErrors: errors.some(error => error.severity === 'error'),
    hasWarnings: errors.some(error => error.severity === 'warning'),
  };
};

/**
 * Sanitize input string
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/[&]/g, '&amp;') // Escape &
    .replace(/["]/g, '&quot;') // Escape "
    .replace(/[']/g, '&#x27;') // Escape '
    .replace(/[\/]/g, '&#x2F;') // Escape /
    .trim();
};

/**
 * Validate and sanitize HTML input
 * @param {string} html - The HTML to validate and sanitize
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') {
    return '';
  }

  // Simple HTML sanitization - in production, use a library like DOMPurify
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'ul', 'ol', 'li', 'a'];
  const allowedAttributes = {
    a: ['href', 'title', 'target'],
  };

  // Remove all tags except allowed ones
  let sanitized = html.replace(/<(\/?)(\w+)([^>]*)>/g, (match, slash, tag, attributes) => {
    if (!allowedTags.includes(tag.toLowerCase())) {
      return '';
    }

    if (slash) {
      return `</${tag}>`;
    }

    let cleanedAttributes = '';
    if (allowedAttributes[tag.toLowerCase()]) {
      const attrRegex = /(\w+)=("[^"]*"|'[^']*'|[^"'\s>]+)/g;
      let attrMatch;
      const foundAttributes = [];
      
      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        const attrValue = attrMatch[2];
        
        if (allowedAttributes[tag.toLowerCase()].includes(attrName)) {
          // Basic URL validation for href
          if (attrName === 'href') {
            try {
              new URL(attrValue.replace(/['"]/g, ''));
              foundAttributes.push(`${attrName}=${attrValue}`);
            } catch {
              // Invalid URL, skip this attribute
            }
          } else {
            foundAttributes.push(`${attrName}=${attrValue}`);
          }
        }
      }
      
      if (foundAttributes.length > 0) {
        cleanedAttributes = ' ' + foundAttributes.join(' ');
      }
    }

    return `<${tag}${cleanedAttributes}>`;
  });

  // Remove any remaining < or > characters
  sanitized = sanitized.replace(/[<>]/g, '');

  return sanitized;
};