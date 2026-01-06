import React from 'react';
import { 
  Upload, 
  Brain, 
  BarChart3, 
  ShieldCheck,
  Zap,
  Target,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Top Navigation Component ---
const TopNavigation = () => {
  const navigate = useNavigate();
  return (
    <nav className="w-full bg-white/80 backdrop-blur border-b border-gray-100 fixed top-0 left-0 z-40">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-green-700 font-bold text-xl hover:text-emerald-700 transition"
          aria-label="AgriSeal Home"
        >
          <ShieldCheck className="w-7 h-7 text-green-600" />
          <span>AgriSeal AI</span>
        </button>
        <div className="flex items-center gap-8">
          <button
            className="text-gray-700 hover:text-green-600 font-medium transition"
            onClick={() => navigate('/how-it-works')}
          >
            How It Works
          </button>
          <button
            className="text-gray-700 hover:text-green-600 font-medium transition"
            onClick={() => navigate('/pricing')}
          >
            Pricing
          </button>
          <button
            className="text-gray-700 hover:text-green-600 font-medium transition"
            onClick={() => navigate('/contact')}
          >
            Contact
          </button>
          <button
            onClick={() => navigate('/')}
            className="ml-4 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow"
          >
            Try Free
          </button>
        </div>
      </div>
    </nav>
  );
};

const HowItWorksPage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: '01',
      title: 'Upload Crop Images',
      icon: <Upload className="w-8 h-8" />,
      description: 'Take clear photos of your crops from multiple angles. Our AI works best with 2-3 images showing different parts of the plant.',
      tips: [
        'Use good lighting',
        'Capture both close-ups and wide shots',
        'Include affected and healthy leaves'
      ],
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50'
    },
    {
      number: '02',
      title: 'AI Analysis Process',
      icon: <Brain className="w-8 h-8" />,
      description: 'Our advanced computer vision models analyze every pixel, comparing against thousands of disease patterns.',
      process: [
        'Image quality validation',
        'Crop type recognition',
        'Feature extraction',
        'Disease pattern matching',
        'Confidence scoring'
      ],
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50'
    },
    {
      number: '03',
      title: 'Instant Diagnosis',
      icon: <BarChart3 className="w-8 h-8" />,
      description: 'Receive detailed reports in under 60 seconds with actionable insights and treatment recommendations.',
      features: [
        'Disease identification',
        'Severity assessment',
        'Confidence score',
        'Treatment options',
        'Prevention strategies'
      ],
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50'
    },
    {
      number: '04',
      title: 'Take Action & Monitor',
      icon: <ShieldCheck className="w-8 h-8" />,
      description: 'Implement recommended treatments and track progress with follow-up analyses.',
      actions: [
        'Apply treatments',
        'Schedule follow-ups',
        'Track recovery',
        'Prevent future outbreaks'
      ],
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50'
    }
  ];

  const stats = [
    { icon: <Zap className="w-6 h-6" />, value: '95%', label: 'Accuracy Rate' },
    { icon: <Clock className="w-6 h-6" />, value: '<60s', label: 'Analysis Time' },
    { icon: <Target className="w-6 h-6" />, value: '50+', label: 'Disease Types' },
    { icon: <Users className="w-6 h-6" />, value: '5,000+', label: 'Farmers Served' },
  ];

  return (
    <>
      <TopNavigation />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
        {/* Height compensation for nav (fixed height 64px) */}
        <div className="h-16 w-full" />
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full mb-6">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold">How AgriSeal AI Works</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              From Photo to Prescription in Minutes
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover how our AI-powered platform transforms crop images into actionable insights
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              Try It Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-all">
                <div className="inline-flex p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl mb-4">
                  <div className="text-blue-600">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="space-y-12 mb-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`rounded-2xl border-2 border-gray-200 ${step.bgColor} p-8 transition-all hover:shadow-xl`}
              >
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="flex-shrink-0">
                    <div className={`text-5xl font-bold text-transparent bg-gradient-to-r ${step.color} bg-clip-text mb-2`}>
                      {step.number}
                    </div>
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${step.bgColor} border border-gray-200`}>
                      <div className={`text-transparent bg-gradient-to-r ${step.color} bg-clip-text`}>
                        {step.icon}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-700 mb-6 text-lg">{step.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {step.tips && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Tips for Best Results:</h4>
                          <ul className="space-y-2">
                            {step.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {step.process && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">AI Process:</h4>
                          <ul className="space-y-2">
                            {step.process.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-purple-600">{i + 1}</span>
                                </div>
                                <span className="text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {step.features && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Report Features:</h4>
                          <ul className="space-y-2">
                            {step.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {step.actions && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Recommended Actions:</h4>
                          <ul className="space-y-2">
                            {step.actions.map((action, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-amber-600">✓</span>
                                </div>
                                <span className="text-gray-700">{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Technology Section */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-16">
            <h2 className="text-3xl font-bold mb-6">Advanced Technology Stack</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Computer Vision
                </h3>
                <p className="text-gray-300">
                  Our models are trained on millions of agricultural images using convolutional neural networks (CNNs) specifically optimized for plant disease detection.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Real-time Processing
                </h3>
                <p className="text-gray-300">
                  Cloud-based GPU acceleration ensures analyses complete in under 60 seconds, even for complex multi-disease detection.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Data Security
                </h3>
                <p className="text-gray-300">
                  All images and data are encrypted end-to-end. We never share your farm data with third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-8 mb-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Need Help Getting Started?</h3>
                <p className="text-gray-700 mb-4">
                  Our agricultural experts are available to guide you through the process and answer any questions.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900 font-medium">0800-AGRI-SEAL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900 font-medium">support@agriseal.ai</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all whitespace-nowrap"
              >
                Contact Support
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Protect Your Crops?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who have already prevented crop losses with AgriSeal AI
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              Start Your Free Analysis Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorksPage;