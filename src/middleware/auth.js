const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Driver = require('../models/driver.model');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    const driver = await Driver.findById(decoded.userId);

    if (!user && !driver) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user || driver;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Admin authorization middleware
const authorizeAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Access denied' });
  }
};

// Driver authorization middleware
const authorizeDriver = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isDriver) {
      return res.status(403).json({ error: 'Driver access required' });
    }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Access denied' });
  }
};

// User authorization middleware
const authorizeUser = async (req, res, next) => {
  try {
    if (!req.user || req.user.isDriver) {
      return res.status(403).json({ error: 'User access required' });
    }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Access denied' });
  }
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeDriver,
  authorizeUser
}; 