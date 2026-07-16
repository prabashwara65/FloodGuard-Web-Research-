const Location = require('../models/Location');

// @desc    Get all locations
// @route   GET /api/locations
exports.getLocations = async (req, res) => {
    try {
        let query = {};
        
        // If user is not admin, only show assigned locations
        if (req.user.role !== 'admin') {
            query._id = { $in: req.user.assignedLocations };
        }

        const locations = await Location.find(query)
            .populate('assignedUsers', 'name email');

        res.json({
            success: true,
            locations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get single location
// @route   GET /api/locations/:id
exports.getLocation = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id)
            .populate('assignedUsers', 'name email');

        if (!location) {
            return res.status(404).json({
                success: false,
                error: 'Location not found'
            });
        }

        // Check access
        if (req.user.role !== 'admin' && 
            !req.user.assignedLocations.includes(location._id)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        res.json({
            success: true,
            location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Create location (Admin only)
// @route   POST /api/locations
exports.createLocation = async (req, res) => {
    try {
        const location = await Location.create(req.body);
        res.status(201).json({
            success: true,
            location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update location (Admin only)
// @route   PUT /api/locations/:id
exports.updateLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!location) {
            return res.status(404).json({
                success: false,
                error: 'Location not found'
            });
        }

        res.json({
            success: true,
            location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete location (Admin only)
// @route   DELETE /api/locations/:id
exports.deleteLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndDelete(req.params.id);

        if (!location) {
            return res.status(404).json({
                success: false,
                error: 'Location not found'
            });
        }

        res.json({
            success: true,
            message: 'Location deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update location thresholds (Admin only)
// @route   PUT /api/locations/:id/thresholds
exports.updateThresholds = async (req, res) => {
    try {
        const { warning, danger, extreme } = req.body;
        
        const location = await Location.findByIdAndUpdate(
            req.params.id,
            { thresholds: { warning, danger, extreme } },
            { new: true }
        );

        if (!location) {
            return res.status(404).json({
                success: false,
                error: 'Location not found'
            });
        }

        res.json({
            success: true,
            location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};