// backend/routes/smsRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const smsController = require('../controllers/smsController');

// All routes require authentication
router.use(protect);

// Send custom SMS
router.post('/custom', smsController.sendCustomSMS);

// Send test SMS
router.post('/test', smsController.sendTestSMS);

// Check balance
router.get('/balance', smsController.checkBalance);

// Get delivery status
router.get('/status/:messageId', smsController.getDeliveryStatus);

module.exports = router;