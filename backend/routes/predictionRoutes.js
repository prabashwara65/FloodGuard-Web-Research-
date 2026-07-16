const express = require('express');
const path = require('path');
const https = require('https');
const { execFile } = require('child_process');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Prediction = require('../models/Prediction');
const Station = require('../models/Station');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '4bb3d2c28268126912fc88315724a7ca';
const STATION_COORDINATES = {
    Hanwella: { lat: 6.9, lon: 80.1 },
    Norwood: { lat: 6.8, lon: 80.2 },
    Kithulgala: { lat: 6.98, lon: 80.4 },
    Deraniuagala: { lat: 6.7, lon: 80.3 },
    Holombuwa: { lat: 6.6, lon: 80.3 },
    Glencourse: { lat: 6.7, lon: 80.2 },
    "N'Street": { lat: 6.8, lon: 80.2 },
};

const normalizeStationName = (value) => String(value || '').trim();

const getStationCoordinates = async (stationInput) => {
    const stationName = normalizeStationName(stationInput);
    if (!stationName) {
        return null;
    }

    const stationDoc = await Station.findOne({
        $or: [
            { stationName: stationName },
            { stationId: stationName },
            { stationName: new RegExp(`^${stationName}$`, 'i') },
            { stationId: new RegExp(`^${stationName}$`, 'i') }
        ]
    }).lean();

    if (stationDoc?.latitude != null && stationDoc?.longitude != null) {
        return { lat: Number(stationDoc.latitude), lon: Number(stationDoc.longitude) };
    }

    const fallback = STATION_COORDINATES[stationName] || STATION_COORDINATES[stationName.replace(/\s+/g, '')];
    if (fallback) {
        return fallback;
    }

    const aliasMatch = Object.entries(STATION_COORDINATES).find(([name]) => name.toLowerCase() === stationName.toLowerCase());
    return aliasMatch ? aliasMatch[1] : null;
};

const fetchHistoricalRainfall = async (stationInput) => {
    const coordinates = await getStationCoordinates(stationInput);
    if (!coordinates) {
        return [];
    }

    const now = Math.floor(Date.now() / 1000);
    const start = now - (3 * 24 * 60 * 60);
    const end = now;
    const url = `https://history.openweathermap.org/data/2.5/history/city?lat=${coordinates.lat}&lon=${coordinates.lon}&type=hour&start=${start}&end=${end}&appid=${OPENWEATHER_API_KEY}`;

    return new Promise((resolve) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const hourlyItems = Array.isArray(parsed.list) ? parsed.list : [];
                    const totalsByDay = new Map();

                    hourlyItems.forEach((item) => {
                        const timestamp = item.dt || item.time || 0;
                        if (!timestamp) {
                            return;
                        }
                        const date = new Date(timestamp * 1000);
                        const dayKey = date.toISOString().split('T')[0];
                        const rainAmount = item.rain?.['1h'] || item.rain?.['3h'] || item.rain || 0;
                        const currentValue = Number(rainAmount) || 0;
                        totalsByDay.set(dayKey, (totalsByDay.get(dayKey) || 0) + currentValue);
                    });

                    const values = Array.from(totalsByDay.entries())
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([, total]) => Number(total.toFixed(2)));

                    resolve(values.slice(-3));
                } catch (error) {
                    console.error('OpenWeather rainfall parsing error:', error);
                    resolve([]);
                }
            });
        }).on('error', (error) => {
            console.error('OpenWeather rainfall fetch error:', error);
            resolve([]);
        });
    });
};

