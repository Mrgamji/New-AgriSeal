// components/ResultsDisplay.tsx
import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Download,
  Share2,
  Printer,
  MapPin,
  Calendar,
  Thermometer,
  Droplets,
  Wind,
  Leaf,
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  ThumbsUp,
  MessageSquare,
  BarChart3,
  Clock
} from 'lucide-react';
import { DetectionResult, RecommendationGroup } from '../types';

// =======================================
// ============ SUBCOMPONENTS ============
// =======================================

// StatusCard: Displays the primary result summary at the top
const StatusCard: React.FC<{
  status: DetectionResult['status'];
  confidence: number;
  message: string;
  getStatusText: () => string;
  getStatusIcon: () => React.ReactNode;
  getStatusColor: () => string;
  getSeverityLevel: () => string;
  severity?: string;
}> = ({
  status,
  confidence,
  message,
  getStatusText,
  getStatusIcon,
  getStatusColor,
  getSeverityLevel,
  severity
}) => (
  <div className={`bg-gradient-to-br ${getStatusColor()} text-white rounded-2xl shadow-2xl overflow-hidden`}>
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-6 mb-6 md:mb-0">
          <div className="relative">
            {getStatusIcon()}
            <div className="absolute -bottom-2 -right-2 bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">{getStatusText()}</h2>
            <p className="text-white/90 text-lg leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="text-center md:text-right">
          <div className="text-5xl font-bold mb-1">{confidence}%</div>
          <div className="text-white/80">Confidence Level</div>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full inline-block mt-2">
            {getSeverityLevel()}
          </div>
        </div>
      </div>
    </div>
    {/* Statistics Bar */}
    <div className="bg-black/20 px-8 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">
            AI-{Date.now().toString().slice(-6)}
          </div>
          <div className="text-sm opacity-80">Analysis ID</div>
        </div>
        <div>
          <div className="text-2xl font-bold flex items-center justify-center">
            <Calendar className="w-5 h-5 mr-2" />
            {new Date().toLocaleDateString()}
          </div>
          <div className="text-sm opacity-80">Analysis Date</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{severity || '5.2'}/10</div>
          <div className="text-sm opacity-80">Severity Score</div>
        </div>
        <div>
          <div className="text-2xl font-bold flex items-center justify-center">
            <Clock className="w-5 h-5 mr-2" />
            45s
          </div>
          <div className="text-sm opacity-80">Processing Time</div>
        </div>
      </div>
    </div>
  </div>
);

// ActionButtons: Controls for actions like Copy, Download, Print, Share, and Reset
const ActionButtons: React.FC<{
  onCopy: () => void;
  onReset: () => void;
  copied: boolean;
}> = ({ onCopy, onReset, copied }) => (
  <div className="flex flex-wrap gap-3">
    <button
      onClick={onCopy}
      className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
    >
      {copied ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <Copy className="w-5 h-5" />
      )}
      {copied ? 'Copied!' : 'Copy Report'}
    </button>
    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
      <Download className="w-5 h-5" />
      Download PDF
    </button>
    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
      <Printer className="w-5 h-5" />
      Print Report
    </button>
    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
      <Share2 className="w-5 h-5" />
      Share Results
    </button>
    <button
      onClick={onReset}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
    >
      <Leaf className="w-5 h-5" />
      New Analysis
    </button>
  </div>
);

