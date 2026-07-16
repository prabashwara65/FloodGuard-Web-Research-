// backend/services/notifyLkService.js
const axios = require('axios');

class NotifyLKService {
    constructor() {
        this.userId = process.env.NOTIFY_LK_USER_ID;
        this.apiKey = process.env.NOTIFY_LK_API_KEY;
        this.senderId = process.env.NOTIFY_LK_SENDER_ID || 'NotifyDEMO';
        this.baseUrl = 'https://app.notify.lk/api/v1';
        
        console.log('📱 Notify.lk Service Initialized:');
        console.log(`   User ID: ${this.userId}`);
        console.log(`   Sender ID: ${this.senderId}`);
        console.log(`   API Key: ${this.apiKey ? '✅ Set' : '❌ Missing'}`);
    }

    /**
     * Format Sri Lankan phone numbers for Notify.lk
     * REQUIRES: 11 digits starting with 94
     */
    formatPhoneNumber(phone) {
        let number = phone.toString().replace(/\D/g, '');
        
        if (number.startsWith('0')) {
            number = number.substring(1);
        }
        if (!number.startsWith('94')) {
            number = '94' + number;
        }
        if (number.length !== 11) {
            console.warn(`   ⚠️ Warning: Expected 11 digits, got ${number.length}`);
        }
        
        console.log(`   Formatted: ${phone} -> ${number}`);
        return number;
    }

    /**
     * Send SMS via Notify.lk with Unicode support
     */
    async sendSMS(phoneNumber, message) {
        try {
            const formattedNumber = this.formatPhoneNumber(phoneNumber);
            
            if (formattedNumber.length !== 11) {
                return {
                    success: false,
                    error: `Invalid phone number format. Expected 11 digits, got ${formattedNumber.length}: ${formattedNumber}`
                };
            }

            // ✅ Check if message contains Sinhala Unicode
            const hasSinhala = this.hasSinhalaChars(message);
            console.log(`🔤 Sinhala Unicode: ${hasSinhala ? 'Yes' : 'No'}`);
            
            console.log(`📤 Sending SMS via Notify.lk`);
            console.log(`   To: ${formattedNumber}`);
            console.log(`   From: ${this.senderId}`);
            console.log(`   Message: ${message.substring(0, 50)}...`);
            console.log(`   Length: ${message.length} chars`);
            console.log(`   Unicode: ${hasSinhala ? '✅' : '❌'}`);

            const payload = {
                user_id: this.userId,
                api_key: this.apiKey,
                sender_id: this.senderId,
                to: formattedNumber,
                message: message,
                // ✅ Force Unicode encoding
                unicode: '1'
            };

            console.log('📦 Payload:', payload);

            const response = await axios.post(`${this.baseUrl}/send`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            console.log('📊 Notify.lk Response:', response.data);

            if (response.data.status === 'success') {
                return {
                    success: true,
                    messageId: response.data.message_id || response.data.msg_id || response.data.id,
                    to: formattedNumber,
                    provider: 'Notify.lk',
                    unicode: hasSinhala,
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.error || response.data.message || 'Failed to send SMS',
                    details: response.data
                };
            }
        } catch (error) {
            console.error('❌ Notify.lk error:', error.message);
            if (error.response) {
                console.error('   Response:', error.response.data);
                console.error('   Status:', error.response.status);
            }
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Check if message contains Sinhala Unicode characters
     */
    hasSinhalaChars(text) {
        // Sinhala Unicode range: 0x0D80 - 0x0DFF
        const sinhalaRegex = /[\u0D80-\u0DFF]/;
        const sinhalaMultiRegex = /[\u0D80-\u0DFF][\u0DCA-\u0DFF]?/;
        
        return sinhalaRegex.test(text) || sinhalaMultiRegex.test(text);
    }

    /**
     * Convert message to ensure proper Unicode encoding
     */
    encodeUnicodeMessage(message) {
        // Ensure message is properly encoded for Unicode
        // This handles Sinhala characters correctly
        try {
            // Normalize the string to ensure proper Unicode encoding
            const normalized = message.normalize('NFC');
            return normalized;
        } catch (error) {
            console.error('Encoding error:', error);
            return message;
        }
    }

    /**
     * Send bulk SMS
     */
    async sendBulkSMS(phoneNumbers, message) {
        const results = [];
        let sent = 0;
        let failed = 0;

        console.log(`\n📱 Sending bulk SMS to ${phoneNumbers.length} numbers via Notify.lk...`);
        console.log(`🔤 Message contains Sinhala: ${this.hasSinhalaChars(message) ? 'Yes' : 'No'}`);

        for (let i = 0; i < phoneNumbers.length; i++) {
            const phone = phoneNumbers[i];
            console.log(`\n📱 [${i+1}/${phoneNumbers.length}] Sending to: ${phone}`);
            
            // ✅ Ensure message is properly encoded
            const encodedMessage = this.encodeUnicodeMessage(message);
            
            const result = await this.sendSMS(phone, encodedMessage);
            results.push({
                phone: phone,
                ...result,
                timestamp: new Date().toISOString()
            });
            
            if (result.success) {
                sent++;
                console.log(`✅ Success (${sent}/${phoneNumbers.length})`);
            } else {
                failed++;
                console.log(`❌ Failed: ${result.error}`);
            }
            
            if (i < phoneNumbers.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`\n📊 Bulk SMS Complete:`);
        console.log(`   ✅ Sent: ${sent}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📱 Total: ${results.length}`);

        return {
            total: results.length,
            sent: sent,
            failed: failed,
            results: results,
            summary: `Sent to ${sent} users, ${failed} failed`
        };
    }

    /**
     * Check SMS balance
     */
    async checkBalance() {
        try {
            const response = await axios.post(`${this.baseUrl}/balance`, {
                user_id: this.userId,
                api_key: this.apiKey
            }, {
                timeout: 30000
            });
            
            console.log('💰 Balance Response:', response.data);
            
            if (response.data.status === 'success') {
                return {
                    success: true,
                    balance: response.data.balance || response.data.credits || 0,
                    currency: 'LKR',
                    data: response.data
                };
            }
            return {
                success: true,
                balance: 9,
                currency: 'LKR',
                note: 'Using default balance from fallback'
            };
        } catch (error) {
            console.warn('⚠️ Balance check failed:', error.message);
            return {
                success: true,
                balance: 9,
                currency: 'LKR',
                note: 'Using default balance (API unavailable)'
            };
        }
    }

    /**
     * Get delivery status
     */
    async getDeliveryStatus(messageId) {
        try {
            const response = await axios.post(`${this.baseUrl}/status`, {
                user_id: this.userId,
                api_key: this.apiKey,
                message_id: messageId
            }, {
                timeout: 30000
            });
            
            if (response.data.status === 'success') {
                return {
                    success: true,
                    status: response.data.delivery_status,
                    data: response.data
                };
            }
            return {
                success: false,
                error: response.data.error || 'Failed to get status'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new NotifyLKService();