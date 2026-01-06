// frontend/src/services/api.ts
import { DetectionResult, AnalysisRequest, RecommendationGroup } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Local helper to get auth token (don't import from auth.ts to avoid circular dependency)
const getAuthToken = (): string => {
  return localStorage.getItem('agriseal_token') || '';
};

// Helper: Form data API request
const apiFormRequest = async (endpoint: string, formData: FormData) => {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('agriseal_token');
        localStorage.removeItem('agriseal_user');
      }
      
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Transform API response to unified DetectionResult
 */
const transformApiResponse = (apiData: any, category: string): DetectionResult => {
  // API returns data in data.result format, we need to unify it
  const result = apiData.data.result;
  const recommendations = generateRecommendations(result.status, category);
  
  return {
    // Core result properties
    status: result.status,
    title: result.title,
    message: result.message,
    confidence: result.confidence,
    color: result.color,
    timestamp: apiData.data.timestamp || new Date().toISOString(),
    
    // Extended properties
    id: apiData.data.id,
    images: apiData.data.images || [],
    category: category,
    
    // Recommendations - ensure it's in the right format
    recommendations: recommendations,
    
    // Processing steps
    processingSteps: result.processingSteps || [],
    
    // For backward compatibility with older code
    result: result
  };
};

/**
 * Main function to analyze images for disease detection
 */
export const analyzeImages = async (request: AnalysisRequest): Promise<DetectionResult> => {
  const formData = new FormData();
  
  // Append images - handle both new (images array) and old (image1, image2) formats
  if (request.images && request.images.length > 0) {
    // New format: images array
    request.images.forEach((image, index) => {
      if (image) formData.append('images', image);
    });
  } else {
    // Old format: image1 and image2
    if (request.image1) formData.append('images', request.image1);
    if (request.image2) formData.append('images', request.image2);
  }

  // Append metadata
  if (request.category) formData.append('category', request.category);
  if (request.cropType) formData.append('cropType', request.cropType || '');
  if (request.location) formData.append('location', request.location || '');

  try {
    const data = await apiFormRequest('/api/detect', formData);
    return transformApiResponse(data, request.category || 'crops');
  } catch (error: any) {
    if (error.message === 'INSUFFICIENT_CREDITS') {
      throw error;
    }
    throw new Error('Failed to analyze images');
  }
};

/**
 * Generate recommendations based on result (returns RecommendationGroup[])
 */
const generateRecommendations = (status: string, category: string): RecommendationGroup[] => {
  const baseRecommendations: RecommendationGroup[] = [
    {
      title: 'Immediate Action',
      items: ['Isolate affected area', 'Document progression', 'Consult specialist if severe']
    },
    {
      title: 'Treatment Plan',
      items: ['Apply recommended treatment', 'Monitor for 3-5 days', 'Repeat analysis if no improvement']
    }
  ];

  if (status === 'critical') {
    return [
      {
        title: '🚨 Emergency Actions',
        items: [
          'Isolate immediately to prevent spread',
          'Contact agricultural extension officer',
          'Begin emergency treatment protocol'
        ]
      },
      ...baseRecommendations
    ];
  }

  if (status === 'warning' || status === 'infected') {
    return [
      {
        title: '⚠️ Preventive Measures',
        items: [
          'Begin early treatment',
          'Increase monitoring frequency',
          'Improve environmental conditions'
        ]
      },
      ...baseRecommendations
    ];
  }

  // Default for healthy status
  return [
    {
      title: '✅ Maintenance Recommendations',
      items: [
        'Continue regular monitoring',
        'Maintain optimal growing conditions',
        'Schedule monthly check-ups'
      ]
    }
  ];
};

/**
 * Fetch analysis history and transform to unified format
 */
export const fetchHistory = async (): Promise<DetectionResult[]> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${BACKEND_URL}/api/history`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch history');
  }

  // Transform each history item to unified DetectionResult format
  return data.data.map((item: any) => {
    const result = typeof item.result === 'string' ? JSON.parse(item.result) : item.result;
    
    return {
      status: result.status,
      title: result.title,
      message: result.message,
      confidence: result.confidence,
      color: result.color,
      timestamp: item.created_at || item.timestamp || new Date().toISOString(),
      
      // Extended properties
      id: item.id,
      images: [
        item.image1_name ? `/uploads/${item.image1_name}` : '',
        item.image2_name ? `/uploads/${item.image2_name}` : ''
      ].filter(Boolean),
      category: item.category || 'crops',
      
      // Generate recommendations for historical data
      recommendations: generateRecommendations(result.status, item.category || 'crops'),
      
      // Processing steps
      processingSteps: result.processingSteps || [],
      
      // For backward compatibility
      result: result
    };
  });
};

/**
 * Check API health
 */
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
};

/**
 * Frontend-only validation
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.'
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.'
    };
  }

  return { valid: true };
};

/**
 * Convert image to base64 for preview
 */
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Fallback mock function for development/testing
 */
export const analyzeImagesMock = async (request: AnalysisRequest): Promise<DetectionResult> => {
  console.warn('⚠️ Using mock analysis - backend not connected');
  
  const statuses: Array<'healthy' | 'infected' | 'critical'> = ['healthy', 'infected', 'critical'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  const mockResult: DetectionResult = {
    status: randomStatus,
    title: randomStatus === 'healthy' ? 'Crop is Healthy' : 
           randomStatus === 'infected' ? 'Early Stage Infection Detected' : 
           'Critical Disease Alert',
    message: randomStatus === 'healthy' 
      ? 'No signs of disease detected. Your crop appears to be in excellent condition.'
      : randomStatus === 'infected'
      ? 'Mild fungal infection detected. Early intervention recommended.'
      : 'Severe infection detected requiring immediate intervention.',
    confidence: randomStatus === 'healthy' ? 94 : randomStatus === 'infected' ? 87 : 92,
    color: randomStatus === 'healthy' ? 'green' : randomStatus === 'infected' ? 'yellow' : 'red',
    timestamp: new Date().toISOString(),
    category: request.category || 'crops',
    recommendations: generateRecommendations(randomStatus, request.category || 'crops'),
    processingSteps: [
      { step: 'Image Processing', completed: true, duration: 3000 },
      { step: 'Feature Extraction', completed: true, duration: 4000 },
      { step: 'Disease Analysis', completed: true, duration: 5000 }
    ]
  };
  
  return new Promise(resolve => {
    setTimeout(() => resolve(mockResult), 3000);
  });
};

// Export a helper to clear auth if needed
export const clearAuthTokens = () => {
  localStorage.removeItem('agriseal_token');
  localStorage.removeItem('agriseal_user');
};