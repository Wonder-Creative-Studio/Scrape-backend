const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Apply authentication and admin authorization middleware to all routes
router.use(authenticate);
router.use(authorizeAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);

// Driver management
router.get('/drivers', adminController.getDrivers);
router.post('/drivers/:driverId/verify', adminController.verifyDriver);

// Booking management
router.get('/bookings', adminController.getBookings);
router.post('/bookings/:bookingId/dispute', adminController.handleDispute);

// Payment management
router.get('/payments', adminController.getPayments);

// Reward management
router.get('/rewards', adminController.getRewards);
router.post('/rewards/config', adminController.updateRewardConfig);

module.exports = router; 