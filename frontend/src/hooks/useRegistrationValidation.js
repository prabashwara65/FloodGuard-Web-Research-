// frontend/src/hooks/useRegistrationValidation.js
import { useState, useCallback } from 'react';
import { validateRegistrationForm, validateField } from '../utils/registrationValidations';

export const useRegistrationValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateFieldHandler = useCallback((field, value) => {
    const fieldErrors = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: fieldErrors }));
    return fieldErrors.length === 0;
  }, []);

  const validateForm = useCallback((formData) => {
    const result = validateRegistrationForm(formData);
    const errorMap = {};
    
    result.errors.forEach(error => {
      if (error.includes('Name')) {
        errorMap.name = errorMap.name || [];
        errorMap.name.push(error);
      } else if (error.includes('Email')) {
        errorMap.email = errorMap.email || [];
        errorMap.email.push(error);
      } else if (error.includes('Password') && !error.includes('match')) {
        errorMap.password = errorMap.password || [];
        errorMap.password.push(error);
      } else if (error.includes('match')) {
        errorMap.confirmPassword = errorMap.confirmPassword || [];
        errorMap.confirmPassword.push(error);
      } else if (error.includes('Phone')) {
        errorMap.phone = errorMap.phone || [];
        errorMap.phone.push(error);
      } else if (error.includes('station')) {
        errorMap.preferredStation = errorMap.preferredStation || [];
        errorMap.preferredStation.push(error);
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
    validateField: validateFieldHandler,
    validateForm,
    handleBlur,
    clearErrors,
    resetTouched,
    setErrors,
    setTouched,
  };
};