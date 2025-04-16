const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  passportNumber: {
    type: String,
    required: function() { return this.role === 'user'; },
    unique: true,
    sparse: true,
    trim: true,
  },
  uniqueCode: {
    type: String,
    required: function() { return this.role === 'user'; },
    select: false, // Don't return unique code in queries by default
  },
  // Admin fields
  username: {
    type: String,
    required: function() { return this.role === 'admin'; },
    unique: true,
    sparse: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() { return this.role === 'admin'; },
    select: false, // Don't return password in queries by default
    minlength: 8
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: true
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash the unique code or password before saving
UserSchema.pre('save', async function(next) {
  try {
    // For user role: hash uniqueCode if modified
    if (this.role === 'user' && this.isModified('uniqueCode')) {
      const salt = await bcrypt.genSalt(10);
      this.uniqueCode = await bcrypt.hash(this.uniqueCode, salt);
    }
    
    // For admin role: hash password if modified
    if (this.role === 'admin' && this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare uniqueCode for login
UserSchema.methods.compareUniqueCode = async function(candidateCode) {
  return await bcrypt.compare(candidateCode, this.uniqueCode);
};

// Method to handle failed login attempts
UserSchema.methods.incrementLoginAttempts = async function() {
  // If lockUntil is set and it's greater than the current time
  if (this.lockUntil && this.lockUntil > Date.now()) {
    return this.save();
  }
  
  // Increment login attempts
  this.loginAttempts += 1;
  
  // Lock the account if attempts exceed threshold (from .env)
  const maxAttempts = process.env.LOCKOUT_ATTEMPTS || 5;
  const lockTime = process.env.LOCKOUT_TIME || 30; // minutes
  
  if (this.loginAttempts >= maxAttempts) {
    this.lockUntil = new Date(Date.now() + lockTime * 60 * 1000);
  }
  
  return this.save();
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);