class LiveTracking {
  constructor(mapElementId, bookingId) {
    this.mapElementId = mapElementId;
    this.bookingId = bookingId;
    this.map = null;
    this.driverMarker = null;
    this.directionsService = null;
    this.directionsRenderer = null;
    this.socket = null;
    this.initialize();
  }

  initialize() {
    // Initialize Google Maps
    this.map = new google.maps.Map(document.getElementById(this.mapElementId), {
      zoom: 15,
      center: { lat: 0, lng: 0 },
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // Initialize directions service
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
      suppressMarkers: true
    });

    // Initialize driver marker
    this.driverMarker = new google.maps.Marker({
      map: this.map,
      icon: {
        url: '/images/driver-marker.png',
        scaledSize: new google.maps.Size(40, 40)
      }
    });

    // Initialize Socket.IO connection
    this.initializeSocket();
  }

  initializeSocket() {
    this.socket = io();

    // Join booking room
    this.socket.emit('join_booking', this.bookingId);

    // Listen for driver location updates
    this.socket.on('driver_location_update', (data) => {
      this.updateDriverLocation(data.location);
    });

    // Listen for booking status updates
    this.socket.on('booking_status_update', (data) => {
      this.updateBookingStatus(data.status);
    });

    // Listen for ETA updates
    this.socket.on('eta_update', (data) => {
      this.updateETA(data.eta);
    });
  }

  updateDriverLocation(location) {
    const position = {
      lat: location.latitude,
      lng: location.longitude
    };

    // Update driver marker position
    this.driverMarker.setPosition(position);
    this.map.panTo(position);

    // Update route if pickup location is available
    if (this.pickupLocation) {
      this.updateRoute(position, this.pickupLocation);
    }

    // Update distance and ETA display
    document.getElementById('distance').textContent = `${location.distance.toFixed(1)} km`;
    document.getElementById('eta').textContent = `${location.estimatedTime} mins`;
  }

  updateRoute(origin, destination) {
    this.directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(result);
      }
    });
  }

  updateBookingStatus(status) {
    const statusElement = document.getElementById('booking-status');
    statusElement.textContent = status;
    statusElement.className = `status-${status.toLowerCase()}`;
  }

  updateETA(eta) {
    document.getElementById('eta').textContent = `${eta} mins`;
  }

  setPickupLocation(location) {
    this.pickupLocation = location;
    const marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: {
        url: '/images/pickup-marker.png',
        scaledSize: new google.maps.Size(40, 40)
      }
    });
  }

  cleanup() {
    if (this.socket) {
      this.socket.emit('leave_booking', this.bookingId);
      this.socket.disconnect();
    }
  }
}

// Usage example:
// const tracking = new LiveTracking('map', 'booking123');
// tracking.setPickupLocation({ lat: 12.9716, lng: 77.5946 }); 