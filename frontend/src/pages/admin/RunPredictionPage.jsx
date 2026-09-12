// frontend/src/pages/admin/RunPredictionPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';
import SendSMSModal from '../../components/SendSMSModal';

// Icon components using different icon sets
const Icons = {
    Cloud: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
    ),
    Rain: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 16l-1 2m-6-2l-1 2m-6-2l-1 2M9 8l1 2m-4 0l1 2m0-4l1 2m8-6l-1 2m4 0l-1 2m0-4l-1 2" />
        </svg>
    ),
    Brain: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    Chart: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    Check: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Warning: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    Play: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Refresh: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    Database: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4zm0 5c0 2.21 3.582 4 8 4s8-1.79 8-4" />
        </svg>
    ),
    ArrowRight: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    ),
    Send: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
    ),
};

const STATIONS = [
    { value: 'Norwood', label: 'Norwood' },
    { value: 'Kithulgala', label: 'Kithulgala' },
    { value: 'Deraniyagala', label: 'Deraniyagala' },
    { value: 'Holombuwa', label: 'Holombuwa' },
    { value: 'Glencourse', label: 'Glencourse' },
    { value: 'Hanwella', label: 'Hanwella' },
    { value: 'Nagalagam Street', label: "Nagalagam Street" },
];

const RunPredictionPage = ({ 
    forecastForm, 
    setForecastForm, 
    forecastResult, 
    forecastError, 
    forecastLoading, 
    handleForecastSubmit,
    users = []
}) => {
    const [logs, setLogs] = useState([]);
    const [isLogsVisible, setIsLogsVisible] = useState(true);
    const [expandedLogs, setExpandedLogs] = useState({});
    const logsContainerRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // State for rainfall data
    const [rainfallData, setRainfallData] = useState(null);
    const [isRainfallLoading, setIsRainfallLoading] = useState(false);
    const [rainfallError, setRainfallError] = useState('');
    const [hasRainfallData, setHasRainfallData] = useState(false);

    // SMS Modal states
    const [smsModalOpen, setSmsModalOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [allPredictions, setAllPredictions] = useState([]);
    const [smsDateIndex, setSmsDateIndex] = useState(null);

    // Auto-scroll logs to bottom when new logs are added
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // Watch for forecastResult changes to log real data
    useEffect(() => {
        if (forecastResult && isProcessing) {
            addLog('📈 Processing prediction results...', 'info');
            
            if (forecastResult.rainfallData && forecastResult.rainfallData.length > 0) {
                const rainfallDetails = {};
                forecastResult.rainfallData.forEach((rainfall, index) => {
                    const day = new Date();
                    day.setDate(day.getDate() - (forecastResult.rainfallData.length - index));
                    rainfallDetails[`Day ${index + 1} (${day.toLocaleDateString()})`] = `${rainfall}mm`;
                });
                rainfallDetails['Total'] = `${forecastResult.totalRainfall || forecastResult.rainfallData.reduce((a, b) => a + b, 0).toFixed(1)}mm`;
                rainfallDetails['Average'] = `${forecastResult.averageRainfall || (forecastResult.rainfallData.reduce((a, b) => a + b, 0) / forecastResult.rainfallData.length).toFixed(1)}mm`;
                
                addLog('📊 Rainfall Data Used:', 'data', rainfallDetails);
            }
            
            const riskLevel = forecastResult.riskLevel || (forecastResult.warning ? 'high' : 'low');
            const riskDisplay = riskLevel.toUpperCase();
            
            addLog(`⚠️ Flood Risk Level: ${riskDisplay}`, 
                riskLevel === 'critical' || riskLevel === 'high' ? 'error' : 
                riskLevel === 'moderate' ? 'warning' : 'success');
            
            if (forecastResult.confidence) {
                addLog(`📊 Model Confidence: ${forecastResult.confidence}%`, 'info');
            }
            
            if (forecastResult.predictions && forecastResult.predictions.length > 0) {
                const predictionDetails = {};
                forecastResult.predictions.forEach((pred, index) => {
                    const date = forecastResult.dates?.[index] || `Day ${index + 1}`;
                    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                    });
                    predictionDetails[formattedDate] = `${pred.toFixed(2)}m`;
                });
                predictionDetails['Threshold'] = `${forecastForm.threshold}m`;
                predictionDetails['Status'] = forecastResult.warning ? '⚠️ WARNING' : '✅ NORMAL';
                
                addLog('📋 Prediction Results:', 'data', predictionDetails);
            }
            
            const recommendations = getRealRecommendations(riskLevel);
            addLog('💡 Recommendations:', 'info', {
                'Actions': recommendations.join(' • ')
            });
            
            addLog('✅ Prediction completed successfully', 'success');
            setIsProcessing(false);
        }
    }, [forecastResult]);

    // Watch for errors
    useEffect(() => {
        if (forecastError) {
            addLog(`❌ API Error: ${forecastError}`, 'error');
            addLog('💡 Check your backend connection and try again', 'warning');
            setIsProcessing(false);
        }
    }, [forecastError]);

    // Add a log entry with timestamp
    const addLog = (message, type = 'info', details = null) => {
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        setLogs(prev => [...prev, {
            id: Date.now() + Math.random(),
            timestamp,
            message,
            type,
            details,
            expanded: false
        }]);
    };

    // Toggle log expansion
    const toggleLogExpansion = (logId) => {
        setExpandedLogs(prev => ({
            ...prev,
            [logId]: !prev[logId]
        }));
    };

    // Get log icon based on type
    const getLogIcon = (type) => {
        switch(type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'data': return '📊';
            default: return 'ℹ️';
        }
    };

    // Get log color based on type
    const getLogColor = (type) => {
        switch(type) {
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'warning': return 'text-yellow-600';
            case 'data': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    // Get border color based on type
    const getLogBorderColor = (type) => {
        switch(type) {
            case 'success': return 'border-green-300';
            case 'error': return 'border-red-300';
            case 'warning': return 'border-yellow-300';
            case 'data': return 'border-blue-300';
            default: return 'border-gray-300';
        }
    };

    // Real recommendations based on actual risk level
    const getRealRecommendations = (riskLevel) => {
        switch(riskLevel?.toLowerCase()) {
            case 'critical':
                return [
                    'Issue evacuation orders immediately',
                    'Activate emergency response teams',
                    'Monitor water levels every 30 minutes',
                    'Alert local authorities and communities'
                ];
            case 'high':
                return [
                    'Alert local authorities immediately',
                    'Prepare sandbags and flood barriers',
                    'Monitor weather updates continuously',
                    'Prepare evacuation routes'
                ];
            case 'moderate':
                return [
                    'Monitor water levels regularly',
                    'Check drainage systems for blockages',
                    'Stay informed via weather alerts',
                    'Prepare emergency supplies'
                ];
            default:
                return [
                    'Continue routine monitoring',
                    'Maintain standard preparedness',
                    'Update weather data periodically',
                    'Review emergency protocols'
                ];
        }
    };

    // Fetch rainfall data
    const handleFetchRainfall = async () => {
        setRainfallError('');
        setIsRainfallLoading(true);
        setRainfallData(null);
        setHasRainfallData(false);
        
        const stationValue = forecastForm.station;
        const stationLabel = STATIONS.find(s => s.value === stationValue)?.label || stationValue;
        
        addLog('Fetching weather data from OpenWeather API...', 'info');
        addLog(`Station: ${stationLabel}`, 'info');
        
        try {
            const response = await api.get(`/weather/rainfall/${stationValue}?days=3`);
            
            if (response.data.success) {
                const data = response.data.data;
                setRainfallData(data);
                setHasRainfallData(true);
                
                const rainfallDetails = {};
                data.rainfallData.forEach((rainfall, index) => {
                    const day = new Date();
                    day.setDate(day.getDate() - (data.rainfallData.length - index));
                    rainfallDetails[`Day ${index + 1} (${day.toLocaleDateString()})`] = `${rainfall}mm`;
                });
                rainfallDetails['Total'] = `${data.totalRainfall}mm`;
                rainfallDetails['Average'] = `${data.averageRainfall}mm`;
                rainfallDetails['Source'] = data.source || 'OpenWeather API';
                rainfallDetails['Station'] = stationLabel;
                
                addLog('Rainfall data retrieved successfully.', 'success');
                addLog('Past 3 days rainfall data:', 'data', rainfallDetails);
                addLog('Click "Run Prediction" to generate the forecast.', 'info');
            }
        } catch (error) {
            console.error('Rainfall fetch error:', error);
            setRainfallError(error.response?.data?.error || 'Failed to fetch rainfall data');
            addLog(`Error fetching rainfall: ${error.response?.data?.error || 'Unknown error'}`, 'error');
            addLog('Check your OpenWeather API key and try again.', 'warning');
        } finally {
            setIsRainfallLoading(false);
        }
    };

    // Modified submit handler with real-time logs
    const handleSubmitWithLogs = async (event) => {
        event.preventDefault();
        
        if (!hasRainfallData) {
            addLog('Please fetch rainfall data before running the forecast.', 'warning');
            return;
        }
        
        setLogs(prev => prev.filter(log => 
            log.message.includes('Rainfall') || 
            log.message.includes('weather') || 
            log.message.includes('Station')
        ));
        setIsProcessing(true);
        
        try {
            const stationLabel = STATIONS.find(s => s.value === forecastForm.station)?.label || forecastForm.station;
            
            addLog('Starting prediction process...', 'info');
            addLog(`Station: ${stationLabel}`, 'info');
            addLog(`Using rainfall data: ${rainfallData.rainfallData.join(', ')}mm`, 'info');
            addLog(`Threshold: ${forecastForm.threshold}m`, 'info');
            addLog(`Horizon: ${forecastForm.horizon}`, 'info');
            
            addLog('Connecting to ML prediction model...', 'info');
            await sleep(500);
            addLog('Model connection established.', 'success');
            
            addLog('Preprocessing data for model...', 'info');
            await sleep(400);
            addLog('Data prepared for prediction.', 'success');
            
            addLog('Running prediction...', 'info');
            await handleForecastSubmit(event);
            addLog('Processing model results...', 'info');
            
        } catch (error) {
            addLog(`Error: ${error.message || 'Failed to generate prediction'}`, 'error');
            addLog('Check your backend server and try again.', 'warning');
            setIsProcessing(false);
        }
    };

    // Get prediction data for display - FIXED
    const getPredictionData = () => {
        if (!forecastResult) return [];
        
        // Log the raw data to see what we're working with
        console.log('📊 Raw Forecast Result:', forecastResult);
        
        const dates = forecastResult.dates || [];
        const predictions = forecastResult.predictions || [];
        const warnings = forecastResult.warnings || [];
        
        console.log('📊 Raw Data:', { dates, predictions, warnings });
        
        // If we have predictions but no dates, generate dates
        if (predictions.length > 0) {
            const today = new Date();
            const result = predictions.map((value, index) => {
                let date;
                if (dates[index]) {
                    date = dates[index];
                } else {
                    const d = new Date(today);
                    d.setDate(d.getDate() + index);
                    date = d.toISOString().split('T')[0];
                }
                
                // Get warning status - check multiple possible locations
                let warning = false;
                if (warnings && warnings[index]) {
                    warning = warnings[index].warning || warnings[index] === true;
                }
                
                // Also check if value exceeds threshold
                const threshold = forecastResult.threshold || 1.5;
                if (value !== null && value !== undefined && value > threshold) {
                    warning = true;
                }
                
                return {
                    date: date,
                    formattedDate: new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    value: value !== null && value !== undefined ? value : null,
                    warning: warning
                };
            });
            
            console.log('📊 Processed Predictions:', result);
            return result;
        }
        
        return [];
    };

    // Open SMS Modal
    const openSMSModal = (dateIndex = null) => {
        if (!forecastResult) return;
        
        // Get prediction data with proper mapping
        const predictionsData = getPredictionData();
        
        if (predictionsData.length === 0) {
            addLog('⚠️ No prediction data available to send SMS', 'warning');
            return;
        }
        
        // Build station data from forecastResult
        const stationData = {
            stationName: forecastResult.station || 'Unknown',
            stationId: forecastResult.stationId || forecastResult.stationCode || 'N/A',
            threshold: forecastResult.threshold || 1.5,
            description: forecastResult.description || 'No description available'
        };
        
        // If dateIndex is null, use the first prediction for the summary
        const index = dateIndex !== null ? dateIndex : 0;
        const selectedPred = predictionsData[index] || predictionsData[0];
        
        // Get warning status - check multiple sources
        let warningStatus = selectedPred?.warning || false;
        
        // Also check if value exceeds threshold
        if (selectedPred?.value !== null && selectedPred?.value !== undefined) {
            const threshold = forecastResult.threshold || 1.5;
            if (selectedPred.value > threshold) {
                warningStatus = true;
            }
        }
        
        // Build prediction data with proper values
        const predictionData = {
            predictionValue: selectedPred?.value !== null && selectedPred?.value !== undefined ? selectedPred.value : null,
            predictionDate: selectedPred?.date || null,
            warning: warningStatus,
            horizon: forecastResult.horizon || forecastForm.horizon || '72H',
            confidence: forecastResult.confidence || 0,
            threshold: forecastResult.threshold || 1.5,
            station: forecastResult.station || 'Unknown'
        };
        
        console.log('📊 SMS Modal Data:', {
            station: stationData,
            prediction: predictionData,
            allPredictions: predictionsData,
            dateIndex: dateIndex
        });
        
        setSelectedStation(stationData);
        setSelectedPrediction(predictionData);
        setAllPredictions(predictionsData);
        setSmsDateIndex(dateIndex);
        setSmsModalOpen(true);
    };

    // Close SMS Modal
    const closeSMSModal = () => {
        setSmsModalOpen(false);
        setSelectedStation(null);
        setSelectedPrediction(null);
        setAllPredictions([]);
        setSmsDateIndex(null);
    };

    // Handle SMS Success
    const handleSMSSuccess = (result) => {
        addLog(`✅ SMS sent successfully to ${result.sent} users`, 'success');
        if (result.failed > 0) {
            addLog(`⚠️ ${result.failed} users failed to receive SMS`, 'warning');
        }
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-500">Forecast</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-800">Run Prediction</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Fetch rainfall data and generate a flood outlook for the selected station.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
                        <span className={`h-2.5 w-2.5 rounded-full ${forecastLoading || isProcessing ? 'bg-amber-400' : hasRainfallData ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {forecastLoading || isProcessing ? 'Processing' : hasRainfallData ? 'Data ready' : 'Awaiting data'}
                    </div>
                </div>

                <form onSubmit={handleSubmitWithLogs} className="mt-6">
                    <div className="grid gap-3 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto_auto]">
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Station
                            </label>
                            <select
                                value={forecastForm.station}
                                onChange={(event) => {
                                    setForecastForm({ ...forecastForm, station: event.target.value });
                                    setHasRainfallData(false);
                                    setRainfallData(null);
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                required
                                disabled={forecastLoading || isProcessing || isRainfallLoading}
                            >
                                {STATIONS.map((station) => (
                                    <option key={station.value} value={station.value}>
                                        {station.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Horizon
                            </label>
                            <select
                                value={forecastForm.horizon}
                                onChange={(event) => setForecastForm({ ...forecastForm, horizon: event.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                disabled={forecastLoading || isProcessing}
                            >
                                <option value="24H">24 Hours</option>
                                <option value="48H">48 Hours</option>
                                <option value="72H">72 Hours</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Threshold
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={forecastForm.threshold}
                                onChange={(event) => setForecastForm({ ...forecastForm, threshold: event.target.value })}
                                placeholder="Threshold (m)"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                disabled={forecastLoading || isProcessing}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleFetchRainfall}
                            disabled={isRainfallLoading || forecastLoading || isProcessing}
                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                isRainfallLoading ? 'bg-slate-400 text-white' :
                                hasRainfallData ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
                                'bg-blue-500 text-white hover:bg-blue-600'
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                            {isRainfallLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading
                                </span>
                            ) : hasRainfallData ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Icons.Check />
                                    Data Loaded
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Icons.Cloud />
                                    Get Rainfall
                                </span>
                            )}
                        </button>

                        <button
                            type="submit"
                            disabled={!hasRainfallData || forecastLoading || isProcessing || isRainfallLoading}
                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                !hasRainfallData || forecastLoading || isProcessing
                                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                    : 'bg-violet-500 text-white hover:bg-violet-600 shadow-[0_10px_20px_rgba(139,92,246,0.25)]'
                            }`}
                        >
                            {forecastLoading || isProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Icons.Play />
                                    Run Prediction
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <Icons.ArrowRight />
                    <span>Step 1: Fetch rainfall</span>
                    <span className="text-slate-300">→</span>
                    <span>Step 2: Run forecast</span>
                </div>

                {forecastError && <p className="mt-3 text-sm font-medium text-red-600">{forecastError}</p>}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-[0_12px_30px_rgba(59,130,246,0.08)]">
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">Rainfall data</h3>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${isRainfallLoading ? 'text-amber-600' : hasRainfallData ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {isRainfallLoading ? 'Loading' : hasRainfallData ? 'Fetched' : 'Not fetched'}
                            </span>
                            <button
                                onClick={handleFetchRainfall}
                                disabled={isRainfallLoading || forecastLoading || isProcessing}
                                className="rounded-full border border-blue-200 bg-white p-2 text-blue-600 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                                aria-label="Refresh rainfall data"
                            >
                                <Icons.Refresh />
                            </button>
                        </div>
                    </div>

                    {rainfallData && hasRainfallData ? (
                        <div>
                            <div className="grid gap-4 md:grid-cols-3">
                                {rainfallData.rainfallData.map((rainfall, index) => {
                                    const day = new Date();
                                    day.setDate(day.getDate() - (rainfallData.rainfallData.length - index));
                                    return (
                                        <div key={index} className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                                                {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="mt-3 text-3xl font-bold text-blue-700">{rainfall}mm</p>
                                            <p className="mt-1 text-xs text-slate-400">Precipitation</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3 rounded-2xl border border-blue-100 bg-white/80 p-3 text-sm text-slate-600">
                                <span>Total: <strong>{rainfallData.totalRainfall}mm</strong></span>
                                <span>Average: <strong>{rainfallData.averageRainfall}mm</strong></span>
                                <span>Station: <strong>{rainfallData.station || STATIONS.find(s => s.value === forecastForm.station)?.label || forecastForm.station}</strong></span>
                                <span>Fetched: <strong>{new Date(rainfallData.fetchedAt).toLocaleTimeString()}</strong></span>
                            </div>

                            {rainfallError && <p className="mt-3 text-sm text-red-600">{rainfallError}</p>}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-blue-200 bg-white/70 py-10 text-center">
                            <div className="mb-3 flex justify-center">
                                <div className="rounded-full bg-blue-100 p-4 text-blue-600">
                                    <Icons.Cloud />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-500">No rainfall data available yet.</p>
                            <p className="mt-1 text-xs text-slate-400">Click “Get Rainfall” to retrieve the latest weather values.</p>
                        </div>
                    )}
                </div>

                <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 shadow-[0_12px_30px_rgba(139,92,246,0.08)]">
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">Status overview</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${forecastResult ? (forecastResult.warning ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700') : 'bg-slate-100 text-slate-500'}`}>
                            {forecastResult ? (forecastResult.warning ? 'Warning' : 'Normal') : 'Pending'}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-2xl bg-white p-4 border border-violet-100">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Station</p>
                            <p className="mt-2 text-lg font-bold text-slate-800">
                                {STATIONS.find(s => s.value === forecastForm.station)?.label || forecastForm.station}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 border border-violet-100">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Threshold</p>
                            <p className="mt-2 text-lg font-bold text-slate-800">{Number(forecastResult?.threshold || forecastForm.threshold || 1.5).toFixed(1)}m</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 border border-violet-100">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Horizon</p>
                            <p className="mt-2 text-lg font-bold text-slate-800">{forecastForm.horizon}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                            <Icons.Chart />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Prediction results</h3>
                            <p className="text-sm text-slate-500">Latest forecast values for the selected station.</p>
                        </div>
                    </div>
                    <span className={`text-xs font-semibold ${forecastLoading || isProcessing ? 'text-amber-600' : forecastResult ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {forecastLoading || isProcessing ? 'Processing' : forecastResult ? 'Completed' : 'Pending'}
                    </span>
                </div>

                {forecastResult ? (
                    <div>
                        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Risk Level</p>
                                <p className={`text-2xl font-bold ${forecastResult.warning ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {forecastResult.riskLevel?.toUpperCase() || (forecastResult.warning ? 'HIGH' : 'LOW')}
                                </p>
                            </div>
                            <div className="text-sm text-slate-500">
                                Threshold: <strong className="text-slate-700">{Number(forecastResult.threshold || 1.5).toFixed(1)}m</strong>
                                <span className="mx-2 text-slate-300">|</span>
                                Confidence: <strong className="text-slate-700">{forecastResult.confidence || 0}%</strong>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {getPredictionData().map((pred, index) => (
                                <div key={index} className={`rounded-2xl border p-4 ${pred.warning ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        {pred.formattedDate || 'Date N/A'}
                                    </p>
                                    <p className="mt-3 text-3xl font-bold text-slate-800">
                                        {pred.value !== null && pred.value !== undefined ? `${pred.value.toFixed(2)}m` : 'N/A'}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className={`text-xs font-semibold ${pred.warning ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {pred.warning ? 'Warning' : 'Normal'}
                                        </span>
                                        <button
                                            onClick={() => openSMSModal(index)}
                                            className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-600"
                                        >
                                            Send SMS
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex justify-center">
                            <button
                                onClick={() => openSMSModal(null)}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(99,102,241,0.25)] transition hover:shadow-[0_14px_24px_rgba(99,102,241,0.35)]"
                            >
                                <Icons.Send className="w-4 h-4" />
                                Send SMS for all dates
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                        <div className="mb-3 flex justify-center">
                            <div className="rounded-full bg-violet-100 p-4 text-violet-600">
                                <Icons.Brain />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500">No prediction results yet.</p>
                        <p className="mt-1 text-xs text-slate-400">Fetch rainfall data first, then run the forecast.</p>
                    </div>
                )}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                            <Icons.Database />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Process log</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsLogsVisible(!isLogsVisible)} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                            {isLogsVisible ? 'Hide' : 'Show'}
                        </button>
                        {logs.length > 0 && (
                            <button onClick={() => setLogs([])} className="text-xs font-medium text-red-600 hover:text-red-700">
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {isLogsVisible && (
                    <div ref={logsContainerRef} className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3" style={{ scrollBehavior: 'smooth' }}>
                        {logs.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-400">No log entries yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {logs.map((log) => (
                                    <div key={log.id} className={`rounded-xl border-l-4 bg-white p-3 ${getLogBorderColor(log.type)} shadow-sm`}>
                                        <div className="flex items-start gap-3">
                                            <span className="text-sm">{getLogIcon(log.type)}</span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className={`text-xs font-medium ${getLogColor(log.type)}`}>{log.message}</span>
                                                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                                                </div>

                                                {log.details && typeof log.details === 'object' && (
                                                    <div className="mt-2">
                                                        <button onClick={() => toggleLogExpansion(log.id)} className="text-[10px] font-medium text-blue-600 hover:text-blue-700">
                                                            {expandedLogs[log.id] ? 'Hide details' : 'Show details'}
                                                        </button>
                                                        {expandedLogs[log.id] && (
                                                            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-[10px] text-slate-600">
                                                                {Object.entries(log.details).map(([key, value]) => (
                                                                    <div key={key} className="flex justify-between gap-3 border-b border-slate-100 py-1 last:border-b-0">
                                                                        <span>{key}</span>
                                                                        <span className="font-medium text-slate-800">{Array.isArray(value) ? value.join(' • ') : String(value)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {logs.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] font-medium text-slate-500">
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{logs.filter(l => l.type === 'success').length} Success</span>
                        <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">{logs.filter(l => l.type === 'warning').length} Warnings</span>
                        <span className="rounded-full bg-red-50 px-2 py-1 text-red-700">{logs.filter(l => l.type === 'error').length} Errors</span>
                        <span className="ml-auto text-slate-400">Last updated: {logs[logs.length - 1]?.timestamp}</span>
                    </div>
                )}
            </div>

            <SendSMSModal
                isOpen={smsModalOpen}
                onClose={closeSMSModal}
                station={selectedStation}
                prediction={selectedPrediction}
                allPredictions={allPredictions}
                users={users}
                onSuccess={handleSMSSuccess}
            />
        </div>
    );
};

export default RunPredictionPage;