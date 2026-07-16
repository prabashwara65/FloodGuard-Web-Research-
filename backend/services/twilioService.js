// backend/services/twilioService.js
const twilio = require('twilio');

class TwilioService {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
        this.client = twilio(this.accountSid, this.authToken);
    }

    /**
     * Send SMS with Unicode support (for Sinhala, Tamil, etc.)
     */
    async sendSMS(phoneNumber, message) {
        try {
            const formattedNumber = this.formatPhoneNumber(phoneNumber);
            
            // Check if message contains Unicode characters
            const hasUnicode = this.hasUnicodeChars(message);
            
            console.log(`📤 Sending SMS to: ${formattedNumber}`);
            console.log(`📝 Message length: ${message.length} chars`);
            console.log(`🔤 Unicode: ${hasUnicode ? 'Yes' : 'No'}`);

            const response = await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: formattedNumber,
                // For Unicode messages, Twilio automatically handles encoding
                // But we can specify the content type
                contentType: hasUnicode ? 'application/json' : 'application/x-www-form-urlencoded',
                // Smart encoding for better delivery
                smartEncoded: true
            });
            
            console.log(`✅ SMS sent! SID: ${response.sid}`);
            console.log(`📊 Status: ${response.status}`);
            
            return {
                success: true,
                sid: response.sid,
                status: response.status,
                to: formattedNumber,
                message: message,
                unicode: hasUnicode
            };
        } catch (error) {
            console.error('❌ SMS sending failed:', error.message);
            return {
                success: false,
                error: error.message,
                code: error.code
            };
        }
    }

    /**
     * Check if message contains Unicode characters (Sinhala, Tamil, etc.)
     */
    hasUnicodeChars(text) {
        // Check for Sinhala Unicode range: 0x0D80 - 0x0DFF
        // Also check for other Unicode ranges
        const sinhalaRegex = /[\u0D80-\u0DFF]/;
        const tamilRegex = /[\u0B80-\u0BFF]/;
        const emojiRegex = /[\u{1F000}-\u{1FFFF}]/u;
        const otherUnicodeRegex = /[^\x00-\x7F]/;
        
        return sinhalaRegex.test(text) || 
               tamilRegex.test(text) || 
               emojiRegex.test(text) || 
               otherUnicodeRegex.test(text);
    }

    /**
     * Format Sri Lankan phone numbers
     */
    formatPhoneNumber(phone) {
        let number = phone.toString().replace(/\D/g, '');
        if (number.startsWith('0')) {
            number = '94' + number.substring(1);
        } else if (!number.startsWith('94')) {
            number = '94' + number;
        }
        return '+' + number;
    }

    /**
     * Send Sinhala flood alert
     */
    async sendSinhalaFloodAlert(station, level, threshold, phoneNumber, warning = false) {
        // Sinhala Unicode messages
        let message = '';
        
        if (warning) {
            message = `🚨 ගංවතුර අනතුරු ඇඟවීම! 🚨\n\n` +
                      `📍 ස්ථානය: ${station}\n` +
                      `🌊 ජල මට්ටම: ${level}m\n` +
                      `⚠️ අනතුරු සීමාව: ${threshold}m\n` +
                      `📊 තත්වය: අනතුරුදායකයි!\n\n` +
                      `කරුණාකර ආරක්ෂිත ප්‍රදේශවලට ගොස් ආරක්ෂා වන්න.\n` +
                      `🌊 FloodGuard AI`;
        } else {
            message = `📊 ගංවතුර අනාවැකිය 📊\n\n` +
                      `📍 ස්ථානය: ${station}\n` +
                      `🌊 ජල මට්ටම: ${level}m\n` +
                      `📏 අනතුරු සීමාව: ${threshold}m\n` +
                      `✅ තත්වය: සාමාන්යයි\n\n` +
                      `කරුණාකර අවදානෙන් සිටින්න.\n` +
                      `🌊 FloodGuard AI`;
        }
        
        // Sinhala messages can be longer, but Twilio has 1600 char limit
        if (message.length > 1600) {
            // Split into multiple messages if needed
            return await this.sendLongSMS(phoneNumber, message);
        }
        
        return await this.sendSMS(phoneNumber, message);
    }

    /**
     * Send long SMS (split into multiple messages)
     */
    async sendLongSMS(phoneNumber, message, maxLength = 1600) {
        const chunks = this.splitMessage(message, maxLength);
        const results = [];
        
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const prefix = i > 0 ? `(${i+1}/${chunks.length}) ` : '';
            const result = await this.sendSMS(phoneNumber, prefix + chunk);
            results.push(result);
            
            // Wait between messages
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        return {
            success: results.every(r => r.success),
            results: results,
            totalChunks: chunks.length
        };
    }

    /**
     * Split long message into chunks
     */
    splitMessage(text, maxLength = 1600) {
        const chunks = [];
        let currentChunk = '';
        
        // Split by sentences or words
        const sentences = text.split(/(?<=[.!?])\s+/);
        
        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxLength) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = '';
                }
                // If a single sentence is too long, split by characters
                if (sentence.length > maxLength) {
                    for (let i = 0; i < sentence.length; i += maxLength) {
                        chunks.push(sentence.slice(i, i + maxLength).trim());
                    }
                } else {
                    currentChunk = sentence;
                }
            } else {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
        }
        
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }

    /**
     * Send bulk SMS with Sinhala support
     */
    async sendBulkSMS(phoneNumbers, message) {
        const results = [];
        
        for (let i = 0; i < phoneNumbers.length; i++) {
            const phone = phoneNumbers[i];
            const result = await this.sendSMS(phone, message);
            results.push({
                phone: phone,
                ...result
            });
            
            // Rate limiting: 1 SMS per second
            if (i < phoneNumbers.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        return {
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results: results
        };
    }
}

module.exports = new TwilioService();