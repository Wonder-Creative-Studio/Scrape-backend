const io = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const TEST_DRIVER_ID = 'test_driver_123';
const TEST_BOOKING_ID = 'test_booking_123';

// Connect as driver
const driverSocket = io(SERVER_URL);

driverSocket.on('connect', () => {
  console.log('Driver connected');
  
  // Authenticate driver
  driverSocket.emit('driver_auth', TEST_DRIVER_ID);
  console.log('Driver authentication sent');

  // Simulate location updates every 5 seconds
  setInterval(() => {
    const location = {
      driverId: TEST_DRIVER_ID,
      bookingId: TEST_BOOKING_ID,
      location: {
        latitude: 12.9716 + (Math.random() * 0.01),
        longitude: 77.5946 + (Math.random() * 0.01)
      }
    };
    
    driverSocket.emit('update_location', location);
    console.log('Location update sent:', location);
  }, 5000);
});

// Connect as user
const userSocket = io(SERVER_URL);

userSocket.on('connect', () => {
  console.log('User connected');
  
  // Join booking room
  userSocket.emit('join_booking', TEST_BOOKING_ID);
  console.log('Joined booking room:', TEST_BOOKING_ID);

  // Listen for location updates
  userSocket.on('driver_location', (data) => {
    console.log('Received location update:', data);
  });

  // Listen for status updates
  userSocket.on('booking_status', (data) => {
    console.log('Received status update:', data);
  });

  // Listen for ETA updates
  userSocket.on('eta_update', (data) => {
    console.log('Received ETA update:', data);
  });
});

// Error handling
driverSocket.on('error', (error) => {
  console.error('Driver socket error:', error);
});

userSocket.on('error', (error) => {
  console.error('User socket error:', error);
});

// Disconnect handling
process.on('SIGINT', () => {
  console.log('Disconnecting...');
  driverSocket.disconnect();
  userSocket.disconnect();
  process.exit();
}); 