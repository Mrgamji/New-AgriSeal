import React, { useState } from 'react';
import { 
  CheckCircle, 
  Star, 
  Zap, 
  Shield, 
  Clock, 
  Users,
  TrendingUp,
  CreditCard,
  Calendar,
  ArrowRight,
  BadgeCheck,
  Leaf,
  Home,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navLinks = [
  { href: '/', label: 'Home', icon: <Home className="inline w-5 h-5 mr-1" /> },
  { href: '/how-it-works', label: 'How it Works', icon: <HelpCircle className="inline w-5 h-5 mr-1" /> },
  { href: '/pricing', label: 'Pricing', icon: <CreditCard className="inline w-5 h-5 mr-1" /> },
  { href: '/contact', label: 'Contact', icon: <Users className="inline w-5 h-5 mr-1" /> }
];

const PricingPage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'pay-as-you-go',
      name: 'Pay As You Go',
      tagline: 'Perfect for occasional users',
      icon: <CreditCard className="w-8 h-8" />,
      price: 500,
      priceText: '₦500',
      period: 'per analysis',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      features: [
        'Single disease analysis',
        'Basic crop health report',
        'Email support',
        '24-hour access',
        '1 credit per payment'
      ],
      buttonText: 'Buy Credits',
      popular: false
    },
    {
      id: 'daily',
      name: 'Daily Pro',
      tagline: 'For daily farm monitoring',
      icon: <Zap className="w-8 h-8" />,
      price: 6000,
      priceText: '₦6,000',
      period: 'per day',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      features: [
        'Unlimited daily analyses',
        'Priority processing',
        'Advanced analytics',
        'Phone & email support',
        'Export to PDF/Excel',
        'Multi-crop support'
      ],
      buttonText: 'Get Daily Access',
      popular: true
    },
    {
      id: 'monthly',
      name: 'Monthly Pro',
      tagline: 'Best for commercial farms',
      icon: <Calendar className="w-8 h-8" />,
      price: billingCycle === 'monthly' ? 50000 : 45000,
      priceText: billingCycle === 'monthly' ? '₦50,000' : '₦45,000',
      period: billingCycle === 'monthly' ? 'per month' : 'per month (yearly)',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
      borderColor: 'border-purple-200',
      features: [
        'Unlimited monthly analyses',
        'Advanced AI models',
        '24/7 priority support',
        'Custom disease libraries',
        'Team access (up to 5 users)',
        'API access',
        'Historical data tracking'
      ],
      buttonText: 'Subscribe Now',
      popular: false
    },
    {
      id: 'yearly',
      name: 'Enterprise Yearly',
      tagline: 'Ultimate value for large farms',
      icon: <Shield className="w-8 h-8" />,
      price: billingCycle === 'yearly' ? 500000 : 550000,
      priceText: billingCycle === 'yearly' ? '₦500,000' : '₦550,000',
      period: 'per year',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      features: [
        'Everything in Monthly Pro',
        'Unlimited team members',
        'Custom AI model training',
        'Dedicated account manager',
        'On-site training',
        'Custom integrations',
        'SLA guarantee (99.9% uptime)',
        'Advanced reporting dashboard'
      ],
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-blue-50 shadow-sm py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo with gradient */}
          <div
            className="flex items-center cursor-pointer gap-2"
            onClick={() => navigate('/')}
          >
            <span className="inline-flex items-center justify-center rounded-xl p-2 bg-gradient-to-r from-green-500 to-emerald-500 shadow-md">
              <Leaf className="text-white w-7 h-7" />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-green-800 via-emerald-600 to-blue-600 bg-clip-text select-none">
              AgriSeal AI
            </span>
          </div>
          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all"
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </div>
          {/* Mobile nav placeholder (just a menu icon for now) */}
          <div className="md:hidden">
            {/* Optionally implement a mobile drawer in the future */}
            <button className="p-2 rounded-lg hover:bg-green-50">
              <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4" />
            <span className="text-sm font-semibold">Flexible Pricing Plans</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            From occasional use to enterprise farming, we have a plan that fits your needs
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly Billing <span className="text-green-600 font-bold">(Save 10%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 ${plan.borderColor} ${plan.bgColor} p-8 transition-all hover:scale-[1.02] hover:shadow-2xl`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-1 rounded-full text-sm font-bold shadow-lg">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`inline-flex p-3 rounded-xl ${plan.bgColor} mb-4`}>
                  <div className={`text-transparent bg-gradient-to-r ${plan.color} bg-clip-text`}>
                    {plan.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.tagline}</p>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold text-gray-900">{plan.priceText}</div>
                  <div className="text-gray-600">{plan.period}</div>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                {plan.buttonText}
                <ArrowRight className="inline ml-2 w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Plan Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 text-gray-900 font-semibold">Feature</th>
                  <th className="text-center py-4 text-gray-900 font-semibold">Pay As You Go</th>
                  <th className="text-center py-4 text-gray-900 font-semibold">Daily Pro</th>
                  <th className="text-center py-4 text-gray-900 font-semibold">Monthly Pro</th>
                  <th className="text-center py-4 text-gray-900 font-semibold">Enterprise Yearly</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Analyses per period', payg: '1', daily: 'Unlimited', monthly: 'Unlimited', yearly: 'Unlimited' },
                  { feature: 'Priority Processing', payg: '❌', daily: '✅', monthly: '✅', yearly: '✅' },
                  { feature: 'Advanced Analytics', payg: '❌', daily: '✅', monthly: '✅', yearly: '✅' },
                  { feature: 'Team Members', payg: '1', daily: '1', monthly: 'Up to 5', yearly: 'Unlimited' },
                  { feature: 'API Access', payg: '❌', daily: '❌', monthly: '✅', yearly: '✅' },
                  { feature: 'Custom Models', payg: '❌', daily: '❌', monthly: '❌', yearly: '✅' },
                  { feature: 'Dedicated Support', payg: '❌', daily: '❌', monthly: '✅', yearly: '✅' },
                  { feature: 'Training Sessions', payg: '❌', daily: '❌', monthly: '❌', yearly: '✅' },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 text-gray-700 font-medium">{row.feature}</td>
                    <td className="text-center py-4 text-gray-600">{row.payg}</td>
                    <td className="text-center py-4 text-gray-600">{row.daily}</td>
                    <td className="text-center py-4 text-gray-600">{row.monthly}</td>
                    <td className="text-center py-4 text-gray-600">{row.yearly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I switch plans later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! Every new user gets 1 FREE analysis credit to test our platform.'
              },
              {
                q: 'How do I pay?',
                a: 'We accept bank transfers, credit/debit cards, and mobile money payments.'
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, all plans are month-to-month with no long-term contracts. Cancel anytime.'
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all">
                <div className="flex items-start gap-4">
                  <BadgeCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to protect your crops with AI?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of farmers already using AgriSeal AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                Start Free Analysis
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;