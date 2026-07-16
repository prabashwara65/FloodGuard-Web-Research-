// frontend/src/components/SendSMSModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Loader2,
  Check,
  XCircle,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Phone,
  Mail,
  User,
  Shield,
  Target,
  Hash,
  FileText,
  Clock,
  Droplets,
  Thermometer,
  Gauge,
  Compass,
} from 'lucide-react';
import api from '../api/axios';

const SendSMSModal = ({ 
  isOpen, 
  onClose, 
  station, 
  prediction, 
  allPredictions,
  users,
  onSuccess
}) => {
  const [customMessage, setCustomMessage] = useState('');
  const [sendingSMS, setSendingSMS] = useState(false);
  const [smsResults, setSmsResults] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(true);

  // Filter users for this station
  useEffect(() => {
    if (users && station) {
      const filtered = users.filter(user => {
        const hasPreferredStation = user.preferredStation === station?.stationName || 
                                   user.preferredStation === station?.stationId;
        const hasSubscription = user.subscriptions && user.subscriptions.some(sub => 
          sub.station === station?.stationName || 
          sub.station === station?.stationId
        );
        return (hasPreferredStation || hasSubscription) && user.phone;
      });
      setFilteredUsers(filtered);
      if (selectAll) {
        setSelectedUsers(filtered.map(u => u._id));
      }
    }
  }, [users, station, selectAll]);

  // Generate default message when data changes
  useEffect(() => {
    if (station && prediction) {
      generateDefaultMessage();
    }
  }, [station, prediction, selectedDate, allPredictions]);

  const generateDefaultMessage = () => {
    if (!station || !prediction) return;

    const stationName = station.stationName || station.stationId || 'Unknown';
    const threshold = station.threshold || prediction.threshold || 1.5;
    
    // Get warning status from multiple sources
    let isWarning = prediction.warning || false;
    
    // Also check if value exceeds threshold
    const value = prediction.predictionValue;
    if (value !== null && value !== undefined && value > threshold) {
      isWarning = true;
    }
    
    // Format the level
    let level = 'N/A';
    if (prediction.predictionValue !== null && prediction.predictionValue !== undefined) {
      level = prediction.predictionValue.toFixed(2);
    }
    
    const date = prediction.predictionDate 
      ? new Date(prediction.predictionDate).toLocaleDateString('si-LK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'N/A';
    const horizon = prediction.horizon || '72H';

    // Check if we have multiple predictions
    const hasMultiplePredictions = allPredictions && allPredictions.length > 1;
    const isAllDates = selectedDate === null && hasMultiplePredictions;
    
    let message = '';
    
    if (isAllDates) {
      // All dates message
      let forecastText = '';
      allPredictions.forEach((pred, index) => {
        const predDate = pred.date 
          ? new Date(pred.date).toLocaleDateString('si-LK', { month: 'short', day: 'numeric' })
          : `දින ${index + 1}`;
        const predLevel = pred.value !== null && pred.value !== undefined 
          ? pred.value.toFixed(2) 
          : 'N/A';
        const predWarning = pred.warning || false;
        const statusText = predWarning ? ' Anathurudayakai' : ' Samanyai';
        forecastText += `\n ${predDate}: ${predLevel}m (${statusText})`;
      });
      
      message = ` Anathuru Anawakiya 

Isthanaya: ${stationName}
Anathuru Seemawa: ${threshold}m
${isWarning ? 'Thathwaya: Anathurudayakai' : 'Thathwaya: Samanyai'}
${forecastText}

Karunakara Awadanayen Sitinna..
 FloodGuard AI`;
    } else {
      // Single date message
      const statusText = isWarning ? ' Thathwaya: Anathurudayakai' : ' Thathwaya: Samanyai';
      
      message = ` Ganwathura Anawakiya 

 Isthanaya: ${stationName}
 Dinaya: ${date}
 Jala Mattama: ${level} M
 Anathuru Seemawa: ${threshold} M
 Kaalasimawa: ${horizon}
${statusText}

Karunakara Awadanayen Sitinna..
🌊 FloodGuard AI`;
    }

    setCustomMessage(message);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  const sendSMS = async () => {
    if (!customMessage || customMessage.trim() === '') {
      alert('කරුණාකර පණිවිඩයක් ඇතුළත් කරන්න.');
      return;
    }

    const selectedUserObjects = filteredUsers.filter(u => selectedUsers.includes(u._id));
    if (selectedUserObjects.length === 0) {
      alert('කරුණාකර අවම වශයෙන් එක් පරිශීලකයෙකු තෝරන්න.');
      return;
    }

    if (!window.confirm(`📱 පහත පණිවිඩය ${selectedUserObjects.length} පරිශීලකයන්ට යවන්නද?\n\n${customMessage.substring(0, 100)}...`)) {
      return;
    }

    setSendingSMS(true);
    setSmsResults(null);

    try {
      const response = await api.post('/sms/custom', {
        station: station?.stationName || 'Unknown',
        message: customMessage,
        users: selectedUserObjects.map(u => ({
          id: u._id,
          name: u.name || 'User',
          phone: u.phone,
          email: u.email
        }))
      });

      if (response.data.success) {
        const responseData = response.data.data || response.data;
        const sentCount = responseData.sent || selectedUserObjects.length;
        const failedCount = responseData.failed || 0;

        setSmsResults({
          success: true,
          message: `✅ සිංහල SMS පණිවිඩ ${sentCount} පරිශීලකයන්ට යවන ලදී!`,
          data: {
            sent: sentCount,
            failed: failedCount,
            provider: responseData.provider || 'Notify.lk'
          }
        });

        if (onSuccess) {
          onSuccess({
            sent: sentCount,
            failed: failedCount,
            users: selectedUserObjects.length
          });
        }

        // Auto close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setSmsResults({
          success: false,
          error: response.data.error || response.data.message || 'SMS යැවීම අසාර්ථක විය'
        });
      }
    } catch (error) {
      console.error('❌ SMS sending error:', error);
      setSmsResults({
        success: false,
        error: error.response?.data?.error || error.message || 'SMS යැවීම අසාර්ථක විය'
      });
    } finally {
      setSendingSMS(false);
    }
  };

  if (!isOpen) return null;

  // Get all predictions for display with proper value mapping
  const getAllPredictions = () => {
    if (allPredictions && allPredictions.length > 0) {
      return allPredictions;
    }
    if (prediction) {
      return [prediction];
    }
    return [];
  };

  const predictionsList = getAllPredictions();
  const usersWithPhone = filteredUsers.filter(u => u.phone);

  // Helper to get prediction value
  const getPredictionValue = (pred) => {
    if (pred.value !== undefined && pred.value !== null) return pred.value;
    if (pred.predictionValue !== undefined && pred.predictionValue !== null) return pred.predictionValue;
    return null;
  };

  // Helper to get prediction warning
  const getPredictionWarning = (pred) => {
    if (pred.warning !== undefined) return pred.warning;
    if (pred.warning !== undefined) return pred.warning;
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Send SMS Alert
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {station?.stationName || 'Station'} - {predictionsList.length} prediction(s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Station & Prediction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Station Details */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-500" />
                Station Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Name</span>
                  <span className="font-medium text-gray-800 dark:text-white">{station?.stationName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">ID</span>
                  <span className="font-medium text-gray-800 dark:text-white">{station?.stationId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Threshold</span>
                  <span className="font-medium text-gray-800 dark:text-white">{station?.threshold || 1.5}m</span>
                </div>
                {station?.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Description</span>
                    <span className="font-medium text-gray-800 dark:text-white text-right max-w-[60%] truncate">
                      {station.description}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Prediction Details */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-500" />
                Prediction Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Horizon</span>
                  <span className="font-medium text-gray-800 dark:text-white">{prediction?.horizon || '72H'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Water Level</span>
                  <span className={`font-medium ${prediction?.warning ? 'text-red-600' : 'text-green-600'}`}>
                    {prediction?.predictionValue !== null && prediction?.predictionValue !== undefined 
                      ? `${prediction.predictionValue.toFixed(2)}m` 
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Risk Level</span>
                  <span className={`font-medium ${prediction?.warning ? 'text-red-600' : 'text-green-600'}`}>
                    {prediction?.warning ? '⚠️ Warning' : '✅ Normal'}
                  </span>
                </div>
                {prediction?.confidence && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Confidence</span>
                    <span className="font-medium text-gray-800 dark:text-white">{prediction.confidence}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Predictions List */}
          {predictionsList.length > 1 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                All Predictions ({predictionsList.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {predictionsList.map((pred, index) => {
                  const value = getPredictionValue(pred);
                  const warning = getPredictionWarning(pred) || (value !== null && value > (station?.threshold || 1.5));
                  
                  return (
                    <div key={index} className={`bg-white dark:bg-gray-800 rounded-lg p-2 border ${warning ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'}`}>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pred.date ? new Date(pred.date).toLocaleDateString() : 
                         pred.predictionDate ? new Date(pred.predictionDate).toLocaleDateString() : 
                         `Day ${index + 1}`}
                      </p>
                      <p className={`text-lg font-bold ${warning ? 'text-red-600' : 'text-green-600'}`}>
                        {value !== null ? `${value.toFixed(2)}m` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {warning ? '⚠️ Warning' : '✅ Normal'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message Editor */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Message (Sinhala)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={generateDefaultMessage}
                  className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  🔄 Reset
                </button>
              </div>
            </div>

            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ fontFamily: '"Iskoola Pota", "Noto Sans Sinhala", sans-serif' }}
              placeholder="Type your message here..."
            />
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>Characters: {customMessage.length}</span>
              <span>Sinhala chars: {customMessage.match(/[\u0D80-\u0DFF]/g)?.length || 0}</span>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => {
                  const stationName = station?.stationName || 'Unknown';
                  const level = prediction?.predictionValue !== null && prediction?.predictionValue !== undefined 
                    ? prediction.predictionValue.toFixed(2) 
                    : 'N/A';
                  setCustomMessage(`🚨 ගංවතුර අනතුරු ඇඟවීම! 🚨

📍 ${stationName}
🌊 ජල මට්ටම: ${level}m
⚠️ කරුණාකර ආරක්ෂිතව සිටින්න.

🌊 FloodGuard AI`);
                }}
                className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                🚨 Alert
              </button>
              <button
                onClick={() => {
                  const stationName = station?.stationName || 'Unknown';
                  const level = prediction?.predictionValue !== null && prediction?.predictionValue !== undefined 
                    ? prediction.predictionValue.toFixed(2) 
                    : 'N/A';
                  setCustomMessage(`📊 ගංවතුර අනාවැකිය 📊

📍 ${stationName}
🌊 ජල මට්ටම: ${level}m
✅ තත්වය: සාමාන්යයි

🌊 FloodGuard AI`);
                }}
                className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                📊 Forecast
              </button>
              <button
                onClick={() => {
                  const stationName = station?.stationName || 'Unknown';
                  const predictionsText = predictionsList.map((p, i) => {
                    const date = p.predictionDate ? new Date(p.predictionDate).toLocaleDateString() : `Day ${i+1}`;
                    const value = p.predictionValue !== null && p.predictionValue !== undefined 
                      ? p.predictionValue.toFixed(2) 
                      : 'N/A';
                    return `${date}: ${value}m`;
                  }).join('\n');
                  setCustomMessage(`📊 ගංවතුර අනාවැකි වාර්තාව 📊

📍 ${stationName}
${predictionsText}

🌊 FloodGuard AI`);
                }}
                className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                📊 All Dates
              </button>
            </div>
          </div>

          {/* Users Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Subscribed Users
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {usersWithPhone.length} with phone
                </span>
              </h3>
              <button
                onClick={toggleAllUsers}
                className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No users subscribed to this station.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={toggleAllUsers}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Phone</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => toggleUserSelection(user._id)}
                            className="rounded border-gray-300 dark:border-gray-600"
                            disabled={!user.phone}
                          />
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                          {user.name || 'N/A'}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                          {user.phone ? (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {user.phone}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">No phone</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                            {user.role || 'user'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SMS Results */}
          {smsResults && (
            <div className={`p-3 rounded-lg ${
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
                        <span className="ml-2 text-purple-600 dark:text-purple-400">
                          via {smsResults.data.provider}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={sendSMS}
              disabled={sendingSMS || !customMessage || selectedUsers.length === 0}
              className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                sendingSMS || !customMessage || selectedUsers.length === 0
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-600/25'
              }`}
            >
              {sendingSMS ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending to {selectedUsers.length} user(s)...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send SMS ({selectedUsers.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendSMSModal;