const User = require('../models/user.model');
const { generateToken, isValidEmail, isValidPhoneNumber, generateReferralCode } = require('../utils/common.utils');

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, gender, referredBy } = req.body;

    // Validate email and phone
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!isValidPhoneNumber(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or phone' });
    }

    // Generate referral code
    const referralCode = generateReferralCode();

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      address,
      gender,
      referralCode,
      referredBy: referredBy || null
    });

    await user.save();

    // Create wallet for the user
    const Wallet = require('../models/wallet.model');
    await Wallet.findOrCreate(user._id);

    // Generate token
    const token = generateToken(user._id);
    user.tokens = user.tokens || [];
    user.tokens.push({ token });
    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);
    user.tokens = user.tokens || [];
    user.tokens.push({ token });
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'phone', 'address'];
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

// Get user's points and rewards
const getPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('points');
    res.json({ points: user.points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's booking history
const getBookingHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('driver', 'name phone vehicleDetails')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout user
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
  getPoints,
  getBookingHistory,
  logout
}; 