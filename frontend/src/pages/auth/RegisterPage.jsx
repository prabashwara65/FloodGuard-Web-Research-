// frontend/src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';

// Validation functions
const validateRegistrationForm = (data) => {
  const errors = {};
  const { name, email, password, confirmPassword, phone, preferredStation } = data;

  // Name Validation
  if (!name || name.trim() === '') {
    errors.name = 'Full name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 50) {
    errors.name = 'Name is too long (maximum 50 characters)';
  } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    errors.name = 'Name contains invalid characters';
  }

  // Email Validation
  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  } else if (email.includes(' ')) {
    errors.email = 'Email cannot contain spaces';
  } else if (email.length > 100) {
    errors.email = 'Email is too long (maximum 100 characters)';
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  // Password Validation
  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (password.length > 50) {
    errors.password = 'Password is too long (maximum 50 characters)';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }

  // Confirm Password Validation
  if (!confirmPassword || confirmPassword.trim() === '') {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Phone Validation (optional)
  if (phone && phone.trim() !== '') {
    if (!/^[0-9+\-\s()]+$/.test(phone)) {
      errors.phone = 'Phone number contains invalid characters';
    } else if (phone.replace(/[\s\-()]/g, '').length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }
  }

  // Preferred Station Validation
  if (!preferredStation || preferredStation.trim() === '') {
    errors.preferredStation = 'Please select a preferred station';
  }

  return errors;
};

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        preferredStation: 'Hanwella'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [termsError, setTermsError] = useState('');
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const stations = [
        'Norwood',
        'Kithulgala',
        'Deraniuagala',
        'Holombuwa',
        'Glencourse',
        'Hanwella',
        "N'Street"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear field error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: undefined
            });
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({
            ...touched,
            [name]: true
        });
        
        // Validate field on blur
        const errors = validateRegistrationForm(formData);
        if (errors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: errors[name]
            });
        }
    };

    const validateField = (field, value) => {
        const testData = { ...formData, [field]: value };
        const errors = validateRegistrationForm(testData);
        return errors[field] || null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());
        setTermsError('');

        // Mark all fields as touched
        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        // Validate all fields
        const errors = validateRegistrationForm(formData);
        setValidationErrors(errors);

        // Check terms agreement
        if (!agreeTerms) {
            setTermsError('You must agree to the Terms & Conditions');
            toast.error('Please agree to the Terms & Conditions');
            return;
        }

        // If there are validation errors, show toast and return
        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            toast.error(firstError);
            return;
        }

        // Proceed with registration
        const { confirmPassword, ...userData } = formData;
        const result = await dispatch(registerUser(userData));

        if (registerUser.fulfilled.match(result)) {
            toast.success('Account created successfully! 🎉');
            navigate('/dashboard');
        } else {
            toast.error(result.payload || 'Registration failed');
        }
    };

    // Get field error message
    const getFieldError = (field) => {
        if (touched[field] && validationErrors[field]) {
            return validationErrors[field];
        }
        return null;
    };

    // Get input className based on validation state
    const getInputClassName = (field) => {
        const baseClass = "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm";
        const error = getFieldError(field);
        if (error) {
            return `${baseClass} border-red-500 bg-red-50`;
        }
        return `${baseClass} border-gray-300`;
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-[60%] bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
                <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-2xl"></div>
                <div className="relative z-10 text-center max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <span className="text-5xl">🌊</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">FloodGuard AI</h1>
                    <p className="text-blue-100 text-lg mb-8">Early Warning System for Flood Prediction</p>
                    <div className="space-y-4 text-left">
                        <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="font-semibold">72-Hour Predictions</p>
                                <p className="text-sm text-blue-200">Advanced AI flood forecasting</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="font-semibold">Real-Time Alerts</p>
                                <p className="text-sm text-blue-200">Instant notifications for your area</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="font-semibold">Explainable AI</p>
                                <p className="text-sm text-blue-200">Understand why floods are predicted</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-center gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold">10+</p>
                            <p className="text-sm text-blue-200">Years of Data</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">95%</p>
                            <p className="text-sm text-blue-200">Accuracy Rate</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">24/7</p>
                            <p className="text-sm text-blue-200">Monitoring</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - 40% Form */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-6 bg-white overflow-y-auto min-h-screen">
                <div className="w-full max-w-md py-8">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-6">
                        <div className="flex justify-center mb-3">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl">🌊</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-blue-900">FloodGuard AI</h1>
                        <p className="text-gray-600 text-sm">Create your account</p>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:block mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                        <p className="text-gray-500 text-sm">Join FloodGuard AI today</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">❌ {error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClassName('name')}
                                placeholder="Enter your full name"
                                required
                            />
                            {getFieldError('name') && (
                                <p className="mt-1 text-red-500 text-xs">{getFieldError('name')}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClassName('email')}
                                placeholder="Enter your email"
                                required
                            />
                            {getFieldError('email') && (
                                <p className="mt-1 text-red-500 text-xs">{getFieldError('email')}</p>
                            )}
                        </div>

                        {/* Password and Confirm Password */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password *
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={getInputClassName('password')}
                                    placeholder="Min 6 chars"
                                    required
                                />
                                {getFieldError('password') && (
                                    <p className="mt-1 text-red-500 text-xs">{getFieldError('password')}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm *
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={getInputClassName('confirmPassword')}
                                    placeholder="Confirm"
                                    required
                                />
                                {getFieldError('confirmPassword') && (
                                    <p className="mt-1 text-red-500 text-xs">{getFieldError('confirmPassword')}</p>
                                )}
                            </div>
                        </div>

                        {/* Show/Hide Password */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {showPassword ? ' Hide' : '  Show'} Passwords
                            </button>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone (optional)
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClassName('phone')}
                                placeholder="Phone number"
                            />
                            {getFieldError('phone') && (
                                <p className="mt-1 text-red-500 text-xs">{getFieldError('phone')}</p>
                            )}
                        </div>

                        {/* Preferred Station */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preferred Station
                            </label>
                            <select
                                name="preferredStation"
                                value={formData.preferredStation}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm ${
                                    getFieldError('preferredStation') 
                                        ? 'border-red-500 bg-red-50' 
                                        : 'border-gray-300'
                                }`}
                            >
                                {stations.map((station) => (
                                    <option key={station} value={station}>
                                        {station}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                This station will be used as your default for forecasts.
                            </p>
                            {getFieldError('preferredStation') && (
                                <p className="mt-1 text-red-500 text-xs">{getFieldError('preferredStation')}</p>
                            )}
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-center gap-2 text-sm">
                            <input 
                                type="checkbox" 
                                checked={agreeTerms}
                                onChange={(e) => {
                                    setAgreeTerms(e.target.checked);
                                    if (e.target.checked) {
                                        setTermsError('');
                                    }
                                }}
                                className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                                    termsError ? 'border-red-500' : ''
                                }`}
                                required
                            />
                            <span className="text-gray-600">
                                I agree to the{' '}
                                <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Terms & Conditions
                                </Link>
                            </span>
                        </div>
                        {termsError && (
                            <p className="text-red-500 text-xs">{termsError}</p>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            <span className="text-xl">🔵</span>
                            <span className="font-medium">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            <span className="text-xl">📘</span>
                            <span className="font-medium">Facebook</span>
                        </button>
                    </div>

                    <div className="text-center mt-5">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;