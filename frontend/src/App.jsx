// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './features/auth/authSlice';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';


//  ProtectedRoute
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useSelector((state) => state.auth);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
};

//  AppContent
function AppContent() {
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (token) {
            dispatch(loadUser());
        }
    }, [dispatch, token]);

    return (
        <>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute adminOnly>
                            <AdminPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/" 
                    element={
                        <Navigate to={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'} replace />
                    } 
                />
            </Routes>
            <ToastContainer position="bottom-right" theme="colored" />
        </>
    );
}

//  App
function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;