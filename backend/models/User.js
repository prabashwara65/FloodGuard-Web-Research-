const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    preferredStation: {
        type: String,
        default: 'Hanwella'
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    assignedLocations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    }],
    assignedStations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station'
    }],
    organization: {
        type: String
    },
    district: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    preferences: {
        alertChannels: {
            sms: { type: Boolean, default: false },
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: false }
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);