// ===== ADD THIS: GET all predictions =====
router.get('/', protect, async (req, res) => {
    try {
        // Get all predictions, sorted by predictionDate (newest first)
        const predictions = await Prediction.find()
            .sort({ predictionDate: -1, createdAt: -1 })
            .limit(100); // Limit to 100 most recent predictions
        
        res.json({
            success: true,
            predictions: predictions
        });
    } catch (error) {
        console.error('Error fetching predictions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== ADD THIS: GET predictions for a specific station =====
router.get('/station/:stationCode', protect, async (req, res) => {
    try {
        const { stationCode } = req.params;
        const predictions = await Prediction.find({ stationCode })
            .sort({ predictionDate: -1 })
            .limit(50);
        
        res.json({
            success: true,
            predictions: predictions
        });
    } catch (error) {
        console.error('Error fetching station predictions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get latest predictions (for dashboard)
router.get('/latest', protect, async (req, res) => {
    try {
        // Get the most recent prediction for each station
        const latestPredictions = await Prediction.aggregate([
            {
                $sort: { predictionDate: -1 }
            },
            {
                $group: {
                    _id: '$stationCode',
                    prediction: { $first: '$$ROOT' }
                }
            },
            {
                $replaceRoot: { newRoot: '$prediction' }
            }
        ]);
        
        res.json({
            success: true,
            predictions: latestPredictions
        });
    } catch (error) {
        console.error('Error fetching latest predictions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate forecast (existing POST endpoint)
router.post('/forecast', protect, async (req, res) => {
    try {
        const { station, days, rainfall, threshold } = req.body;
        const resolvedStation = normalizeStationName(station || req.user?.preferredStation);

        if (!resolvedStation) {
            return res.status(400).json({ success: false, error: 'Station is required' });
        }

        const daysNum = Number(days) || 3;
        const requestedRainfall = Array.isArray(rainfall)
            ? rainfall.filter((value) => Number.isFinite(Number(value)))
            : [];
        const rainfallValues = requestedRainfall.length > 0
            ? requestedRainfall
            : await fetchHistoricalRainfall(resolvedStation);

        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        const scriptPath = path.resolve(__dirname, '..', 'predict_cli.py');
        const backendDir = path.resolve(__dirname, '..');
        const args = [scriptPath, String(resolvedStation), String(daysNum)];

        if (Number.isFinite(Number(threshold))) {
            args.push(String(Number(threshold)));
        }

        if (rainfallValues.length > 0) {
            args.push(rainfallValues.join(','));
        }

        execFile(pythonCommand, args, { cwd: backendDir }, async (error, stdout, stderr) => {
            if (error) {
                const message = error.message || 'Forecast execution failed';
                const lowerMessage = message.toLowerCase();
                const missingDependency = lowerMessage.includes('modulenotfounderror') || lowerMessage.includes('no module named');
                const missingModel = lowerMessage.includes('no such file') || lowerMessage.includes('failed to load') || lowerMessage.includes('file not found');

                console.error('Forecast execution error:', message);

                if (missingDependency) {
                    return res.status(500).json({
                        success: false,
                        error: 'Python dependencies are missing. Install pandas, numpy, joblib, and tensorflow in the Python environment used by the backend.',
                        details: message
                    });
                }

                if (missingModel) {
                    return res.status(500).json({
                        success: false,
                        error: 'The trained prediction model files are not present in the backend folder.',
                        details: message
                    });
                }

                return res.status(500).json({ success: false, error: message, stderr });
            }

            try {
                const result = JSON.parse(stdout);

                if (result.error) {
                    const isInputError = /station|available|not found|usage/i.test(result.error);
                    const statusCode = isInputError ? 400 : 500;
                    const payload = {
                        success: false,
                        error: result.error
                    };

                    if (result.fallback) {
                        payload.fallback = true;
                        payload.station = result.station;
                        payload.days = result.days;
                        payload.rainfall = result.rainfall;
                    }

                    return res.status(statusCode).json(payload);
                }

                try {
                    const stationDoc = await Station.findOne({
                        $or: [
                            { stationName: resolvedStation },
                            { stationId: resolvedStation }
                        ]
                    });

                    const horizon = daysNum === 1 ? '24H' : daysNum === 2 ? '48H' : '72H';
                    const predictionEntries = (result.dates || []).map((date, index) => ({
                        stationName: stationDoc?.stationName || resolvedStation,
                        stationCode: stationDoc?.stationId || resolvedStation,
                        horizon,
                        predictionDate: new Date(date),
                        predictionValue: Number(result.predictions?.[index]),
                        warning: Boolean(result.warnings?.[index]?.warning || false),
                        threshold: Number(result.threshold || threshold),
                        status: result.warnings?.[index]?.status || 'normal',
                        timestamp: new Date()
                    }));

                    let savedCount = 0;
                    if (predictionEntries.length > 0) {
                        const saved = await Prediction.insertMany(predictionEntries);
                        savedCount = saved.length;
                    }

                    return res.json({ 
                        success: true, 
                        forecast: result, 
                        saved: savedCount 
                    });
                } catch (dbError) {
                    console.error('Forecast DB save error:', dbError);
                    return res.json({ 
                        success: true, 
                        forecast: result, 
                        saved: 0, 
                        warning: 'Forecast generated but could not be stored in the database.' 
                    });
                }
            } catch (parseError) {
                console.error('Forecast parse error:', parseError);
                return res.status(500).json({ success: false, error: 'Invalid response from forecast script', raw: stdout });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;