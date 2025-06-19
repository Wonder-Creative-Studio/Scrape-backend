const jwt = require('jsonwebtoken');
const moment = require('moment');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

// Generate time slots for a given date
const generateTimeSlots = (date, interval = 30) => {
  const slots = [];
  const startTime = moment(date).startOf('day').add(9, 'hours'); // Start at 9 AM
  const endTime = moment(date).startOf('day').add(18, 'hours'); // End at 6 PM

  let currentSlot = startTime;
  while (currentSlot.isBefore(endTime)) {
    slots.push({
      startTime: currentSlot.format('HH:mm'),
      endTime: currentSlot.add(interval, 'minutes').format('HH:mm')
    });
  }

  return slots;
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Generate referral code
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Calculate points for a booking
const calculateBookingPoints = (amount, isFirstBooking = false, isWomanContributor = false) => {
  let points = Math.floor(amount * 0.05); // 5% of booking amount
  
  if (isFirstBooking) {
    points += 200;
  }
  
  if (isWomanContributor) {
    points += 400;
  }
  
  return points;
};

// Validate phone number (Indian format)
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format date for display
const formatDate = (date) => {
  return moment(date).format('DD MMM YYYY, hh:mm A');
};

// Generate reference
const generateReference = (prefix = '') => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

module.exports = {
  generateToken,
  calculateDistance,
  generateTimeSlots,
  formatCurrency,
  generateReferralCode,
  calculateBookingPoints,
  isValidPhoneNumber,
  isValidEmail,
  formatDate,
  generateReference
}; 