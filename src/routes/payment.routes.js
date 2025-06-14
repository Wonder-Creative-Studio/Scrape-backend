const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new payment
router.post('/', paymentController.createPayment);

// Get payment history
router.get('/history', paymentController.getPaymentHistory);

// Get payment details
router.get('/:paymentId', paymentController.getPaymentDetails);

// Process refund
router.post('/:paymentId/refund', paymentController.processRefund);

module.exports = router; 
