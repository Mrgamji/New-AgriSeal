import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Activity, Cpu, Database, Cloud, Shield } from 'lucide-react';

interface ProcessingStepsProps {
  steps: Array<{
    step: string;
    completed: boolean;
    duration: number;
    icon?: React.ReactNode;
    description?: string;
  }>;
  category: string;
  progress?: number;
}

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ steps, category, progress = 0 }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (progress > animatedProgress) {
      const timer = setTimeout(() => {
        setAnimatedProgress(prev => Math.min(prev + 2, progress));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [progress, animatedProgress]);

  useEffect(() => {
    const completedIndex = steps.findIndex(step => !step.completed);
    setCurrentStep(completedIndex === -1 ? steps.length - 1 : completedIndex);
  }, [steps]);

  const getCategoryIcon = () => {
    switch (category) {
      case 'crops': return '🌱';
      case 'livestock': return '🐄';
      case 'fishery': return '🐟';
      default: return '🔍';
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Analysis Running</h3>
              <p className="text-gray-600 text-sm">Analyzing {category} images</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{animatedProgress.toFixed(0)}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div 
            className="absolute h-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-full transition-all duration-300"
            style={{ width: `${animatedProgress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full border-2 border-emerald-500 animate-ping" />
          </div>
        </div>
      </div>

      {/* Steps with Animation */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`relative p-4 rounded-xl border transition-all duration-300 ${
              step.completed 
                ? 'bg-green-50 border-green-200 shadow-sm' 
                : index === currentStep
                  ? 'bg-blue-50 border-blue-300 shadow-md animate-pulse'
                  : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-100' 
                    : index === currentStep
                      ? 'bg-blue-100 animate-spin-slow'
                      : 'bg-gray-100'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : index === currentStep ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 bg-blue-600 rounded-full" />
                    </div>
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                  {index === currentStep && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{step.step}</div>
                  <div className="text-sm text-gray-600">{step.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-700">
                  {step.duration / 1000}s
                </div>
                {index === currentStep && (
                  <div className="text-xs text-blue-600 font-medium mt-1">
                    Processing...
                  </div>
                )}
              </div>
            </div>

            {/* Step connector lines */}
            {index < steps.length - 1 && (
              <div className="absolute left-5 top-full h-4 w-0.5 bg-gray-200" />
            )}
          </div>
        ))}
      </div>

      {/* AI Status Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">YOLOv8 AI Model</span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Secure Cloud Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">95% Accuracy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add custom animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
`;
document.head.appendChild(style);

export default ProcessingSteps;