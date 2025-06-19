const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    // Join a room for specific booking tracking
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
      console.log(`Client joined booking room: ${bookingId}`);
    });

    // Leave booking room
    socket.on('leave_booking', (bookingId) => {
      socket.leave(`booking_${bookingId}`);
      console.log(`Client left booking room: ${bookingId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

// Update driver location
const updateDriverLocation = (bookingId, location) => {
  if (io) {
    io.to(`booking_${bookingId}`).emit('driver_location_update', {
      bookingId,
      location,
      timestamp: new Date()
    });
  }
};

// Update booking status
const updateBookingStatus = (bookingId, status) => {
  if (io) {
    io.to(`booking_${bookingId}`).emit('booking_status_update', {
      bookingId,
      status,
      timestamp: new Date()
    });
  }
};

// Send ETA update
const sendEtaUpdate = (bookingId, eta) => {
  if (io) {
    io.to(`booking_${bookingId}`).emit('eta_update', {
      bookingId,
      eta,
      timestamp: new Date()
    });
  }
};

module.exports = {
  initializeSocket,
  updateDriverLocation,
  updateBookingStatus,
  sendEtaUpdate
}; 