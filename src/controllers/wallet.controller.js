const Wallet = require('../models/wallet.model');
const { generateReference } = require('../utils/common.utils');

// Get wallet balance and recent transactions
const getWalletDetails = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id })
      .select('-transactions')
      .lean();

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      balance: wallet.balance,
      lastUpdated: wallet.lastUpdated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const transactions = wallet.transactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + parseInt(limit));

    res.json({
      transactions,
      total: wallet.transactions.length,
      page: parseInt(page),
      totalPages: Math.ceil(wallet.transactions.length / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add money to wallet
const addMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const wallet = await Wallet.findOrCreate(req.user._id);
    const reference = generateReference('WAL');


    
    await wallet.addMoney(
      amount,
      'Wallet recharge',
      reference
    );

    res.json({
      message: 'Money added successfully',
      balance: wallet.balance,
      reference
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Withdraw money from wallet
const withdrawMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const reference = generateReference('WAL');
    
    await wallet.deductMoney(
      amount,
      'Wallet withdrawal',
      reference
    );

    res.json({
      message: 'Money withdrawn successfully',
      balance: wallet.balance,
      reference
    });
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// Pay for booking using wallet
const payForBooking = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    
    if (!bookingId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid booking details' });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const reference = generateReference('PAY');
    
    await wallet.deductMoney(
      amount,
      `Payment for booking ${bookingId}`,
      reference
    );

    // Here you would typically update the booking status and payment details
    // This would be integrated with your booking system

    res.json({
      message: 'Payment successful',
      balance: wallet.balance,
      reference
    });
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getWalletDetails,
  getTransactionHistory,
  addMoney,
  withdrawMoney,
  payForBooking
}; 