const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth.middleware');
const {
  createEcoTip,
  getEcoTips,
  getEcoTip,
  updateEcoTip,
  deleteEcoTip,
  getFeaturedEcoTips,
  getEcoTipsByCategory
} = require('../controllers/ecotip.controller');

// Public routes
router.get('/', getEcoTips);
router.get('/featured', getFeaturedEcoTips);
router.get('/category/:category', getEcoTipsByCategory);
router.get('/:id', getEcoTip);

// Admin routes
router.post('/', adminAuth, createEcoTip);
router.patch('/:id', adminAuth, updateEcoTip);
router.delete('/:id', adminAuth, deleteEcoTip);

module.exports = router; 