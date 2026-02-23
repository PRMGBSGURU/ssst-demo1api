/**
 * Shared configuration and constants for the entire application
 * This ensures all modules use the same JWT_SECRET
 */

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

module.exports = {
  SECRET_KEY,
  JWT_CONFIG: {
    expiresIn: '1h'
  },
  INACTIVITY_TIMEOUT: 15 * 60 * 1000, // 15 minutes
};
