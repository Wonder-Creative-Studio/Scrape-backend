const mongoose = require('mongoose');

const ecoTipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['reduce', 'reuse', 'recycle', 'general'],
    required: true
  },
  image: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
ecoTipSchema.index({ status: 1, category: 1 });
ecoTipSchema.index({ tags: 1 });
ecoTipSchema.index({ featured: 1, priority: -1 });

// Method to publish tip
ecoTipSchema.methods.publish = function() {
  if (this.status !== 'draft') {
    throw new Error('Only draft tips can be published');
  }
  
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

// Method to archive tip
ecoTipSchema.methods.archive = function() {
  if (this.status === 'archived') {
    throw new Error('Tip is already archived');
  }
  
  this.status = 'archived';
  return this.save();
};

// Static method to get featured tips
ecoTipSchema.statics.getFeaturedTips = function(limit = 5) {
  return this.find({
    status: 'published',
    featured: true
  })
  .sort({ priority: -1, publishedAt: -1 })
  .limit(limit);
};

// Static method to get tips by category
ecoTipSchema.statics.getTipsByCategory = function(category, limit = 10) {
  return this.find({
    status: 'published',
    category
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

const EcoTip = mongoose.model('EcoTip', ecoTipSchema);

module.exports = EcoTip; 