# Visa Status Checker Backend

This is the backend API for the Visa Application Status Checker system. It provides secure endpoints for visa application submission, status checking, and administrative management.

## Features

- **Secure Authentication**: JWT-based authentication with role-based access control
- **Data Encryption**: Sensitive data encryption at rest using mongoose-encryption
- **Security Measures**: Protection against common web vulnerabilities (XSS, CSRF, SQL Injection)
- **Notification System**: Email and SMS notifications for application status updates
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation for all API inputs

## Security Implementation

The backend implements several security measures:

1. **HTTPS Enforcement**: All traffic is redirected to HTTPS in production
2. **Helmet Security Headers**: Protection against various attacks with secure HTTP headers
3. **CSRF Protection**: Double-submit cookie pattern for CSRF protection
4. **XSS Prevention**: Input sanitization and Content-Security-Policy headers
5. **Rate Limiting**: Request throttling to prevent abuse
6. **MongoDB Sanitization**: Prevention of NoSQL injection attacks
7. **Parameter Pollution Prevention**: Protection against HTTP parameter pollution
8. **Data Encryption**: Sensitive fields are encrypted at rest

## Notification System

The application includes a notification system for status updates:

- **Email Notifications**: Sent via Nodemailer when application status changes
- **SMS Notifications**: Placeholder implementation for SMS integration

## Deployment Configuration

The backend is configured for deployment to various environments:

- **Development**: Local development environment
- **Production**: Configured for Render or AWS deployment
- **Testing**: Separate environment for running tests

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/visa-status-checker

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d

# Security
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100
LOCKOUT_ATTEMPTS=5
LOCKOUT_TIME=30  # minutes

# Encryption
ENCRYPTION_KEY=your_encryption_key_here
SIGNING_KEY=your_signing_key_here

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email@gmail.com
```

## Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with passport number and unique code
- `POST /api/auth/admin/login` - Admin login with username and password

### Applications
- `POST /api/applications` - Submit new visa application
- `GET /api/applications/:id` - Get application status (authenticated)
- `GET /api/applications/user` - Get user's applications (authenticated)

### Admin Routes
- `GET /api/applications/admin/all` - Get all applications (admin only)
- `GET /api/applications/admin/:id` - Get application details (admin only)
- `PUT /api/applications/admin/:id/status` - Update application status (admin only)

## License

MIT