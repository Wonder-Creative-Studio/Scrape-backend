# Scrap Pickup Management System

A comprehensive backend system for managing scrap pickup and recycling services, built with Node.js and MongoDB.

## Features

### User App
- Scrap Pickup Booking
  - Book pickups with time slots and address
  - Minimum quantity enforcement (10kg)
- Real-Time Tracking
  - Live driver location visibility via map
- Driver Charge Transparency
  - View driver fees by location before confirming
- In-App Payments
  - Digital payment gateway (UPI, cards, wallets)
- Ratings & Reviews
  - Post-service feedback for quality assurance
- Eco-Friendly Tips
  - Dynamic tips to reduce, reuse, recycle
- Referral Program
  - Earn credits or coupons for every referral
- Women Contributor Rewards
  - Special point-based rewards system for female users
- Notifications
  - Booking confirmation, driver ETA, status updates

### Driver App
- Self-Onboarding
  - Register, upload KYC, and start receiving bookings
- Set Own Charges
  - Set per kg or per km rate, editable in profile
- Accept/Reject Bookings
  - Accept jobs based on availability and scrap type
- Earnings Dashboard
  - Daily/weekly/monthly reports with withdrawal options

### Admin Panel
- User and driver management
- Reward system configuration
- Transaction tracking and settlements
- Content manager (eco-tips, announcements)
- Dispute resolution handling

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Socket.IO (for real-time features)
- JWT Authentication
- Razorpay Integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scrap-pickup-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/scrap_pickup
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication
- POST /api/users/register - Register a new user
- POST /api/users/login - User login
- POST /api/drivers/register - Register a new driver
- POST /api/drivers/login - Driver login

### Bookings
- POST /api/bookings - Create a new booking
- GET /api/bookings - Get user's bookings
- GET /api/bookings/:id - Get booking details
- PUT /api/bookings/:id/status - Update booking status

### Payments
- POST /api/payments/create - Create payment
- POST /api/payments/verify - Verify payment
- GET /api/payments/history - Get payment history

### Rewards
- GET /api/rewards - Get user's rewards
- POST /api/rewards/referral - Create referral reward
- GET /api/rewards/points - Get points balance

### Eco Tips
- GET /api/ecotips - Get eco tips
- GET /api/ecotips/:id - Get specific eco tip
- POST /api/ecotips - Create eco tip (admin only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 