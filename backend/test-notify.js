// backend/test-notify.js
require('dotenv').config();
const notifyLkService = require('./services/notifyLkService');

async function testNotifyLK() {
    console.log('🧪 Testing Notify.lk Service\n');
    
    // 1. Check Configuration
    console.log('📋 Configuration:');
    console.log(`   User ID: ${process.env.NOTIFY_LK_USER_ID ? '✅' : '❌'}`);
    console.log(`   API Key: ${process.env.NOTIFY_LK_API_KEY ? '✅' : '❌'}`);
    console.log(`   Sender ID: ${process.env.NOTIFY_LK_SENDER_ID || 'FloodGuard'}`);
    console.log('');

    if (!process.env.NOTIFY_LK_USER_ID || !process.env.NOTIFY_LK_API_KEY) {
        console.log('❌ Missing Notify.lk credentials!');
        console.log('Please add to .env:');
        console.log('  NOTIFY_LK_USER_ID=32377');
        console.log('  NOTIFY_LK_API_KEY=your_key');
        return;
    }

    // 2. Check Balance
    console.log('💰 Checking Balance...');
    const balance = await notifyLkService.checkBalance();
    if (balance.success) {
        console.log(`   Balance: ${balance.balance} ${balance.currency}`);
    } else {
        console.log(`   ❌ ${balance.error}`);
    }
    console.log('');

    // 3. Send Test SMS
    const testPhone = '0713578202'; // Your Sri Lankan number
    console.log(`📱 Sending test SMS to: ${testPhone}`);
    console.log('   (Using Notify.lk - No verification needed!)\n');
    
    const result = await notifyLkService.sendSMS(
        testPhone,
        '🧪 Test message from FloodGuard AI via Notify.lk!\n\nYour SMS system is working! ✅'
    );
    
    if (result.success) {
        console.log('\n✅ Test SMS sent successfully!');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Provider: ${result.provider}`);
        console.log('\n📱 Check your phone for the message!');
    } else {
        console.log('\n❌ Test SMS failed:');
        console.log(`   Error: ${result.error}`);
        if (result.details) {
            console.log(`   Details:`, result.details);
        }
    }
}

testNotifyLK();