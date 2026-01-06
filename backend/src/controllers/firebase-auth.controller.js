// src/controllers/firebase-auth.controller.js
import admin from '../utils/firebase-admin.js';
import db from '../utils/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Set the default password hash for all firebase users ("123456" hashed with bcrypt)
const DEFAULT_FIREBASE_PASSWORD_HASH =
  '$2b$10$7RQvpDMAYA9Yg3.aCBXlIuSNYGGyRyvE4s46HoPazTA/gkGEXUXMa'; // bcrypt hash of "123456"

export const firebaseAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify Firebase token with REAL Firebase Admin SDK
    let firebaseUser;
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        picture: decodedToken.picture || null
      };
      console.log('✅ Firebase user authenticated:', firebaseUser);
    } catch (firebaseError) {
      console.error('Firebase token verification error:', firebaseError);

      // For development/testing only - fallback to mock if no real Firebase setup
      if (process.env.NODE_ENV === 'development' && idToken === 'mock-firebase-token') {
        console.log('🔐 [DEV] Using mock token for testing');
        firebaseUser = {
          uid: 'mock-uid-123',
          email: 'test@example.com',
          name: 'Test User',
          picture: null
        };
      } else {
        return res.status(401).json({
          error: 'Invalid Firebase token',
          details: firebaseError.message
        });
      }
    }

    // Check if user exists by firebase_uid or email
    let user = await db.get(
      'SELECT * FROM users WHERE firebase_uid = ? OR email = ?',
      [firebaseUser.uid, firebaseUser.email]
    );

    if (!user) {
      // Create new user
      console.log('Creating new Firebase user...');
      const result = await db.run(
        `INSERT INTO users (
          email, 
          name, 
          firebase_uid, 
          profile_picture, 
          auth_provider, 
          password_hash,
          credits,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          firebaseUser.email,
          firebaseUser.name,
          firebaseUser.uid,
          firebaseUser.picture,
          'firebase',
          DEFAULT_FIREBASE_PASSWORD_HASH, // Set default password hash for Firebase users
          5 // Initial credits
        ]
      );

      user = await db.get('SELECT * FROM users WHERE id = ?', [result.id]);
      console.log('✅ New user created:', { id: user.id, email: user.email });
    } else if (!user.firebase_uid) {
      // Update existing user with firebase_uid
      console.log('Updating existing user with Firebase UID...');
      await db.run(
        'UPDATE users SET firebase_uid = ?, auth_provider = ?, updated_at = datetime("now"), password_hash = ? WHERE id = ?',
        [firebaseUser.uid, 'firebase', DEFAULT_FIREBASE_PASSWORD_HASH, user.id]
      );
      user.firebase_uid = firebaseUser.uid;
      user.auth_provider = 'firebase';
      user.password_hash = DEFAULT_FIREBASE_PASSWORD_HASH;
    }

    if (!user) {
      throw new Error('Failed to create or retrieve user');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        auth_provider: user.auth_provider
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profile_picture,
        credits: user.credits,
        authProvider: user.auth_provider
      }
    });

  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      details: error.message
    });
  }
};
// Add this to your firebase-auth.controller.js
export const linkFirebaseAccount = async (req, res) => {
  try {
    const { idToken } = req.body;
    const userId = req.user?.id; // Assuming user is authenticated via JWT

    if (!idToken) {
      return res.status(400).json({ error: 'Token is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify Firebase token
    let firebaseUser;
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
    } catch (firebaseError) {
      return res.status(401).json({ error: 'Invalid Firebase token' });
    }

    // Check if Firebase UID is already linked to another account
    const existingUser = await db.get(
      'SELECT * FROM users WHERE firebase_uid = ? AND id != ?',
      [firebaseUser.uid, userId]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Firebase account already linked to another user' });
    }

    // Link Firebase to existing user and set default password hash
    await db.run(
      'UPDATE users SET firebase_uid = ?, auth_provider = "firebase", updated_at = datetime("now"), password_hash = ? WHERE id = ?',
      [firebaseUser.uid, DEFAULT_FIREBASE_PASSWORD_HASH, userId]
    );

    res.json({
      success: true,
      message: 'Firebase account linked successfully',
      firebaseUid: firebaseUser.uid
    });

  } catch (error) {
    console.error('Link Firebase error:', error);
    res.status(500).json({ error: 'Failed to link Firebase account' });
  }
};