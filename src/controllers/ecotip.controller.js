const EcoTip = require('../models/ecotip.model');

// Create eco tip (admin only)
const createEcoTip = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      image,
      tags,
      featured,
      priority
    } = req.body;

    const ecoTip = new EcoTip({
      title,
      content,
      category,
      image,
      tags,
      featured,
      priority,
      author: req.user._id
    });

    await ecoTip.save();
    res.status(201).json(ecoTip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all eco tips
const getEcoTips = async (req, res) => {
  try {
    const { category, tag, featured } = req.query;
    const query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const ecoTips = await EcoTip.find(query)
      .populate('author', 'name')
      .sort({ priority: -1, publishedAt: -1 });

    res.json(ecoTips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specific eco tip
const getEcoTip = async (req, res) => {
  try {
    const ecoTip = await EcoTip.findOne({
      _id: req.params.id,
      status: 'published'
    }).populate('author', 'name');

    if (!ecoTip) {
      return res.status(404).json({ error: 'Eco tip not found' });
    }

    res.json(ecoTip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update eco tip (admin only)
const updateEcoTip = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'title',
      'content',
      'category',
      'image',
      'tags',
      'featured',
      'priority',
      'status'
    ];

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    const ecoTip = await EcoTip.findById(req.params.id);
    if (!ecoTip) {
      return res.status(404).json({ error: 'Eco tip not found' });
    }

    updates.forEach(update => ecoTip[update] = req.body[update]);
    await ecoTip.save();

    res.json(ecoTip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete eco tip (admin only)
const deleteEcoTip = async (req, res) => {
  try {
    const ecoTip = await EcoTip.findById(req.params.id);
    if (!ecoTip) {
      return res.status(404).json({ error: 'Eco tip not found' });
    }

    await ecoTip.remove();
    res.json({ message: 'Eco tip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get featured eco tips
const getFeaturedEcoTips = async (req, res) => {
  try {
    const ecoTips = await EcoTip.getFeaturedTips();
    res.json(ecoTips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get eco tips by category
const getEcoTipsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const ecoTips = await EcoTip.getTipsByCategory(category);
    res.json(ecoTips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEcoTip,
  getEcoTips,
  getEcoTip,
  updateEcoTip,
  deleteEcoTip,
  getFeaturedEcoTips,
  getEcoTipsByCategory
}; 