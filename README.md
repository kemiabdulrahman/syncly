# Telemedicine Coordination Platform

A comprehensive real-time telemedicine platform for healthcare workers to collaborate on patient cases, share medical records securely, coordinate referrals, and respond to emergency situations.

## Features

### 1. Real-time Collaboration
- Socket.io-powered real-time communication
- Live case discussions with typing indicators
- Instant notifications for updates and assignments
- Online/offline status tracking

### 2. Patient Case Management
- Create and manage patient cases
- Assign multiple healthcare workers to cases
- Track case status and priority levels
- Add symptoms, diagnosis, and treatment plans
- Attach documents and images

### 3. Medical Record Sharing
- Secure medical record storage
- End-to-end encryption for sensitive data
- Granular access control (Owner, Full Access, Limited Access, Emergency)
- Share and revoke access dynamically
- Complete audit logging

### 4. Referral System
- Create patient referrals between healthcare providers
- Track referral status (Pending, Accepted, Rejected, Completed)
- Urgency levels and response tracking
- Automated notifications

### 5. Emergency Response Coordination
- Create emergency alerts
- Priority-based alert system
- Real-time broadcast to available healthcare workers
- Track responders and resolution status

### 6. Security Features
- JWT-based authentication
- Role-based access control (Doctor, Nurse, Specialist, Paramedic, Admin)
- AES-256-GCM encryption for sensitive medical data
- Comprehensive audit logging
- IP address and user agent tracking

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Cache/Queue**: Redis
- **Authentication**: JWT
- **Encryption**: Node.js Crypto (AES-256-GCM)

## Project Structure

```
src/
├── config/          # Database and configuration
├── controllers/     # Request handlers
├── middleware/      # Auth, audit logging
├── models/          # Mongoose schemas
├── routes/          # API routes
├── services/        # Business logic (Socket.io, Notifications)
├── types/           # TypeScript interfaces and enums
├── utils/           # Helpers (JWT, Encryption)
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/telemedicine
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
NODE_ENV=development
ENCRYPTION_KEY=your-32-byte-hex-encryption-key
```

3. Start MongoDB and Redis:
```bash
# MongoDB
mongod

# Redis
redis-server
```

4. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new healthcare worker
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Patients
- `POST /api/patients` - Create patient
- `GET /api/patients` - List patients (with search)
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient (Admin only)

### Cases
- `POST /api/cases` - Create case
- `GET /api/cases` - List cases (filter by status, priority, assignedToMe)
- `GET /api/cases/:id` - Get case details
- `PUT /api/cases/:id` - Update case
- `PUT /api/cases/:id/assign` - Assign healthcare workers
- `DELETE /api/cases/:id` - Delete case

### Discussions
- `GET /api/discussions/case/:caseId` - Get case discussion
- `POST /api/discussions/case/:caseId/message` - Add message
- `DELETE /api/discussions/case/:caseId/message/:messageId` - Delete message

### Medical Records
- `POST /api/medical-records` - Create medical record
- `GET /api/medical-records` - List medical records (filtered by access)
- `GET /api/medical-records/:id` - Get record (with optional decryption)
- `POST /api/medical-records/:id/share` - Share record with user
- `POST /api/medical-records/:id/revoke` - Revoke access

### Referrals
- `POST /api/referrals` - Create referral
- `GET /api/referrals` - List referrals (incoming/outgoing)
- `GET /api/referrals/:id` - Get referral details
- `PUT /api/referrals/:id/respond` - Accept/Reject referral
- `PUT /api/referrals/:id/complete` - Mark as completed

### Emergency Alerts
- `POST /api/emergency` - Create emergency alert
- `GET /api/emergency` - List emergency alerts
- `GET /api/emergency/:id` - Get alert details
- `PUT /api/emergency/:id/respond` - Respond to alert
- `PUT /api/emergency/:id/resolve` - Resolve alert
- `DELETE /api/emergency/:id` - Delete alert

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## WebSocket Events

### Connection
```javascript
// Client connects with JWT token
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});
```

### Case Discussions
```javascript
// Join case discussion
socket.emit('case:join', caseId);

// Send message
socket.emit('case:message', { caseId, message, senderName });

// Listen for messages
socket.on('case:message', (data) => {
  console.log(data); // { caseId, message, sender, senderName, timestamp }
});

// Typing indicator
socket.emit('case:typing', { caseId, isTyping: true });
socket.on('case:typing', (data) => {
  console.log(`${data.userId} is typing...`);
});
```

### Emergency Alerts
```javascript
// Join emergency channel
socket.emit('emergency:join');

// Listen for alerts
socket.on('emergency:alert', (alert) => {
  console.log('Emergency alert:', alert);
});
```

### Notifications
```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

### User Status
```javascript
socket.on('user:online', ({ userId }) => {
  console.log(`User ${userId} is online`);
});

socket.on('user:offline', ({ userId }) => {
  console.log(`User ${userId} is offline`);
});
```

## User Roles

- **DOCTOR**: Full access to create cases, patients, medical records
- **NURSE**: Create cases, manage patients, limited medical records
- **SPECIALIST**: Receive referrals, consult on cases
- **PARAMEDIC**: Emergency alerts, basic patient info
- **ADMIN**: Full system access

## Security Best Practices

1. Always use HTTPS in production
2. Change JWT_SECRET and ENCRYPTION_KEY
3. Set up proper CORS origins
4. Use environment-specific configuration
5. Enable MongoDB authentication
6. Set up Redis password protection
7. Implement rate limiting (recommended)
8. Regular security audits
9. Monitor audit logs

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Contributing

1. Follow TypeScript best practices
2. Maintain audit logging for sensitive operations
3. Test authentication and authorization
4. Document new endpoints
5. Use proper error handling

## License

MIT

## Support

For issues and questions, please open an issue on the repository.