const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get user's rewards
router.get('/', rewardController.getUserRewards);

// Get reward details
router.get('/:rewardId', rewardController.getRewardDetails);

// Add points to user (admin only)
router.post('/add', authorizeAdmin, rewardController.addPoints);

// Redeem points
router.post('/redeem', rewardController.redeemPoints);

module.exports = router; 