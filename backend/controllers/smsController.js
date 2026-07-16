// backend/controllers/smsController.js
const notifyLkService = require('../services/notifyLkService');
const User = require('../models/User');

class SMSController {
    // Send custom SMS to users
    async sendCustomSMS(req, res) {
        try {
            const { station, message, users } = req.body;
            
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
            
            res.json({
                success: result.sent > 0,
                data: {
                    sent: result.sent,
                    failed: result.failed,
                    total: result.total,
                    results: result.results,
                    summary: result.summary,
                    provider: 'Notify.lk'
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