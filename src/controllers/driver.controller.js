const Driver = require('../models/driver.model');
const Booking = require('../models/booking.model');
const { generateToken, isValidEmail, isValidPhoneNumber } = require('../utils/common.utils');

// Register a new driver
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      vehicleDetails,
      charges
    } = req.body;

    // Validate email and phone
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!isValidPhoneNumber(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ $or: [{ email }, { phone }] });
    if (existingDriver) {
      return res.status(400).json({ error: 'Driver already exists with this email or phone' });
    }

    // Create new driver
    const driver = new Driver({
      name,
      email,
      password,
      phone,
      vehicleDetails,
      charges
    });

    await driver.save();

    // Generate token
    const token = generateToken(driver._id);

    res.status(201).json({
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicleDetails: driver.vehicleDetails
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login driver
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find driver
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await driver.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(driver._id);

    res.json({
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicleDetails: driver.vehicleDetails
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver profile
const getProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user._id).select('-password');
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update driver profile
const updateProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'phone', 'vehicleDetails', 'charges', 'bankDetails'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update driver location
const updateLocation = async (req, res) => {
  try {
    const { coordinates } = req.body;
    req.user.currentLocation = {
      type: 'Point',
      coordinates
    };
    await req.user.save();
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver's earnings
const getEarnings = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user._id).select('earnings');
    res.json(driver.earnings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver's booking history
const getBookingHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({ driver: req.user._id })
      .populate('user', 'name phone address')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update driver availability
const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    req.user.isAvailable = isAvailable;
    await req.user.save();
    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout driver
const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updateLocation,
  getEarnings,
  getBookingHistory,
  updateAvailability,
  logout
}; 