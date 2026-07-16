// frontend/src/utils/registrationValidations.js

export const validateRegistrationForm = (data) => {
  const errors = [];
  const { name, email, password, confirmPassword, phone, preferredStation } = data;

  // Name Validation
  if (!name || name.trim() === '') {
    errors.push('Full name is required');
  } else if (name.length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.length > 50) {
    errors.push('Name is too long (maximum 50 characters)');
  } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    errors.push('Name contains invalid characters');
  }

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
  } else if (!hasPasswordStrength(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }

  // Confirm Password Validation
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  // Phone Validation (optional)
  if (phone && phone.trim() !== '') {
    if (!/^[0-9+\-\s()]+$/.test(phone)) {
      errors.push('Phone number contains invalid characters');
    } else if (phone.replace(/[\s\-()]/g, '').length < 10) {
      errors.push('Phone number must be at least 10 digits');
    }
  }

  // Preferred Station Validation
  if (!preferredStation || preferredStation.trim() === '') {
    errors.push('Please select a preferred station');
  }

  // Security Checks
  if (email && containsSQLInjection(email)) {
    errors.push('Invalid email format');
  }
  if (name && containsSQLInjection(name)) {
    errors.push('Invalid name format');
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

const hasPasswordStrength = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber;
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

// Additional validation helpers
export const validateField = (field, value) => {
  const formData = { name: '', email: '', password: '', confirmPassword: '', phone: '', preferredStation: '' };
  formData[field] = value;
  const result = validateRegistrationForm(formData);
  
  const fieldErrors = result.errors.filter(error => {
    if (field === 'name') return error.includes('Name');
    if (field === 'email') return error.includes('Email');
    if (field === 'password') return error.includes('Password') && !error.includes('match');
    if (field === 'confirmPassword') return error.includes('match');
    if (field === 'phone') return error.includes('Phone');
    if (field === 'preferredStation') return error.includes('station');
    return false;
  });
  
  return fieldErrors;
};