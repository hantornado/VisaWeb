/**
 * Sentry Configuration
 * This file configures Sentry for error tracking and reporting
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry for error tracking
 * @param {Object} app - Express application instance
 */
const initSentry = (app) => {
  // Skip Sentry initialization if DSN is not provided
  if (!process.env.SENTRY_DSN) {
    console.log('Sentry DSN not provided. Error tracking disabled.');
    return;
  }

  // Initialize Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express request tracing
      new Sentry.Integrations.Express({ app }),
      // Enable profiling (performance monitoring)
      new ProfilingIntegration(),
    ],
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // We recommend adjusting this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    // Set profilesSampleRate to 1.0 to profile all transactions
    // We recommend adjusting this value in production
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Set environment tag
    environment: process.env.NODE_ENV || 'development',
  });

  // Configure handlers
  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());
  
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  console.log('Sentry initialized for error tracking and monitoring');

  return Sentry;
};

/**
 * Add Sentry error handler to Express app
 * This should be added after all controllers/routes
 * @param {Object} app - Express application instance
 */
const addSentryErrorHandler = (app) => {
  if (!process.env.SENTRY_DSN) return;

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  // Optional fallthrough error handler
  app.use((err, req, res, next) => {
    // The error id is attached to `res.sentry` to be returned and optionally displayed to the user
    const eventId = res.sentry;
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      eventId: eventId // Include Sentry event ID for reference
    });
  });
};

module.exports = {
  initSentry,
  addSentryErrorHandler
};