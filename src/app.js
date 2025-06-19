const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/user.routes');
const driverRoutes = require('./routes/driver.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const rewardRoutes = require('./routes/reward.routes');
const ecotipRoutes = require('./routes/ecotip.routes');
const adminRoutes = require('./routes/admin.routes');
const walletRoutes = require('./routes/wallet.routes');

// Import WebSocket service
const webSocketService = require('./services/websocket.service');

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket service
webSocketService.initialize(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/ecotips', ecotipRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server }; 