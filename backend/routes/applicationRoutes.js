const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitApplication,
  getApplicationStatus,
  getUserApplications,
  getAllApplications,
  updateApplicationStatus,
  getApplicationDetails
} = require('../controllers/applicationController');

// Public route for submitting applications
router.post('/', submitApplication);

// Protected routes - require authentication
router.get('/:id', protect, getApplicationStatus);
router.get('/user', protect, getUserApplications);

// Admin routes - require admin role
router.get('/admin/all', protect, authorize('admin'), getAllApplications);
router.get('/admin/:id', protect, authorize('admin'), getApplicationDetails);
router.put('/admin/:id/status', protect, authorize('admin'), updateApplicationStatus);

module.exports = router;