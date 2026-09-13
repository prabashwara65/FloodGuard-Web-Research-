// frontend/src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import {
  LayoutDashboard,
  TrendingUp,
  MapPin,
  Users,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Upload,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Key,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Rocket,
  Zap,
  Flame,
  Cloud,
  Sun,
  Moon,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Compass,
  Navigation,
  Layers,
  Grid,
  List,
  Download,
  Filter,
  MoreVertical,
  Copy,
  Link,
  Share2,
  Bookmark,
  Flag,
  Target,
  Award,
  Medal,
  Crown,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Wifi,
} from 'lucide-react';
import api from '../api/axios';
import AdminHomePage from './admin/AdminHomePage';
import RunPredictionPage from './admin/RunPredictionPage';
import ManageStationsPage from './admin/ManageStationsPage';
import ManageUsersPage from './admin/ManageUsersPage';
import SettingsPage from './admin/SettingsPage';
import SMSWarningHistoryPage from './admin/SMSWarningHistoryPage';

const AdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  const [stats, setStats] = useState({
    users: 0,
    locations: 0,
    alerts: 0,
    predictions: 0,
    activeStations: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [forecastForm, setForecastForm] = useState({
    station: user?.preferredStation || 'Hanwella',
    horizon: '72H',
    threshold: '1.5'
  });
  const [forecastResult, setForecastResult] = useState(null);
  const [forecastError, setForecastError] = useState('');
  const [forecastLoading, setForecastLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [smsWarningRecords, setSmsWarningRecords] = useState([]);
  const [selectedSmsWarningStation, setSelectedSmsWarningStation] = useState('all');
  const [selectedPredictionStation, setSelectedPredictionStation] = useState('all');
  const [stationForm, setStationForm] = useState({
    stationName: '',
    stationId: '',
    threshold: '1.5',
    description: ''
  });
  const [stationImage, setStationImage] = useState(null);
  const [editingStationId, setEditingStationId] = useState(null);
  const [stationLoading, setStationLoading] = useState(false);
  const [stationMessage, setStationMessage] = useState('');
  const [activeView, setActiveView] = useState('home');
  const [users, setUsers] = useState([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-400' },
    { id: 'prediction', label: 'Run Prediction', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'stations', label: 'Manage Stations', icon: MapPin, color: 'text-amber-400' },
    { id: 'users', label: 'Manage Users', icon: Users, color: 'text-purple-400' },
    { id: 'sms-warnings', label: 'SMS Warnings', icon: Bell, color: 'text-violet-400' },
  ];

  // Stats card configuration
  const statsCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Active Stations',
      value: stats.activeStations,
      icon: MapPin,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },

  ];

  const smsWarningStationOptions = [...new Set([
    ...stations.map((station) => station.stationName || station.stationId),
    ...smsWarningRecords.map((warning) => warning.station),
  ].filter(Boolean))].sort();
  const smsWarningsForStation = selectedSmsWarningStation === 'all'
    ? smsWarningRecords
    : smsWarningRecords.filter((warning) => warning.station === selectedSmsWarningStation);
  const smsSentForStation = smsWarningsForStation.reduce((total, warning) => total + (warning.sentCount || 0), 0);
  const predictionStationOptions = stations
    .map((station) => ({
      value: station.stationId || station.stationName,
      label: station.stationName || station.stationId,
    }))
    .filter((station) => station.value && station.label);

  const selectedStationPredictions = predictions.filter((prediction) => {
    if (selectedPredictionStation === 'all') return true;

    return prediction.stationCode === selectedPredictionStation || prediction.stationName === selectedPredictionStation;
  });

  const predictionCounts = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isTodayOrFuture = (date) => {
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return !Number.isNaN(checkDate.getTime()) && checkDate >= today;
    };

    // Same approach as AdminHomePage: retain the most recently generated
    // prediction (timestamp/createdAt) for each station and forecast date.
    const latestPredictionsByDate = {};
    selectedStationPredictions.forEach((prediction) => {
      if (!prediction.predictionDate || !isTodayOrFuture(prediction.predictionDate)) return;

      const stationKey = prediction.stationCode || prediction.stationName || 'unknown-station';
      const dateKey = new Date(prediction.predictionDate).toDateString();
      const key = `${stationKey}-${dateKey}`;
      const existingPrediction = latestPredictionsByDate[key];
      const predictionCreatedAt = new Date(prediction.timestamp || prediction.createdAt);
      const existingCreatedAt = new Date(existingPrediction?.timestamp || existingPrediction?.createdAt || 0);

      if (!existingPrediction || predictionCreatedAt > existingCreatedAt) {
        latestPredictionsByDate[key] = prediction;
      }
    });

    const countForForecastDay = (daysAhead) => {
      const forecastDate = new Date(today);
      forecastDate.setDate(forecastDate.getDate() + daysAhead);
      const forecastDateKey = forecastDate.toDateString();

      return Object.values(latestPredictionsByDate).filter((prediction) => (
        new Date(prediction.predictionDate).toDateString() === forecastDateKey
      )).length;
    };

    return {
      day1: countForForecastDay(0),
      day2: countForForecastDay(1),
      day3: countForForecastDay(2),
    };
  })();
  // Loading messages
  const loadingMessages = [
    'Initializing system...',
    'Connecting to database...',
    'Fetching user data...',
    'Loading stations...',
    'Fetching predictions...',
    'Loading alerts...',
    'Preparing dashboard...',
    'Almost ready...',
  ];

  useEffect(() => {
    // Simulate loading progress
    let progress = 0;
    let messageIndex = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;
      setLoadingProgress(Math.min(100, progress));
      
      const msgIndex = Math.floor((progress / 100) * loadingMessages.length);
      if (msgIndex < loadingMessages.length && msgIndex !== messageIndex) {
        messageIndex = msgIndex;
        setLoadingMessage(loadingMessages[msgIndex]);
      }
    }, 200);

    // Fetch data
    const loadData = async () => {
      await fetchData();
      await fetchStations();
      await fetchPredictions();
      
      clearInterval(interval);
      setLoadingProgress(100);
      setLoadingMessage('Ready!');
      
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };

    loadData();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?.preferredStation) {
      setForecastForm((prev) => ({
        ...prev,
        station: prev.station === 'Hanwella' || prev.station === '' ? user.preferredStation : prev.station,
      }));
    }
  }, [user?.preferredStation]);

  const fetchData = async () => {
    try {
      const [usersRes, locationsRes, alertsRes, predictionsRes, stationsRes, smsWarningsRes] = await Promise.allSettled([
        api.get('/users'),
        api.get('/locations'),
        api.get('/alerts'),
        api.get('/predictions'),
        api.get('/stations'),
        api.get('/sms/warnings')
      ]);

      const usersList = usersRes.status === 'fulfilled' ? usersRes.value.data.users || [] : [];
      const locations = locationsRes.status === 'fulfilled' ? locationsRes.value.data.locations || [] : [];
      const alerts = alertsRes.status === 'fulfilled' ? alertsRes.value.data.alerts || [] : [];
      const predictionsList = predictionsRes.status === 'fulfilled' ? predictionsRes.value.data.predictions || [] : [];
      const stationsList = stationsRes.status === 'fulfilled' ? stationsRes.value.data.stations || [] : [];
      const smsWarningsList = smsWarningsRes.status === 'fulfilled' ? smsWarningsRes.value.data.warnings || [] : [];

      setUsers(usersList);
      setSmsWarningRecords(smsWarningsList);
      setStats({
        users: usersList.length,
        locations: locations.length,
        alerts: alerts.length,
        predictions: predictionsList.length,
        activeStations: stationsList.filter(s => s.isActive !== false).length,
      });

      setRecentAlerts(alerts.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const syncStats = (updates = {}) => {
    setStats((prevStats) => ({
      ...prevStats,
      ...updates,
    }));
  };

  const fetchStations = async () => {
    try {
      const response = await api.get('/stations');
      const stationList = response.data.stations || [];
      setStations(stationList);
      syncStats({
        activeStations: stationList.filter((station) => station.isActive !== false).length,
      });
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const usersList = response.data.users || [];
      setUsers(usersList);
      setSmsWarningRecords(smsWarningsList);
      syncStats({ users: usersList.length });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await api.get('/predictions');
      const predictionList = response.data.predictions || [];
      setPredictions(predictionList);
      syncStats({ predictions: predictionList.length });
      console.log('Fetched predictions:', predictionList);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
      syncStats({ predictions: 0 });
    }
  };

  const handleRegionHover = (regionId) => {
    setSelectedRegion(regionId);
  };

  const getStationImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return `http://localhost:5000${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  };

  const handleNavigateToStations = () => {
    setActiveView('stations');
  };

  const handleStationSubmit = async (event) => {
    event.preventDefault();
    setStationLoading(true);
    setStationMessage('');

    try {
      const formData = new FormData();
      formData.append('stationName', stationForm.stationName.trim());
      formData.append('stationId', stationForm.stationId.trim());
      formData.append('threshold', String(Number(stationForm.threshold) || 1.5));
      formData.append('description', stationForm.description.trim());
      if (stationImage) {
        formData.append('image', stationImage);
      }

      if (editingStationId) {
        await api.put(`/stations/${editingStationId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setStationMessage('Station updated successfully');
      } else {
        await api.post('/stations', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setStationMessage('Station created successfully');
      }

      setStationForm({ stationName: '', stationId: '', threshold: '1.5', description: '' });
      setStationImage(null);
      setEditingStationId(null);
      fetchStations();
      fetchPredictions();
    } catch (error) {
      console.error('Station error:', error);
      setStationMessage(error.response?.data?.error || 'Unable to save station');
    } finally {
      setStationLoading(false);
    }
  };

  const handleEditStation = (station) => {
    setEditingStationId(station._id);
    setStationForm({
      stationName: station.stationName || '',
      stationId: station.stationId || '',
      threshold: station.threshold?.toString() || '1.5',
      description: station.description || ''
    });
    setStationImage(null);
  };

  const handleDeleteStation = async (stationId) => {
    if (!window.confirm('Delete this station?')) return;
    try {
      await api.delete(`/stations/${stationId}`);
      setStationMessage('Station deleted successfully');
      fetchStations();
      fetchPredictions();
    } catch (error) {
      console.error('Delete station error:', error);
      setStationMessage(error.response?.data?.error || 'Unable to delete station');
    }
  };

  const handleUpdateStation = async (stationId, formData) => {
    try {
      await api.put(`/stations/${stationId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStationMessage('Station updated successfully');
      fetchStations();
      fetchPredictions();
    } catch (error) {
      console.error('Update station error:', error);
      setStationMessage(error.response?.data?.error || 'Unable to update station');
    }
  };

  const handleUserRoleChange = async (userId, role) => {
    try {
      await api.put(`/users/${userId}`, { role });
      await fetchUsers();
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      await api.put(`/users/${userId}`, updatedData);
      await fetchUsers();
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      await fetchUsers();
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      await fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  };

  // In AdminPage.jsx - Replace your handleForecastSubmit with this debug version
const handleForecastSubmit = async (event) => {
    event.preventDefault();
    setForecastError('');
    setForecastLoading(true);

    try {
        const daysMap = { '24H': 1, '48H': 2, '72H': 3 };
        const days = daysMap[forecastForm.horizon] || 3;

        const requestData = {
            station: forecastForm.station.trim(),
            days: days,
            threshold: Number(forecastForm.threshold) || 1.5,
        };

        console.log('🔍 Sending forecast request to:', '/predictions/forecast');
        console.log('📦 Request data:', requestData);
        console.log('🔑 Token present:', !!localStorage.getItem('token'));

        const response = await api.post('/predictions/forecast', requestData, {
            timeout: 60000 // Increase timeout
        });

        console.log('✅ Forecast response:', response.data);

        if (response.data.success) {
            setForecastResult(response.data.forecast || null);
            await fetchPredictions();
            setForecastError('');
        } else {
            setForecastError(response.data.error || 'Unable to generate forecast right now.');
        }
    } catch (error) {
        console.error('❌ Forecast error details:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config
        });
        
        if (error.code === 'ECONNABORTED') {
            setForecastError('Request timed out. The prediction is taking too long.');
        } else if (error.response) {
            setForecastError(error.response.data?.error || `Server error: ${error.response.status}`);
        } else if (error.request) {
            setForecastError('No response from server. Please check if the backend is running.');
        } else {
            setForecastError(error.message || 'Unable to generate forecast right now.');
        }
    } finally {
        setForecastLoading(false);
    }
};

  // Professional Loading Animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md w-full px-6">
          {/* Logo/Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto relative">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse"></div>
              {/* Inner Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
            FloodGuard
          </h1>
          <p className="text-slate-400 text-sm mb-8">Admin Panel</p>

          {/* Progress Bar */}
          <div className="relative">
            <div className="bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              >
                <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-400">{loadingMessage}</span>
              <span className="text-xs font-medium text-blue-400">{Math.round(loadingProgress)}%</span>
            </div>
          </div>

          {/* Animated Dots */}
          <div className="flex items-center justify-center gap-1 mt-6">
            <div className="w-2 h-2 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

          {/* Version */}
          <p className="text-xs text-slate-500 mt-8">v2.0.0 • Loading system resources...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'prediction':
        return (
          <RunPredictionPage
            forecastForm={forecastForm}
            setForecastForm={setForecastForm}
            forecastResult={forecastResult}
            forecastError={forecastError}
            forecastLoading={forecastLoading}
            handleForecastSubmit={handleForecastSubmit}
            users={users}
          />
        );

      case 'stations':
        return (
          <ManageStationsPage
            stations={stations}
            stationForm={stationForm}
            setStationForm={setStationForm}
            stationImage={stationImage}
            setStationImage={setStationImage}
            editingStationId={editingStationId}
            stationLoading={stationLoading}
            stationMessage={stationMessage}
            handleStationSubmit={handleStationSubmit}
            handleEditStation={handleEditStation}
            handleDeleteStation={handleDeleteStation}
            getStationImageUrl={getStationImageUrl}
          />
        );

      case 'users':
        return (
          <ManageUsersPage
            stats={stats}
            users={users}
            onRoleChange={handleUserRoleChange}
            onUpdateUser={handleUpdateUser}
            onCreateUser={handleCreateUser}
            onDeleteUser={handleDeleteUser}
          />
        );

      case 'sms-warnings':
        return <SMSWarningHistoryPage />;

      case 'settings':
        return <SettingsPage forecastForm={forecastForm} setForecastForm={setForecastForm} />;

      case 'home':
      default:
        return (
          <AdminHomePage
            stats={stats}
            recentAlerts={recentAlerts}
            selectedRegion={selectedRegion}
            onRegionHover={handleRegionHover}
            stations={stations}
            getStationImageUrl={getStationImageUrl}
            onUpdateStation={handleUpdateStation}
            onDeleteStation={handleDeleteStation}
            predictions={predictions}
            onNavigateToStations={handleNavigateToStations}
            users = {users}
          />
        );
    }
  };

  return (
    <div className={`vision-admin ${isDarkMode ? 'vision-admin--dark bg-gray-900' : 'bg-[#f4f7fe]'} min-h-screen flex`}>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 ${
          isDarkMode ? 'bg-[#1b2559]' : 'bg-white'
        } text-[#2b3674] flex flex-col shadow-[10px_0_35px_rgba(112,144,176,0.08)] transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'w-72' : 'w-20'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {isSidebarExpanded && (
              <div className="transition-all duration-300">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                  FloodGuard
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-all duration-200 flex-shrink-0 hidden lg:block`}
          >
            {isSidebarExpanded ? (
              <ChevronLeft className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
            ) : (
              <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-all duration-200 lg:hidden`}
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-shrink-0 overflow-y-auto p-3 space-y-1.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25'
                    : isDarkMode
                      ? 'text-slate-200 hover:bg-white/10 hover:text-white'
                      : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'
                } ${!isSidebarExpanded && 'justify-center'}`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-white'
                      : isDarkMode
                        ? 'text-slate-400 group-hover:text-white'
                        : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                />
                {isSidebarExpanded && <span>{item.label}</span>}
                {isActive && isSidebarExpanded && (
                  <div className="ml-auto w-1.5 h-8 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live dashboard summary — placed right under nav with tighter spacing */}
        {isSidebarExpanded && (
          <section className="px-3 pt-3 pb-3 mt-auto">
            <p className={`px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Live summary</p>
            <div className="flex flex-col gap-2">
              {statsCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.title} className={`rounded-xl border p-3 transition hover:-translate-y-0.5 hover:shadow-md ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-[#edf0f7] bg-[#f8f9ff]'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</span>
                    </div>
                    <p className={`mt-2 text-[10px] font-bold leading-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>{stat.title}</p>
                  </div>
                );
              })}
              <div className={`rounded-xl border p-3 ${isDarkMode ? 'border-amber-900/40 bg-amber-900/20' : 'border-amber-100 bg-amber-50'}`}>
                <div className={`flex items-center justify-between gap-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <p className="text-[10px] font-bold uppercase tracking-wide">SMS warnings</p>
                  </div>
                  <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{smsSentForStation}</span>
                </div>
                <label htmlFor="sidebar-sms-station" className="sr-only">SMS warning station</label>
                <select
                  id="sidebar-sms-station"
                  value={selectedSmsWarningStation}
                  onChange={(event) => setSelectedSmsWarningStation(event.target.value)}
                  className={`mt-2 w-full rounded-md border px-2 py-1.5 text-xs font-medium outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'border-amber-800 bg-gray-900 text-white focus:border-amber-500 focus:ring-amber-900/40'
                      : 'border-amber-200 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-200'
                  }`}
                >
                  <option value="all">All stations</option>
                  {smsWarningStationOptions.map((station) => <option key={station} value={station}>{station}</option>)}
                </select>
                <p className={`mt-2 text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>SMS sent to selected station</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDarkMode ? 'border-purple-900/40 bg-purple-900/20' : 'border-purple-100 bg-purple-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className={`flex items-center gap-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    <BarChart3 className="h-4 w-4" />
                    <p className="text-[10px] font-bold uppercase tracking-wide">Predictions</p>
                  </div>
                </div>
                <label htmlFor="sidebar-prediction-station" className="sr-only">Prediction station</label>
                <select
                  id="sidebar-prediction-station"
                  value={selectedPredictionStation}
                  onChange={(event) => setSelectedPredictionStation(event.target.value)}
                  className={`mt-2 w-full rounded-md border px-2 py-1.5 text-xs font-medium outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'border-purple-800 bg-gray-900 text-white focus:border-purple-500 focus:ring-purple-900/40'
                      : 'border-purple-200 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200'
                  }`}
                >
                  <option value="all">All stations</option>
                  {predictionStationOptions.map((station) => (
                    <option key={station.value} value={station.value}>{station.label}</option>
                  ))}
                </select>
                <div className="mt-3 grid grid-cols-3 gap-1 text-center">
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{predictionCounts.day1}</p>
                    <p className={`text-[9px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>Day 1</p>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{predictionCounts.day2}</p>
                    <p className={`text-[9px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>Day 2</p>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{predictionCounts.day3}</p>
                    <p className={`text-[9px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>Day 3</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </aside>

      {/* Main Content */}
      <main className="vision-admin-main flex-1 min-w-0">
        {/* Top Bar */}
        <header className={`${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200/50'} backdrop-blur-lg border-b sticky top-0 z-30`}>
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <Menu className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <div className="hidden md:flex items-center gap-2">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {sidebarItems.find(item => item.id === activeView)?.label || 'Dashboard'}
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-100'}`}>
                  {activeView}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Search
              <div className={`hidden md:flex items-center ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg px-3 py-1.5 border focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all`}>
                <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`bg-transparent border-none outline-none text-sm ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-700'} w-40 ml-2`}
                />
                <kbd className="hidden sm:inline-block text-xs text-gray-400 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5">
                  ⌘K
                </kbd>
              </div> */}

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Notifications */}
              {/* <button className={`relative p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}>
                <Bell className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </button> */}

              {/* User Info (moved from sidebar) */}
              <div className={`hidden md:flex items-center gap-3 pl-3 pr-1 border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="leading-tight">
                  <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {user?.name || 'Admin'}
                  </p>
                  <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.email || 'admin@floodguard.com'}
                  </p>
                </div>
              </div>

              {/* Mobile avatar only */}
              <div className="md:hidden flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-xs">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    handleLogout();
                  }
                }}
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-red-900/20 hover:text-red-400'
                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>

              {/* Mobile Logout */}
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    handleLogout();
                  }
                }}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-red-900/20 hover:text-red-400'
                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="vision-admin-content p-4 md:p-6 animate-fade-in-up">
          {/* Main Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;