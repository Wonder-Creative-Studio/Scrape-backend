const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { auth } = require('../middleware/auth.middleware');

// All routes require user authentication
router.use(auth);

// Get wallet details
router.get('/', walletController.getWalletDetails);

// Get transaction history
router.get('/transactions', walletController.getTransactionHistory);

// Add money to wallet
router.post('/add', walletController.addMoney);

// Withdraw money from wallet
router.post('/withdraw', walletController.withdrawMoney);

// Pay for booking using wallet
router.post('/pay', walletController.payForBooking);

module.exports = router; 