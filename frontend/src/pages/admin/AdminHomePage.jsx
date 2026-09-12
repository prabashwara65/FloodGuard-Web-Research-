// frontend/src/pages/admin/AdminHomePage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import {
  MapPin,
  X,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Shield,
  Award,
  Medal,
  Crown,
  Star,
  Sparkles,
  Rocket,
  Zap,
  ArrowRight,
  ChevronRight,
  Settings,
  BarChart3,
  Database,
  Activity,
  User,
  Users,
  Bell,
  BellRing,
  Home,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Wifi,
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
  Tag,
  Hash,
  FileText,
  Phone,
  Mail,
  Send,
  Loader2,
  Check,
  XCircle,
  LogOut,
} from 'lucide-react';
import api from '../../api/axios';

const AdminHomePage = ({ 
    stats, 
    recentAlerts, 
    selectedRegion, 
    onRegionHover,
    stations = [],
    getStationImageUrl,
    onUpdateStation,
    onDeleteStation,
    predictions = [],
    onNavigateToStations,
    users = [],
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Find specific stations by ID
    const station001 = stations.find(s => s.stationId === "001");
    const station002 = stations.find(s => s.stationId === "002");
    const station003 = stations.find(s => s.stationId === "003");
    const station004 = stations.find(s => s.stationId === "004");
    const station005 = stations.find(s => s.stationId === "005");
    const station006 = stations.find(s => s.stationId === "006");
    const station007 = stations.find(s => s.stationId === "007");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [stationPredictions, setStationPredictions] = useState([]);
    const [formData, setFormData] = useState({
        stationName: '',
        stationId: '',
        threshold: '',
        description: '',
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // SMS sending state
    const [sendingSMS, setSendingSMS] = useState(false);
    const [smsResults, setSmsResults] = useState(null);

    // Helper to check if a date is today or in the future
    const isTodayOrFuture = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate.getTime() >= today.getTime();
    };

    // Helper to check if a date is today
    const isToday = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate.getTime() === today.getTime();
    };

    // Get unique predictions by date - ONLY today and future
    const getUniquePredictionsByDate = (predictionsList) => {
        const dateMap = {};
        predictionsList.forEach(pred => {
            if (pred.predictionDate && isTodayOrFuture(pred.predictionDate)) {
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
            }
        });
        return Object.values(dateMap).sort((a, b) => 
            new Date(a.predictionDate) - new Date(b.predictionDate)
        );
    };

    // Get the latest prediction for a station (today or future)
    const getLatestPrediction = (stationId, stationName) => {
        const stationPreds = predictions.filter(p => {
            if (p.predictionDate && isTodayOrFuture(p.predictionDate)) {
                return p.stationCode === stationId || p.stationName === stationName;
            }
            return false;
        });
        if (stationPreds.length === 0) return null;
        return stationPreds.sort((a, b) => {
            const dateA = new Date(a.predictionDate);
            const dateB = new Date(b.predictionDate);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB;
            }
            const timeA = new Date(a.timestamp || a.createdAt);
            const timeB = new Date(b.timestamp || b.createdAt);
            return timeB - timeA;
        })[0];
    };

    // Get all unique predictions for a station (today and future only)
    const getUniqueStationPredictions = (stationId, stationName) => {
        const stationPreds = predictions.filter(p => {
            if (p.predictionDate && isTodayOrFuture(p.predictionDate)) {
                return p.stationCode === stationId || p.stationName === stationName;
            }
            return false;
        });
        return getUniquePredictionsByDate(stationPreds);
    };

    // Handle card click - open modal with station data
    const handleCardClick = (station) => {
        setEditingStation(station);
        setFormData({
            stationName: station.stationName || '',
            stationId: station.stationId || '',
            threshold: station.threshold?.toString() || '1.5',
            description: station.description || '',
        });
        setSelectedImage(null);
        setSmsResults(null);
        
        const uniquePreds = getUniqueStationPredictions(station.stationId, station.stationName);
        setStationPredictions(uniquePreds);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStation(null);
        setSelectedImage(null);
        setStationPredictions([]);
        setSmsResults(null);
        setSendingSMS(false);
    };

    // Navigate to manage stations with the specific station ID
    const handleNavigateToStations = () => {
        closeModal();
        if (onNavigateToStations) {
            onNavigateToStations();
        }
    };

    // Send SMS to all subscribed users
    const sendSMSAlert = async () => {
        if (!editingStation) return;
        
        // Get users subscribed to this station
        const filteredUsers = users.filter(user => {
            const hasPreferredStation = user.preferredStation === editingStation?.stationName || 
                                       user.preferredStation === editingStation?.stationId;
            const hasSubscription = user.subscriptions && user.subscriptions.some(sub => 
                sub.station === editingStation?.stationName || 
                sub.station === editingStation?.stationId
            );
            return (hasPreferredStation || hasSubscription) && user.phone;
        });

        console.log('📱 Filtered users for SMS:', filteredUsers);

        if (filteredUsers.length === 0) {
            alert('මෙම ස්ථානය සඳහා දුරකථන අංක ඇති පරිශීලකයන් නොමැත.');
            return;
        }

        // Get latest prediction
        const latestPred = getLatestPrediction(editingStation?.stationId, editingStation?.stationName);
        
        // Build Sinhala message
        const stationName = editingStation?.stationName || 'නොදන්නා ස්ථානය';
        const threshold = editingStation?.threshold || '1.5';
        const level = latestPred ? latestPred.predictionValue.toFixed(2) : 'N/A';
        const isWarning = latestPred?.warning || false;
        const date = latestPred ? new Date(latestPred.predictionDate).toLocaleDateString('si-LK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'N/A';
        
        // Create Sinhala message
        let message = '';
        
        if (isWarning) {
            message = `🚨 ගංවතුර අනතුරු ඇඟවීම! 🚨\n\n` +
                      `📍 ස්ථානය: ${stationName}\n` +
                      `🌊 ජල මට්ටම: ${level} මීටර්\n` +
                      `⚠️ අනතුරු සීමාව: ${threshold} මීටර්\n` +
                      `📊 තත්වය: අනතුරුදායකයි!\n` +
                      `📅 දිනය: ${date}\n\n` +
                      `කරුණාකර ආරක්ෂිත ප්‍රදේශවලට ගොස් ආරක්ෂා වන්න.\n` +
                      `🌊 FloodGuard AI`;
        } else {
            message = `📊 ගංවතුර අනාවැකිය 📊\n\n` +
                      `📍 ස්ථානය: ${stationName}\n` +
                      `🌊 ජල මට්ටම: ${level} මීටර්\n` +
                      `📏 අනතුරු සීමාව: ${threshold} මීටර්\n` +
                      `✅ තත්වය: සාමාන්යයි\n` +
                      `📅 දිනය: ${date}\n\n` +
                      `කරුණාකර අවදානෙන් සිටින්න.\n` +
                      `🌊 FloodGuard AI`;
        }

        // Confirm before sending
        if (!window.confirm(
            `📱 පහත පණිවිඩය ${filteredUsers.length} පරිශීලකයන්ට යවන්නද?\n\n` +
            `${message.substring(0, 100)}...`
        )) {
            return;
        }

        setSendingSMS(true);
        setSmsResults(null);

        try {
            // ✅ FIX: Use /sms/custom instead of /sms/alert
            const response = await api.post('/sms/custom', {
                station: stationName,
                message: message,
                users: filteredUsers.map(u => ({
                    id: u._id,
                    name: u.name || 'User',
                    phone: u.phone,
                    email: u.email
                }))
            });

            console.log('📱 SMS Response:', response.data);

            if (response.data.success) {
                const responseData = response.data.data || response.data;
                
                let sentCount = 0;
                let failedCount = 0;
                
                if (responseData.sent !== undefined) {
                    sentCount = responseData.sent;
                } else if (responseData.successful !== undefined) {
                    sentCount = responseData.successful;
                } else if (responseData.total !== undefined) {
                    sentCount = responseData.total;
                } else {
                    sentCount = filteredUsers.length;
                }

                if (responseData.failed !== undefined) {
                    failedCount = responseData.failed;
                }

                setSmsResults({
                    success: true,
                    message: `✅ සිංහල SMS පණිවිඩ ${sentCount} පරිශීලකයන්ට යවන ලදී!`,
                    data: {
                        sent: sentCount,
                        failed: failedCount,
                        details: responseData,
                        provider: responseData.provider || 'Notify.lk'
                    }
                });
            } else {
                setSmsResults({
                    success: false,
                    error: response.data.error || response.data.message || 'SMS යැවීම අසාර්ථක විය'
                });
            }
        } catch (error) {
            console.error('❌ SMS sending error:', error);
            
            let errorMessage = 'SMS යැවීම අසාර්ථක විය';
            
            if (error.response) {
                errorMessage = error.response.data?.error || 
                              error.response.data?.message || 
                              `සේවාදායක දෝෂය (${error.response.status})`;
            } else if (error.request) {
                errorMessage = 'සේවාදායකයට සම්බන්ධ විය නොහැක. කරුණාකර ඔබගේ අන්තර්ජාල සම්බන්ධතාව පරීක්ෂා කරන්න.';
            } else {
                errorMessage = error.message || 'SMS යැවීම අසාර්ථක විය';
            }
            
            setSmsResults({
                success: false,
                error: errorMessage,
                details: error.response?.data || null
            });
        } finally {
            setSendingSMS(false);
        }
    };

    // Send test SMS to a single user
    const sendTestSMS = async (phone, name) => {
        if (!phone) {
            alert('No phone number available for this user.');
            return;
        }

        if (!window.confirm(`Send test SMS to ${name || 'user'} at ${phone}?`)) {
            return;
        }

        try {
            const response = await api.post('/sms/test', {
                phone: phone
            });

            if (response.data.success) {
                alert(`✅ Test SMS sent to ${name || 'user'} successfully!`);
            } else {
                alert(`❌ Failed to send test SMS: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Test SMS error:', error);
            alert(`❌ Error sending test SMS: ${error.response?.data?.error || error.message}`);
        }
    };

    // Render station card
    const renderStationCard = (station, sizeClass = "w-full h-full", extraClass = "", textPadding = "p-4") => {
        if (!station) return null;
        
        const latestPred = getLatestPrediction(station.stationId, station.stationName);
        const hasPrediction = latestPred !== null;
        
        const formattedDate = hasPrediction 
            ? new Date(latestPred.predictionDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : null;
        
        const uniquePreds = getUniqueStationPredictions(station.stationId, station.stationName);
        const predCount = uniquePreds.length;
        
        return (
            <div 
                key={station._id} 
                className={`
                    relative overflow-hidden
                    ${sizeClass}
                    ${extraClass}
                    transition-transform hover:scale-105
                    m-0 p-0
                    cursor-pointer
                `}
                style={{
                    border: 'none',
                    boxShadow: 'none',
                    outline: 'none',
                    margin: 0,
                    padding: 0,
                }}
                onClick={() => handleCardClick(station)}
            >
                {/* Background Image */}
                {station.imageUrl ? (
                    <img
                        src={getStationImageUrl(station.imageUrl)}
                        alt={station.stationName}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <MapPin className="w-16 h-16 text-white opacity-50" />
                    </div>
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Prediction Value - Centered */}
                {hasPrediction && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-center">
                            <div className={`text-3xl font-bold text-white drop-shadow-lg ${
                                latestPred.warning ? 'text-red-300' : 'text-green-300'
                            }`}>
                                {latestPred.predictionValue.toFixed(2)} m
                            </div>
                            <div className="text-xs text-white/40 mt-1">
                                Updated: {new Date(latestPred.timestamp || latestPred.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Text content - Bottom */}
                <div className={`absolute bottom-0 left-0 right-0 ${textPadding} text-white`}>
                    <p className="text-sm font-semibold truncate">
                        {station.stationName}
                    </p>
                    <p className="text-xs text-white/80">
                        ID: {station.stationId || 'N/A'}
                    </p>
                    <p className="text-xs text-white/80">
                        Threshold: {station.threshold || '1.5'} m
                    </p>
                    
                    {hasPrediction && (
                        <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                            <span className={`font-medium ${
                                latestPred.warning ? 'text-red-300' : 'text-green-300'
                            }`}>
                                {latestPred.warning ? '⚠️ Warning' : '✅ Normal'}
                            </span>
                            <span className="text-white/60">•</span>
                            <span className="text-white/60">
                                {latestPred.horizon || '72H'}
                            </span>
                            <span className="text-white/60">•</span>
                            <span className="text-white/60">
                                {formattedDate}
                            </span>
                            {predCount > 1 && (
                                <>
                                    <span className="text-white/60">•</span>
                                    <span className="text-white/40 text-xs">
                                        +{predCount - 1} more dates
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                    
                    {!hasPrediction && (
                        <div className="mt-1 text-xs text-white/40">
                            No predictions yet
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Enhanced Modal Component
    const renderModal = () => {
        if (!isModalOpen) return null;
        
        const warningCount = stationPredictions.filter(p => p.warning).length;
        const hasWarnings = warningCount > 0;
        const imageUrl = editingStation?.imageUrl ? getStationImageUrl(editingStation.imageUrl) : null;
        const latestPred = getLatestPrediction(editingStation?.stationId, editingStation?.stationName);

        // Filter users who have this station as preferredStation and have phone numbers
        const filteredUsers = users.filter(user => {
            const hasPreferredStation = user.preferredStation === editingStation?.stationName || 
                                       user.preferredStation === editingStation?.stationId;
            const hasSubscription = user.subscriptions && user.subscriptions.some(sub => 
                sub.station === editingStation?.stationName || 
                sub.station === editingStation?.stationId
            );
            return hasPreferredStation || hasSubscription;
        });

        const usersWithPhone = filteredUsers.filter(u => u.phone);
        const usersWithoutPhone = filteredUsers.filter(u => !u.phone);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {editingStation?.stationName}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Station Details & Predictions
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={closeModal}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Station Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left: Station Info */}
                            <div className="md:col-span-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            Station Name
                                        </label>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">
                                            {editingStation?.stationName}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                                            <Hash className="w-3 h-3" />
                                            Station ID
                                        </label>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">
                                            {editingStation?.stationId}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                                            <Target className="w-3 h-3" />
                                            Threshold
                                        </label>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">
                                            {editingStation?.threshold || '1.5'} m
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                                            {hasWarnings ? (
                                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                            ) : (
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                            )}
                                            Status
                                        </label>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                            hasWarnings 
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        }`}>
                                            {hasWarnings ? (
                                                <AlertTriangle className="w-3 h-3" />
                                            ) : (
                                                <CheckCircle className="w-3 h-3" />
                                            )}
                                            {hasWarnings ? 'Warning' : 'Normal'}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        Description
                                    </label>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        {editingStation?.description || 'No description available'}
                                    </p>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <button
                                        onClick={handleNavigateToStations}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Station
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Close
                                    </button>
                                </div>
                            </div>

                            {/* Right: Image */}
                            <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={editingStation?.stationName}
                                        className="w-full max-h-48 object-cover rounded-lg shadow-md"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-48 flex items-center justify-center">
                                        <MapPin className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Station Image</p>
                                
                                {/* Latest Prediction Summary */}
                                {latestPred && (
                                    <div className="mt-3 w-full bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Latest Prediction</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className={`text-lg font-bold ${
                                                latestPred.warning ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                            }`}>
                                                {latestPred.predictionValue.toFixed(2)}m
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                latestPred.warning 
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                                {latestPred.warning ? '⚠️ Warning' : '✅ Normal'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {new Date(latestPred.predictionDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subscribed Users Section with SMS Button */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        Subscribed Users
                                    </h3>
                                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                        {filteredUsers.length}
                                    </span>
                                    {usersWithPhone.length > 0 && (
                                        <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                                            {usersWithPhone.length} with phone
                                        </span>
                                    )}
                                </div>
                                
                                {/* SMS Button */}
                                {usersWithPhone.length > 0 && (
                                    <button
                                        onClick={sendSMSAlert}
                                        disabled={sendingSMS}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 ${
                                            sendingSMS 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg hover:shadow-green-600/25'
                                        }`}
                                    >
                                        {sendingSMS ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send SMS Alert
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* SMS Results */}
                            {smsResults && (
                                <div className={`mb-3 p-3 rounded-lg ${
                                    smsResults.success 
                                        ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                                        : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                }`}>
                                    <div className="flex items-start gap-2">
                                        {smsResults.success ? (
                                            <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${
                                                smsResults.success 
                                                    ? 'text-green-800 dark:text-green-300' 
                                                    : 'text-red-800 dark:text-red-300'
                                            }`}>
                                                {smsResults.success ? smsResults.message : smsResults.error}
                                            </p>
                                            {smsResults.success && smsResults.data && (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    Sent: {smsResults.data.sent || 0} | Failed: {smsResults.data.failed || 0}
                                                    {smsResults.data.provider && (
                                                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                                                            via {smsResults.data.provider}
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Users Table */}
                            {filteredUsers.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        Name
                                                    </div>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        Email
                                                    </div>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        Phone
                                                    </div>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredUsers.map((user) => (
                                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                        {user.name || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                        {user.email || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                        {user.phone ? (
                                                            <span className="inline-flex items-center gap-1">
                                                                <Phone className="w-3 h-3 text-gray-400" />
                                                                {user.phone}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">Not provided</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                            user.role === 'admin' 
                                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                                                                : user.role === 'moderator'
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                                            {user.role || 'user'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {user.phone ? (
                                                            <button
                                                                onClick={() => sendTestSMS(user.phone, user.name)}
                                                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                                                                title="Send test SMS"
                                                            >
                                                                <Send className="w-3 h-3 inline" /> Test
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No phone</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                    <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-500 dark:text-gray-400">No users subscribed to this station.</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Users need to set this as their preferred station.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Predictions Section - Only today and future */}
                        {stationPredictions.length > 0 ? (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            Prediction History
                                        </h3>
                                        <span className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                            Today & Future
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {stationPredictions.length} records
                                        </span>
                                        {warningCount > 0 && (
                                            <span className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 font-medium">
                                                <AlertTriangle className="w-4 h-4" />
                                                {warningCount} warnings
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Date
                                                    </div>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3" />
                                                        Value
                                                    </div>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Horizon
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Updated
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {stationPredictions.map((pred, index) => (
                                                <tr key={pred._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                        {new Date(pred.predictionDate).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                        {isToday(pred.predictionDate) && (
                                                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                                                                Today
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                                                        {pred.predictionValue.toFixed(2)} m
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                        {pred.horizon || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3">
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
                                                    <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                                                        {new Date(pred.timestamp || pred.createdAt).toLocaleTimeString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="text-center py-8">
                                    <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No future predictions available for this station.</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">Run a prediction to see forecasts.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* <section className="flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[0_4px_18px_rgba(112,144,176,0.07)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#4318ff] to-[#7551ff] text-base font-bold text-white shadow-lg shadow-indigo-100">{(user?.name || 'A').charAt(0).toUpperCase()}</div>
                    <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#a3aed0]">Admin workspace</p><h1 className="mt-0.5 text-xl font-bold text-[#2b3674]">Welcome back, {user?.name || 'Admin'}</h1><p className="mt-0.5 text-sm text-[#707eae]">Your flood monitoring network is ready.</p></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden rounded-xl bg-[#f4f7fe] px-3 py-2 text-right sm:block"><p className="text-xs font-bold text-[#2b3674]">{user?.email || 'admin@floodguard.com'}</p><p className="text-[11px] font-medium text-[#a3aed0]">Administrator</p></div>
                    <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-[#f4f7fe] px-4 py-2.5 text-sm font-bold text-[#4318ff] transition hover:bg-[#4318ff] hover:text-white"><LogOut className="h-4 w-4" /> Logout</button>
                </div>
            </section> */}
            <div className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-[0_4px_18px_rgba(112,144,176,0.07)]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-[#2b3674] flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Monitoring Stations
                    </h2>
                    <span className="rounded-full bg-[#f4f7fe] px-3 py-1 text-xs font-bold text-[#4318ff]">{stations.length} stations</span>
                </div>
                
                <div 
                    className="grid"
                    style={{
                        gridTemplateColumns: '210px 195px 195px 1fr 1fr',
                        gridTemplateRows: '240px 420px',
                        gap: 0,
                    }}
                >
                    {station004 && (
                        <div className="col-start-2 col-end-5 row-start-1 row-end-2 w-full h-full p-0">
                            {renderStationCard(station004, "w-full h-full")}
                        </div>
                    )}

                    {station001 && (
                        <div className="col-start-1 col-end-2 row-start-2 row-end-3 w-full h-full p-0 ml-6">
                            {renderStationCard(station001, "w-full h-full")}
                        </div>
                    )}
                    {station002 && (
                        <div className="col-start-2 col-end-3 row-start-2 row-end-3 w-full h-full p-0">
                            {renderStationCard(station002, "w-full h-full")}
                        </div>
                    )}
                    {station003 && (
                        <div className="col-start-3 col-end-4 row-start-2 row-end-3 w-full h-full p-0">
                            {renderStationCard(station003, "w-full h-full")}
                        </div>
                    )}
                    
                    <div className="col-start-4 col-end-5 row-start-2 row-end-3 w-full h-full flex flex-col p-0">
                        {station005 && renderStationCard(station005, "w-full h-[205px]")}
                        {station006 && renderStationCard(station006, "w-full h-[195px]")}
                    </div>

                    {station007 && (
                        <div className="col-start-5 col-end-6 row-start-2 row-end-3 w-full h-full p-0">
                            {renderStationCard(station007, "w-[280px] h-[410px] flex-shrink-0", "m-0 p-0", "p-0")}
                        </div>
                    )}
                </div>

                {stations.filter(s => !["001","002","003","004","005","006","007"].includes(s.stationId)).length > 0 && (
                    <div className="flex flex-wrap mt-0 pt-0 border-t-0">
                        {stations
                            .filter(s => !["001","002","003","004","005","006","007"].includes(s.stationId))
                            .map(station => renderStationCard(station, "min-w-[130px] flex-1 max-w-[160px] h-[140px]"))}
                    </div>
                )}
            </div>

            {renderModal()}
        </div>
    );
};

export default AdminHomePage;