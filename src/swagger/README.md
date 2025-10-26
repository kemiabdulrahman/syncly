# API Documentation

This folder contains the complete OpenAPI 3.0 (Swagger) documentation for the Telemedicine Platform API.

## Structure

```
swagger/
├── swagger.config.ts      # Main Swagger/OpenAPI configuration
├── index.ts               # Swagger exports and setup
├── paths/                 # API endpoint documentation
│   ├── auth.ts           # Authentication endpoints
│   ├── patients.ts       # Patient management endpoints
│   ├── cases.ts          # Medical case endpoints
│   ├── medical-records.ts # Medical records with access control
│   ├── referrals.ts      # Referral management endpoints
│   ├── emergency.ts      # Emergency alert endpoints
│   ├── discussions.ts    # Case discussion/messaging endpoints
│   └── notifications.ts  # Notification endpoints
└── README.md             # This file
```

## Accessing the Documentation

### Interactive UI (Swagger UI)
When the server is running, visit:
```
http://localhost:3000/api-docs
```

This provides an interactive interface where you can:
- Browse all API endpoints
- View request/response schemas
- Test API calls directly from the browser
- See detailed parameter descriptions
- View example requests and responses

### OpenAPI JSON Specification
The raw OpenAPI 3.0 specification is available at:
```
http://localhost:3000/api-docs.json
```

This can be:
- Imported into Postman, Insomnia, or other API clients
- Used to generate client SDKs
- Used with API testing tools
- Shared with frontend developers

## Authentication

Most endpoints require JWT authentication. To use protected endpoints:

1. **Register or Login** via `/api/auth/register` or `/api/auth/login`
2. **Copy the JWT token** from the response
3. **Click "Authorize"** button in Swagger UI
4. **Enter:** `Bearer <your-token-here>`
5. **Click "Authorize"** to save

Now all authenticated requests will include your token automatically.

## API Overview

### Authentication (`/api/auth`)
- User registration and login
- Profile management
- JWT-based authentication

### Patients (`/api/patients`)
- Create, read, update, delete patient records
- Search and filter patients
- Access control based on user role

### Cases (`/api/cases`)
- Medical case management
- Case assignment to healthcare workers
- Status and priority tracking
- Attachment support

### Medical Records (`/api/medical-records`)
- Secure medical record storage
- Granular access control
- Encryption support
- Share/revoke access permissions

### Referrals (`/api/referrals`)
- Create referrals between providers
- Accept, reject, or complete referrals
- Urgency-based prioritization

### Emergency (`/api/emergency`)
- Create emergency alerts
- Real-time notification system
- Response tracking
- Status management

### Discussions (`/api/discussions`)
- Case-based messaging
- Real-time chat for collaboration
- Message history

### Notifications (`/api/notifications`)
- User notification management
- Mark as read/unread
- Notification filtering

## User Roles

The API supports different healthcare worker roles with varying permissions:

- **Doctor**: Full access to cases, patients, and medical records
- **Nurse**: Can manage patients and cases, limited medical record access
- **Admin**: System administration, user management
- **Specialist**: Consultation and referral management
- **Paramedic**: Emergency response and alert management

## Testing the API

### Using Swagger UI
1. Start the server: `npm run dev`
2. Open browser: `http://localhost:3000/api-docs`
3. Authorize with a valid JWT token
4. Click on any endpoint to expand
5. Click "Try it out"
6. Fill in parameters
7. Click "Execute"

### Using cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "doctor@hospital.com", "password": "password123"}'

# Get patients (with auth)
curl -X GET http://localhost:3000/api/patients \
  -H "Authorization: Bearer <your-token>"
```

### Using Postman
1. Import the OpenAPI spec: `http://localhost:3000/api-docs.json`
2. Set up environment variables for the token
3. Use the auto-generated collection

## Updating Documentation

When adding new endpoints:

1. Add route implementation in `src/routes/*.ts`
2. Add Swagger documentation in `src/swagger/paths/*.ts`
3. Update schemas in `swagger.config.ts` if needed
4. Rebuild: `npm run build`
5. Restart server to see changes

## Schema Definitions

All request/response schemas are defined in `swagger.config.ts` under `components.schemas`. This includes:

- User and authentication models
- Patient information
- Medical cases
- Records and documents
- Referrals and alerts
- Error responses

## Best Practices

1. **Always authenticate** for protected endpoints
2. **Check response codes** for proper error handling
3. **Use pagination** parameters for list endpoints
4. **Respect role permissions** - some endpoints require specific roles
5. **Test in development** before deploying to production

## Support

For issues or questions about the API:
- Check the interactive Swagger UI documentation
- Review example requests and responses
- Consult the schema definitions for data structures
- Contact the development team

---

**Version**: 1.0.0
**OpenAPI Version**: 3.0.0
**Last Updated**: 2024