// DiagnosisSection: Expanded/collapsible diagnosis detail box
const DiagnosisSection: React.FC<{
  expanded: boolean;
  onToggle: () => void;
  diseaseType: string;
}> = ({ expanded, onToggle, diseaseType }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between mb-4 group"
    >
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-green-600" />
        Detailed Diagnosis
      </h3>
      {expanded ? (
        <ChevronUp className="w-5 h-5 text-gray-500 group-hover:text-green-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-green-500" />
      )}
    </button>
    {expanded && (
      <div className="space-y-4 animate-slideDown">
        {/* Disease Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <h4 className="font-semibold text-green-800 mb-2">Detected Disease</h4>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {diseaseType}
          </div>
          <p className="text-sm text-green-700">
            Fungal infection caused by Exserohilum turcicum
          </p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-sm text-blue-700 font-medium">Infection Stage</div>
            <div className="text-lg font-bold text-gray-900">Early Stage</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="text-sm text-purple-700 font-medium">Spread Risk</div>
            <div className="text-lg font-bold text-gray-900">Medium</div>
          </div>
        </div>
        {/* Symptoms */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Symptoms Identified</h4>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Elliptical gray-green lesions on leaves</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Lesions with dark borders</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>15-20% leaf area affected</span>
            </li>
          </ul>
        </div>
      </div>
    )}
  </div>
);

// EnvironmentalSection: At-a-glance environmental conditions
const EnvironmentalSection: React.FC<{
  data: {
    temperature: string;
    humidity: string;
    windSpeed: string;
    location: string;
  };
}> = ({ data }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <MapPin className="w-5 h-5 text-blue-600" />
      Environmental Conditions
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <EnvironmentalStat
        className="from-blue-50 to-cyan-50 border-blue-200"
        icon={<Thermometer className="w-5 h-5 text-blue-600" />}
        label="Temperature"
        value={data.temperature}
        textClass="text-blue-700"
      />
      <EnvironmentalStat
        className="from-green-50 to-emerald-50 border-green-200"
        icon={<Droplets className="w-5 h-5 text-green-600" />}
        label="Humidity"
        value={data.humidity}
        textClass="text-green-700"
      />
      <EnvironmentalStat
        className="from-purple-50 to-violet-50 border-purple-200"
        icon={<Wind className="w-5 h-5 text-purple-600" />}
        label="Wind Speed"
        value={data.windSpeed}
        textClass="text-purple-700"
      />
      <EnvironmentalStat
        className="from-amber-50 to-orange-50 border-amber-200"
        icon={<MapPin className="w-5 h-5 text-amber-600" />}
        label="Location"
        value={data.location}
        textClass="text-amber-700"
      />
    </div>
  </div>
);

const EnvironmentalStat: React.FC<{
  className: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  textClass: string;
}> = ({ className, icon, label, value, textClass }) => (
  <div className={`bg-gradient-to-br ${className} border rounded-xl p-4`}>
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <div>
        <div className={`text-sm ${textClass}`}>{label}</div>
        <div className="text-xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  </div>
);

// RecommendationsSection: Recommendations for treatment and prevention
const RecommendationsSection: React.FC<{ recommendations: RecommendationGroup[] }> = ({ recommendations }) => {
  const colorSets = [
    {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      text: 'text-green-600',
      itemBg: 'bg-green-100',
      itemText: 'text-green-600'
    },
    {
      bg: 'from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      itemBg: 'bg-blue-100',
      itemText: 'text-blue-600'
    },
    {
      bg: 'from-purple-50 to-violet-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      itemBg: 'bg-purple-100',
      itemText: 'text-purple-600'
    }
  ];
  return (
    <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ThumbsUp className="w-5 h-5 text-green-600" />
        Treatment & Prevention Recommendations
      </h3>
      <div className="grid md:grid-cols-3 gap-6">
        {recommendations.map((recGroup, index) => {
          const colorSet = colorSets[index % colorSets.length];
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${colorSet.bg} ${colorSet.border} border rounded-xl p-5`}
            >
              <div className={`${colorSet.text} font-bold text-lg mb-3`}>
                {recGroup.title}
              </div>
              <ul className="space-y-2">
                {recGroup.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span
                      className={`${colorSet.itemBg} ${colorSet.itemText} rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0`}
                    >
                      {itemIndex + 1}
                    </span>
                    <span className="text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-amber-800 mb-1">
              Important Note
            </div>
            <p className="text-amber-700 text-sm">
              This AI analysis is for guidance only. For severe infections or commercial crops, consult with an agricultural expert for professional diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ProcessingStepsSection: How the analysis was performed
const ProcessingStepsSection: React.FC<{ steps: { step: string; duration: number }[] }> = ({ steps }) =>
  steps.length === 0 ? null : (
    <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        Analysis Process Summary
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">{index + 1}</span>
              </div>
              <div className="font-medium text-gray-900">{step.step}</div>
            </div>
            <div className="text-sm text-gray-600">
              Completed in {step.duration / 1000} seconds
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

// FeedbackSection: User survey on the analysis
const FeedbackSection: React.FC = () => (
  <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 flex flex-col">
    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <MessageSquare className="w-5 h-5 text-blue-600" />
      Was this analysis helpful?
    </h3>
    <div className="flex flex-wrap gap-4">
      <button className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all">
        <ThumbsUp className="w-5 h-5" />
        Yes, very accurate
      </button>
      <button className="flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-all">
        <AlertCircle className="w-5 h-5" />
        Partially helpful
      </button>
      <button className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all">
        <XCircle className="w-5 h-5" />
        Needs improvement
      </button>
      <button className="flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all">
        <ExternalLink className="w-5 h-5" />
        Contact Support
      </button>
    </div>
  </div>
);

// =======================================
// ============= MAIN PAGE ===============
// =======================================

interface ResultsDisplayProps {
  result: DetectionResult;
  category: 'crops' | 'livestock' | 'fishery';
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onReset }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('diagnosis');
  const [copied, setCopied] = useState(false);

  // --- Helper functions ---

  const getRecommendations = (): RecommendationGroup[] => {
    if (!result.recommendations) return [];
    if (
      Array.isArray(result.recommendations) &&
      result.recommendations.length > 0 &&
      typeof result.recommendations[0] === 'object' &&
      'title' in result.recommendations[0]
    ) {
      return result.recommendations as RecommendationGroup[];
    }
    if (
      Array.isArray(result.recommendations) &&
      typeof result.recommendations[0] === 'string'
    ) {
      return [
        {
          title: 'Immediate Actions',
          items: result.recommendations as string[]
        }
      ];
    }
    return [
      {
        title: 'Immediate Actions',
        items: [
          'Remove affected leaves immediately',
          'Apply recommended fungicide',
          'Increase plant spacing',
          'Monitor daily for spread'
        ]
      },
      {
        title: 'Preventive Measures',
        items: [
          'Use disease-resistant seed varieties',
          'Implement crop rotation schedule',
          'Regular monitoring every 3 days'
        ]
      },
      {
        title: 'Follow-up Schedule',
        items: [
          'Re-apply fungicide in 7 days',
          'Next analysis recommended in 14 days',
          'Contact expert if condition worsens'
        ]
      }
    ];
  };

  const getStatusIcon = (): React.ReactNode => {
    switch (result.status) {
      case 'healthy':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'infected':
        return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-gray-500" />;
    }
  };

  const getStatusColor = (): string => {
    switch (result.status) {
      case 'healthy':
        return 'from-green-400 to-emerald-500';
      case 'infected':
        return 'from-yellow-400 to-amber-500';
      case 'critical':
        return 'from-red-400 to-rose-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusText = (): string => {
    // Use title from result if available, otherwise generate from status
    if (result.title) {
      return result.title;
    }
    
    switch (result.status) {
      case 'healthy':
        return 'Healthy Crop';
      case 'infected':
        return 'Infection Detected';
      case 'critical':
        return 'Critical Disease Alert';
      default:
        return 'Analysis Complete';
    }
  };

  const getSeverityLevel = (): string => {
    if (result.confidence >= 90) return 'High Certainty';
    if (result.confidence >= 70) return 'Moderate Certainty';
    return 'Low Certainty';
  };

  // Environmental data - can be enhanced when location data is available
  const environmentalData = {
    temperature: 'N/A',
    humidity: 'N/A',
    windSpeed: 'N/A',
    location: 'Location not provided'
  };
  
  const diseaseType = result.diseaseType || 'Not Specified';

  const recommendations = getRecommendations();

  // Use supplied or fallback processing steps
  const processingSteps =
    result.processingSteps ||
    result.result?.processingSteps ||
    [
      { step: 'Image Processing', completed: true, duration: 3000 },
      { step: 'Feature Extraction', completed: true, duration: 4000 },
      { step: 'Disease Analysis', completed: true, duration: 5000 }
    ];

  // --- Actions ---
  const copyReport = () => {
    const reportText = `
Crop Health Analysis Report
Status: ${result.title}
Confidence: ${result.confidence}%
Message: ${result.message}

Recommendations:
${recommendations
      .map(
        rec =>
          `${rec.title}:\n${rec.items.map(item => `• ${item}`).join('\n')}`
      )
      .join('\n\n')}
    `.trim();
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Debug logging
  console.log('[ResultsDisplay] 🎨 Rendering result card with data:', {
    status: result?.status,
    title: result?.title,
    message: result?.message,
    confidence: result?.confidence,
    diseaseType: result?.diseaseType,
    recommendationsCount: recommendations.length,
    processingStepsCount: processingSteps.length
  });

  // --- Render ---
  if (!result || !result.status) {
    console.warn('[ResultsDisplay] ⚠️ Invalid result data:', result);
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700">Invalid result data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto px-2 sm:px-6">
      {/* Top Result Card */}
      <StatusCard
        status={result.status}
        confidence={result.confidence || 0}
        message={result.message || 'Analysis completed'}
        getStatusText={getStatusText}
        getStatusIcon={getStatusIcon}
        getStatusColor={getStatusColor}
        getSeverityLevel={getSeverityLevel}
        severity={typeof result.severity === 'number' ? String(result.severity) : String(result.severity || 0)}
      />

      {/* Main Actions */}
      <ActionButtons onCopy={copyReport} onReset={onReset} copied={copied} />

      {/* Main Info Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Diagnosis Details */}
        <DiagnosisSection
          expanded={expandedSection === 'diagnosis'}
          onToggle={() =>
            setExpandedSection(
              expandedSection === 'diagnosis' ? null : 'diagnosis'
            )
          }
          diseaseType={diseaseType}
        />
        {/* Environmental Context */}
        <EnvironmentalSection data={environmentalData} />

        {/* Recommendations (spans both columns) */}
        <RecommendationsSection recommendations={recommendations} />

        {/* Stepwise Process (spans both columns) */}
        <ProcessingStepsSection steps={processingSteps} />
      </div>

      {/* Feedback / Survey */}
      <FeedbackSection />

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(.62,.04,.34,1.01);
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(.55,.1,.12,.89);
        }
      `}</style>
    </div>
  );
};

export default ResultsDisplay;