// src/services/api.ts - FIXED VERSION
/* ======================================================
   CONFIG
====================================================== */

const BACKEND_URL ='https://new-agriseal.onrender.com';

/* ======================================================
   TYPES - UPDATED
====================================================== */

export type Category = 'crops' | 'livestock' | 'fishery';

export interface AnalysisRequest {
  files?: File[];
  images?: File[];
  imageUrls?: string[];
  formData?: FormData;
  category?: Category;
  cropType?: string;
  description?: string;
  timestamp?: string | number;
}

// ENHANCED DetectionResult to match backend
export interface DetectionResult {
  success: boolean;
  data?: {
    id: number;
    timestamp: string;
    images: string[];
    result: {
      status: 'healthy' | 'infected' | 'critical' | 'rejected' | 'unclear' | string;
      title: string;
      message: string;
      confidence: number;
      color: string;
      diseaseType: string;
      identifiedCrop?: string;
      severity: number;
      riskLevel: string;
      recommendations: string[] | { title: string; items: string[] }[];
      additionalNotes: string;
      source: string;
      analysisTime: number;
      isAgricultural: boolean;
      isClear: boolean;
      processingSteps?: Array<{ step: string; duration: number }>;
    };
  };
  metadata?: {
    category: string;
    cropType: string | null;
    imagesAnalyzed: number;
    creditsRemaining: number;
    aiModel: string;
    note: string;
  };
  error?: string;
  message?: string;
}

/* ======================================================
   LOW-LEVEL REQUEST
====================================================== */

async function apiFormRequest(
  endpoint: string,
  formData: FormData,
  token?: string
): Promise<any> {
  const url = `${BACKEND_URL}${endpoint}`;

  console.log('\n📤 [API REQUEST] =======================================');
  console.log('📤 URL:', url);
  console.log('📤 Method: POST');
  console.log('📤 Backend URL:', BACKEND_URL);
  console.log('🔑 Auth token present:', Boolean(token));

  const entries = Array.from(formData.entries());
  console.log(
    '📦 FormData entries:',
    entries.map(([key, value]) =>
      value instanceof File
        ? `${key}: File("${value.name}", ${value.size} bytes, ${value.type})`
        : `${key}: "${value}"`
    )
  );
  console.log(
    '📦 Total files:',
    entries.filter(([, v]) => v instanceof File).length
  );

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
  } catch (networkError) {
    console.error('\n❌ [API NETWORK ERROR]');
    console.error(networkError);
    throw new Error(
      `Cannot connect to server at ${BACKEND_URL}. Please ensure the backend is running.`
    );
  }

  console.log('\n📥 [API RESPONSE] =======================================');
  console.log('📥 Status:', response.status);
  console.log('📥 OK:', response.ok);
  console.log('📥 Content-Type:', response.headers.get('content-type'));

  let data: any;
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      data = await response.json();
      console.log('📥 Raw response data:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.error('❌ Unexpected response format:', text.substring(0, 500));
      throw new Error(`Unexpected response format`);
    }
  } catch (parseError) {
    console.error('❌ Failed to parse backend response', parseError);
    throw new Error('Invalid response from server');
  }

  if (!response.ok) {
    console.error('❌ [API ERROR PAYLOAD]', data);

    const error = new Error(
      data?.message || data?.error || 'Request failed'
    );

    (error as any).code = data?.error;
    (error as any).status = response.status;

    throw error;
  }

  return data;
}

/* ======================================================
   ANALYSIS API - FIXED
====================================================== */

export async function analyzeImages(
  request: AnalysisRequest,
  token?: string
): Promise<DetectionResult> {
  console.log('\n🔬 [Analyze] ===========================================');
  console.log('🔬 Starting analysis');
  console.log('🔬 Category:', request.category);
  console.log('🔬 Crop Type:', request.cropType);

  // Read token from localStorage if not provided
  if (!token) {
    token = localStorage.getItem('agriseal_token') || undefined;
    console.log('🔑 Token loaded from localStorage:', Boolean(token));
  }

  let formData: FormData;

  if (request.formData) {
    console.log('📦 Using pre-built FormData');
    formData = request.formData;
  } else {
    console.log('📦 Building FormData in API layer');
    formData = new FormData();

    const files = request.files || request.images || [];
    if (files.length === 0) {
      throw new Error('No images provided for analysis');
    }
    
    files.forEach((file) => {
      formData.append('images', file);
      console.log(`📤 Adding file: ${file.name} (${file.size} bytes)`);
    });

    formData.append('category', request.category || 'crops');
    if (request.cropType) formData.append('cropType', request.cropType);
    if (request.description) formData.append('description', request.description);
  }

  try {
    const response = await apiFormRequest('/api/detect', formData, token);
    console.log('✅ [Analyze] Received complete backend response');
    
    // Return the FULL response - don't transform it
    return response as DetectionResult;
    
  } catch (error) {
    console.error('❌ [Analyze] API call failed:', error);
    throw error;
  }
}

/* ======================================================
   HELPER: Extract result for ResultsDisplay
====================================================== */

export function extractResultForDisplay(apiResponse: DetectionResult) {
  console.log('\n🎯 [Extract] Preparing data for ResultsDisplay');
  
  if (!apiResponse.success || !apiResponse.data) {
    console.error('❌ Invalid API response:', apiResponse);
    throw new Error(apiResponse.message || 'Analysis failed');
  }
  
  const result = apiResponse.data.result;
  console.log('🎯 Extracted result:', {
    status: result.status,
    title: result.title,
    confidence: result.confidence,
    diseaseType: result.diseaseType,
    identifiedCrop: result.identifiedCrop,
    isAgricultural: result.isAgricultural,
    isClear: result.isClear
  });
  
  return result;
}

/* ======================================================
   HISTORY & DETAILS APIs
====================================================== */

export async function getDetectionHistory(token?: string, limit = 10, offset = 0) {
  if (!token) {
    const storedToken = localStorage.getItem('agriseal_token');
    token = storedToken !== null ? storedToken : undefined;
  }
  
  const url = `${BACKEND_URL}/api/detections?limit=${limit}&offset=${offset}`;
  
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch detection history');
  }
  
  return await response.json();
}

export async function getDetectionDetails(id: number, token?: string) {
  if (!token) {
    const storedToken = localStorage.getItem('agriseal_token');
    token = storedToken !== null ? storedToken : undefined;
  }
  
  const url = `${BACKEND_URL}/api/detections/${id}`;
  
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch detection details');
  }
  
  return await response.json();
}

/* ======================================================
   SYSTEM STATUS
====================================================== */

export async function getSystemStatus() {
  const url = `${BACKEND_URL}/api/system/status`;
  
  const response = await fetch(url, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to get system status');
  }
  
  return await response.json();
}
