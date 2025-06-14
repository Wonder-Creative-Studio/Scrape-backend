const express = require('express');
const router = express.Router();
const { auth, driverAuth } = require('../middleware/auth.middleware');
const {
  createBooking,
  getBooking,
  updateBookingStatus,
  getUserBookings,
  getDriverBookings,
  rateBooking
} = require('../controllers/booking.controller');

// User routes
router.post('/', auth, createBooking);
router.get('/user', auth, getUserBookings);
router.get('/:id', auth, getBooking);
router.post('/:id/rate', auth, rateBooking);

// Driver routes
router.get('/driver', driverAuth, getDriverBookings);
router.patch('/:id/status', driverAuth, updateBookingStatus);

module.exports = router; 