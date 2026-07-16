const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
    stationName: {
        type: String,
        required: true,
        trim: true
    },
    stationId: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    threshold: {
        type: Number,
        default: 1.5
    },
    imageUrl: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    latitude: {
        type: Number,
        default: null
    },
    longitude: {
        type: Number,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Station', StationSchema);
