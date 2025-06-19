const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  reference: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [transactionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster queries
walletSchema.index({ user: 1 });

// Method to add money to wallet
walletSchema.methods.addMoney = async function(amount, description, reference) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  this.balance += amount;
  this.transactions.push({
    type: 'CREDIT',
    amount,
    description,
    reference,
    status: 'COMPLETED'
  });
  this.lastUpdated = new Date();
  
  return this.save();
};

// Method to deduct money from wallet
walletSchema.methods.deductMoney = async function(amount, description, reference) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }

  this.balance -= amount;
  this.transactions.push({
    type: 'DEBIT',
    amount,
    description,
    reference,
    status: 'COMPLETED'
  });
  this.lastUpdated = new Date();
  
  return this.save();
};

// Static method to find or create wallet
walletSchema.statics.findOrCreate = async function(userId) {
  let wallet = await this.findOne({ user: userId });
  
  if (!wallet) {
    wallet = await this.create({
      user: userId,
      balance: 0
    });
  }
  
  return wallet;
};

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet; 