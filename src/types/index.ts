// --- Common domain types for both backend and frontend ---

// Subscription plan types
export interface Subscription {
  id: string;
  plan: 'free' | 'basic' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  expiresAt: string;
  credits: number;
}

// Unified User interface
export interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  subscription: Subscription | null;
  freeTrialUsed: boolean;
  createdAt: string;
}

// ProcessingStep structure
export interface ProcessingStep {
  step: string;
  completed: boolean;
  duration: number;
  icon?: string; // Optional, for frontend display
  category?: 'crops' | 'livestock' | 'fishery';
}

// Single Disease/Analysis result structure
export type RecommendationGroup = {
  title: string;
  items: string[];
};

// DetectionResult type supporting both backend and frontend structures
export interface DetectionResult {
  // These are always present for an analysis result
  status: 'healthy' | 'infected' | 'critical' | 'invalid' | string;
  title: string;
  message: string;
  confidence: number;
  color: string;
  timestamp: string;

  // Some extended properties for results record display and matching API models
  id?: number; // DB record id if applicable
  images?: string[]; // URLs or data-urls
  category?: 'crops' | 'livestock' | 'fishery' | string;
  diseaseType?: string;
  severity?: number;

  // Unify recommendations as group objects (preferably), fallback to string[] for backward compat
  recommendations?: RecommendationGroup[] | string[];

  // For records: backend returns this, for in-memory: can fallback to top-level processingSteps
  processingSteps?: ProcessingStep[];
  result?: {
    status: string;
    title: string;
    message: string;
    confidence: number;
    color: string;
    processingSteps?: ProcessingStep[];
  };
}

// Request shape for running a new analysis
export interface AnalysisRequest {
  files: any;
  images?: File[]; // Preferred usage in new API - array of images (all categories)
  // For legacy use (older code): support `image1` and `image2`
  image1?: File;
  image2?: File;

  category?: 'crops' | 'livestock' | 'fishery';
  cropType?: string;
  location?: string;
  description?: string;
  timestamp?: string;
  imageUrls?: string[];
  formData?: FormData;
}

// Payments
export interface PaymentDetails {
  amount: number;
  credits: number;
  transactionId: string;
  timestamp: string;
}

