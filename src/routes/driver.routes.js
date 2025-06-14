const express = require('express');
const router = express.Router();
const { driverAuth } = require('../middleware/auth.middleware');
const {
  register,
  login,
  getProfile,
  updateProfile,
  updateLocation,
  getEarnings,
  getBookingHistory,
  updateAvailability,
  logout
} = require('../controllers/driver.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', driverAuth, getProfile);
router.patch('/profile', driverAuth, updateProfile);
router.post('/location', driverAuth, updateLocation);
router.get('/earnings', driverAuth, getEarnings);
router.get('/bookings', driverAuth, getBookingHistory);
router.patch('/availability', driverAuth, updateAvailability);
router.post('/logout', driverAuth, logout);

module.exports = router; 
 