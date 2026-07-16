// frontend/src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());

        const result = await dispatch(loginUser({ email, password }));

        if (loginUser.fulfilled.match(result)) {
            toast.success('Welcome back! 🎉');
            navigate(result.payload.user.role === 'admin' ? '/admin' : '/dashboard');
        } else {
            toast.error(result.payload || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - 60% Branding */}
            <div className="hidden lg:flex lg:w-[60%] bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
                {/* Same left side content as RegisterPage */}
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
                    <p className="text-blue-100 text-lg mb-8">
                        Early Warning System for Flood Prediction
                    </p>

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
            <div className="w-full lg:w-[40%] flex items-center justify-center p-6 bg-white min-h-screen">
                <div className="w-full max-w-md">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-6">
                        <div className="flex justify-center mb-3">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl">🌊</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-blue-900">FloodGuard AI</h1>
                        <p className="text-gray-600 text-sm">Login to your account</p>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:block mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                        <p className="text-gray-500 text-sm">Login to your account</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">❌ {error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                                <span className="ml-2 text-gray-600">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : 'Login'}
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
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;