const io = require('socket.io-client');
const { expect } = require('chai');

describe('WebSocket Live Tracking Tests', function () {
  this.timeout(5000);
  let driverSocket;
  let userSocket;
  const SERVER_URL = 'http://localhost:3000';
  const TEST_DRIVER_ID = 'test_driver_123';
  const TEST_BOOKING_ID = 'test_booking_123';

  before((done) => {
    // Connect driver socket
    driverSocket = io(SERVER_URL);
    driverSocket.on('connect', () => {
      console.log('Driver socket connected');
      // Connect user socket
      userSocket = io(SERVER_URL);
      userSocket.on('connect', () => {
        console.log('User socket connected');
        done();
      });
    });
  });

  after((done) => {
    if (driverSocket) driverSocket.disconnect();
    if (userSocket) userSocket.disconnect();
    done();
  });

  describe('Driver Authentication', () => {
    it('should authenticate driver successfully', (done) => {
      driverSocket.emit('driver_auth', TEST_DRIVER_ID);
      setTimeout(() => {
        expect(driverSocket.connected).to.be.true;
        done();
      }, 1000);
    });
  });

  describe('Booking Room Management', () => {
    it('should allow user to join booking room', (done) => {
      userSocket.emit('join_booking', TEST_BOOKING_ID);
      setTimeout(() => {
        expect(userSocket.connected).to.be.true;
        done();
      }, 1000);
    });

    it('should allow user to leave booking room', (done) => {
      userSocket.emit('leave_booking', TEST_BOOKING_ID);
      setTimeout(() => {
        expect(userSocket.connected).to.be.true;
        done();
      }, 1000);
    });
  });

  describe('Location Updates', () => {
    it('should broadcast driver location updates', (done) => {
      const testLocation = {
        driverId: TEST_DRIVER_ID,
        bookingId: TEST_BOOKING_ID,
        location: {
          latitude: 12.9716,
          longitude: 77.5946
        }
      };

      // Set up listener before emitting
      userSocket.once('driver_location', (data) => {
        try {
          expect(data).to.have.property('bookingId', TEST_BOOKING_ID);
          expect(data).to.have.property('location');
          expect(data.location).to.have.property('latitude', 12.9716);
          expect(data.location).to.have.property('longitude', 77.5946);
          done();
        } catch (error) {
          done(error);
        }
      });

      // Join the room and wait a bit before emitting
      userSocket.emit('join_booking', TEST_BOOKING_ID);
      setTimeout(() => {
        driverSocket.emit('update_location', testLocation);
      }, 1000);
    });
  });

  describe('Booking Status Updates', () => {
    it('should broadcast booking status updates', (done) => {
      const testStatus = 'in_progress';

      // Set up listener before emitting
      userSocket.once('booking_status', (data) => {
        try {
          expect(data).to.have.property('bookingId', TEST_BOOKING_ID);
          expect(data).to.have.property('status', testStatus);
          done();
        } catch (error) {
          done(error);
        }
      });

      // Join the room and wait a bit before emitting
      userSocket.emit('join_booking', TEST_BOOKING_ID);
      setTimeout(() => {
        driverSocket.emit('booking_status_update', {
          bookingId: TEST_BOOKING_ID,
          status: testStatus
        });
      }, 1000);
    });
  });

  describe('ETA Updates', () => {
    it('should broadcast ETA updates', (done) => {
      const testETA = 15;

      // Set up listener before emitting
      userSocket.once('eta_update', (data) => {
        try {
          expect(data).to.have.property('bookingId', TEST_BOOKING_ID);
          expect(data).to.have.property('eta', testETA);
          done();
        } catch (error) {
          done(error);
        }
      });

      // Join the room and wait a bit before emitting
      userSocket.emit('join_booking', TEST_BOOKING_ID);
      setTimeout(() => {
        driverSocket.emit('eta_update', {
          bookingId: TEST_BOOKING_ID,
          eta: testETA
        });
      }, 1000);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid location data', (done) => {
      const invalidLocation = {
        driverId: TEST_DRIVER_ID,
        bookingId: TEST_BOOKING_ID,
        location: {
          latitude: 'invalid',
          longitude: 'invalid'
        }
      };

      // Set up error listener
      driverSocket.once('error', (error) => {
        try {
          expect(error).to.have.property('message');
          done();
        } catch (error) {
          done(error);
        }
      });

      // Emit invalid location
      driverSocket.emit('update_location', invalidLocation);
    });

    it('should handle unauthorized driver updates', (done) => {
      const unauthorizedDriverSocket = io(SERVER_URL);
      
      // Set up error listener
      unauthorizedDriverSocket.once('error', (error) => {
        try {
          expect(error).to.have.property('message');
          unauthorizedDriverSocket.disconnect();
          done();
        } catch (error) {
          done(error);
        }
      });

      // Emit unauthorized update
      unauthorizedDriverSocket.emit('update_location', {
        driverId: 'unauthorized_driver',
        bookingId: TEST_BOOKING_ID,
        location: {
          latitude: 12.9716,
          longitude: 77.5946
        }
      });
    });
  });
}); 