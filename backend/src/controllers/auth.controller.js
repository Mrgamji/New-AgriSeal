// backend/src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import db from '../utils/db.js';
import { generateToken } from '../middleware/auth.middleware.js';

/**
 * User Registration
 */
export const register = async (req, res) => {
  try {
    const { name, email, password_hash } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password_hash, salt);
    
    // Create user with 1 free credit
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, credits, created_at) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 1, new Date().toISOString()]
    );
    
    const userId = result.lastID;
    
    // Get created user
    const user = await db.get(
      'SELECT id, email, name, credits, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Set token in cookie (optional)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to AgriSeal AI.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle database constraint errors
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
};

/**
 * User Login
 */
export const login = async (req, res) => {
  try {
    const { email, password_hash } = req.body;
    
    // Find user with password_hash
    const user = await db.get(
      'SELECT id, email, name, password_hash, credits, created_at FROM users WHERE email = ?',
      [email]
    );
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password_hash, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      credits: user.credits
    });
    
    // Set token in cookie (optional)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Remove password from response
    delete user.password_hash;
    
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
};

/**
 * Get Current User Profile
 */
export const getProfile = async (req, res) => {
  try {
    // Get fresh user data from database
    const user = await db.get(
      'SELECT id, email, name, credits, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};

/**
 * Update User Profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    
    await db.run(
      'UPDATE users SET name = ?, updated_at = ? WHERE id = ?',
      [name, new Date().toISOString(), req.user.id]
    );
    
    // Get updated user
    const user = await db.get(
      'SELECT id, email, name, credits, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

/**
 * Add Credits to User Account
 */
export const addCredits = async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0 || amount > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Credit amount must be between 1 and 1000'
      });
    }
    
    await db.run(
      'UPDATE users SET credits = credits + ?, updated_at = ? WHERE id = ?',
      [amount, new Date().toISOString(), req.user.id]
    );
    
    // Get updated user
    const user = await db.get(
      'SELECT id, email, name, credits FROM users WHERE id = ?',
      [req.user.id]
    );
    
    // Log credit transaction
    await db.run(
      'INSERT INTO credit_transactions (user_id, amount, type, created_at) VALUES (?, ?, ?, ?)',
      [req.user.id, amount, 'purchase', new Date().toISOString()]
    );
    
    res.json({
      success: true,
      message: `Successfully added ${amount} credits`,
      credits: user.credits
    });
    
  } catch (error) {
    console.error('Add credits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add credits'
    });
  }
};

/**
 * Firebase Authentication
 * Handles Google, Apple, and other OAuth providers via Firebase
 */
