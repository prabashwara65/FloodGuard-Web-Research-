// backend/controllers/smsController.js
const notifyLkService = require('../services/notifyLkService');
const User = require('../models/User');
const SMSWarning = require('../models/SMSWarning');

class SMSController {
    // Send custom SMS to users
    async sendCustomSMS(req, res) {
        try {
            const { station, message, users, prediction } = req.body;
            
            console.log('📱 Custom SMS Request:');
            console.log(`   Station: ${station}`);
            console.log(`   Message Length: ${message?.length}`);
            console.log(`   Users: ${users?.length}`);

            if (!users || users.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No users provided'
                });
            }

            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'No message provided'
                });
            }

            // Extract phone numbers
            const phoneNumbers = users
                .filter(u => u.phone)
                .map(u => u.phone);
            
            if (phoneNumbers.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid phone numbers found'
                });
            }

            // Send SMS via Notify.lk
            const result = await notifyLkService.sendBulkSMS(phoneNumbers, message);
            const deliveryResults = result.results || [];
            const recipients = users.filter((user) => user.phone).map((user) => {
                const phoneSuffix = String(user.phone).replace(/\D/g, '').slice(-9);
                const delivery = deliveryResults.find((item) => (
                    String(item.phone || '').replace(/\D/g, '').slice(-9) === phoneSuffix
                )) || {};

                return {
                    userId: user.id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    status: delivery.success ? 'sent' : 'failed',
                    providerMessageId: delivery.messageId,
                    error: delivery.error,
                    sentAt: delivery.timestamp || (delivery.success ? new Date() : undefined),
                };
            });
            const smsWarning = await SMSWarning.create({
                station: station || 'Unknown',
                message,
                prediction: prediction ? {
                    predictionId: prediction.id || prediction._id,
                    predictionDate: prediction.predictionDate || prediction.date,
                    predictionValue: prediction.predictionValue ?? prediction.value,
                    warning: prediction.warning,
                } : undefined,
                recipients,
                sentCount: result.sent || 0,
                failedCount: result.failed || 0,
                provider: 'Notify.lk',
                createdBy: req.user?._id,
            });
            
            res.json({
                success: result.sent > 0,
                data: {
                    sent: result.sent,
                    failed: result.failed,
                    total: result.total,
                    results: result.results,
                    summary: result.summary,
                    provider: 'Notify.lk',
                    warning: smsWarning
                }
            });
        } catch (error) {
            console.error('❌ SMS error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Read the persisted SMS warning history.
    async getSMSWarnings(req, res) {
        try {
            const isAdmin = req.user?.role === 'admin';
            const recipientQuery = isAdmin ? {} : {
                $or: [
                    { 'recipients.userId': req.user?._id },
                    { 'recipients.phone': req.user?.phone },
                    { 'recipients.email': req.user?.email },
                ].filter((condition) => Object.values(condition)[0]),
            };
            const warnings = await SMSWarning.find(recipientQuery)
                .sort({ createdAt: -1 })
                .populate('createdBy', 'name email')
                .lean();

            res.json({ success: true, warnings });
        } catch (error) {
            console.error('❌ SMS warning history error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Delete a persisted SMS warning record. This never recalls a delivered SMS.
    async deleteSMSWarning(req, res) {
        try {
            const warning = await SMSWarning.findByIdAndDelete(req.params.id);
            if (!warning) {
                return res.status(404).json({ success: false, error: 'SMS warning not found' });
            }

            res.json({ success: true, message: 'SMS warning deleted' });
        } catch (error) {
            console.error('❌ SMS warning delete error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // Send test SMS
    async sendTestSMS(req, res) {
        try {
            const { phone } = req.body;
            
            if (!phone) {
                return res.status(400).json({
                    success: false,
                    error: 'Phone number is required'
                });
            }

            const testMessage = `🧪 පරීක්ෂණ පණිවිඩය 🧪\n\n` +
                               `🌊 FloodGuard AI පද්ධතිය ක්‍රියාත්මකයි!\n` +
                               `✅ ඔබගේ දුරකථන අංකය සාර්ථකව ලියාපදිංචි කර ඇත.\n\n` +
                               `📱 අනතුරු ඇඟවීම් සඳහා මෙම අංකය භාවිතා වේ.\n` +
                               `🌊 FloodGuard AI - ගංවතුර අනතුරු ඇඟවීමේ පද්ධතිය`;

            const result = await notifyLkService.sendSMS(phone, testMessage);
            
            if (result.success) {
                res.json({
                    success: true,
                    data: result
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error,
                    details: result.details
                });
            }
        } catch (error) {
            console.error('❌ Test SMS error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Check balance
    async checkBalance(req, res) {
        try {
            const balance = await notifyLkService.checkBalance();
            
            if (balance.success) {
                res.json({
                    success: true,
                    data: {
                        balance: balance.balance,
                        currency: balance.currency,
                        provider: 'Notify.lk'
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: balance.error
                });
            }
        } catch (error) {
            console.error('❌ Balance check error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get delivery status
    async getDeliveryStatus(req, res) {
        try {
            const { messageId } = req.params;
            
            if (!messageId) {
                return res.status(400).json({
                    success: false,
                    error: 'Message ID is required'
                });
            }
            
            const status = await notifyLkService.getDeliveryStatus(messageId);
            
            if (status.success) {
                res.json({
                    success: true,
                    data: status
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: status.error
                });
            }
        } catch (error) {
            console.error('❌ Status check error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new SMSController();