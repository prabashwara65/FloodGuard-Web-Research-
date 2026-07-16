// frontend/src/utils/validations.js

export const validateLoginForm = (data) => {
  const errors = [];
  const { email, password } = data;

  // Email Validation
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (email.includes(' ')) {
    errors.push('Email cannot contain spaces');
  } else if (email.length > 100) {
    errors.push('Email is too long (maximum 100 characters)');
  } else if (!isValidEmail(email)) {
    errors.push('Please enter a valid email address');
  }

  // Password Validation
  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  } else if (password.length > 50) {
    errors.push('Password is too long (maximum 50 characters)');
  }

  // Security Checks
  if (email && containsSQLInjection(email)) {
    errors.push('Invalid email format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

const containsSQLInjection = (input) => {
  const sqlPatterns = [
    /(\bSELECT\b.*\bFROM\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /('.*--)/,
    /('.*;)/,
  ];
  return sqlPatterns.some(pattern => pattern.test(input));
};  