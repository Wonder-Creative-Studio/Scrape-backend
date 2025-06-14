const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const {
  register,
  login,
  getProfile,
  updateProfile,
  getPoints,
  getBookingHistory,
  logout
} = require('../controllers/user.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);
router.get('/points', auth, getPoints);
router.get('/bookings', auth, getBookingHistory);
router.post('/logout', auth, logout);

module.exports = router; 