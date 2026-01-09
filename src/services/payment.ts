// src/services/payment.ts
const BACKEND_URL ='https://new-agriseal.onrender.com';

export interface PricingTier {
  id: string;
  name: string;
  quantity: number;
  pricePerCredit: number;
  totalPrice: number;
  savings: number;
}

export interface PaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
  amount: number;
  quantity: number;
  transactionId: number;
}

export interface Transaction {
  id: number;
  quantity: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transaction_ref: string;
  paystack_reference: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get pricing tiers
 */
export const getPricing = async (): Promise<PricingTier[]> => {
  const response = await fetch(`${BACKEND_URL}/api/payment/pricing`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch pricing');
  }
  
  return data.data;
};

/**
 * Initialize payment with Paystack
 */
export const initializePayment = async (quantity: number): Promise<PaymentResponse> => {
  const token = localStorage.getItem('agriseal_token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${BACKEND_URL}/api/payment/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ quantity })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to initialize payment');
  }

  return data.data;
};

/**
 * Verify payment
 */
export const verifyPayment = async (reference: string): Promise<any> => {
  const response = await fetch(`${BACKEND_URL}/api/payment/verify?reference=${reference}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Payment verification failed');
  }

  return data.data;
};

/**
 * Get user transactions
 */
export const getTransactions = async (): Promise<Transaction[]> => {
  const token = localStorage.getItem('agriseal_token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${BACKEND_URL}/api/payment/transactions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch transactions');
  }

  return data.data;
};

/**
 * Calculate price for custom quantity
 */
export const calculatePrice = async (quantity: number): Promise<{
  quantity: number;
  pricePerCredit: number;
  totalPrice: number;
  savings: number;
  savingsAmount: number;
}> => {
  const response = await fetch(`${BACKEND_URL}/api/payment/calculate-price?quantity=${quantity}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to calculate price');
  }

  return data.data;
};

