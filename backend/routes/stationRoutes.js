const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const Station = require('../models/Station');
const { protect, adminOnly } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage });

// Get stations
router.get('/', protect, async (req, res) => {
    try {
        const isAdmin = req.user?.role === 'admin';

        let stations;
        if (isAdmin) {
            stations = await Station.find().sort({ stationName: 1 });
        } else {
            const assignedStationIds = (req.user?.assignedStations || []).map((station) => station._id || station);
            stations = await Station.find({
                _id: { $in: assignedStationIds }
            }).sort({ stationName: 1 });
        }

        res.json({ success: true, stations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create station
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const { stationName, stationId, threshold, description } = req.body;

        if (!stationName || !stationId) {
            return res.status(400).json({ success: false, error: 'Station name and station ID are required' });
        }

        const imageUrl = req.file
            ? `/uploads/${req.file.filename}`
            : '';

        const station = await Station.create({
            stationName,
            stationId,
            threshold: threshold || 1.5,
            imageUrl,
            description: description || ''
        });

        res.status(201).json({ success: true, station });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update station
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body };
        if (req.file) {
            updates.imageUrl = `/uploads/${req.file.filename}`;
        }

        const station = await Station.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!station) {
            return res.status(404).json({ success: false, error: 'Station not found' });
        }
        res.json({ success: true, station });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete station
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const station = await Station.findByIdAndDelete(req.params.id);
        if (!station) {
            return res.status(404).json({ success: false, error: 'Station not found' });
        }
        res.json({ success: true, message: 'Station deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
