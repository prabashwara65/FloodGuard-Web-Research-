// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Bell,
  BellRing,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldCheck,
  ShieldOff,
  Users,
  Activity,
  Droplets,
  Thermometer,
  Gauge,
  Compass,
  Navigation,
  Award,
  Medal,
  Crown,
  Star,
  Sparkles,
  Rocket,
  Zap,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Save,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Upload,
  Download,
  Share2,
  Link,
  Copy,
  Bookmark,
  Flag,
  Target,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Cloud,
  Sun,
  Moon,
  Wind,
  AlertTriangle,
  Check,
  UserCheck,
  UserX,
  UserPlus,
  Shield as ShieldIcon,
} from 'lucide-react';
import api from '../api/axios';
import { loadUser, logout } from '../features/auth/authSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [predictions, setPredictions] = useState([]);
  const [smsWarnings, setSmsWarnings] = useState([]);
  const [stations, setStations] = useState([]);
  const [assignedStations, setAssignedStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forecastForm, setForecastForm] = useState({ station: '', days: '3', rainfall: '' });
  const [forecastResult, setForecastResult] = useState(null);
  const [forecastError, setForecastError] = useState('');
  const [forecastLoading, setForecastLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    district: '',
    password: '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stationPredictions, setStationPredictions] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [warningSummary, setWarningSummary] = useState([]);
  const [threeDayWarnings, setThreeDayWarnings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Recompute assigned stations whenever stations or user changes
  useEffect(() => {
    if (stations.length > 0 && user) {
      let filtered = [];
      
      // Check if user has assigned stations
      const userStationIds = (user.assignedStations || [])
        .map((station) => (typeof station === 'string' ? station : station?._id?.toString?.() || station?.toString?.()))
        .filter(Boolean);

      // Check if user has a preferred station
      const preferredStationName = user.preferredStation;

      if (userStationIds.length > 0) {
        // User has assigned stations - filter them
        filtered = stations.filter((station) => userStationIds.includes(station._id?.toString?.()));
      } else if (preferredStationName) {
        // User has a preferred station - find and show that station
        const preferredStation = stations.filter((station) => 
          station.stationName?.toLowerCase() === preferredStationName?.toLowerCase() ||
          station.stationId?.toLowerCase() === preferredStationName?.toLowerCase()
        );
        filtered = preferredStation;
      } else if (user?.role === 'admin') {
        // Admin users see all stations
        filtered = stations;
      } else {
        // Regular users with no assigned stations and no preferred station - show empty
        filtered = [];
      }
      
      setAssignedStations(filtered);
      
      // Generate warning summary for assigned stations
      generateWarningSummary(filtered, predictions);
      
      // Generate 3-day warnings for preferred station
      generateThreeDayWarnings(filtered, predictions);
    }
  }, [stations, user, predictions]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        organization: user.organization || '',
        district: user.district || '',
        password: '',
      });
      
      // Set forecast form station to user's preferred station
      if (user.preferredStation) {
        setForecastForm(prev => ({
          ...prev,
          station: user.preferredStation
        }));
      }
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [predRes, stationRes, smsWarningRes] = await Promise.all([
        api.get('/predictions'),
        api.get('/stations'),
        api.get('/sms/warnings')
      ]);
      setPredictions(predRes.data.predictions || []);
      setStations(stationRes.data.stations || []);
      setSmsWarnings(smsWarningRes.data.warnings || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStationImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return `http://localhost:5000${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  };

  // Get date key for comparison
  const getDateKey = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  // Keep the newest prediction per available forecast date (up to three dates).
  // This works for 1-day, 2-day, and 3-day forecast runs.
  const getNextThreeDayPredictions = (stationId, stationName) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const latestByDate = {};

    predictions.filter((prediction) => (
      (prediction.stationCode === stationId || prediction.stationName === stationName) && prediction.predictionDate
    )).forEach((prediction) => {
      const predictionDate = new Date(prediction.predictionDate);
      predictionDate.setHours(0, 0, 0, 0);
      if (Number.isNaN(predictionDate.getTime()) || predictionDate < today) return;

      const dateKey = predictionDate.toDateString();
      const existing = latestByDate[dateKey];
      if (!existing || new Date(prediction.timestamp || prediction.createdAt || 0) > new Date(existing.timestamp || existing.createdAt || 0)) {
        latestByDate[dateKey] = prediction;
      }
    });

    return Object.values(latestByDate)
      .sort((first, second) => new Date(first.predictionDate) - new Date(second.predictionDate))
      .slice(0, 3)
      .map((prediction, index) => ({
        date: new Date(prediction.predictionDate),
        label: index === 0 ? 'Day 1' : `Day ${index + 1}`,
        prediction,
        hasData: true,
      }));
  };

  // Generate 3-day warnings for preferred station
  const generateThreeDayWarnings = (stationsList, predictionsList) => {
    const warnings = [];
    
    stationsList.forEach(station => {
      const nextThreeDays = getNextThreeDayPredictions(station.stationId, station.stationName);
      
      // Filter only warnings
      const warningDays = nextThreeDays.filter(day => 
        day.hasData && day.prediction && day.prediction.warning === true
      );
      
      if (warningDays.length > 0) {
        warnings.push({
          station,
          warnings: warningDays
        });
      }
    });
    
    setThreeDayWarnings(warnings);
  };

  // Generate warning summary for all assigned stations
  const generateWarningSummary = (stationsList, predictionsList) => {
    const summary = stationsList.map(station => {
      const nextThreeDays = getNextThreeDayPredictions(station.stationId, station.stationName);
      const warnings = nextThreeDays.filter(day => 
        day.hasData && day.prediction && day.prediction.warning === true
      );
      
      // Get the latest prediction for current status
      const latestPred = getLatestPrediction(station.stationId, station.stationName);
      
      return {
        station,
        nextThreeDays,
        warningsCount: warnings.length,
        hasWarning: warnings.length > 0,
        latestPred,
        allWarnings: warnings
      };
    });
    
    setWarningSummary(summary);
  };

  // Get the latest prediction for a station
  const getLatestPrediction = (stationId, stationName) => {
    const stationPreds = predictions.filter(p => 
      p.stationCode === stationId || 
      p.stationName === stationName
    );
    if (stationPreds.length === 0) return null;
    return stationPreds.sort((a, b) => {
      const dateA = new Date(a.predictionDate);
      const dateB = new Date(b.predictionDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB - dateA;
      }
      const timeA = new Date(a.timestamp || a.createdAt);
      const timeB = new Date(b.timestamp || b.createdAt);
      return timeB - timeA;
    })[0];
  };

  // Get unique predictions by date
  const getUniquePredictionsByDate = (predictionsList) => {
    const dateMap = {};
    predictionsList.forEach(pred => {
      const dateKey = new Date(pred.predictionDate).toDateString();
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = pred;
      } else {
        const existingDate = new Date(dateMap[dateKey].timestamp || dateMap[dateKey].createdAt);
        const newDate = new Date(pred.timestamp || pred.createdAt);
        if (newDate > existingDate) {
          dateMap[dateKey] = pred;
        }
      }
    });
    return Object.values(dateMap).sort((a, b) => 
      new Date(a.predictionDate) - new Date(b.predictionDate)
    );
  };

  // Get all unique predictions for a station
  const getUniqueStationPredictions = (stationId, stationName) => {
    const stationPreds = predictions.filter(p => 
      p.stationCode === stationId || 
      p.stationName === stationName
    );
    return getUniquePredictionsByDate(stationPreds);
  };

  // Handle card click - open modal with station data
  const handleCardClick = (station) => {
    setSelectedStation(station);
    const uniquePreds = getUniqueStationPredictions(station.stationId, station.stationName);
    setStationPredictions(uniquePreds);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStation(null);
    setStationPredictions([]);
  };

  const handleForecastSubmit = async (event) => {
    event.preventDefault();
    setForecastError('');
    setForecastLoading(true);

    try {
      const rainfallValues = forecastForm.rainfall
        .split(',')
        .map((value) => Number(value.trim()))
        .filter((value) => !Number.isNaN(value));

      const response = await api.post('/predictions/forecast', {
        station: forecastForm.station.trim(),
        days: Number(forecastForm.days) || 3,
        rainfall: rainfallValues,
      });

      setForecastResult(response.data.forecast || null);
    } catch (error) {
      console.error('Forecast error:', error);
      setForecastError(error.response?.data?.error || 'Unable to generate forecast right now.');
    } finally {
      setForecastLoading(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');

    try {
      const payload = { ...profileForm };
      if (!payload.password) {
        delete payload.password;
      }

      await api.put(`/users/${user?.id || user?._id}`, payload);
      await dispatch(loadUser());
      setProfileMessage('Your profile was updated successfully.');
      setProfileForm((prev) => ({ ...prev, password: '' }));
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileMessage(error.response?.data?.error || 'Unable to update your profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      navigate('/login');
    }
  };

  // Render station card with prediction overlay
  const renderStationCard = (station) => {
    if (!station) return null;
    
    const latestPred = getLatestPrediction(station.stationId, station.stationName);
    const hasPrediction = latestPred !== null;
    const nextThreeDays = getNextThreeDayPredictions(station.stationId, station.stationName);
    const hasUpcomingWarning = nextThreeDays.some(day => day.hasData && day.prediction?.warning);
    
    const imageUrl = station.imageUrl ? getStationImageUrl(station.imageUrl) : null;
    
    return (
      <div
        key={station._id}
        className="relative overflow-hidden rounded-xl cursor-pointer group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        style={{ height: '220px' }}
        onClick={() => handleCardClick(station)}
      >
        {/* Background Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={station.stationName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white/50" />
          </div>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        {/* Warning Badge - Top Right */}
        {hasUpcomingWarning && (
          <div className="absolute top-3 right-3 z-20">
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/90 backdrop-blur-sm rounded-lg text-white text-xs font-medium animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>Warning</span>
            </div>
          </div>
        )}

        {/* Prediction Value - Centered */}
        {hasPrediction && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <div className={`text-4xl font-bold text-white drop-shadow-lg ${
                latestPred.warning ? 'text-red-300' : 'text-green-300'
              }`}>
                {latestPred.predictionValue.toFixed(2)}<span className="text-xl">m</span>
              </div>
              <div className="text-xs text-white/70 mt-1">
                {new Date(latestPred.predictionDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        )}

        {/* Station Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-10">
          <p className="text-sm font-semibold truncate">{station.stationName}</p>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>ID: {station.stationId}</span>
            <span>•</span>
            <span>Threshold: {station.threshold || '1.5'}m</span>
          </div>
          
          {/* Next 3 Days Mini Preview */}
          <div className="flex items-center gap-2 mt-1.5">
            {nextThreeDays.map((day, idx) => (
              <div key={idx} className="flex items-center gap-1 text-xs">
                {day.hasData ? (
                  <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                    day.prediction?.warning 
                      ? 'bg-red-500/40 text-red-200' 
                      : 'bg-green-500/40 text-green-200'
                  }`}>
                    {day.prediction?.warning ? (
                      <AlertTriangle className="w-2.5 h-2.5" />
                    ) : (
                      <CheckCircle className="w-2.5 h-2.5" />
                    )}
                    {day.prediction?.predictionValue?.toFixed(1)}m
                  </span>
                ) : (
                  <span className="text-white/30">—</span>
                )}
                {idx < 2 && <span className="text-white/20">|</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-all duration-300"></div>
      </div>
    );
  };

  // Render Modal
  const renderModal = () => {
    if (!isModalOpen || !selectedStation) return null;
    
    const warningCount = stationPredictions.filter(p => p.warning).length;
    const nextThreeDays = getNextThreeDayPredictions(selectedStation.stationId, selectedStation.stationName);
    const imageUrl = selectedStation.imageUrl ? getStationImageUrl(selectedStation.imageUrl) : null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {selectedStation.stationName}
              </h2>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Station Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Station Name</label>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedStation.stationName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Station ID</label>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedStation.stationId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Threshold</label>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedStation.threshold || '1.5'} m</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      stationPredictions.some(p => p.warning) 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {stationPredictions.some(p => p.warning) ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {stationPredictions.some(p => p.warning) ? 'Warning' : 'Normal'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedStation.description || 'No description available'}</p>
                </div>
                {user?.preferredStation && 
                  selectedStation.stationName?.toLowerCase() === user.preferredStation?.toLowerCase() && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                        <Star className="w-3 h-3" />
                        Your Preferred Station
                      </span>
                    </div>
                  )}
              </div>

              {/* Image */}
              <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={selectedStation.stationName}
                    className="w-full max-h-48 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <MapPin className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Station Image</p>
              </div>
            </div>

            {/* 3-Day Forecast Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                3-Day Forecast (Starting Tomorrow)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {nextThreeDays.map((day, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${
                    day.hasData && day.prediction?.warning
                      ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      : day.hasData
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{day.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {day.hasData ? (
                      <>
                        <div className="flex items-end gap-2">
                          <span className={`text-2xl font-bold ${
                            day.prediction?.warning 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {day.prediction.predictionValue.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">m</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            day.prediction?.warning 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {day.prediction?.warning ? (
                              <AlertTriangle className="w-3 h-3" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            {day.prediction?.warning ? 'Warning' : 'Normal'}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {day.prediction?.horizon || 'N/A'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-400 dark:text-gray-500">No data available</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Full Prediction History */}
            {stationPredictions.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Prediction History
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {stationPredictions.length} records
                    </span>
                    {warningCount > 0 && (
                      <span className="text-sm text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {warningCount} warnings
                      </span>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Value</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Horizon</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stationPredictions.slice(0, 10).map((pred, index) => (
                        <tr key={pred._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                            {new Date(pred.predictionDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                            {pred.predictionValue.toFixed(2)} m
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                            {pred.horizon || 'N/A'}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              pred.warning 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {pred.warning ? (
                                <AlertTriangle className="w-3 h-3" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              {pred.warning ? 'Warning' : 'Normal'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
                            {new Date(pred.timestamp || pred.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stationPredictions.length > 10 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
                      Showing 10 of {stationPredictions.length} records
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const userSmsWarnings = useMemo(() => {
    if (!user || !smsWarnings.length) return [];
    const userId = user._id || user.id;
    const normalizedPhone = user.phone?.replace(/\D/g, '') || '';
    const normalizedEmail = user.email?.toLowerCase() || '';

    return smsWarnings.filter((warning) => {
      if (!warning?.recipients?.length) return false;
      return warning.recipients.some((recipient) => {
        const recipientId = recipient.userId?._id || recipient.userId || '';
        const recipientPhone = recipient.phone?.replace(/\D/g, '') || '';
        const recipientEmail = recipient.email?.toLowerCase() || '';

        return (
          (recipientId && String(recipientId) === String(userId)) ||
          (normalizedPhone && recipientPhone && normalizedPhone === recipientPhone) ||
          (normalizedEmail && recipientEmail && normalizedEmail === recipientEmail)
        );
      });
    });
  }, [smsWarnings, user]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading Dashboard...</p>
          <p className="text-sm text-gray-400 mt-1">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  const isUser = user?.role === 'user';
  const isAdmin = user?.role === 'admin';
  const totalWarnings = warningSummary.reduce((sum, item) => sum + item.warningsCount, 0);
  const hasWarnings = totalWarnings > 0;
  const hasAssignedStations = assignedStations.length > 0;
  const preferredStationName = user?.preferredStation;
  
  // Get total 3-day warnings
  const totalThreeDayWarnings = threeDayWarnings.reduce((sum, item) => sum + item.warnings.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome, {user?.name} 👋</h1>
                  <p className="text-blue-100 text-sm">
                    {isAdmin 
                      ? 'You have admin access - viewing all stations'
                      : preferredStationName && hasAssignedStations
                      ? `Viewing warnings for your preferred station: ${preferredStationName}`
                      : isUser && !hasAssignedStations
                      ? 'No stations assigned yet. Contact your administrator.'
                      : 'View your assigned stations and monitor flood risks'}
                  </p>
                </div>
              </div>
              {totalThreeDayWarnings > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/30 backdrop-blur-sm rounded-lg animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">{totalThreeDayWarnings} Warning{totalThreeDayWarnings > 1 ? 's' : ''} in 3 Days</span>
                </div>
              )}
              {isAdmin && (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/30 backdrop-blur-sm rounded-lg">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Admin</span>
                </div>
              )}
              {preferredStationName && !isAdmin && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 backdrop-blur-sm rounded-lg">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">{preferredStationName}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isAdmin ? 'Total Stations' : 'Your Stations'}
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{assignedStations.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {isAdmin 
                  ? `Total stations in system: ${stations.length}`
                  : preferredStationName && !hasAssignedStations
                  ? `Preferred: ${preferredStationName}`
                  : assignedStations.length > 0 
                    ? 'Stations assigned to you' 
                    : 'No stations assigned'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">SMS Warnings</p>
                <p className={`text-2xl font-bold ${userSmsWarnings.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  {userSmsWarnings.length}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${userSmsWarnings.length > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <BellRing className={`w-6 h-6 ${userSmsWarnings.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-xs font-medium ${userSmsWarnings.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                {userSmsWarnings.length > 0 ? 'Latest warning sent' : 'No mobile warnings'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Predictions</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{predictions.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Available predictions
              </span>
            </div>
          </div>
        </div>

        {/* 3-Day Warnings Section - Show only if there are warnings */}
        {totalThreeDayWarnings > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300 text-lg">
                  ⚠️ 3-Day Warning Forecast
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {totalThreeDayWarnings} warning{totalThreeDayWarnings > 1 ? 's' : ''} forecasted for the next 3 days (starting tomorrow).
                  Please review the details below and take necessary precautions.
                </p>
                
                <div className="mt-4 space-y-4">
                  {threeDayWarnings.map((item, idx) => (
                    <div key={idx} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {item.station.stationName}
                          </span>
                          {user?.preferredStation && 
                            item.station.stationName?.toLowerCase() === user.preferredStation?.toLowerCase() && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-400/80 text-yellow-900 text-xs font-medium rounded-full">
                                <Star className="w-3 h-3" />
                                Preferred
                              </span>
                            )}
                        </div>
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          {item.warnings.length} warning{item.warnings.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {item.warnings.map((day, dayIdx) => (
                          <div key={dayIdx} className="bg-red-100/50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                                {day.label}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-end gap-1">
                                <span className="text-xl font-bold text-red-600 dark:text-red-400">
                                  {day.prediction.predictionValue.toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">m</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-200 dark:bg-red-800/50 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                                  <AlertTriangle className="w-3 h-3" />
                                  Warning
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  Threshold: {day.prediction.threshold || item.station.threshold || '1.5'}m
                                </span>
                              </div>
                              {day.prediction.horizon && (
                                <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                  Horizon: {day.prediction.horizon}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stations Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    {isAdmin ? 'All Stations' : 'Your Stations'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {assignedStations.length} station{assignedStations.length > 1 ? 's' : ''} 
                    {isAdmin && ` (${stations.length} total in system)`}
                    {preferredStationName && !isAdmin && ` • Preferred: ${preferredStationName}`}
                  </p>
                </div>
                {totalThreeDayWarnings > 0 && (
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    {totalThreeDayWarnings} Warning{totalThreeDayWarnings > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {hasAssignedStations ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignedStations.map((station) => {
                    // Check if this is the user's preferred station
                    const isPreferred = user?.preferredStation && 
                      station.stationName?.toLowerCase() === user.preferredStation?.toLowerCase();
                    
                    return (
                      <div key={station._id} className="relative">
                        {isPreferred && (
                          <div className="absolute top-2 left-2 z-20">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-400/90 backdrop-blur-sm text-yellow-900 text-xs font-medium rounded-lg">
                              <Star className="w-3 h-3" />
                              Preferred
                            </span>
                          </div>
                        )}
                        {renderStationCard(station)}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {isAdmin 
                      ? 'No stations found in the system.' 
                      : preferredStationName
                      ? `No station found for "${preferredStationName}"`
                      : 'You haven\'t been assigned any stations yet.'}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {isAdmin 
                      ? 'Please create stations in the admin panel.' 
                      : preferredStationName
                      ? 'Please check your preferred station name or contact administrator.'
                      : 'Contact your administrator for access.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* 3-Day Warning Summary */}
            {hasAssignedStations && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">3-Day Warning Summary</h2>
                  {totalThreeDayWarnings > 0 && (
                    <span className="ml-auto text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                      {totalThreeDayWarnings} warnings
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {assignedStations.map((station) => {
                    const nextThreeDays = getNextThreeDayPredictions(station.stationId, station.stationName);
                    const warningDays = nextThreeDays.filter(day => day.hasData && day.prediction?.warning);
                    const hasWarning = warningDays.length > 0;
                    const isPreferred = user?.preferredStation && 
                      station.stationName?.toLowerCase() === user.preferredStation?.toLowerCase();
                    const dayLabels = warningDays.map(day => day.label).join(', ');
                    
                    return (
                      <div key={station._id} className={`p-3 rounded-lg border ${
                        hasWarning 
                          ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 dark:text-white">
                            {station.stationName}
                            {isPreferred && (
                              <Star className="w-3 h-3 inline ml-1 text-yellow-500" />
                            )}
                          </span>
                          {hasWarning ? (
                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Warning
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Normal
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {nextThreeDays.map((day, idx) => (
                            <div key={idx} className="text-center">
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{day.label}</p>
                              {day.hasData ? (
                                <div className={`text-xs font-medium ${
                                  day.prediction?.warning 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {day.prediction.predictionValue.toFixed(2)}m
                                  {day.prediction?.warning && (
                                    <AlertTriangle className="w-3 h-3 inline ml-0.5" />
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-300 dark:text-gray-600">—</div>
                              )}
                            </div>
                          ))}
                        </div>
                        {hasWarning && (
                          <p className="mt-2 text-[10px] font-medium text-red-600 dark:text-red-300">
                            Forecast warning in: {dayLabels}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {userSmsWarnings.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BellRing className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">SMS Warning Messages</h2>
                </div>

                <div className="space-y-3">
                  {userSmsWarnings.slice(0, 3).map((warning, index) => (
                    <div key={warning._id || index} className="rounded-lg border border-red-200 bg-red-50/60 p-3 dark:border-red-800 dark:bg-red-900/20">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
                          {warning.station || 'Station'}
                        </p>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {new Date(warning.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                        {warning.message || 'Flood warning message sent to you.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Your Profile</h2>
              </div>

              {profileMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                  profileMessage.includes('success') 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}>
                  {profileMessage.includes('success') ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{profileMessage}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Email"
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Phone"
                  />
                </div>

                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="Organization"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={profileForm.district}
                    onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="District"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    placeholder="New password (optional)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200 disabled:opacity-60"
                >
                  {profileLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Station Modal */}
        {renderModal()}
      </div>
    </div>
  );
};

export default DashboardPage;