export const firebaseAuth = async (req, res) => {
  try {
    const { idToken, provider } = req.body;
    
    if (!idToken || !provider) {
      return res.status(400).json({
        success: false,
        error: 'ID token and provider are required'
      });
    }

    console.log(`[firebaseAuth] Processing ${provider} authentication`);
    
    // Extract user info from Firebase ID token
    let email, name, picture, uid;
    
    try {
      // Decode JWT token to get user info (without verification for now)
      // In production, use Firebase Admin SDK: const decodedToken = await admin.auth().verifyIdToken(idToken);
      const tokenParts = idToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        email = payload.email || payload.email_address;
        name = payload.name || payload.display_name || (email ? email.split('@')[0] : null);
        picture = payload.picture || payload.photo_url || null;
        uid = payload.user_id || payload.sub || payload.uid || null;
      }
      
      // Fallback if token parsing fails (for testing)
      if (!email) {
        console.warn('[firebaseAuth] Could not decode token, using fallback');
        email = `${provider}_user_${Date.now()}@agriseal.local`;
        name = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
        uid = `firebase_${provider}_${Date.now()}`;
      }
    } catch (decodeError) {
      console.error('[firebaseAuth] Token decode error:', decodeError);
      return res.status(400).json({
        success: false,
        error: 'Invalid ID token format'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract email from token'
      });
    }

    // Normalize email to lowercase
    email = email.toLowerCase().trim();
    
    // Generate default password hash for Firebase users ("123456" hashed with bcrypt)
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('123456', salt);
    
    console.log(`[firebaseAuth] Checking for existing user with email: ${email}`);
    
    // Check if user already exists by email (prevent duplicates)
    let user = await db.get(
      'SELECT id, email, name, credits, auth_provider FROM users WHERE email = ?',
      [email]
    );
    
    if (user) {
      console.log(`[firebaseAuth] User found: ${user.email} (ID: ${user.id})`);
      
      // Ensure password_hash is set (update if NULL or missing)
      try {
        const userCheck = await db.get('SELECT password_hash FROM users WHERE id = ?', [user.id]);
        if (!userCheck || !userCheck.password_hash) {
          console.log(`[firebaseAuth] Setting default password hash for existing user`);
          await db.run(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [defaultPasswordHash, user.id]
          );
        }
      } catch (updateError) {
        // Column might not exist, try to update with all fields
        console.log(`[firebaseAuth] Updating user with Firebase info (column check)`);
        try {
          // Try updating with optional columns if they exist
          await db.run(
            'UPDATE users SET auth_provider = ?, updated_at = ?, password_hash = ? WHERE id = ?',
            [provider, new Date().toISOString(), defaultPasswordHash, user.id]
          );
        } catch (err) {
          // If columns don't exist, just update password_hash
          await db.run(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [defaultPasswordHash, user.id]
          );
        }
      }
    } else {
      // Create new user with default password hash
      console.log(`[firebaseAuth] Creating new user: ${email}`);
      
      try {
        // Try inserting with all columns (including optional Firebase columns)
        const result = await db.run(
          `INSERT INTO users (
            email, 
            name, 
            password_hash, 
            credits, 
            auth_provider,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            email,
            name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
            defaultPasswordHash, // Default password hash for Firebase users
            1, // Welcome credit
            provider,
            new Date().toISOString()
          ]
        );
        
        user = await db.get(
          'SELECT id, email, name, credits FROM users WHERE id = ?',
          [result.lastID]
        );
        
        console.log(`[firebaseAuth] ✅ New user created: ${user.email} (ID: ${user.id})`);
      } catch (insertError) {
        console.error('[firebaseAuth] Insert error:', insertError);
        // If insert fails due to missing columns, try with minimal columns
        if (insertError.message.includes('no such column')) {
          const result = await db.run(
            `INSERT INTO users (
              email, 
              name, 
              password_hash, 
              credits,
              created_at
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              email,
              name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
              defaultPasswordHash,
              1,
              new Date().toISOString()
            ]
          );
          
          user = await db.get(
            'SELECT id, email, name, credits FROM users WHERE id = ?',
            [result.lastID]
          );
        } else {
          throw insertError;
        }
      }
    }
    
    if (!user) {
      throw new Error('Failed to create or retrieve user');
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      credits: user.credits
    });
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({
      success: true,
      message: `${provider} authentication successful`,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('[firebaseAuth] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Firebase authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get Available Auth Providers
 */
export const getAuthProviders = async (req, res) => {
  try {
    const providers = [
      { id: 'email', name: 'Email', icon: 'mail', available: true },
      { id: 'google', name: 'Google', icon: 'chrome', available: true },
      { id: 'apple', name: 'Apple', icon: 'apple', available: false } // Disable for now
    ];
    
    res.json({
      success: true,
      providers
    });
    
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch auth providers'
    });
  }
};

/**
 * Check Authentication Status
 */
export const checkAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({
        success: true,
        authenticated: false
      });
    }
    
    res.json({
      success: true,
      authenticated: true,
      user: req.user
    });
    
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check authentication'
    });
  }
};

/**
 * Logout User
 */
export const logout = async (req, res) => {
  try {
    // Clear token cookie
    res.clearCookie('token');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  addCredits,
  firebaseAuth,
  getAuthProviders,
  checkAuth,
  logout
};