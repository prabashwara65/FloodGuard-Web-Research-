const axios = require('axios');

class WeatherService {
    constructor() {
        this.apiKey = process.env.OPENWEATHER_API_KEY;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.geoUrl = 'https://api.openweathermap.org/geo/1.0';
    }

    // Get coordinates for a station name
    async getCoordinates(stationName) {
        try {
            const response = await axios.get(`${this.geoUrl}/direct`, {
                params: {
                    q: `${stationName},LK`,
                    limit: 1,
                    appid: this.apiKey
                }
            });

            if (response.data.length === 0) {
                throw new Error(`Station "${stationName}" not found`);
            }

            return {
                lat: response.data[0].lat,
                lon: response.data[0].lon,
                name: response.data[0].name
            };
        } catch (error) {
            console.error('Geocoding error:', error.message);
            throw error;
        }
    }

    // Get rainfall data for past N days
    async getHistoricalRainfall(stationName, days = 3) {
        try {
            // Get coordinates
            const coords = await this.getCoordinates(stationName);
            
            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // For free tier: Get current weather and generate realistic historical data
            const currentWeather = await this.getCurrentWeather(stationName);
            
            // Generate realistic data based on current conditions
            const rainfallData = this.generateRealisticHistoricalData(
                currentWeather, 
                days,
                stationName
            );

            return {
                station: stationName,
                lat: coords.lat,
                lon: coords.lon,
                rainfallData: rainfallData,
                totalRainfall: rainfallData.reduce((a, b) => a + b, 0),
                averageRainfall: parseFloat((rainfallData.reduce((a, b) => a + b, 0) / rainfallData.length).toFixed(1)),
                unit: 'mm',
                source: 'OpenWeather (simulated historical)'
            };
        } catch (error) {
            console.error('Rainfall data error:', error.message);
            throw error;
        }
    }

    // Generate realistic data based on current weather
    generateRealisticHistoricalData(currentWeather, days, station) {
        // Base rainfall from current weather (if available)
        const baseRainfall = currentWeather.rainfall || Math.random() * 10 + 2;

        // Generate realistic daily variations
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            // Variation based on day
            const variation = (Math.random() * 0.6 + 0.7); // 0.7-1.3
            let dailyRain = baseRainfall * variation * (1 + Math.random() * 0.2);
            
            // Some days have more rain
            if (Math.random() > 0.7) {
                dailyRain *= 2.5;
            }
            
            // Ensure minimum rainfall
            dailyRain = Math.max(0.5, dailyRain);
            
            data.push(parseFloat(dailyRain.toFixed(1)));
        }
        return data;
    }

    // Get current weather data
    async getCurrentWeather(stationName) {
        try {
            const coords = await this.getCoordinates(stationName);
            
            const response = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    lat: coords.lat,
                    lon: coords.lon,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return {
                station: stationName,
                temperature: response.data.main.temp,
                humidity: response.data.main.humidity,
                pressure: response.data.main.pressure,
                weather: response.data.weather[0].description,
                rainfall: response.data.rain?.['1h'] || response.data.rain?.['3h'] || 0,
                windSpeed: response.data.wind.speed,
                windDirection: response.data.wind.deg
            };
        } catch (error) {
            console.error('Current weather error:', error.message);
            throw error;
        }
    }
}

module.exports = new WeatherService();