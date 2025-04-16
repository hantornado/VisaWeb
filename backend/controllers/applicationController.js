const Application = require('../models/Application');
const User = require('../models/User');
const { generateUniqueCode } = require('../utils/codeGenerator');
const mongoose = require('mongoose');

/**
 * @desc    Get all applications (for admin)
 * @route   GET /api/applications/admin/all
 * @access  Private (Admin only)
 */
exports.getAllApplications = async (req, res) => {
  try {
    // Extract query parameters for filtering and pagination
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Add status filter if provided
    if (status) {
      filter['statusHistory.0.status'] = status;
    }
    
    // Add search filter if provided (search by name, passport number, or application code)
    if (search) {
      filter['$or'] = [
        { fullName: { $regex: search, $options: 'i' } },
        { passportNumber: { $regex: search, $options: 'i' } },
        { uniqueApplicationCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get applications with pagination and filtering
    const applications = await Application.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'passportNumber');
    
    // Get total count for pagination
    const total = await Application.countDocuments(filter);
    
    // Calculate statistics
    const stats = {
      total: await Application.countDocuments(),
      approved: await Application.countDocuments({ 'statusHistory.0.status': 'Approved' }),
      rejected: await Application.countDocuments({ 'statusHistory.0.status': 'Rejected' }),
      pending: await Application.countDocuments({
        'statusHistory.0.status': { $nin: ['Approved', 'Rejected'] }
      })
    };
    
    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      applications,
      stats
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Submit a new visa application
 * @route   POST /api/applications
 * @access  Public
 */
exports.submitApplication = async (req, res) => {
  try {
    const { 
      fullName, passportNumber, dateOfBirth, nationality, gender,
      passportIssueDate, passportExpiryDate,
      addressLine1, addressLine2, city, state, postalCode, country,
      visaType, purposeOfVisit, plannedArrivalDate, plannedDepartureDate,
      previousVisits, previousVisitDetails,
      contactEmail, contactPhone,
      emergencyContactName, emergencyContactPhone, emergencyContactRelationship,
      healthDeclaration, termsAccepted
    } = req.body;

    // Validate required fields
    if (!fullName || !passportNumber || !dateOfBirth || !nationality || !gender ||
        !passportIssueDate || !passportExpiryDate ||
        !addressLine1 || !city || !postalCode || !country ||
        !visaType || !purposeOfVisit || !plannedArrivalDate || !plannedDepartureDate ||
        !contactEmail || !contactPhone ||
        !emergencyContactName || !emergencyContactPhone || !emergencyContactRelationship ||
        !healthDeclaration || !termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Generate a unique code for the user
    const uniqueCode = generateUniqueCode();

    // Check if user with this passport number already exists
    let user = await User.findOne({ passportNumber });

    // If user doesn't exist, create a new one
    if (!user) {
      user = await User.create({
        passportNumber,
        uniqueCode,
        role: 'user',
      });
    }

    // Create a new application
    const application = await Application.create({
      user: user._id,
      fullName,
      passportNumber,
      dateOfBirth,
      nationality,
      visaType,
      contactEmail,
      contactPhone,
      uniqueApplicationCode: generateUniqueCode(12), // Generate a unique application code
      statusHistory: [
        {
          status: 'Submitted',
          date: Date.now(),
          notes: 'Application submitted successfully',
        },
      ],
    });

    // Return success response with the unique code
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      uniqueCode,
      applicationId: application._id,
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all applications (for admin)
 * @route   GET /api/applications/admin/all
 * @access  Private (Admin only)
 */
exports.getAllApplications = async (req, res) => {
  try {
    // Extract query parameters for filtering and pagination
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Add status filter if provided
    if (status) {
      filter['statusHistory.0.status'] = status;
    }
    
    // Add search filter if provided (search by name, passport number, or application code)
    if (search) {
      filter['$or'] = [
        { fullName: { $regex: search, $options: 'i' } },
        { passportNumber: { $regex: search, $options: 'i' } },
        { uniqueApplicationCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get applications with pagination and filtering
    const applications = await Application.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'passportNumber');
    
    // Get total count for pagination
    const total = await Application.countDocuments(filter);
    
    // Calculate statistics
    const stats = {
      total: await Application.countDocuments(),
      approved: await Application.countDocuments({ 'statusHistory.0.status': 'Approved' }),
      rejected: await Application.countDocuments({ 'statusHistory.0.status': 'Rejected' }),
      pending: await Application.countDocuments({
        'statusHistory.0.status': { $nin: ['Approved', 'Rejected'] }
      })
    };
    
    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      applications,
      stats
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update application status (admin only)
 * @route   PUT /api/applications/:id/status
 * @access  Private (Admin only)
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Check if application exists
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Add new status to history (at the beginning of the array)
    application.statusHistory.unshift({
      status,
      date: Date.now(),
      notes: notes || `Status updated to ${status}`,
      updatedBy: req.user._id
    });
    
    // Save the updated application
    await application.save();
    
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get application status by ID
 * @route   GET /api/applications/:id
 * @access  Private (User)
 */
exports.getApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    // Check if application exists
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check if the user is authorized to view this application
    if (application.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application',
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error fetching application status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all applications (for admin)
 * @route   GET /api/applications/admin/all
 * @access  Private (Admin only)
 */
exports.getAllApplications = async (req, res) => {
  try {
    // Extract query parameters for filtering and pagination
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Add status filter if provided
    if (status) {
      filter['statusHistory.0.status'] = status;
    }
    
    // Add search filter if provided (search by name, passport number, or application code)
    if (search) {
      filter['$or'] = [
        { fullName: { $regex: search, $options: 'i' } },
        { passportNumber: { $regex: search, $options: 'i' } },
        { uniqueApplicationCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get applications with pagination and filtering
    const applications = await Application.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'passportNumber');
    
    // Get total count for pagination
    const total = await Application.countDocuments(filter);
    
    // Calculate statistics
    const stats = {
      total: await Application.countDocuments(),
      approved: await Application.countDocuments({ 'statusHistory.0.status': 'Approved' }),
      rejected: await Application.countDocuments({ 'statusHistory.0.status': 'Rejected' }),
      pending: await Application.countDocuments({
        'statusHistory.0.status': { $nin: ['Approved', 'Rejected'] }
      })
    };
    
    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      applications,
      stats
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update application status (admin only)
 * @route   PUT /api/applications/:id/status
 * @access  Private (Admin only)
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Check if application exists
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Add new status to history (at the beginning of the array)
    application.statusHistory.unshift({
      status,
      date: Date.now(),
      notes: notes || `Status updated to ${status}`,
      updatedBy: req.user._id
    });
    
    // Save the updated application
    await application.save();
    
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all applications for a user
 * @route   GET /api/applications/user
 * @access  Private (User)
 */
exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get application details by ID (admin only)
 * @route   GET /api/applications/admin/:id
 * @access  Private (Admin only)
 */
exports.getApplicationDetails = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'passportNumber');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update application status (for admin)
 * @route   PUT /api/applications/admin/:id/status
 * @access  Private (Admin only)
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    // Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    // Find application by ID
    const application = await Application.findById(id);

    // Check if application exists
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get current status
    const currentStatus = application.statusHistory[0].status;

    // Add new status to history if different from current
    if (currentStatus !== status) {
      // Import notification service
      const notificationService = require('../utils/notificationService');
      
      application.statusHistory.unshift({
        status,
        comments: comments || '',
        updatedBy: req.user.id,
        updatedAt: Date.now()
      });

      await application.save();
      
      // Send notification about status update
      try {
        await notificationService.sendStatusUpdateNotification(
          application,
          currentStatus,
          status
        );
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Continue execution even if notification fails
      }

      res.status(200).json({
        success: true,
        message: 'Application status updated successfully',
        application
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'No status change needed',
        application
      });
    }
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};