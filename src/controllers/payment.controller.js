const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const Driver = require('../models/driver.model');

// Create a new payment
const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;
    const userId = req.user._id;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Create a mock payment
    const payment = new Payment({
      user: userId,
      booking: bookingId,
      amount,
      paymentMethod,
      status: 'completed', // For testing, we'll mark it as completed immediately
      transactionId: `MOCK_${Date.now()}` // Generate a mock transaction ID
    });

    await payment.save();

    // Update booking status
    booking.status = 'confirmed';
    await booking.save();

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payment history for a user
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ user: userId })
      .populate('booking', 'pickupAddress scrapDetails')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId)
      .populate('user', 'name email')
      .populate('booking', 'pickupAddress scrapDetails');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Process refund (mock implementation)
const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // For testing, we'll just mark it as refunded
    payment.status = 'refunded';
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.status = 'cancelled';
      booking.cancellationReason = `Refunded: ${reason}`;
      await booking.save();
    }

    res.json({ message: 'Refund processed successfully', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPayment,
  getPaymentHistory,
  getPaymentDetails,
  processRefund
}; 