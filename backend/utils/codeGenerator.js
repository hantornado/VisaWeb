const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * Generates a secure, random unique code for visa applications
 * @param {number} length - Length of the code to generate (default: 10)
 * @returns {string} - The generated unique code
 */
const generateUniqueCode = (length = 10) => {
  // Define character set for the unique code (excluding similar looking characters)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed I, O, 0, 1 to avoid confusion
  
  // Generate cryptographically secure random bytes
  const randomBytes = crypto.randomBytes(length);
  
  // Convert random bytes to characters from our set
  let code = '';
  for (let i = 0; i < length; i++) {
    // Use modulo to map the random byte to our character set
    const randomIndex = randomBytes[i] % chars.length;
    code += chars[randomIndex];
  }
  
  return code;
};

/**
 * Hashes a unique code for secure storage
 * @param {string} code - The unique code to hash
 * @returns {Promise<string>} - The hashed code
 */
const hashUniqueCode = async (code) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(code, salt);
};

/**
 * Verifies if a provided code matches the hashed code
 * @param {string} providedCode - The code provided by the user
 * @param {string} hashedCode - The hashed code from the database
 * @returns {Promise<boolean>} - True if the codes match, false otherwise
 */
const verifyUniqueCode = async (providedCode, hashedCode) => {
  return await bcrypt.compare(providedCode, hashedCode);
};

module.exports = {
  generateUniqueCode,
  hashUniqueCode,
  verifyUniqueCode
};