# Telemedicine Platform API Documentation

A comprehensive real-time telemedicine platform API for healthcare workers to collaborate on patient cases, share medical records, and coordinate emergency responses.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/telemedicine
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

### 3. Start the Server
```bash
# Development mode
npm run dev

# Build and run production
npm run build
npm start
```

### 4. Access API Documentation
Once the server is running, access the interactive API documentation:
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## API Documentation Features

### Interactive Swagger UI
The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Interactive testing interface
- Authentication support
- Example requests and responses
- Real-time API exploration

### Comprehensive Documentation
All endpoints are fully documented with:
- Detailed descriptions
- Required/optional parameters
- Request body schemas
- Response codes and examples
- Authentication requirements
- Role-based access control information

## API Endpoints Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new healthcare worker | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

### Patients (`/api/patients`)
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/api/patients` | Create patient | Yes | Doctor, Nurse, Admin |
| GET | `/api/patients` | List all patients | Yes | All |
| GET | `/api/patients/:id` | Get patient details | Yes | All |
| PUT | `/api/patients/:id` | Update patient | Yes | Doctor, Nurse, Admin |
| DELETE | `/api/patients/:id` | Delete patient | Yes | Admin |

### Cases (`/api/cases`)
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/api/cases` | Create case | Yes | Doctor, Nurse, Specialist |
| GET | `/api/cases` | List cases | Yes | All |
| GET | `/api/cases/:id` | Get case details | Yes | All |
| PUT | `/api/cases/:id` | Update case | Yes | All |
| PUT | `/api/cases/:id/assign` | Assign case to workers | Yes | Doctor, Admin |
| DELETE | `/api/cases/:id` | Delete case | Yes | Admin, Doctor |

### Medical Records (`/api/medical-records`)
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/api/medical-records` | Create record | Yes | Doctor, Nurse, Specialist |
| GET | `/api/medical-records` | List accessible records | Yes | All |
| GET | `/api/medical-records/:id` | Get record details | Yes | All (with access) |
| POST | `/api/medical-records/:id/share` | Share record access | Yes | Record owner |
| POST | `/api/medical-records/:id/revoke` | Revoke record access | Yes | Record owner |

### Referrals (`/api/referrals`)
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/api/referrals` | Create referral | Yes | Doctor, Specialist, Nurse |
| GET | `/api/referrals` | List referrals | Yes | All |
| GET | `/api/referrals/:id` | Get referral details | Yes | All |
| PUT | `/api/referrals/:id/respond` | Accept/reject referral | Yes | Recipient |
| PUT | `/api/referrals/:id/complete` | Mark as completed | Yes | Recipient |

### Emergency Alerts (`/api/emergency`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/emergency` | Create emergency alert | Yes |
| GET | `/api/emergency` | List alerts | Yes |
| GET | `/api/emergency/:id` | Get alert details | Yes |
| PUT | `/api/emergency/:id/respond` | Respond to alert | Yes |
| PUT | `/api/emergency/:id/resolve` | Resolve alert | Yes |
| DELETE | `/api/emergency/:id` | Delete alert | Yes |

### Discussions (`/api/discussions`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/discussions/case/:caseId` | Get case discussion | Yes |
| POST | `/api/discussions/case/:caseId/message` | Add message | Yes |
| DELETE | `/api/discussions/case/:caseId/message/:messageId` | Delete message | Yes |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get notifications | Yes |
| GET | `/api/notifications/unread-count` | Get unread count | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Getting a Token

1. **Register** a new healthcare worker:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "doctor",
    "licenseNumber": "MD-123456",
    "phoneNumber": "+1234567890"
  }'
```

2. **Login** to get a token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Using the Token

Include the token in the `Authorization` header:
```bash
curl -X GET http://localhost:3000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

In Swagger UI:
1. Click the "Authorize" button
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click "Authorize"

## User Roles and Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| **Doctor** | Primary care physician | Full access to cases, patients, medical records |
| **Nurse** | Nursing staff | Manage patients, cases, limited record access |
| **Admin** | System administrator | Full system access, user management |
| **Specialist** | Medical specialist | Consultations, referrals, specialized care |
| **Paramedic** | Emergency responder | Emergency alerts, initial patient care |

## Features

### Real-Time Communication
- WebSocket support for live updates
- Real-time notifications
- Case discussion messaging
- Emergency alert broadcasting

### Security
- JWT authentication
- Role-based access control (RBAC)
- Medical record encryption support
- Audit logging for all actions
- Granular access control for sensitive data

### Medical Record Management
- Secure storage and retrieval
- Access control per record
- Share and revoke permissions
- Support for attachments
- Encryption for sensitive data

### Case Collaboration
- Multi-provider case management
- Real-time discussions
- Case assignment and tracking
- Status and priority management
- Attachment support

### Emergency Response
- Emergency alert creation
- Real-time notifications
- Response tracking
- Priority-based routing

## Development

### Project Structure
```
src/
├── app.ts                  # Express app configuration
├── index.ts               # Server entry point
├── config/
│   └── database.ts        # Database configuration
├── controllers/           # Request handlers
├── models/               # Mongoose models
├── routes/               # API routes
├── middleware/           # Custom middleware
├── services/             # Business logic
├── utils/                # Utilities
├── types/                # TypeScript types
└── swagger/              # API documentation
    ├── swagger.config.ts # Swagger configuration
    ├── index.ts          # Swagger setup
    └── paths/            # Endpoint documentation
```

### Adding New Endpoints

1. **Create the controller** in `src/controllers/`
2. **Define the route** in `src/routes/`
3. **Add documentation** in `src/swagger/paths/`
4. **Update schemas** in `src/swagger/swagger.config.ts` if needed
5. **Rebuild** the project: `npm run build`

### Testing

```bash
# Type check
npm run build

# Run the server
npm run dev
```

Visit http://localhost:3000/api-docs to test endpoints interactively.

## Technologies Used

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **Redis** - Caching and sessions
- **JWT** - Authentication
- **Swagger/OpenAPI 3.0** - API documentation
- **bcryptjs** - Password hashing
- **crypto-js** - Encryption

## WebSocket Events

The platform includes real-time features via Socket.io:

- `case:updated` - Case changes
- `message:new` - New discussion messages
- `emergency:alert` - Emergency alerts
- `notification:new` - New notifications
- `referral:received` - New referrals

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Production Deployment

1. Set production environment variables
2. Build the application: `npm run build`
3. Start with: `npm start`
4. Use a process manager like PM2
5. Set up reverse proxy (nginx)
6. Enable HTTPS
7. Configure CORS properly
8. Set up database backups
9. Monitor logs and performance

## Support and Contributing

For detailed API documentation, always refer to the live Swagger UI at `/api-docs` when the server is running.

For additional information about the Swagger documentation structure, see `src/swagger/README.md`.

## License

MIT

---

**API Version**: 1.0.0
**Documentation**: http://localhost:3000/api-docs
**OpenAPI Spec**: http://localhost:3000/api-docs.json
