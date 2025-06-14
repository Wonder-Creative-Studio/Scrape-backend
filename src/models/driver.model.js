const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  vehicleDetails: {
    type: {
      type: String,
      required: true,
      enum: ['bike', 'auto', 'mini_truck', 'truck']
    },
    number: {
      type: String,
      required: true
    },
    capacity: {
      type: Number,
      required: true // in kg
    }
  },
  currentLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  kycDocuments: {
    aadharCard: {
      number: String,
      image: String
    },
    drivingLicense: {
      number: String,
      image: String
    },
    vehicleRC: {
      number: String,
      image: String
    }
  },
  charges: {
    perKg: {
      type: Number,
      required: true
    },
    perKm: {
      type: Number,
      required: true
    },
    minimumCharge: {
      type: Number,
      required: true
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  earnings: {
    total: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    withdrawn: {
      type: Number,
      default: 0
    }
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  }
}, {
  timestamps: true
});

// Index for geospatial queries
driverSchema.index({ currentLocation: '2dsphere' });

// Hash password before saving
driverSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
driverSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update rating
driverSchema.methods.updateRating = function(newRating) {
  this.totalRatings += 1;
  this.rating = ((this.rating * (this.totalRatings - 1)) + newRating) / this.totalRatings;
};

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver; 