const Booking = require('../models/booking.model');
const Driver = require('../models/driver.model');
const User = require('../models/user.model');
const Payment = require('../models/payment.model');
const Reward = require('../models/reward.model');
const { calculateDistance, calculateBookingPoints } = require('../utils/common.utils');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      pickupAddress,
      scrapDetails,
      timeSlot
    } = req.body;

    // Validate minimum quantity
    if (scrapDetails.quantity < 10) {
      return res.status(400).json({ error: 'Minimum quantity should be 10kg' });
    }

    // Find available drivers near the pickup location
    const availableDrivers = await Driver.find({
      isAvailable: true,
      'vehicleDetails.capacity': { $gte: scrapDetails.quantity },
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: pickupAddress.coordinates
          },
          $maxDistance: 10000 // 10km radius
        }
      }
    }).sort({ rating: -1 });

    if (availableDrivers.length === 0) {
      return res.status(404).json({ error: 'No drivers available in your area' });
    }

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      pickupAddress,
      scrapDetails,
      timeSlot,
      status: 'pending'
    });

    await booking.save();

    // Notify nearby drivers (implement notification logic here)

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get booking details
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name phone address')
      .populate('driver', 'name phone vehicleDetails currentLocation');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user has permission to view this booking
    if (booking.user.toString() !== req.user._id.toString() && 
        (!booking.driver || booking.driver.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['accepted', 'cancelled'],
      accepted: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    // Update booking status
    booking.status = status;
    
    // Handle status-specific actions
    switch (status) {
      case 'accepted':
        booking.driver = req.user._id;
        break;
      case 'in_progress':
        booking.actualPickupTime = new Date();
        break;
      case 'completed':
        booking.completionTime = new Date();
        // Create payment record
        const payment = new Payment({
          booking: booking._id,
          user: booking.user,
          driver: booking.driver,
          amount: booking.payment.amount,
          status: 'pending'
        });
        await payment.save();
        break;
      case 'cancelled':
        booking.cancellationReason = req.body.reason;
        break;
    }

    await booking.save();

    // Handle rewards for completed bookings
    if (status === 'completed') {
      const user = await User.findById(booking.user);
      const isFirstBooking = await Booking.countDocuments({ user: booking.user }) === 1;
      
      const points = calculateBookingPoints(
        booking.payment.amount,
        isFirstBooking,
        user.gender === 'female'
      );

      const reward = new Reward({
        user: booking.user,
        type: 'booking',
        points,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        metadata: {
          bookingId: booking._id
        }
      });

      await reward.save();
      await reward.creditPoints();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('driver', 'name phone vehicleDetails')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver's bookings
const getDriverBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ driver: req.user._id })
      .populate('user', 'name phone address')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rate booking
const rateBooking = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed bookings' });
    }

    // Update booking rating
    if (req.userType === 'user') {
      booking.driverRating = { value: rating, comment };
      // Update driver's overall rating
      const driver = await Driver.findById(booking.driver);
      driver.updateRating(rating);
      await driver.save();
    } else {
      booking.rating = { value: rating, comment };
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBooking,
  getBooking,
  updateBookingStatus,
  getUserBookings,
  getDriverBookings,
  rateBooking
}; 