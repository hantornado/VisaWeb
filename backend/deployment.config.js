/**
 * Deployment Configuration
 * This file contains configuration for deploying the backend to various environments
 */

const deploymentConfig = {
  // Development environment (local)
  development: {
    server: {
      port: process.env.PORT || 5000,
      host: 'localhost'
    },
    database: {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/visa-status-checker',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    cors: {
      origin: 'http://localhost:3000',
      credentials: true
    },
    security: {
      encryptionKey: process.env.ENCRYPTION_KEY,
      signingKey: process.env.SIGNING_KEY
    }
  },
  
  // Production environment (Render/AWS)
  production: {
    server: {
      port: process.env.PORT || 5000,
      host: '0.0.0.0' // Bind to all network interfaces
    },
    database: {
      uri: process.env.MONGO_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: true,
        sslValidate: true
      }
    },
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    },
    security: {
      encryptionKey: process.env.ENCRYPTION_KEY,
      signingKey: process.env.SIGNING_KEY
    }
  },
  
  // Testing environment
  test: {
    server: {
      port: process.env.TEST_PORT || 5001,
      host: 'localhost'
    },
    database: {
      uri: process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/visa-status-checker-test',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    cors: {
      origin: 'http://localhost:3000',
      credentials: true
    },
    security: {
      encryptionKey: 'test-encryption-key',
      signingKey: 'test-signing-key'
    }
  }
};

// Export configuration based on current environment
const environment = process.env.NODE_ENV || 'development';
module.exports = deploymentConfig[environment] || deploymentConfig.development;