const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

// Get all locations
router.get('/', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            locations: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create location
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Location created'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;  // ✅ MUST BE EXPORTED