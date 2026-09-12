const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    status: { type: String, enum: ['sent', 'failed'], required: true },
    providerMessageId: { type: String, trim: true },
    error: { type: String, trim: true },
    sentAt: { type: Date },
}, { _id: false });

const smsWarningSchema = new mongoose.Schema({
    station: { type: String, required: true, trim: true, index: true },
    message: { type: String, required: true, trim: true },
    prediction: {
        predictionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' },
        predictionDate: { type: Date },
        predictionValue: { type: Number },
        warning: { type: Boolean },
    },
    recipients: { type: [recipientSchema], default: [] },
    sentCount: { type: Number, default: 0, min: 0 },
    failedCount: { type: Number, default: 0, min: 0 },
    provider: { type: String, default: 'Notify.lk' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

smsWarningSchema.index({ station: 1, createdAt: -1 });
smsWarningSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SMSWarning', smsWarningSchema);