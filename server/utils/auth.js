// ===============================================
// JWT AUTHENTICATION UTILITIES - LINGUALEAP
// ===============================================

import jwt from 'jsonwebtoken';

// ===============================================
// JWT UTILITIES
// ===============================================

export const authUtils = {
  // Generate JWT token
  generateToken: (userId) => {
    return jwt.sign(
      { userId }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  },

  // Verify JWT token
  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('❌ JWT verification failed:', error.message);
      return null;
    }
  },

  // Extract token from Authorization header
  extractTokenFromHeader: (authHeader) => {
    if (!authHeader) return null;
    
    // Format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  },

  // Get user from request headers
  getUserFromRequest: async (request, db) => {
    try {
      const authHeader = request.headers.get('authorization');
      const token = authUtils.extractTokenFromHeader(authHeader);
      
      if (!token) {
        return null;
      }
      
      const decoded = authUtils.verifyToken(token);
      if (!decoded || !decoded.userId) {
        return null;
      }
      
      // Get user from database
      const user = await db.users.findById(decoded.userId);
      if (!user || !user.isActive) {
        return null;
      }
      
      return { userId: decoded.userId, ...user };
    } catch (error) {
      console.error('❌ Error getting user from request:', error.message);
      return null;
    }
  }
};