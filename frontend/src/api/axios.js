// frontend/src/api/axios.js
import axios from 'axios';

// ✅ SIMPLE FIX - Hardcode the URL
const API_URL = 'http://localhost:5000/api';

console.log('🔗 API URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            
            if (status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            
            console.error('API Error:', {
                status,
                message: data?.error || data?.message || 'Unknown error',
                data
            });
        } else if (error.request) {
            console.error('No response from server:', error.request);
        } else {
            console.error('Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api;