// backend/src/controllers/payment.controller.js
import db from '../utils/db.js';
import axios from 'axios';

const PAYSTACK_SECRET_KEY = (process.env.PAYSTACK_SECRET_KEY || '').trim();
const PAYSTACK_PUBLIC_KEY = (process.env.PAYSTACK_PUBLIC_KEY || '').trim();

/**
 * Calculate price based on quantity
 * N100 per token, N80 for 1000+, N50 for 10000+
 */
const calculatePrice = (quantity) => {
  if (quantity >= 10000) {
    return quantity * 50;
  } else if (quantity >= 1000) {
    return quantity * 80;
  } else {
    return quantity * 100;
  }
};

/**
 * Get pricing tiers
 */
export const getPricing = async (req, res) => {
  try {
    const tiers = [
      {
        id: 'single',
        name: 'Single Credit',
        quantity: 1,
        pricePerCredit: 100,
        totalPrice: 100,
        savings: 0
      },
      {
        id: 'bulk',
        name: 'Bulk Purchase (1000+)',
        quantity: 1000,
        pricePerCredit: 80,
        totalPrice: 80000,
        savings: 20
      },
      {
        id: 'enterprise',
        name: 'Enterprise (10000+)',
        quantity: 10000,
        pricePerCredit: 50,
        totalPrice: 500000,
        savings: 50
      }
    ];

    res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing'
    });
  }
};

/**
 * Initialize Paystack payment
 */
export const initializePayment = async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === '') {
      console.error('❌ [Payment] PAYSTACK_SECRET_KEY is not configured');
      return res.status(500).json({
        success: false,
        error: 'Payment service is not configured. Please contact support.'
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity. Minimum is 1 credit.'
      });
    }

    // Calculate price
    const amount = calculatePrice(quantity);

    // Get user email
    const user = await db.get('SELECT email, name FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Create transaction record
    const transactionRef = `TXN_${Date.now()}_${userId}`;
    const result = await db.run(
      `INSERT INTO transactions (user_id, quantity, amount, status, transaction_ref, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, quantity, amount, 'pending', transactionRef, new Date().toISOString()]
    );

    const transactionId = result.lastID;

    // Initialize Paystack payment
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: amount * 100, // Convert to kobo
        reference: transactionRef,
        metadata: {
          userId,
          transactionId,
          quantity,
          custom_fields: [
            {
              display_name: 'Credits',
              variable_name: 'credits',
              value: quantity
            }
          ]
        },
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback`
      },
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!paystackResponse.data || !paystackResponse.data.data) {
      console.error('❌ [Payment] Invalid Paystack response:', paystackResponse.data);
      return res.status(500).json({
        success: false,
        error: paystackResponse.data?.message || 'Failed to initialize payment. Please try again.'
      });
    }

    const { authorization_url, access_code, reference } = paystackResponse.data.data;

    // Update transaction with Paystack reference
    await db.run(
      'UPDATE transactions SET paystack_reference = ? WHERE id = ?',
      [reference, transactionId]
    );

    console.log(`✅ [Payment] Initialized payment for user ${userId}: ${quantity} credits = ₦${amount}`);

    res.json({
      success: true,
      data: {
        authorization_url,
        access_code,
        reference,
        amount,
        quantity,
        transactionId
      }
    });
  } catch (error) {
    console.error('Initialize payment error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Failed to initialize payment'
    });
  }
};

/**
 * Verify Paystack payment callback
 */
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required'
      });
    }

    if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === '') {
      console.error('❌ [Payment] PAYSTACK_SECRET_KEY is not configured');
      return res.status(500).json({
        success: false,
        error: 'Payment service is not configured. Please contact support.'
      });
    }

    // Verify with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { status, amount, metadata, customer } = paystackResponse.data.data;

    if (status !== 'success') {
      return res.status(400).json({
        success: false,
        error: 'Payment not successful'
      });
    }

    // Get transaction
    const transaction = await db.get(
      'SELECT * FROM transactions WHERE paystack_reference = ?',
      [reference]
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already processed',
        data: transaction
      });
    }

    // Update transaction status
    await db.run(
      `UPDATE transactions SET status = ?, updated_at = ? WHERE id = ?`,
      ['completed', new Date().toISOString(), transaction.id]
    );

    // Add credits to user account
    await db.run(
      'UPDATE users SET credits = credits + ? WHERE id = ?',
      [transaction.quantity, transaction.user_id]
    );

    // Get updated user
    const user = await db.get(
      'SELECT id, email, name, credits FROM users WHERE id = ?',
      [transaction.user_id]
    );

    console.log(`✅ [Payment] Payment verified: ${transaction.quantity} credits added to user ${transaction.user_id}`);

    res.json({
      success: true,
      message: 'Payment verified and credits added',
      data: {
        transaction,
        user
      }
    });
  } catch (error) {
    console.error('❌ [Payment] Verify payment error:', error.response?.data || error.message);
    
    // Handle Paystack API errors specifically
    if (error.response?.data) {
      const paystackError = error.response.data;
      console.error('❌ [Payment] Paystack verification error:', {
        status: paystackError.status,
        message: paystackError.message,
        type: paystackError.type,
        code: paystackError.code
      });
    }

    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Failed to verify payment. Please try again.'
    });
  }
};

/**
 * Get user transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const transactions = await db.all(
      `SELECT id, quantity, amount, status, transaction_ref, paystack_reference, created_at, updated_at 
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 100`,
      [userId]
    );

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
};

/**
 * Calculate price for custom quantity
 */
export const calculateCustomPrice = async (req, res) => {
  try {
    const { quantity } = req.query;

    if (!quantity || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity'
      });
    }

    const qty = parseInt(quantity);
    const amount = calculatePrice(qty);
    const pricePerCredit = amount / qty;
    const savings = qty >= 10000 ? 50 : qty >= 1000 ? 20 : 0;

    res.json({
      success: true,
      data: {
        quantity: qty,
        pricePerCredit,
        totalPrice: amount,
        savings,
        savingsAmount: savings > 0 ? (qty * 100) - amount : 0
      }
    });
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate price'
    });
  }
};

