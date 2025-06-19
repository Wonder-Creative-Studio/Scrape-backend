const socketIO = require('socket.io');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedDrivers = new Map(); // Map to store driver connections
    this.bookingRooms = new Map(); // Map to store booking rooms
  }

  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Driver authentication
      socket.on('driver_auth', (driverId) => {
        this.connectedDrivers.set(driverId, socket.id);
        console.log(`Driver ${driverId} authenticated`);
      });

      // Join booking room
      socket.on('join_booking', (bookingId) => {
        socket.join(`booking_${bookingId}`);
        this.bookingRooms.set(bookingId, socket.id);
        console.log(`Client joined booking room: ${bookingId}`);
      });

      // Leave booking room
      socket.on('leave_booking', (bookingId) => {
        socket.leave(`booking_${bookingId}`);
        this.bookingRooms.delete(bookingId);
        console.log(`Client left booking room: ${bookingId}`);
      });

      // Handle driver location updates with error handling
      socket.on('update_location', (data) => {
        const { driverId, bookingId, location } = data;
        if (
          !driverId ||
          !bookingId ||
          !location ||
          typeof location.latitude !== 'number' ||
          typeof location.longitude !== 'number'
        ) {
          socket.emit('error', { message: 'Invalid location data' });
          return;
        }
        if (!this.connectedDrivers.has(driverId)) {
          socket.emit('error', { message: 'Unauthorized driver' });
          return;
        }
        this.broadcastDriverLocation(bookingId, location);
      });

      // Handle booking status update from client (for testing/demo)
      socket.on('booking_status_update', (data) => {
        const { bookingId, status } = data;
        this.broadcastBookingStatus(bookingId, status);
      });

      // Handle ETA update from client (for testing/demo)
      socket.on('eta_update', (data) => {
        const { bookingId, eta } = data;
        this.broadcastETA(bookingId, eta);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        // Remove driver from connected drivers
        for (const [driverId, socketId] of this.connectedDrivers.entries()) {
          if (socketId === socket.id) {
            this.connectedDrivers.delete(driverId);
            break;
          }
        }
        console.log('Client disconnected:', socket.id);
      });
    });

    return this.io;
  }

  // Broadcast driver location to all clients in a booking room
  broadcastDriverLocation(bookingId, location) {
    this.io.to(`booking_${bookingId}`).emit('driver_location', {
      bookingId,
      location,
      timestamp: new Date()
    });
  }

  // Broadcast booking status update
  broadcastBookingStatus(bookingId, status) {
    this.io.to(`booking_${bookingId}`).emit('booking_status', {
      bookingId,
      status,
      timestamp: new Date()
    });
  }

  // Broadcast ETA update
  broadcastETA(bookingId, eta) {
    this.io.to(`booking_${bookingId}`).emit('eta_update', {
      bookingId,
      eta,
      timestamp: new Date()
    });
  }

  // Check if a driver is connected
  isDriverConnected(driverId) {
    return this.connectedDrivers.has(driverId);
  }

  // Get socket ID for a driver
  getDriverSocketId(driverId) {
    return this.connectedDrivers.get(driverId);
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

module.exports = webSocketService; 