const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

// List alerts for admin page and frontend consumers
//test
router.get('/', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            alerts: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get active alerts
router.get('/active', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            alerts: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create alert
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Alert created'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;