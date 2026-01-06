// src/pages/BillingsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CreditCard, TrendingDown, Calendar, CheckCircle,
  Clock, XCircle, DollarSign, Package, Sparkles, Receipt, Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from '../components/PaymentModal';
import { getPricing, getTransactions, PricingTier, Transaction } from '../services/payment';
import { useToast } from '../contexts/ToastContext';

const BillingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]); // Reload when user changes

  const loadData = async () => {
    setLoading(true);
    try {
      const [tiers, txs] = await Promise.all([
        getPricing(),
        // Only load transactions if user is logged in
        user ? getTransactions().catch(() => []) : Promise.resolve([])
      ]);
      setPricingTiers(tiers);
      setTransactions(txs);
    } catch (error: any) {
      console.error('Failed to load billing data:', error);
      showError('Failed to load billing information. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Billing & Credits</h1>
                  <p className="text-sm text-gray-600">
                    {user ? 'Manage your account and purchase credits' : 'View pricing and purchase credits'}
                  </p>
                </div>
              </div>
              {user ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">{user.credits || 0} credits</span>
                </div>
              ) : (
                <Link
                  to="/"
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-medium"
                >
                  Sign In to Purchase
                </Link>
              )}
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Pricing & Purchase */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Credits Card - Only show if logged in */}
            {user && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-green-600" />
                    Your Credits
                  </h2>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {user.credits || 0}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">Available analysis credits</div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Purchase More Credits
                  </button>
                </div>
              </div>
            )}

            {/* Welcome Message for Non-Authenticated Users */}
            {!user && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-emerald-100 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started with Credits</h2>
                  <p className="text-gray-600 mb-6">
                    Purchase credits to analyze your agricultural images with our AI-powered disease detection system.
                    Each credit allows you to analyze one set of images.
                  </p>
                  <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Sign In to Purchase Credits
                  </Link>
                </div>
              </div>
            )}

            {/* Pricing Tiers */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-green-600" />
                Credit Packages
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading packages...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`p-5 rounded-xl border-2 ${
                        tier.id === 'enterprise'
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                          : 'border-gray-200 bg-white hover:border-green-300'
                      } transition-all`}
                    >
                      {tier.id === 'enterprise' && (
                        <div className="flex items-center gap-1 mb-2">
                          <Sparkles className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-green-600">BEST VALUE</span>
                        </div>
                      )}
                      <div className="font-bold text-lg text-gray-900 mb-1">{tier.name}</div>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ₦{tier.totalPrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <div>{tier.quantity} credits</div>
                        <div>₦{tier.pricePerCredit} per credit</div>
                      </div>
                      {tier.savings > 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium mb-3">
                          <TrendingDown className="w-3 h-3" />
                          Save {tier.savings}% (₦{((tier.quantity * 100) - tier.totalPrice).toLocaleString()})
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (!user) {
                            // Redirect to home to sign in
                            window.location.href = '/';
                            return;
                          }
                          setShowPaymentModal(true);
                        }}
                        className={`w-full py-2 rounded-lg font-medium transition-all ${
                          tier.id === 'enterprise'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {user ? 'Purchase' : 'Sign In to Purchase'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Pricing Structure
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>Standard:</strong> ₦100 per credit (1-999 credits)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>Bulk:</strong> ₦80 per credit (1000-9,999 credits) - Save 20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>Enterprise:</strong> ₦50 per credit (10,000+ credits) - Save 50%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Transaction History (Only for logged-in users) */}
          {user && (
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-green-600" />
                  Transaction History
                </h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No transactions yet</p>
                    <p className="text-xs mt-1">Purchase credits to see your history</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-4 rounded-xl border border-gray-200 hover:border-green-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(tx.status)}
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">+{tx.quantity}</div>
                            <div className="text-xs text-gray-600">credits</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          ₦{tx.amount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(tx.created_at)}
                        </div>
                        {tx.transaction_ref && (
                          <div className="text-xs text-gray-400 mt-1 font-mono">
                            {tx.transaction_ref.substring(0, 12)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Card for Non-Authenticated Users */}
          {!user && (
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-6 h-6 text-blue-600" />
                  Why Choose AgriSeal?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">AI-Powered Analysis</div>
                      <div className="text-sm text-gray-600">Advanced neural networks for accurate disease detection</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Fast Results</div>
                      <div className="text-sm text-gray-600">Get analysis results in under 60 seconds</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Expert Recommendations</div>
                      <div className="text-sm text-gray-600">Actionable treatment and prevention advice</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Multiple Categories</div>
                      <div className="text-sm text-gray-600">Crops, Livestock, and Fishery support</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <Link
                    to="/"
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal - Only show if user is logged in */}
      {user && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            showSuccess('Credits purchased successfully!');
            loadData();
            setShowPaymentModal(false);
          }}
        />
      )}
    </div>
  );
};

export default BillingsPage;

