const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['referral', 'booking', 'special'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'credited', 'expired'],
    default: 'pending'
  },
  expiryDate: {
    type: Date,
    required: true
  },
  description: String,
  metadata: {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    specialRewardType: {
      type: String,
      enum: ['first_booking', 'monthly_top', 'eco_warrior', 'women_contributor']
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
rewardSchema.index({ user: 1, status: 1 });
rewardSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

// Method to check if reward is valid
rewardSchema.methods.isValid = function() {
  return this.status === 'pending' && new Date() < this.expiryDate;
};

// Static method to calculate points for different actions
rewardSchema.statics.calculatePoints = {
  referral: 100, // Points for successful referral
  booking: function(amount) {
    return Math.floor(amount * 0.05); // 5% of booking amount as points
  },
  special: {
    first_booking: 200,
    monthly_top: 500,
    eco_warrior: 300,
    women_contributor: 400
  }
};

// Method to credit points to user
rewardSchema.methods.creditPoints = async function() {
  if (this.status !== 'pending') {
    throw new Error('Points already credited or expired');
  }

  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.user, {
    $inc: { points: this.points }
  });

  this.status = 'credited';
  return this.save();
};

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward; 