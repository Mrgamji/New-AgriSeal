// src/components/PaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Shield, CheckCircle, Lock, Sparkles, TrendingDown } from 'lucide-react';
import { initializePayment, PricingTier, getPricing, calculatePrice } from '../services/payment';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [customQuantity, setCustomQuantity] = useState('');
  const [priceInfo, setPriceInfo] = useState<{ pricePerCredit: number; totalPrice: number; savings: number; savingsAmount: number } | null>(null);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPricing();
      loadPriceInfo(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedQuantity > 0) {
      loadPriceInfo(selectedQuantity);
    }
  }, [selectedQuantity]);

  const loadPricing = async () => {
    try {
      const tiers = await getPricing();
      setPricingTiers(tiers);
    } catch (err: any) {
      console.error('Failed to load pricing:', err);
      showError('Failed to load pricing information. Please refresh the page.');
    }
  };

  const loadPriceInfo = async (quantity: number) => {
    try {
      const info = await calculatePrice(quantity);
      setPriceInfo(info);
    } catch (err: any) {
      console.error('Failed to calculate price:', err);
      showError('Failed to calculate price. Please try again.');
    }
  };

  const handleCustomQuantityChange = (value: string) => {
    setCustomQuantity(value);
    const qty = parseInt(value);
    if (!isNaN(qty) && qty > 0) {
      setSelectedQuantity(qty);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const paymentData = await initializePayment(selectedQuantity);

      // Initialize Paystack Popup
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_...',
        email: user?.email || '',
        amount: paymentData.amount * 100, // Convert to kobo
        ref: paymentData.reference,
        onClose: () => {
          setIsProcessing(false);
          const cancelMsg = 'Payment was cancelled';
          setError(cancelMsg);
          showError(cancelMsg);
        },
        callback: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(
              `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/payment/verify?reference=${response.reference}`
            );
            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Update user credits
              if (verifyData.data.user) {
                updateUser(verifyData.data.user);
              }
              
              setIsSuccess(true);
              showSuccess(`Payment successful! ${selectedQuantity} credit${selectedQuantity > 1 ? 's' : ''} added to your account.`);
              setTimeout(() => {
                onSuccess();
                onClose();
                setIsSuccess(false);
                setSelectedQuantity(1);
                setCustomQuantity('');
              }, 2000);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (err: any) {
            const errorMsg = err.message || 'Payment verification failed';
            setError(errorMsg);
            showError(errorMsg);
            setIsProcessing(false);
          }
        }
      });

      handler.openIframe();
    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMsg = err.message || 'Failed to initialize payment. Please try again.';
      setError(errorMsg);
      showError(errorMsg);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp shadow-2xl">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-emerald-100 sticky top-0 z-10">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isSuccess ? 'Payment Successful! 🎉' : 'Purchase Credits'}
              </h2>
              <p className="text-gray-600 text-sm">
                {isSuccess ? 'Your credits have been added' : 'Choose a package or enter custom amount'}
              </p>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Complete! 🎉
            </h3>
            <p className="text-gray-600 mb-4">
              <span className="font-bold text-green-600">{selectedQuantity} credit{selectedQuantity > 1 ? 's' : ''}</span> have been added to your account
            </p>
            {priceInfo && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 inline-block">
                <div className="text-4xl font-bold text-gray-900 mb-1">₦{priceInfo.totalPrice.toLocaleString()}</div>
                <p className="text-sm text-gray-600">Transaction completed</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Pricing Tiers */}
            {pricingTiers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Popular Packages</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {pricingTiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => {
                        setSelectedQuantity(tier.quantity);
                        setCustomQuantity('');
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedQuantity === tier.quantity
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{tier.name}</div>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ₦{tier.totalPrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {tier.quantity} credits • ₦{tier.pricePerCredit}/credit
                      </div>
                      {tier.savings > 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <TrendingDown className="w-3 h-3" />
                          Save {tier.savings}% ({((tier.quantity * 100) - tier.totalPrice).toLocaleString()}₦)
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Quantity */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Amount</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={customQuantity}
                  onChange={(e) => handleCustomQuantityChange(e.target.value)}
                  placeholder="Enter number of credits"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              {customQuantity && (
                <p className="mt-2 text-sm text-gray-600">
                  Minimum: 1 credit • Bulk discounts apply at 1000+ and 10000+ credits
                </p>
              )}
            </div>

            {/* Price Summary */}
            {priceInfo && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center mb-6 border border-blue-200">
                <div className="text-sm text-blue-700 font-medium mb-1">You are purchasing</div>
                <div className="text-5xl font-bold text-gray-900 mb-2">{selectedQuantity} Credit{selectedQuantity > 1 ? 's' : ''}</div>
                <div className="text-2xl font-bold text-blue-600 mb-2">₦{priceInfo.totalPrice.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mb-2">
                  ₦{priceInfo.pricePerCredit} per credit
                </div>
                {priceInfo.savings > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                      <Sparkles className="w-4 h-4" />
                      <span>You save ₦{priceInfo.savingsAmount.toLocaleString()} ({priceInfo.savings}% discount)</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing || selectedQuantity < 1}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4 inline mr-2" />
                  Pay ₦{priceInfo?.totalPrice.toLocaleString() || '0'} Securely via Paystack
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center text-gray-500">
                <Shield className="w-4 h-4 mr-2" />
                <span className="text-xs">Payments are secured with Paystack. All transactions are encrypted.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
