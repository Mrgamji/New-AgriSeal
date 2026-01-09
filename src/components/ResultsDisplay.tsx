// components/ResultsDisplay.tsx - PROFESSIONAL REDESIGN (ESSENTIAL INFO ONLY)
import React from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Copy,
} from "lucide-react";

// --- Types ---
interface DisplayResult {
  status: "healthy" | "infected" | "critical" | "rejected" | "unclear" | string;
  title: string;
  message: string;
  confidence: number;
  color: string;
  diseaseType: string;
  identifiedCrop?: string;
  severity: number;
  riskLevel: string;
  recommendations: string[];
  additionalNotes: string;
  source: string;
  analysisTime: number;
  isAgricultural: boolean;
  isClear: boolean;
}

interface ApiDisplayResult {
  success: boolean;
  data?: {
    id: number;
    timestamp: string;
    images: string[];
    result: DisplayResult;
  };
  metadata?: {
    category: "crops" | "livestock" | "fishery";
    cropType: string | null;
    imagesAnalyzed: number;
    creditsRemaining: number;
    aiModel: string;
    note: string;
  };
  error?: string;
  message?: string;
}

interface ResultsDisplayProps {
  result: ApiDisplayResult;
  onReset: () => void;
}

// --- Utility ---

const StatusBadgeColor: Record<string, string> = {
  healthy: "bg-green-600",
  infected: "bg-yellow-500",
  critical: "bg-red-600",
  unclear: "bg-amber-400",
  rejected: "bg-gray-400",
};

// --- MAIN COMPONENT ---
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onReset }) => {
  if (!result.success || !result.data?.result) {
    // Provide error fallback: try message, error, or default.
    const errorMsg =
      typeof result.message === "string"
        ? result.message
        : typeof result.error === "string"
        ? result.error
        : "Unable to display analysis results.";
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center my-8 max-w-xl mx-auto">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-700 mb-2">No Results</h3>
        <p className="text-red-600 mb-4">
          {errorMsg}
        </p>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const d = result.data.result;
  const {
    status,
    title,
    message,
    confidence,
    diseaseType,
    severity,
    riskLevel,
    recommendations,
    additionalNotes,
    isAgricultural,
    isClear,
  } = d;

  // --- Icon selector ---
  let statusIconJsx = null;
  if (status === "healthy") statusIconJsx = <CheckCircle className="w-8 h-8 text-green-500" />;
  else if (status === "infected") statusIconJsx = <AlertTriangle className="w-8 h-8 text-yellow-500" />;
  else if (status === "critical") statusIconJsx = <AlertOctagon className="w-8 h-8 text-red-600" />;
  else if (status === "unclear" || !isClear)
    statusIconJsx = <AlertTriangle className="w-8 h-8 text-amber-500" />;
  else if (status === "rejected" || !isAgricultural)
    statusIconJsx = <XCircle className="w-8 h-8 text-gray-500" />;
  else statusIconJsx = <AlertCircle className="w-8 h-8 text-gray-400" />;

  // --- Report Copy ---
  const [copied, setCopied] = React.useState(false);
  function copyReport() {
    const text =
      `DIAGNOSIS: ${diseaseType}\n` +
      `Risk Level: ${riskLevel}\n` +
      `Severity: ${severity}/10\n` +
      `Confidence: ${confidence}%\n` +
      `\nMessage: ${message}\n` +
      (additionalNotes ? `\nNote: ${additionalNotes}\n` : "") +
      "\nRECOMMENDATIONS:\n" +
      recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  // --- Main professional limited report ---
  return (
    <div className="max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200 mx-auto mt-12 mb-16 animate-fadeIn">
      <div className="flex items-center gap-3 px-8 pt-8 pb-4">
        <div className="shrink-0">
          <div
            className={`rounded-full p-2 flex items-center justify-center ${
              StatusBadgeColor[status] || "bg-blue-500"
            }`}
          >
            {statusIconJsx}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            {title}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`inline-block px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide ${
                StatusBadgeColor[status] || "bg-blue-500"
              } text-white`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span
              className="inline-block px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 ml-2"
              title="Analysis confidence"
            >
              Confidence: {confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* DIAGNOSIS */}
      <section className="px-8 pb-2 pt-1">
        <div className="mt-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Diagnosis</h2>
          <div className="text-base font-bold text-red-700 mb-1">
            {diseaseType}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium mt-1">
            <div>
              <span className="text-gray-500">Severity:</span>{" "}
              <span className="text-gray-900 font-semibold">{severity}/10</span>
            </div>
            <div>
              <span className="text-gray-500">Risk Level:</span>{" "}
              <span
                className={
                  riskLevel.toLowerCase() === "high"
                    ? "text-red-700 font-semibold"
                    : "text-amber-700 font-semibold"
                }
              >
                {riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-gray-700 mt-3 mb-2">{message}</div>
          {additionalNotes && (
            <div className="bg-amber-50 text-amber-800 rounded-lg px-4 py-2 text-sm mt-3 border border-amber-100">
              <span className="font-semibold">Note:</span> {additionalNotes}
            </div>
          )}
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className="px-8 pb-8 mt-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Recommended Actions</h2>
        <ul className="list-decimal ml-6 space-y-1">
          {Array.isArray(recommendations) && recommendations.map((rec, idx) => (
            <li key={idx} className="text-gray-800">{rec}</li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <button
            onClick={copyReport}
            className="flex items-center gap-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition text-sm border border-gray-200"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Report"}
          </button>
          <button
            onClick={onReset}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-sm"
          >
            New Analysis
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-5 border-t pt-4">
          For severe symptoms, always contact an animal health professional promptly. This analysis is for initial, informational purposes only.
        </div>
      </section>
      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s;
        }
      `}</style>
    </div>
  );
};

export default ResultsDisplay;