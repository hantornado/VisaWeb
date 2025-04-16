const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { setCsrfToken, validateCsrfToken } = require('./middleware/csrf');
const { initSentry, addSentryErrorHandler } = require('./config/sentry');

// Load environment variables
dotenv.config();

// Load deployment configuration
const deployConfig = require('./deployment.config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// Initialize express app
const app = express();

// Initialize Sentry for error tracking (must be first)
initSentry(app);

// Connect to MongoDB
require('./config/db')();

// Security middleware
// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api/', limiter);

// Prevent http param pollution
app.use(hpp());

// Sanitize data
app.use(mongoSanitize());

// Regular middleware
app.use(express.json({ limit: '10kb' })); // Body parser with size limit
app.use(cookieParser()); // Parse cookies

// Configure CORS with more secure options
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN']
}));

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Apply CSRF protection after authentication
app.use('/api/auth', authRoutes);
// Set CSRF token after successful authentication
app.use(setCsrfToken);
// Validate CSRF token for non-GET requests
app.use(validateCsrfToken);
// Protected routes
app.use('/api/applications', applicationRoutes);

// Add request logging in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  // Use combined format for production logging
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400 // Only log errors in production
  }));
}

// Add Sentry error handler (must be after all controllers)
addSentryErrorHandler(app);

// Final error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});