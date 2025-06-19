# Live Tracking Integration

Real-time tracking system for scrap pickup management using Socket.IO and MongoDB.

## Overview

The live tracking system enables real-time location updates between drivers and users, providing:
- Real-time driver location tracking
- Distance calculation
- ETA estimation
- Booking status updates
- Room-based communication

## Technical Implementation

### Backend Components

1. **WebSocket Service** (`src/services/websocket.service.js`)
   - Handles all real-time communication
   - Manages driver connections
   - Handles booking rooms
   - Broadcasts location updates

2. **Driver Controller** (`src/controllers/driver.controller.js`)
   - Handles location updates
   - Manages booking status
   - Calculates distance and ETA

3. **App Configuration** (`src/app.js`)
   - Initializes WebSocket server
   - Sets up HTTP server
   - Configures CORS

## WebSocket Events

### Driver Events (Emit)

1. **Driver Authentication**
```javascript
socket.emit('driver_auth', driverId);
```

2. **Location Update**
```javascript
socket.emit('update_location', {
  driverId: 'driver123',
  bookingId: 'booking123',
  location: {
    latitude: 12.9716,
    longitude: 77.5946
  }
});
```

### Client Events (Emit)

1. **Join Booking Room**
```javascript
socket.emit('join_booking', bookingId);
```

2. **Leave Booking Room**
```javascript
socket.emit('leave_booking', bookingId);
```

### Server Events (Listen)

1. **Driver Location Updates**
```javascript
socket.on('driver_location', (data) => {
  // data = {
  //   bookingId: 'booking123',
  //   location: {
  //     latitude: 12.9716,
  //     longitude: 77.5946,
  //     distance: 5.2,
  //     estimatedTime: 10
  //   },
  //   timestamp: '2024-03-14T12:00:00Z'
  // }
});
```

2. **Booking Status Updates**
```javascript
socket.on('booking_status', (data) => {
  // data = {
  //   bookingId: 'booking123',
  //   status: 'in_progress',
  //   timestamp: '2024-03-14T12:00:00Z'
  // }
});
```

3. **ETA Updates**
```javascript
socket.on('eta_update', (data) => {
  // data = {
  //   bookingId: 'booking123',
  //   eta: 10,
  //   timestamp: '2024-03-14T12:00:00Z'
  // }
});
```

## API Endpoints

### Update Driver Location
```http
PUT /api/drivers/location
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

### Update Booking Status
```http
PUT /api/drivers/bookings/:bookingId/status
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

## Implementation Steps

1. **Install Dependencies**
```bash
npm install socket.io
```

2. **Environment Variables**
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
```

3. **Initialize WebSocket Service**
```javascript
const webSocketService = require('./services/websocket.service');
const server = http.createServer(app);
webSocketService.initialize(server);
```

## Testing

### Test Driver Location Update
```bash
curl -X PUT http://localhost:3000/api/drivers/location \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 12.9716, "longitude": 77.5946}'
```

### Test Booking Status Update
```bash
curl -X PUT http://localhost:3000/api/drivers/bookings/booking123/status \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

## Error Handling

The system handles various error scenarios:
- Invalid location data
- Driver authentication failures
- Booking room errors
- Connection issues

## Security Considerations

1. **Driver Authentication**
   - Each driver must authenticate before sending location updates
   - Token-based authentication for API endpoints

2. **Room Management**
   - Booking-specific rooms for targeted communication
   - Automatic room cleanup on disconnection

3. **Data Validation**
   - Location data validation
   - Status update validation
   - Input sanitization

## Performance Optimization

1. **Location Updates**
   - Throttled updates (configurable interval)
   - Distance-based update filtering
   - Efficient coordinate storage

2. **Connection Management**
   - Automatic reconnection handling
   - Connection state monitoring
   - Resource cleanup

## Frontend Integration

To integrate with the frontend:

1. **Connect to WebSocket**
```javascript
const socket = io('http://your-backend-url');
```

2. **Handle Authentication**
```javascript
socket.emit('driver_auth', driverId);
```

3. **Join Booking Room**
```javascript
socket.emit('join_booking', bookingId);
```

4. **Listen for Updates**
```javascript
socket.on('driver_location', handleLocationUpdate);
socket.on('booking_status', handleStatusUpdate);
socket.on('eta_update', handleEtaUpdate);
```

## Troubleshooting

Common issues and solutions:

1. **Connection Issues**
   - Check server status
   - Verify WebSocket URL
   - Check authentication token

2. **Location Update Failures**
   - Validate location data
   - Check driver authentication
   - Verify booking status

3. **Room Management Issues**
   - Check booking ID validity
   - Verify room existence
   - Check connection state 