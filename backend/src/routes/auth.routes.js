// backend/src/routes/auth.routes.js
import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  addCredits,
  firebaseAuth,
  getAuthProviders,
  checkAuth,
  logout
} from '../controllers/auth.controller.js';
import { 
  authenticate, 
  validateRegistration, 
  validateLogin,
  rateLimit 
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply rate limiting to auth routes
router.use(rateLimit());

// Public routes
router.get('/providers', getAuthProviders);
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/firebase', firebaseAuth);
router.get('/check', checkAuth);

// Protected routes (require authentication)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/credits', authenticate, addCredits);
router.post('/logout', authenticate, logout);

// Additional utility routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Password reset routes (to implement later)
router.post('/forgot-password', (req, res) => {
  res.json({
    success: true,
    message: 'Password reset feature coming soon'
  });
});

export default router;