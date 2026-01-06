// backend/src/routes/firebase.routes.js
import express from 'express';
import { firebaseAuth, linkFirebaseAccount } from '../controllers/firebase-auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/firebase
 * @desc    Authenticate with Firebase (Google/Apple)
 * @access  Public
 * @body    idToken: Firebase ID token (required)
 */
router.post('/firebase', firebaseAuth);

/**
 * @route   POST /api/auth/firebase/link
 * @desc    Link Firebase account to existing email account
 * @access  Private
 * @body    idToken: Firebase ID token (required)
 */
router.post('/firebase/link', authenticate, linkFirebaseAccount);

/**
 * @route   GET /api/auth/providers
 * @desc    Get available authentication providers
 * @access  Public
 */
router.get('/providers', (req, res) => {
  res.json({
    success: true,
    providers: [
      { id: 'email', name: 'Email', icon: 'mail' },
      { id: 'google', name: 'Google', icon: 'chrome' },
      { id: 'apple', name: 'Apple', icon: 'smartphone' }
    ]
  });
});

export default router;