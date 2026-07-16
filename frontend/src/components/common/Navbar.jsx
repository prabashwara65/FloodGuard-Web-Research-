// frontend/src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const Navbar = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="bg-blue-900 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl">🌊</span>
                            <span className="font-bold text-xl">FloodGuard AI</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/dashboard" className="hover:text-blue-300 transition">
                            Dashboard
                        </Link>
                        
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="hover:text-blue-300 transition">
                                Admin
                            </Link>
                        )}

                        <div className="flex items-center gap-3">
                            <span className="text-sm bg-blue-800 px-3 py-1 rounded-full">
                                {user?.name || 'User'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded-lg text-sm transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-white focus:outline-none"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-blue-800 px-4 py-3">
                    <div className="flex flex-col gap-3">
                        <Link 
                            to="/dashboard" 
                            className="hover:text-blue-300 transition"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        
                        {user?.role === 'admin' && (
                            <Link 
                                to="/admin" 
                                className="hover:text-blue-300 transition"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Admin
                            </Link>
                        )}

                        <div className="border-t border-blue-700 pt-3 mt-2">
                            <p className="text-sm text-blue-300">{user?.name}</p>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    handleLogout();
                                }}
                                className="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm w-full text-left transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;