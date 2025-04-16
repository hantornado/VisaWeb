const mongoose = require('mongoose');
const crypto = require('crypto');

// MongoDB connection with encryption options
const connectDB = async () => {
  try {
    // Configure mongoose to use encryption for sensitive data
    mongoose.plugin(require('mongoose-encryption'), {
      encryptionKey: process.env.ENCRYPTION_KEY || crypto.randomBytes(32),
      signingKey: process.env.SIGNING_KEY || crypto.randomBytes(64),
      encryptedFields: ['contactEmail', 'contactPhone', 'passportNumber', 'dateOfBirth'],
      additionalAuthenticatedFields: ['fullName', 'nationality']
    });

    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/visa-status-checker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: process.env.NODE_ENV === 'production',
      sslValidate: process.env.NODE_ENV === 'production',
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;