const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    stationName: {
        type: String,
        trim: true
    },
    stationCode: {
        type: String,
        trim: true
    },
    horizon: {
        type: String,
        enum: ['24H', '48H', '72H'],
        default: '72H'
    },
    predictionDate: {
        type: Date
    },
    predictionValue: {
        type: Number
    },
    warning: {
        type: Boolean,
        default: false
    },
    threshold: {
        type: Number
    },
    status: {
        type: String,
        enum: ['warning', 'normal'],
        default: 'normal'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    forecast: {
        hours_24: { type: Number },
        hours_48: { type: Number },
        hours_72: { type: Number }
    },
    floodRisk: {
        level: {
            type: String,
            enum: ['low', 'medium', 'high', 'extreme']
        },
        threshold: { type: Number },
        alertTriggered: { type: Boolean, default: false }
    },
    shapValues: {
        rainfall: { type: Number },
        soil_moisture: { type: Number },
        upstream_level: { type: Number },
        temperature: { type: Number },
        tidal_effect: { type: Number }
    },
    inputFeatures: {
        type: mongoose.Schema.Types.Mixed
    },
    modelVersion: {
        type: String
    },
    confidence: {
        type: Number
    }
}, {
    timestamps: true
});

// Index for faster queries
PredictionSchema.index({ stationName: 1, predictionDate: -1 });

module.exports = mongoose.model('Prediction', PredictionSchema);