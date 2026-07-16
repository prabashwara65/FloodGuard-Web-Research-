// frontend/src/hooks/useLoginValidation.js
import { useState, useCallback } from 'react';
import { validateLoginForm } from '../utils/validations';

export const useLoginValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((field, value) => {
    const formData = { email: '', password: '' };
    formData[field] = value;
    const result = validateLoginForm(formData);
    
    const fieldErrors = result.errors.filter(error => {
      if (field === 'email') {
        return error.includes('Email');
      }
      if (field === 'password') {
        return error.includes('Password');
      }
      return false;
    });

    setErrors(prev => ({ ...prev, [field]: fieldErrors }));
    return fieldErrors.length === 0;
  }, []);

  const validateForm = useCallback((formData) => {
    const result = validateLoginForm(formData);
    const errorMap = {};
    
    result.errors.forEach(error => {
      if (error.includes('Email')) {
        errorMap.email = errorMap.email || [];
        errorMap.email.push(error);
      }
      if (error.includes('Password')) {
        errorMap.password = errorMap.password || [];
        errorMap.password.push(error);
      }
    });

    setErrors(errorMap);
    return result.isValid;
  }, []);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetTouched = useCallback(() => {
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    handleBlur,
    clearErrors,
    resetTouched,
    setErrors,
    setTouched,
  };
};