const mongoose = require('mongoose');
const crypto = require('crypto');

// Function to encrypt sensitive data
const encrypt = (text) => {
  if (!text) return text;
  if (!process.env.ENCRYPTION_KEY) {
    console.warn('ENCRYPTION_KEY not set. Data will not be encrypted.');
    return text;
  }
  
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
};

// Function to decrypt sensitive data
const decrypt = (text) => {
  if (!text) return text;
  if (!process.env.ENCRYPTION_KEY) {
    console.warn('ENCRYPTION_KEY not set. Cannot decrypt data.');
    return text;
  }
  
  try {
    const [ivHex, encryptedText] = text.split(':');
    if (!ivHex || !encryptedText) return text;
    
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return text;
  }
};

const ApplicationSchema = new mongoose.Schema({
  // Reference to the user (passport holder)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Application details
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    set: encrypt,
    get: decrypt
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required']
  },
  passportNumber: {
    type: String,
    required: [true, 'Passport number is required'],
    set: encrypt,
    get: decrypt
  },
  passportIssueDate: {
    type: String,
    required: [true, 'Passport issue date is required'],
    set: encrypt,
    get: decrypt
  },
  passportExpiryDate: {
    type: String,
    required: [true, 'Passport expiry date is required'],
    set: encrypt,
    get: decrypt
  },
  dateOfBirth: {
    type: String, // Store as encrypted string
    required: [true, 'Date of birth is required'],
    set: encrypt,
    get: decrypt
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required']
  },
  // Address information
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    set: encrypt,
    get: decrypt
  },
  addressLine2: {
    type: String,
    set: encrypt,
    get: decrypt
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    set: encrypt,
    get: decrypt
  },
  state: {
    type: String,
    set: encrypt,
    get: decrypt
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    set: encrypt,
    get: decrypt
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
  // Visa information
  visaType: {
    type: String,
    required: [true, 'Visa type is required'],
    enum: ['Tourist', 'Business', 'Student', 'Work', 'Family', 'Other']
  },
  purposeOfVisit: {
    type: String,
    required: [true, 'Purpose of visit is required']
  },
  plannedArrivalDate: {
    type: String,
    required: [true, 'Planned arrival date is required'],
    set: encrypt,
    get: decrypt
  },
  plannedDepartureDate: {
    type: String,
    required: [true, 'Planned departure date is required'],
    set: encrypt,
    get: decrypt
  },
  previousVisits: {
    type: Boolean,
    default: false
  },
  previousVisitDetails: {
    type: String,
    set: encrypt,
    get: decrypt
  },
  // Application status
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Additional Documents Required', 'Approved', 'Rejected', 'On Hold'],
    default: 'Submitted'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Additional Documents Required', 'Approved', 'Rejected', 'On Hold']
    },
    date: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String
    }
  }],
  // Contact information
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    set: encrypt,
    get: decrypt
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    set: encrypt,
    get: decrypt
  },
  // Emergency contact
  emergencyContactName: {
    type: String,
    required: [true, 'Emergency contact name is required'],
    set: encrypt,
    get: decrypt
  },
  emergencyContactPhone: {
    type: String,
    required: [true, 'Emergency contact phone is required'],
    set: encrypt,
    get: decrypt
  },
  emergencyContactRelationship: {
    type: String,
    required: [true, 'Emergency contact relationship is required'],
    set: encrypt,
    get: decrypt
  },
  // Declarations
  healthDeclaration: {
    type: Boolean,
    required: [true, 'Health declaration is required'],
    default: false
  },
  termsAccepted: {
    type: Boolean,
    required: [true, 'Terms acceptance is required'],
    default: false
  },
  uniqueApplicationCode: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true }, // Apply getters when converting to JSON
  toObject: { getters: true } // Apply getters when converting to object
});

// Generate a unique application code before saving
ApplicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate a random 10-character alphanumeric code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    // Ensure the code is unique
    let isUnique = false;
    let code;
    
    while (!isUnique) {
      code = generateCode();
      // Check if code already exists
      const existingApp = await this.constructor.findOne({ uniqueApplicationCode: code });
      if (!existingApp) {
        isUnique = true;
      }
    }
    
    this.uniqueApplicationCode = code;
  }
  next();
});

// Add status change to history
ApplicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      date: new Date(),
      // updatedBy will be set when status is updated through the admin panel
    });
  }
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);