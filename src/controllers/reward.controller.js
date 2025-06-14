const Reward = require('../models/reward.model');
const User = require('../models/user.model');

// Get user's rewards
const getUserRewards = async (req, res) => {
  try {
    const userId = req.user._id;
    const rewards = await Reward.find({ user: userId })
      .sort({ createdAt: -1 });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reward details
const getRewardDetails = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const reward = await Reward.findById(rewardId)
      .populate('user', 'name email');

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json(reward);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add points to user
const addPoints = async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const reward = new Reward({
      user: userId,
      points,
      type: 'credit',
      reason,
      status: 'completed'
    });

    await reward.save();

    // Update user's total points
    user.points += points;
    await user.save();

    res.status(201).json(reward);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Redeem points
const redeemPoints = async (req, res) => {
  try {
    const { points, reason } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.points < points) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    const reward = new Reward({
      user: userId,
      points: -points, // Negative points for redemption
      type: 'debit',
      reason,
      status: 'completed'
    });

    await reward.save();

    // Update user's total points
    user.points -= points;
    await user.save();

    res.status(201).json(reward);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserRewards,
  getRewardDetails,
  addPoints,
  redeemPoints
}; 