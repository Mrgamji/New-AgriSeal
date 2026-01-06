// backend/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * JWT Authentication Middleware
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    
    // Also check cookies for token
    const tokenFromCookie = req.cookies?.token;
    
    if (!authHeader && !tokenFromCookie) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const token = authHeader ? authHeader.split(' ')[1] : tokenFromCookie;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists in database
    const user = await db.get('SELECT id, email, name, credits FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    credits: user.credits || 0
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Check if user has enough credits
 */
export const checkCredits = (requiredCredits = 1) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Get current user credits from database
    const user = await db.get('SELECT credits FROM users WHERE id = ?', [req.user.id]);
    
    if (!user || user.credits < requiredCredits) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        creditsNeeded: requiredCredits,
        creditsAvailable: user ? user.credits : 0,
        message: 'Please purchase more credits to continue'
      });
    }
    
    next();
  };
};

/**
 * Registration validation middleware
 */
export const validateRegistration = async (req, res, next) => {
  try {
    const { name, email, password_hash } = req.body;
    
    const errors = [];
    
    // Name validation
    if (!name || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    if (name && name.trim().length > 50) {
      errors.push('Name cannot exceed 50 characters');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errors.push('Valid email is required');
    }
    
    // Password validation
    if (!password_hash || password_hash.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (password_hash && password_hash.length > 100) {
      errors.push('Password cannot exceed 100 characters');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }
    
    // Check if email already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    // Clean and attach data to request
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    
    next();
  } catch (error) {
    console.error('Registration validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Validation failed'
    });
  }
};

/**
 * Login validation middleware
 */
export const validateLogin = async (req, res, next) => {
  try {
    const { email, password_hash } = req.body;
    
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    if (!password_hash) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }
    
    // Clean email
    req.body.email = email.trim().toLowerCase();
    
    // Check if user exists
    const user = await db.get('SELECT id FROM users WHERE email = ?', [req.body.email]);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    next();
  } catch (error) {
    console.error('Login validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Validation failed'
    });
  }
};

/**
 * Rate limiting middleware (optional but recommended)
 */
export const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const userRequests = requests.get(ip);
    
    // Remove old requests
    while (userRequests.length > 0 && userRequests[0] < now - windowMs) {
      userRequests.shift();
    }
    
    // Check if exceeded limit
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.'
      });
    }
    
    // Add current request
    userRequests.push(now);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [key, value] of requests.entries()) {
        if (value.length === 0) {
          requests.delete(key);
        }
      }
    }
    
    next();
  };
};