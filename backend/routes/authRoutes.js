const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { login, logout, getMe, adminLogin } = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/admin/login', adminLogin);

// Protected routes - require authentication
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;