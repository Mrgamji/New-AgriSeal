// src/App.tsx - FIXED VERSION WITH LARGER LOGO AND MODALS
import React, { useState, useEffect } from 'react';
import {
  Activity, Upload, Shield, LogIn, UserPlus, CreditCard,
  GitCompare, Fish, Home, Info, DollarSign, AlertCircle, Zap,
  Menu, X, CheckCircle, AlertTriangle, Clock, Cpu, Database,
  Cloud, TrendingUp, User, LogOut, Settings, Bell, Sparkles, Brain, Rocket, 
  Mail, Phone, FileText, Lock, ExternalLink, ChevronRight, Award, Users,
  BarChart, Target, Globe, Shield as ShieldIcon, Twitter, Github, Linkedin
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

// Import logo from public (use public path for <img src="/logo.png" .../>)
const LOGO_SRC = "/logo.png";

// Processing steps generator
const generateProcessingSteps = (category: 'crops' | 'livestock' | 'fishery') => {
  const baseSteps = [
    { step: 'Image Validation', description: 'Checking image quality and format', completed: false, duration: 1500, icon: <Shield className="w-4 h-4" /> },
    { step: 'AI Model Loading', description: 'Loading neural network model', completed: false, duration: 2500, icon: <Brain className="w-4 h-4" /> },
    { step: 'Feature Extraction', description: 'Extracting visual patterns', completed: false, duration: 3500, icon: <Cpu className="w-4 h-4" /> },
  ];

  const categorySpecificSteps = {
    crops: [
      { step: 'Leaf Analysis', description: 'Analyzing chlorophyll distribution', completed: false, duration: 4000, icon: <img src={LOGO_SRC} alt="Logo" className="w-4 h-4 object-contain" /> },
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

// Modal Components
const TermsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-emerald-100 animate-scaleIn">
      <div className="sticky top-0 bg-white border-b border-emerald-100 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h3>
            <p className="text-gray-700">By accessing and using AgriSeal AI, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Service Description</h3>
            <p className="text-gray-700">AgriSeal AI provides agricultural diagnostic services through artificial intelligence analysis of uploaded images.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3. User Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Provide accurate information during registration</li>
              <li>Maintain confidentiality of your account credentials</li>
              <li>Use the service only for lawful purposes</li>
              <li>Ensure uploaded images are yours or you have permission to use them</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Intellectual Property</h3>
            <p className="text-gray-700">All content, features, and functionality are owned by AgriSeal AI and are protected by international copyright, trademark, and other intellectual property laws.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Limitation of Liability</h3>
            <p className="text-gray-700">AgriSeal AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
          </section>
        </div>
      </div>
      <div className="sticky bottom-0 bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-100 p-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">By using our service, you agree to these terms.</p>
          <button onClick={onClose} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            I Understand
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PrivacyModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-emerald-100 animate-scaleIn">
      <div className="sticky top-0 bg-white border-b border-emerald-100 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>
      <div className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <ShieldIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">We take your privacy seriously. Your data is encrypted and never shared with third parties without your consent.</p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Information We Collect</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Account Information</h4>
              <p className="text-sm text-gray-600">Name, email, and payment details for service access.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Uploaded Images</h4>
              <p className="text-sm text-gray-600">Processed images are deleted after 30 days.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Usage Data</h4>
              <p className="text-sm text-gray-600">Analytics to improve our service quality.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Protection</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">End-to-end encryption for all data transfers</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Regular security audits and penetration testing</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">GDPR and CCPA compliance</span>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Rights</h3>
          <p className="text-gray-700">You have the right to access, correct, or delete your personal data at any time. Contact us at privacy@agriseal.ai for data requests.</p>
        </section>
      </div>
      <div className="sticky bottom-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100 p-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Need help? Contact our privacy team.</p>
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Got It
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ContactModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-emerald-100 animate-scaleIn">
      <div className="sticky top-0 bg-white border-b border-emerald-100 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-3">For general inquiries and support</p>
            <a href="mailto:support@agriseal.ai" className="text-emerald-600 font-medium hover:text-emerald-700 inline-flex items-center gap-1">
              support@agriseal.ai
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Sales & Business</h3>
            <p className="text-gray-600 mb-3">For enterprise plans and partnerships</p>
            <a href="mailto:sales@agriseal.ai" className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center gap-1">
              sales@agriseal.ai
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Response Times
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">General Support</span>
              <span className="font-medium text-gray-900">Within 24 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Technical Issues</span>
              <span className="font-medium text-gray-900">Within 4-6 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Billing Questions</span>
              <span className="font-medium text-gray-900">Within 12 hours</span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Office Location</h3>
          <p className="text-gray-700 mb-2">AgriSeal AI Headquarters</p>
          <p className="text-gray-600">123 Innovation Drive</p>
          <p className="text-gray-600">San Francisco, CA 94107</p>
          <p className="text-gray-600">United States</p>
        </div>
      </div>
      <div className="sticky bottom-0 bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100 p-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">We're here to help you grow.</p>
          <button onClick={onClose} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

const SupportModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-emerald-100 animate-scaleIn">
      <div className="sticky top-0 bg-white border-b border-emerald-100 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Support Center</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <a href="#" className="group">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 hover:border-purple-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-gray-600 mb-3">Detailed guides and tutorials</p>
              <span className="text-purple-600 font-medium inline-flex items-center gap-1">
                View Docs
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </a>

          <a href="#" className="group">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100 hover:border-cyan-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Video className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
              <p className="text-gray-600 mb-3">Step-by-step video guides</p>
              <span className="text-cyan-600 font-medium inline-flex items-center gap-1">
                Watch Videos
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </a>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Frequently Asked Questions</h4>
            <div className="space-y-2">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-gray-700 hover:text-gray-900">
                  <span>How do I get more analysis credits?</span>
                  <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-gray-600 pl-4">You can purchase credits from the Billing page or upgrade to a subscription plan for unlimited access.</p>
              </details>
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-gray-700 hover:text-gray-900">
                  <span>What image formats are supported?</span>
                  <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-gray-600 pl-4">We support JPG, PNG, BMP, and WEBP formats. Maximum file size is 10MB per image.</p>
              </details>
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-gray-700 hover:text-gray-900">
                  <span>How accurate are the results?</span>
                  <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-gray-600 pl-4">Our AI achieves 95% accuracy in controlled conditions. Results are verified by agricultural experts.</p>
              </details>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h3 className="font-semibold text-gray-900 mb-3">Need Immediate Help?</h3>
          <p className="text-gray-700 mb-4">Our team is available 24/7 for critical issues affecting your agricultural operations.</p>
          <a href="mailto:emergency@agriseal.ai" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <AlertCircle className="w-4 h-4" />
            Emergency Support
          </a>
        </div>
      </div>
      <div className="sticky bottom-0 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100 p-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Still need help? Contact our support team.</p>
          <button onClick={onClose} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Add missing Video component
const Video = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

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
  
  // Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

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
          
          const progress = ((stepIndex + 1) / steps.length) * 100;
          setProcessingProgress(Math.min(95, progress));
          
          stepIndex++;
        } else {
          stepIndex = 0;
          setProcessingSteps(steps.map(step => ({ ...step, completed: false })));
        }
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      setProcessingProgress(0);
      setCurrentStep(0);
    }
  }, [isProcessing, activeCategory]);

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
    setProcessingProgress(10);
    setCurrentStep(0);

    try {
      console.log(`🤖 Calling analyzeImages with ${request.files?.length || 0} files`);
      const detectionResult = await analyzeImages(request);
      
      setProcessingProgress(100);
      
      console.log(`✅ Analysis completed successfully!`);
      console.log(`📋 Result status: ${detectionResult.status}`);
      console.log(`🎯 Confidence: ${detectionResult.confidence}%`);
      
      showSuccess(`Analysis completed! Status: ${detectionResult.status}. Confidence: ${detectionResult.confidence}%`);
      
      setTimeout(() => {
        setResult(detectionResult);
        setIsProcessing(false);
      }, 500);
      
      if (user) {
        updateUserCredits(user.credits - 1);
        console.log(`💰 Credits updated: ${user.credits} → ${user.credits - 1}`);
      }
      
    } catch (error: any) {
      console.error(`❌ Analysis error:`, error);
      setIsProcessing(false);
      setProcessingProgress(0);
      
      if (error.message === 'INSUFFICIENT_CREDITS') {
        const errorMsg = 'Insufficient credits. Please purchase more credits to continue.';
        setError(errorMsg);
        showError(errorMsg);
        setShowPaymentModal(true);
        return;
      }
      
      // Handle other errors...
    }
  };

  const handlePaymentSuccess = async () => {
    console.log('💳 Payment successful, resuming analysis...');
    showSuccess('Payment successful! Starting analysis...');
    setShowPaymentModal(false);
    if (analysisRequest) {
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
            <div className="w-24 h-24 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* LARGER LOGO */}
              <img src={LOGO_SRC} alt="AgriSeal Logo" className="w-16 h-16 object-contain animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading AgriSeal...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing your agricultural intelligence platform</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Navigation with LARGER LOGO */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                {/* MUCH LARGER LOGO CONTAINER */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-white-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  {/* LARGE LOGO */}
                  <img src={LOGO_SRC} alt="AgriSeal Logo" className="w-14 h-14 object-contain p-1" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 bg-gradient-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent">
                  AgriSeal AI
                </h1>
                <p className="text-sm text-gray-500 font-medium">Professional Agricultural Diagnostics</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-green-600 font-medium text-sm flex items-center transition-colors group">
                <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Home
              </Link>
              <Link to="/billings" className="text-gray-700 hover:text-green-600 font-medium text-sm flex items-center transition-colors group">
                <CreditCard className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Pricing
              </Link>
              
              {user ? (
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-2.5 rounded-full border border-green-200 shadow-sm">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-green-700">{user.credits || 0} credits</span>
                  </div>
                  
                  {/* User Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-3 focus:outline-none group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
                        <span className="text-sm font-bold text-white">
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.name || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                          {user.email}
                        </p>
                      </div>
                      <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showUserDropdown && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-10 animate-slideDown backdrop-blur-sm bg-white/95">
                        <div className="px-4 py-3 border-b border-emerald-50">
                          <p className="text-sm font-semibold text-gray-900">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link 
                          to="/billings"
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          Billings & Credits
                        </Link>
                        <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition-colors flex items-center gap-2">
                          <Settings className="w-4 h-4 text-gray-500" />
                          Settings
                        </button>
                        <div className="border-t border-emerald-50 my-1"></div>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="px-5 py-2.5 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 text-sm flex items-center gap-2 transition-all hover:shadow-sm hover:border-green-700 font-medium"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 text-sm flex items-center gap-2 transition-all hover:shadow-lg transform hover:-translate-y-0.5 shadow-md font-semibold"
                  >
                    <Rocket className="w-4 h-4" />
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
                <X className="w-8 h-8 text-gray-700" />
              ) : (
                <Menu className="w-8 h-8 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-6 pb-4 animate-slideDown space-y-4">
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 rounded-xl text-sm transition-colors font-medium"
              >
                <Home className="w-4 h-4 inline mr-3" />
                Home
              </Link>
              <Link
                to="/billings"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 rounded-xl text-sm transition-colors font-medium"
              >
                <CreditCard className="w-4 h-4 inline mr-3" />
                Pricing
              </Link>
              
              {user ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold text-white">
                            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-bold text-green-700">{user.credits || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to="/billings"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 rounded-xl flex items-center gap-2 transition-colors font-medium"
                  >
                    <CreditCard className="w-4 h-4" />
                    Billings & Credits
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                    className="w-full px-4 py-3 text-green-600 border border-green-600 rounded-xl hover:bg-green-50 text-sm transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 text-sm transition-all shadow-md font-semibold"
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
      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Analysis Type</h3>
              </div>
              <div className="space-y-3">
                {['crops', 'livestock', 'fishery'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat as any)}
                    className={`flex items-center gap-4 w-full p-4 rounded-xl font-medium transition-all text-left group ${
                      activeCategory === cat
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 shadow-sm'
                        : 'hover:bg-emerald-50/50 text-gray-700 border border-transparent hover:border-emerald-100'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      cat === 'crops' ? 'bg-green-100 group-hover:bg-green-200' : 
                      cat === 'livestock' ? 'bg-blue-100 group-hover:bg-blue-200' : 
                      'bg-purple-100 group-hover:bg-purple-200'
                    }`}>
                      {cat === 'crops' ? 
                        <img src={LOGO_SRC} alt="Crops" className="w-7 h-7 object-contain" /> :
                        cat === 'livestock' ? <GitCompare className="w-6 h-6 text-blue-600" /> :
                        <Fish className="w-6 h-6 text-purple-600" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-base capitalize">{cat}</div>
                      <div className="text-sm text-gray-500">
                        {cat === 'crops' ? 'Plant disease detection' :
                         cat === 'livestock' ? 'Animal health analysis' :
                         'Aquaculture monitoring'}
                      </div>
                    </div>
                    {activeCategory === cat && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Tips */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Upload Tips</h3>
              </div>
              <div className="space-y-3">
                {categoryTips[activeCategory].map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-blue-50/50 hover:bg-blue-100/50 transition-colors border border-blue-100">
                    <span className="text-2xl mt-0.5 flex-shrink-0">{tip.icon}</span>
                    <span className="text-sm text-blue-800 leading-relaxed font-medium">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Upload Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-8">
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent">
                      {activeCategory === 'crops' && '🌱 Crop Health Analysis'}
                      {activeCategory === 'livestock' && '🐄 Livestock Health Check'}
                      {activeCategory === 'fishery' && '🐟 Fishery Health Assessment'}
                    </h2>
                    <p className="text-gray-600 text-lg mt-2">
                      Upload clear images for instant AI-powered diagnosis and expert recommendations
                    </p>
                  </div>
                  {user && (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200 shadow-sm">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-bold text-green-700">{user.credits || 0} credits</span>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-white to-emerald-100 flex items-center justify-center shadow-sm">
                      <img src={LOGO_SRC} alt="AgriSeal Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Powered by AgriSeal AI</h4>
                      <p className="text-sm text-gray-600">95% accurate agricultural diagnostics</p>
                    </div>
                  </div>
                </div>
              </div>

              <UploadZone 
                onUploadComplete={handleImagesUploaded}
                activeCategory={activeCategory}
                isProcessing={isProcessing}
              />

              {/* Error Display */}
              {error && (
                <div className="mt-8 bg-gradient-to-br from-red-50/80 to-red-100/50 border border-red-200 rounded-2xl p-6 animate-shake">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-red-800 whitespace-pre-line leading-relaxed font-medium">
                        {error}
                      </div>
                      <div className="mt-4 pt-4 border-t border-red-200 flex gap-2">
                        <button
                          onClick={() => setError('')}
                          className="px-5 py-2 text-sm bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={resetAnalysis}
                          className="px-5 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Steps */}
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
                <div className="mt-8 animate-fadeIn">
                  <ResultsDisplay result={result} onReset={resetAnalysis} category={activeCategory} />
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Professional Features</h3>
              </div>
              <div className="space-y-4">
                {professionalTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-emerald-50/50 to-green-50/50 hover:from-emerald-100 hover:to-green-100 transition-all border border-emerald-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      {React.cloneElement(tip.icon, { className: "w-5 h-5 text-white" })}
                    </div>
                    <span className="text-sm text-emerald-800 leading-relaxed font-medium">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {!user && (
              <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-green-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm">
                    <Rocket className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-center">Start Free Today</h3>
                  <p className="text-sm mb-6 opacity-90 text-center leading-relaxed">
                    Get <span className="font-bold text-amber-200">3 free analysis credits</span> to test our professional agricultural AI
                  </p>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full py-4 bg-white text-green-700 font-bold rounded-xl hover:bg-gray-100 transition-all hover:shadow-2xl transform hover:-translate-y-0.5 shadow-lg text-lg"
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

      {/* Footer with Clickable Links */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mr-3">
                  <img src={LOGO_SRC} alt="AgriSeal Logo" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <span className="text-2xl font-bold">AgriSeal AI</span>
                  <p className="text-gray-400 text-sm">Professional Agricultural Diagnostics</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Advanced AI-powered agricultural diagnostics for farmers, veterinarians, and aquaculture experts.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setShowTermsModal(true)}
                    className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors text-sm">
                    Cookie Policy
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    Contact Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowSupportModal(true)}
                    className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                  >
                    <Users className="w-3 h-3" />
                    Help Center
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Status
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Press
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">
                © {new Date().getFullYear()} AgriSeal AI. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Hang On Tight Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-10 max-w-2xl w-full mx-4 shadow-2xl border border-green-100">
            <div className="text-center space-y-6">
              {/* Animated Icon with LARGE LOGO */}
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center animate-pulse mx-auto">
                  <img src={LOGO_SRC} alt="AgriSeal Logo" className="w-20 h-20 object-contain" />
                </div>
                <div className="absolute -inset-6 border-4 border-green-500/30 rounded-full animate-ping"></div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900">
                Hang on tight!
              </h2>

              {/* Dynamic Description */}
              <p className="text-gray-600 text-lg">
                We are analyzing your {activeCategory === 'crops' ? 'crop' : activeCategory === 'livestock' ? 'animal' : 'fish'} images. 
                This usually takes 45-60 seconds.
              </p>

              {/* Progress bar */}
              <div className="mt-8">
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-4 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-3 font-medium">{Math.round(processingProgress)}% complete</p>
              </div>

              {/* Current Step */}
              {processingSteps[currentStep] && (
                <div className="mt-6 p-6 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-green-600 text-2xl">
                      {processingSteps[currentStep].icon}
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-semibold text-green-800">{processingSteps[currentStep].step}</p>
                      <p className="text-green-600">{processingSteps[currentStep].description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 text-sm text-gray-500 space-y-2">
                <p className="flex items-center justify-center gap-2">
                  <Database className="w-4 h-4" />
                  Processing {uploadedFiles.length} image{uploadedFiles.length !== 1 ? 's' : ''}
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Please don't close this window
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4" />
                  Our AI is working hard to give you the best results
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Icons */}
      {React.createElement(() => {
        const Twitter = ({ className }: { className?: string }) => (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        );

        const Linkedin = ({ className }: { className?: string }) => (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );

        const Github = ({ className }: { className?: string }) => (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );

        return null;
      })}

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          setShowAuthModal(false);
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

      {/* Footer Modals */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />

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
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
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
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;