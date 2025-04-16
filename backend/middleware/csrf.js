const crypto = require('crypto');

/**
 * CSRF Protection Middleware
 * Implements Cross-Site Request Forgery protection using the double-submit cookie pattern
 */

// Store for CSRF tokens (in production, use Redis or another distributed store)
const tokenStore = new Map();

// Generate a CSRF token
const generateToken = (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  // Store token with user ID and expiration (24 hours)
  tokenStore.set(userId, {
    token,
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });
  return token;
};

// Clean expired tokens (run periodically)
setInterval(() => {
  for (const [userId, data] of tokenStore.entries()) {
    if (data.expires < Date.now()) {
      tokenStore.delete(userId);
    }
  }
}, 60 * 60 * 1000); // Clean every hour

/**
 * Middleware to set CSRF token in cookie and response
 */
exports.setCsrfToken = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next();
  }
  
  const token = generateToken(req.user.id);
  
  // Set CSRF token in cookie (httpOnly: false so JS can read it)
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  // Also send token in response for SPA applications
  res.locals.csrfToken = token;
  
  next();
};

/**
 * Middleware to validate CSRF token
 * Exempt GET, HEAD, OPTIONS requests as they should be idempotent
 */
exports.validateCsrfToken = (req, res, next) => {
  // Skip validation for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }
  
  // Skip if user is not authenticated
  if (!req.user || !req.user.id) {
    return next();
  }
  
  const tokenFromHeader = req.headers['x-xsrf-token'];
  const storedTokenData = tokenStore.get(req.user.id);
  
  // Validate token exists and matches
  if (!tokenFromHeader || !storedTokenData || tokenFromHeader !== storedTokenData.token) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed'
    });
  }
  
  // Check if token is expired
  if (storedTokenData.expires < Date.now()) {
    tokenStore.delete(req.user.id);
    return res.status(403).json({
      success: false,
      message: 'CSRF token expired'
    });
  }
  
  next();
};