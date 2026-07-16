const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Import models first so Mongoose registers refs like Location before routes execute
require('./models/Location');

// Import routes
const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const alertRoutes = require('./routes/alertRoutes');
const userRoutes = require('./routes/userRoutes');
const stationRoutes = require('./routes/stationRoutes');
const weatherRoutes = require('./routes/weather');
const smsRoutes = require('./routes/smsRoutes');

// Import database connection
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// ========== CORS Configuration ==========
const corsOptions = {
    origin: '*', // or ['http://localhost:3000', 'http://localhost:5000'] for production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // if you use cookies/authentication
};

// Apply global CORS middleware (including for static files)
app.use(cors(corsOptions));

// Optional: Add custom headers to be absolutely sure
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Security middleware (after CORS to not block it)
app.use(helmet({
    crossOriginResourcePolicy: false, // allow cross-origin resource sharing
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ========== Static Files with explicit CORS ==========
app.use('/uploads', cors(corsOptions), express.static(path.join(__dirname, 'uploads')));

// ========== Routes ==========
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/sms', smsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});