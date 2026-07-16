const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    predictionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prediction'
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    level: {
        type: String,
        enum: ['warning', 'danger', 'extreme'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    affectedAreas: [{
        type: String
    }],
    recommendedActions: [{
        type: String
    }],
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sentTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    channels: [{
        type: String,
        enum: ['sms', 'email', 'push', 'dashboard']
    }],
    status: {
        type: String,
        enum: ['active', 'acknowledged', 'resolved'],
        default: 'active'
    },
    acknowledgedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    acknowledgedAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

AlertSchema.index({ locationId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', AlertSchema);