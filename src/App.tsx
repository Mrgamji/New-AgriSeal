// src/App.tsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import {
  Activity, Upload, Shield, LogIn, UserPlus, CreditCard, Leaf, 
  GitCompare, Fish, Home, Info, DollarSign, AlertCircle, Zap, 
  Menu, X, CheckCircle, AlertTriangle, Clock, Cpu, Database, 
  Cloud, TrendingUp, User, LogOut, Settings, Bell, Sparkles, Brain, Rocket
} from 'lucide-react';
import UploadZone from './components/UploadZone';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import ResultsDisplay from './components/ResultsDisplay';
import ProcessingSteps from './components/ProcessingSteps';
import { DetectionResult, AnalysisRequest } from './types';
import { analyzeImages } from './services/api';
import { Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './contexts/ToastContext';
import { ToastContainer } from './components/Toast';

// Processing steps generator
const generateProcessingSteps = (category: 'crops' | 'livestock' | 'fishery') => {
  const baseSteps = [
    { step: 'Image Validation', description: 'Checking image quality and format', completed: false, duration: 1500, icon: <Shield className="w-4 h-4" /> },
    { step: 'AI Model Loading', description: 'Loading neural network model', completed: false, duration: 2500, icon: <Brain className="w-4 h-4" /> },
    { step: 'Feature Extraction', description: 'Extracting visual patterns', completed: false, duration: 3500, icon: <Cpu className="w-4 h-4" /> },
  ];

  const categorySpecificSteps = {
    crops: [
      { step: 'Leaf Analysis', description: 'Analyzing chlorophyll distribution', completed: false, duration: 4000, icon: <Leaf className="w-4 h-4" /> },
      { step: 'Pathogen Detection', description: 'Identifying fungal/bacterial agents', completed: false, duration: 4500, icon: <Activity className="w-4 h-4" /> },
    ],
    livestock: [
      { step: 'Behavioral Analysis', description: 'Assessing movement patterns', completed: false, duration: 4000, icon: <GitCompare className="w-4 h-4" /> },
      { step: 'Symptom Correlation', description: 'Matching with known illnesses', completed: false, duration: 4500, icon: <AlertTriangle className="w-4 h-4" /> },
    ],
    fishery: [
      { step: 'Water Quality Analysis', description: 'Assessing environmental factors', completed: false, duration: 4000, icon: <Fish className="w-4 h-4" /> },
      { step: 'Gill Examination', description: 'Checking respiratory health', completed: false, duration: 4500, icon: <Zap className="w-4 h-4" /> },
    ],
  };

  const finalStep = {
    step: 'Report Generation', description: 'Compiling expert recommendations', completed: false, duration: 3000, icon: <Activity className="w-4 h-4" />
  };

  return [...baseSteps, ...categorySpecificSteps[category], finalStep];
};

// Category tips
const categoryTips = {
  crops: [
    { icon: '🌱', text: 'Upload clear photos of leaves and roots' },
    { icon: '🔍', text: 'Capture affected areas up close' },
    { icon: '☀️', text: 'Use natural daylight for better accuracy' },
    { icon: '📏', text: 'Include scale reference if possible' }
  ],
  livestock: [
    { icon: '🐄', text: 'Show full body and close-up symptoms' },
    { icon: '👁️', text: 'Clear photos of eyes, nose, mouth' },
    { icon: '🏃', text: 'Note any abnormal behavior in description' },
    { icon: '🌡️', text: 'Record temperature if available' }
  ],
  fishery: [
    { icon: '🐟', text: 'Photograph fish in water clearly' },
    { icon: '💧', text: 'Show water clarity and tank conditions' },
    { icon: '🎣', text: 'Capture fins, scales, and gills up close' },
    { icon: '📊', text: 'Note water parameters if measured' }
  ]
};

// Professional tips
const professionalTips = [
  { icon: <TrendingUp className="w-4 h-4" />, text: '95% accuracy rate in agricultural diagnostics' },
  { icon: <Cloud className="w-4 h-4" />, text: 'Secure cloud processing with data encryption' },
  { icon: <Clock className="w-4 h-4" />, text: 'Results in under 60 seconds' },
  { icon: <Shield className="w-4 h-4" />, text: 'Expert-verified recommendations' }
];

function App() {
  // Use AuthContext for authentication
  const { user, logout, updateCredits: updateUserCredits, isLoading: authLoading } = useAuth();
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();
  
  const [analysisRequest, setAnalysisRequest] = useState<AnalysisRequest | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'crops' | 'livestock' | 'fishery'>('crops');
  const [currentStep, setCurrentStep] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);


  // Simulate processing progress with enhanced animation
  useEffect(() => {
    if (isProcessing) {
      const steps = generateProcessingSteps(activeCategory);
      setProcessingSteps(steps);
      
      let stepIndex = 0;
      const interval = setInterval(() => {
        if (stepIndex < steps.length) {
          const newSteps = [...steps];
          newSteps[stepIndex].completed = true;
          setProcessingSteps(newSteps);
          setCurrentStep(stepIndex);
          
          // Smooth progress calculation (slower for realism)
          const progress = ((stepIndex + 1) / steps.length) * 100;
          setProcessingProgress(Math.min(95, progress)); // Cap at 95% until API returns
          
          stepIndex++;
        } else {
          // Reset to show progress animation
          stepIndex = 0;
          setProcessingSteps(steps.map(step => ({ ...step, completed: false })));
        }
      }, 2000); // 2 seconds per step for better UX
      
      return () => clearInterval(interval);
    } else {
      setProcessingProgress(0);
      setCurrentStep(0);
    }
  }, [isProcessing, activeCategory]);

  // Credits are managed via updateUserCredits from AuthContext

  const handleImagesUploaded = (request: AnalysisRequest) => {
    console.log('📸 Images uploaded, starting analysis flow...');
    setAnalysisRequest(request);
    setUploadedFiles(request.files || []);
    
    if (!user) {
      console.log('👤 User not logged in, showing auth modal');
      setTimeout(() => setShowAuthModal(true), 500);
      return;
    }
    
    if (user.credits <= 0) {
      console.log('💳 No credits available, showing payment modal');
      setShowPaymentModal(true);
      return;
    }
    
    startAnalysis(request);
  };

  const startAnalysis = async (request: AnalysisRequest) => {
    console.log(`🚀 Starting AI analysis for ${request.category}...`);
    console.log(`📊 User credits: ${user?.credits || 0}`);
    
    setIsProcessing(true);
    setError('');
    setResult(null);
    setProcessingProgress(10); // Start at 10% for initial setup
    setCurrentStep(0);

    try {
      console.log(`🤖 Calling analyzeImages with ${request.files?.length || 0} files`);
      const detectionResult = await analyzeImages(request);
      
      // Complete the progress when API returns
      setProcessingProgress(100);
      
      console.log(`✅ Analysis completed successfully!`);
      console.log(`📋 Result status: ${detectionResult.status}`);
      console.log(`🎯 Confidence: ${detectionResult.confidence}%`);
      
      // Show success toast
      showSuccess(`Analysis completed! Status: ${detectionResult.status}. Confidence: ${detectionResult.confidence}%`);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        setResult(detectionResult);
        setIsProcessing(false);
      }, 500);
      
      // Update credits if user exists
      if (user) {
        updateUserCredits(user.credits - 1);
        console.log(`💰 Credits updated: ${user.credits} → ${user.credits - 1}`);
      }
      
    } catch (error: any) {
      console.error(`❌ Analysis error:`, error);
      setIsProcessing(false);
      setProcessingProgress(0);
      
      // Handle insufficient credits (user's credits)
      if (error.message === 'INSUFFICIENT_CREDITS') {
        const errorMsg = 'Insufficient credits. Please purchase more credits to continue.';
        setError(errorMsg);
        showError(errorMsg);
        setShowPaymentModal(true);
        return;
      }
      
      // Handle OpenAI quota/credit errors (our API issue)
      if (error.message === 'OPENAI_QUOTA_ERROR' || 
          error.message?.includes('insufficient_quota') ||
          error.message?.includes('rate_limit') ||
          error.message?.includes('quota') ||
          error.message?.includes('billing')) {
        
        const quotaError = `
          🤖 AI Service Update
          
          Our AI service is experiencing high demand. 
          This analysis will NOT be charged to your account.
          
          🕒 Please try again in 15-30 minutes
          🔄 We're working to restore full capacity
          📧 Support: support@agriseal.ai
        `;
        
        setError(quotaError);
        showError('AI service temporarily unavailable. Your account will not be charged.');
        console.log('🚫 OpenAI quota error - not charging user');
        
        // Don't charge user for this - refund the credit if already deducted
        if (user) {
          updateUserCredits(user.credits + 1);
          console.log(`💰 Credit refunded due to OpenAI error`);
        }
        return;
      }
      
      // Handle network errors
      if (error.message.includes('Cannot connect to server') ||
          error.message.includes('Failed to fetch') || 
          error.message.includes('Network Error')) {
        const errorMsg = 'Connection issue: Unable to reach our AI servers. Please check your internet connection.';
        setError(`
          🔌 Connection Issue
          
          Unable to reach our AI servers. Please check:
          
          1. Your internet connection
          2. Firewall settings
          3. Try again in a few minutes
          
          If this persists, contact support@agriseal.ai
        `);
        showError(errorMsg);
        return;
      }
      
      // Handle file upload errors
      if (error.message.includes('FILE_TOO_LARGE')) {
        const errorMsg = 'File too large. Maximum size is 10MB per image.';
        setError(errorMsg);
        showError(errorMsg);
        return;
      }
      
      if (error.message.includes('INVALID_FILE_TYPE')) {
        const errorMsg = 'Invalid file type. Please upload JPG, PNG, BMP, or WEBP images only.';
        setError(errorMsg);
        showError(errorMsg);
        return;
      }
      
      if (error.message.includes('TOO_MANY_FILES')) {
        const errorMsg = 'Maximum 5 images allowed per analysis.';
        setError(errorMsg);
        showError(errorMsg);
        return;
      }
      
      // Generic error with helpful message
      const errorMsg = error.message || 'Analysis failed. Please try again.';
      setError(`
        ⚠️ Analysis Error
        
        ${errorMsg}
        
        📝 What to try:
        • Use clearer, well-lit images
        • Ensure proper focus on subject
        • Check file size (max 10MB)
        • Try different angles
        
        Need help? Contact support@agriseal.ai
      `);
      showError(`Analysis failed: ${errorMsg}`);
      
    }
  };

  const handlePaymentSuccess = async () => {
    console.log('💳 Payment successful, resuming analysis...');
    showSuccess('Payment successful! Starting analysis...');
    setShowPaymentModal(false);
    // Credits are updated by PaymentModal callback
    if (analysisRequest) {
      // Small delay to ensure state updates
      setTimeout(() => startAnalysis(analysisRequest), 300);
    }
  };

  const resetAnalysis = () => {
    console.log('🔄 Resetting analysis...');
    setAnalysisRequest(null);
    setResult(null);
    setError('');
    setUploadedFiles([]);
    setProcessingProgress(0);
    setCurrentStep(0);
    setProcessingSteps([]);
  };

  const handleCategoryChange = (category: 'crops' | 'livestock' | 'fishery') => {
    console.log(`📊 Category changed to: ${category}`);
    setActiveCategory(category);
    resetAnalysis();
  };

  const handleLogout = () => {
    try {
      console.log('👋 Logging out...');
      logout();
      setShowUserDropdown(false);
      resetAnalysis();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Don't render until auth is loaded
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf className="w-8 h-8 text-green-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading AgriSeal...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing your agricultural intelligence platform</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 bg-gradient-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent">
                  AgriSeal AI
                </h1>
                <p className="text-xs text-gray-500">Professional Agricultural Diagnostics</p>
              </div>
            </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-6">
               <Link to="/" className="text-gray-700 hover:text-green-600 font-medium text-sm flex items-center transition-colors">
                 <Home className="w-4 h-4 mr-2" />
                 Home
               </Link>
               <Link to="/billings" className="text-gray-700 hover:text-green-600 font-medium text-sm flex items-center transition-colors">
                 <CreditCard className="w-4 h-4 mr-2" />
                 Pricing
               </Link>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200 shadow-sm">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{user.credits || 0} credits</span>
                  </div>
                  
                  {/* User Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-2 focus:outline-none group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <span className="text-sm font-semibold text-white">
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[120px]">
                          {user.email}
                        </p>
                      </div>
                      <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-emerald-100 py-1 z-10 animate-slideDown backdrop-blur-sm bg-white/95">
                        <div className="px-4 py-3 border-b border-emerald-50">
                          <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link 
                          to="/billings"
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 transition-colors flex items-center"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                          Billings & Credits
                        </Link>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 transition-colors flex items-center">
                          <Settings className="w-4 h-4 mr-2 text-gray-500" />
                          Settings
                        </button>
                        <div className="border-t border-emerald-50 my-1"></div>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 text-sm flex items-center transition-all hover:shadow-sm hover:border-green-700"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </button>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 text-sm flex items-center transition-all hover:shadow-lg transform hover:-translate-y-0.5 shadow-md"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-2 animate-slideDown">
              <Link
                to="/billings"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 rounded-lg text-sm transition-colors mb-3"
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                Pricing
              </Link>
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm font-semibold text-white">
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm">
                      <CreditCard className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">{user.credits || 0}</span>
                    </div>
                  </div>
                  <Link
                    to="/billings"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg flex items-center transition-colors"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billings & Credits
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button 
                    onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                    className="w-full px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 text-sm transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 text-sm transition-all shadow-md"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-2 lg:px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-600" />
                Analysis Type
              </h3>
              <div className="space-y-3">
                {['crops', 'livestock', 'fishery'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat as any)}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-all text-left group ${
                      activeCategory === cat
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 shadow-sm'
                        : 'hover:bg-emerald-50/50 text-gray-700 border border-transparent hover:border-emerald-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      cat === 'crops' ? 'bg-green-100 group-hover:bg-green-200' : 
                      cat === 'livestock' ? 'bg-blue-100 group-hover:bg-blue-200' : 
                      'bg-purple-100 group-hover:bg-purple-200'
                    }`}>
                      {cat === 'crops' ? <Leaf className="w-5 h-5 text-green-600" /> :
                       cat === 'livestock' ? <GitCompare className="w-5 h-5 text-blue-600" /> :
                       <Fish className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold capitalize">{cat}</div>
                      <div className="text-xs text-gray-500">
                        {cat === 'crops' ? 'Plant disease detection' :
                         cat === 'livestock' ? 'Animal health analysis' :
                         'Aquaculture monitoring'}
                      </div>
                    </div>
                    {activeCategory === cat && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Tips */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                Upload Tips
              </h3>
              <div className="space-y-3">
                {categoryTips[activeCategory].map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 hover:bg-blue-100/50 transition-colors border border-blue-100">
                    <span className="text-xl mt-0.5 flex-shrink-0">{tip.icon}</span>
                    <span className="text-sm text-blue-800 leading-relaxed">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Connection Button */}
          </div>

          {/* Main Upload Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent">
                    {activeCategory === 'crops' && '🌱 Crop Health Analysis'}
                    {activeCategory === 'livestock' && '🐄 Livestock Health Check'}
                    {activeCategory === 'fishery' && '🐟 Fishery Health Assessment'}
                  </h2>
                  {user && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200 shadow-sm">
                      <CreditCard className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">{user.credits || 0} credits</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600">
                  Upload clear images for instant AI-powered diagnosis and expert recommendations
                </p>
              </div>

              <UploadZone 
                onUploadComplete={handleImagesUploaded}
                activeCategory={activeCategory}
                isProcessing={isProcessing}
              />

              {/* Error Display with Enhanced Styling */}
              {error && (
                <div className="mt-6 bg-gradient-to-br from-red-50/80 to-red-100/50 border border-red-200 rounded-2xl p-5 animate-shake">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-red-800 whitespace-pre-line leading-relaxed font-medium">
                        {error}
                      </div>
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <button
                          onClick={() => setError('')}
                          className="px-4 py-1.5 text-sm bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={resetAnalysis}
                          className="ml-2 px-4 py-1.5 text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Steps (only show when not in full modal mode) */}
              {isProcessing && (
                <div className="mt-8">
                  <ProcessingSteps 
                    steps={processingSteps} 
                    category={activeCategory}
                    progress={processingProgress}
                  />
                </div>
              )}

              {/* Results Display */}
              {result && !isProcessing && (
                <div className="mt-6 animate-fadeIn">
                  <ResultsDisplay result={result} onReset={resetAnalysis} category={activeCategory} />
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-emerald-600" />
                Professional Features
              </h3>
              <div className="space-y-4">
                {professionalTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50/50 to-green-50/50 hover:from-emerald-100 hover:to-green-100 transition-all border border-emerald-200">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      {React.cloneElement(tip.icon, { className: "w-4 h-4 text-white" })}
                    </div>
                    <span className="text-sm text-emerald-800 leading-relaxed">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {!user && (
              <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-green-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-center">Start Free Today</h3>
                  <p className="text-sm mb-4 opacity-90 text-center leading-relaxed">
                    Get <span className="font-bold">3 free analysis credits</span> to test our professional agricultural AI
                  </p>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full py-3 bg-white text-green-700 font-bold rounded-lg hover:bg-gray-100 transition-all hover:shadow-xl transform hover:-translate-y-0.5 shadow-md"
                  >
                    Create Free Account
                  </button>
                  <p className="text-xs opacity-80 text-center mt-4">
                    No credit card required • Cancel anytime
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-2">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">AgriSeal AI</span>
              </div>
              <p className="text-gray-400 text-sm">Professional Agricultural Diagnostics</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors hover:underline">Terms</a>
              <a href="#" className="hover:text-white transition-colors hover:underline">Privacy</a>
              <a href="#" className="hover:text-white transition-colors hover:underline">Contact</a>
              <a href="#" className="hover:text-white transition-colors hover:underline">Support</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center">
            <p className="text-gray-500 text-sm">© 2024 AgriSeal AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Hang On Tight Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-green-100">
            <div className="text-center space-y-4">
              {/* Animated Icon */}
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center animate-pulse mx-auto">
                  {activeCategory === 'crops' && <Leaf className="w-10 h-10 text-white" />}
                  {activeCategory === 'livestock' && <GitCompare className="w-10 h-10 text-white" />}
                  {activeCategory === 'fishery' && <Fish className="w-10 h-10 text-white" />}
                </div>
                <div className="absolute -inset-4 border-4 border-green-500/30 rounded-full animate-ping"></div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900">
                Hang on tight!
              </h2>

              {/* Dynamic Description */}
              <p className="text-gray-600 text-sm">
                We are analyzing your {activeCategory === 'crops' ? 'crop' : activeCategory === 'livestock' ? 'animal' : 'fish'} images. 
                This usually takes 45-60 seconds.
              </p>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-3 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{Math.round(processingProgress)}% complete</p>
              </div>

              {/* Current Step */}
              {processingSteps[currentStep] && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-green-600">
                      {processingSteps[currentStep].icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-green-800">{processingSteps[currentStep].step}</p>
                      <p className="text-xs text-green-600">{processingSteps[currentStep].description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>• Processing {uploadedFiles.length} image{uploadedFiles.length !== 1 ? 's' : ''}</p>
                <p>• Please don't close this window</p>
                <p>• Our AI is working hard to give you the best results</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          setShowAuthModal(false);
          // If there's a pending analysis request and user has credits, start analysis
          setTimeout(() => {
            if (user && user.credits > 0 && analysisRequest) {
              startAnalysis(analysisRequest);
            }
          }, 100);
        }}
      />
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Global Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;