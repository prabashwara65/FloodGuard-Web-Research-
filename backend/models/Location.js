const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    gaugeId: {
        type: String,
        unique: true,
        required: true
    },
    type: {
        type: String,
        enum: ['gauge_station', 'risk_zone'],
        default: 'gauge_station'
    },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    district: {
        type: String,
        required: true
    },
    division: {
        type: String
    },
    river: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    thresholds: {
        warning: { type: Number, default: 20.0 },
        danger: { type: Number, default: 25.0 },
        extreme: { type: Number, default: 30.0 }
    },
    alertSettings: {
        enabled: { type: Boolean, default: true },
        frequency: { 
            type: String, 
            enum: ['immediate', '6hours', '12hours', 'once'],
            default: 'immediate'
        },
        channels: {
            sms: { type: Boolean, default: false },
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: false }
        }
    },
    assignedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dataAvailability: {
        rainfall: { type: Boolean, default: false },
        discharge: { type: Boolean, default: false },
        soilMoisture: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Location', LocationSchema);