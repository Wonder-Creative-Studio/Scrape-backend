const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  scrapDetails: {
    type: {
      type: String,
      required: true,
      enum: ['paper', 'plastic', 'metal', 'glass', 'e-waste', 'mixed']
    },
    quantity: {
      type: Number,
      required: true,
      min: 10 // minimum 10kg
    },
    description: String
  },
  timeSlot: {
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  payment: {
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['upi', 'card', 'wallet']
    },
    transactionId: String
  },
  rating: {
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  },
  driverRating: {
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  },
  cancellationReason: String,
  estimatedPickupTime: Date,
  actualPickupTime: Date,
  completionTime: Date
}, {
  timestamps: true
});

// Index for geospatial queries
bookingSchema.index({ 'pickupAddress.coordinates': '2dsphere' });

// Method to calculate payment amount
bookingSchema.methods.calculatePayment = function(driverCharges) {
  const { perKg, perKm, minimumCharge } = driverCharges;
  const distance = this.calculateDistance(driverCharges.currentLocation);
  const amount = Math.max(
    minimumCharge,
    (this.scrapDetails.quantity * perKg) + (distance * perKm)
  );
  return amount;
};

// Method to calculate distance (simplified version)
bookingSchema.methods.calculateDistance = function(driverLocation) {
  // This is a simplified version. In production, use a proper geospatial library
  const [pickupLng, pickupLat] = this.pickupAddress.coordinates;
  const [driverLng, driverLat] = driverLocation.coordinates;
  
  // Haversine formula implementation would go here
  // For now, returning a dummy value
  return 5; // 5 km
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 