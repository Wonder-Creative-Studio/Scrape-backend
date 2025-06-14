const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Driver = require('../models/driver.model');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id, 'tokens.token': token });
    const driver = await Driver.findOne({ _id: decoded.id, 'tokens.token': token });

    if (!user && !driver) {
      throw new Error();
    }

    req.token = token;
    req.user = user || driver;
    req.userType = user ? 'user' : 'driver';
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.userType !== 'user' || req.user.role !== 'admin') {
        throw new Error();
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

const driverAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.userType !== 'driver') {
        throw new Error();
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Access denied. Driver privileges required.' });
  }
};

module.exports = {
  auth,
  adminAuth,
  driverAuth
}; 