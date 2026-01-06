// backend/src/routes/payment.routes.js
import express from 'express';
import {
  getPricing,
  initializePayment,
  verifyPayment,
  getTransactions,
  calculateCustomPrice
} from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/pricing', getPricing);
router.get('/verify', verifyPayment);
router.get('/calculate-price', calculateCustomPrice);

// Protected routes
router.post('/initialize', authenticate, initializePayment);
router.get('/transactions', authenticate, getTransactions);

export default router;

