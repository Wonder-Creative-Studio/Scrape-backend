const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'wallet'],
    required: true
  },
  paymentDetails: {
    transactionId: String,
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'other']
    },
    gatewayTransactionId: String,
    gatewayResponse: Object
  },
  refundDetails: {
    amount: Number,
    reason: String,
    processedAt: Date,
    transactionId: String
  },
  commission: {
    platform: {
      type: Number,
      required: true
    },
    driver: {
      type: Number,
      required: true
    }
  }
}, {
  timestamps: true
});

// Method to process refund
paymentSchema.methods.processRefund = async function(reason) {
  if (this.status !== 'completed') {
    throw new Error('Can only refund completed payments');
  }

  this.status = 'refunded';
  this.refundDetails = {
    amount: this.amount,
    reason,
    processedAt: new Date()
  };

  // Update driver's earnings
  const Driver = mongoose.model('Driver');
  await Driver.findByIdAndUpdate(this.driver, {
    $inc: {
      'earnings.total': -this.commission.driver,
      'earnings.pending': -this.commission.driver
    }
  });

  return this.save();
};

// Method to calculate commission
paymentSchema.statics.calculateCommission = function(amount) {
  const platformCommission = amount * 0.15; // 15% platform commission
  const driverCommission = amount - platformCommission;
  
  return {
    platform: platformCommission,
    driver: driverCommission
  };
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 