const User = require('../models/user.model');
const Driver = require('../models/driver.model');
const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');
const Reward = require('../models/reward.model');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDrivers,
      totalBookings,
      totalRevenue,
      pendingVerifications,
      recentBookings
    ] = await Promise.all([
      User.countDocuments(),
      Driver.countDocuments(),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Driver.countDocuments({ isVerified: false }),
      Booking.find()
        .populate('user', 'name')
        .populate('driver', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      totalUsers,
      totalDrivers,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingVerifications,
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all drivers
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify driver
const verifyDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    driver.isVerified = true;
    await driver.save();

    // Send notification to driver (implement notification logic here)

    res.json({ message: 'Driver verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name phone')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name')
      .populate('driver', 'name')
      .populate('booking', 'pickupAddress scrapDetails')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all rewards
const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update reward system configuration
const updateRewardConfig = async (req, res) => {
  try {
    const {
      referralPoints,
      bookingPointsPercentage,
      specialRewards
    } = req.body;

    // Update reward calculation constants
    Reward.calculatePoints = {
      referral: referralPoints,
      booking: (amount) => Math.floor(amount * (bookingPointsPercentage / 100)),
      special: specialRewards
    };

    res.json({ message: 'Reward system configuration updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle dispute
const handleDispute = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { resolution, refundAmount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update booking status based on resolution
    booking.status = 'cancelled';
    booking.cancellationReason = `Dispute resolved: ${resolution}`;
    await booking.save();

    // Process refund if applicable
    if (refundAmount > 0) {
      const payment = await Payment.findOne({ booking: bookingId });
      if (payment) {
        await payment.processRefund(resolution);
      }
    }

    res.json({ message: 'Dispute handled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getDrivers,
  verifyDriver,
  getBookings,
  getPayments,
  getRewards,
  updateRewardConfig,
  handleDispute
}; 