// backend/routes/weather.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get API key from environment variables
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';

// Check if API key is configured
if (!OPENWEATHER_API_KEY) {
    console.warn('⚠️ OPENWEATHER_API_KEY not found in .env file. Please add it.');
} else {
    console.log('✅ OpenWeather API key loaded from .env');
}

// GET weather data for a station (using 5-day forecast)
router.get('/rainfall/:station', async (req, res) => {
    try {
        const { station } = req.params;
        const days = parseInt(req.query.days) || 3;
        
        console.log(`🌤️ Fetching weather data for: ${station}, days: ${days}`);

        // Check if API key exists
        if (!OPENWEATHER_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'OpenWeather API key not configured. Please add OPENWEATHER_API_KEY to .env file.'
            });
        }

        // Step 1: Get coordinates for the station
        console.log(`📍 Geocoding: ${station},LK`);
        const geoResponse = await axios.get(`${OPENWEATHER_BASE}/weather`, {
            params: {
                q: `${station},LK`,
                appid: OPENWEATHER_API_KEY,
                units: 'metric'
            }
        });

        if (!geoResponse.data || !geoResponse.data.coord) {
            // Try without country code
            const geoResponse2 = await axios.get(`${OPENWEATHER_BASE}/weather`, {
                params: {
                    q: station,
                    appid: OPENWEATHER_API_KEY,
                    units: 'metric'
                }
            });
            
            if (!geoResponse2.data || !geoResponse2.data.coord) {
                throw new Error(`Station "${station}" not found`);
            }
            var locationData = geoResponse2.data;
        } else {
            var locationData = geoResponse.data;
        }

        const { lat, lon } = locationData.coord;
        const locationName = locationData.name || station;
        console.log(`📍 Found: ${locationName} at lat=${lat}, lon=${lon}`);

        // Step 2: Get the 5-day forecast (3-hour intervals)
        const forecastResponse = await axios.get(`${OPENWEATHER_BASE}/forecast`, {
            params: {
                lat: lat,
                lon: lon,
                appid: OPENWEATHER_API_KEY,
                units: 'metric',
                cnt: 40 // 40 entries = 5 days
            }
        });

        const forecastList = forecastResponse.data.list || [];
        
        // Step 3: Group forecast data by day
        const dailyData = {};
        forecastList.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyData[date]) {
                dailyData[date] = {
                    rainfall: 0,
                    temp_max: -Infinity,
                    temp_min: Infinity,
                    humidity: [],
                    weather: item.weather[0].description,
                    weatherIcon: item.weather[0].icon,
                    count: 0
                };
            }
            
            // Sum up rainfall for the day (rain in mm)
            const rain = item.rain ? (item.rain['3h'] || 0) : 0;
            dailyData[date].rainfall += rain;
            
            // Track temperatures
            dailyData[date].temp_max = Math.max(dailyData[date].temp_max, item.main.temp_max);
            dailyData[date].temp_min = Math.min(dailyData[date].temp_min, item.main.temp_min);
            dailyData[date].humidity.push(item.main.humidity);
            dailyData[date].count++;
        });

        // Step 4: Extract the last 'days' number of days
        const dates = Object.keys(dailyData).slice(-days);
        
        // If not enough days, use what we have
        if (dates.length === 0) {
            throw new Error('No forecast data available for this location');
        }

        const rainfallData = dates.map(date => 
            parseFloat((dailyData[date].rainfall || 0).toFixed(1))
        );
        const maxTemps = dates.map(date => 
            dailyData[date].temp_max !== -Infinity ? parseFloat(dailyData[date].temp_max.toFixed(1)) : null
        );
        const minTemps = dates.map(date => 
            dailyData[date].temp_min !== Infinity ? parseFloat(dailyData[date].temp_min.toFixed(1)) : null
        );
        const weatherConditions = dates.map(date => 
            dailyData[date].weather || 'Unknown'
        );
        const weatherIcons = dates.map(date => 
            dailyData[date].weatherIcon || ''
        );
        const avgHumidity = dates.map(date => {
            const hums = dailyData[date].humidity;
            return hums.length > 0 ? Math.round(hums.reduce((a, b) => a + b, 0) / hums.length) : null;
        });

        // Calculate statistics
        const total = rainfallData.reduce((a, b) => a + b, 0);
        const average = rainfallData.length > 0 ? parseFloat((total / rainfallData.length).toFixed(1)) : 0;
        const maxRainfall = rainfallData.length > 0 ? Math.max(...rainfallData) : 0;
        const minRainfall = rainfallData.length > 0 ? Math.min(...rainfallData) : 0;

        // Step 5: Get current weather for context
        let currentWeather = {};
        try {
            const currentResponse = await axios.get(`${OPENWEATHER_BASE}/weather`, {
                params: {
                    lat: lat,
                    lon: lon,
                    appid: OPENWEATHER_API_KEY,
                    units: 'metric'
                }
            });
            const current = currentResponse.data;
            currentWeather = {
                temperature: current.main.temp,
                feelsLike: current.main.feels_like,
                humidity: current.main.humidity,
                pressure: current.main.pressure,
                windSpeed: current.wind.speed,
                condition: current.weather[0].description,
                icon: current.weather[0].icon,
                clouds: current.clouds.all,
                visibility: current.visibility,
                sunrise: new Date(current.sys.sunrise * 1000).toLocaleTimeString(),
                sunset: new Date(current.sys.sunset * 1000).toLocaleTimeString()
            };
            console.log('✅ Current weather fetched');
        } catch (weatherError) {
            console.log('⚠️ Could not fetch current weather:', weatherError.message);
        }

        // Step 6: Prepare response
        const responseData = {
            station: locationName,
            country: locationData.sys?.country || 'Unknown',
            coordinates: { latitude: lat, longitude: lon },
            rainfallData: rainfallData,
            dates: dates,
            totalRainfall: parseFloat(total.toFixed(1)),
            averageRainfall: average,
            maxRainfall: maxRainfall,
            minRainfall: minRainfall,
            unit: 'mm',
            temperature: {
                max: maxTemps,
                min: minTemps
            },
            humidity: avgHumidity,
            weatherConditions: weatherConditions,
            weatherIcons: weatherIcons,
            currentWeather: currentWeather,
            fetchedAt: new Date().toISOString(),
            source: 'OpenWeather Forecast (REAL data)',
            isHistorical: false, // It's forecast, not historical
            dataQuality: 'OpenWeather forecast data',
            daysFetched: rainfallData.length,
            locationInfo: {
                name: locationName,
                country: locationData.sys?.country,
                timezone: forecastResponse.data.city?.timezone || 0
            }
        };

        console.log(`✅ Successfully fetched ${rainfallData.length} days of weather data from OpenWeather`);
        
        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('❌ OpenWeather Error:', error.message);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        
        // Determine the appropriate error message
        let errorMessage = 'Failed to fetch weather data';
        
        if (error.response?.status === 401) {
            errorMessage = 'Invalid OpenWeather API key. Please check your .env file.';
        } else if (error.response?.status === 404) {
            errorMessage = `Station "${req.params.station}" not found. Please check the station name.`;
        } else if (error.response?.status === 429) {
            errorMessage = 'OpenWeather rate limit exceeded. Please try again later.';
        } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            errorMessage = 'OpenWeather request timed out. Please try again.';
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
});

module.exports = router;