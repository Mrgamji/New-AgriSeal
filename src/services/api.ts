// src/services/api.ts

/* ======================================================
   CONFIG
====================================================== */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/* ======================================================
   TYPES
====================================================== */

export type Category = 'crops' | 'livestock' | 'fishery';

export interface AnalysisRequest {
  files?: File[];
  images?: File[]; // backward compatibility
  imageUrls?: string[];
  formData?: FormData;
  category?: Category;
  cropType?: string;
  description?: string;
  timestamp?: string | number;
}

export interface DetectionResult {
  title: string;
  status: 'healthy' | 'infected' | 'critical';
  confidence: number;
  recommendations: string[];
  backendResult?: any;
}

/* ======================================================
   LOW-LEVEL REQUEST (NO ABORT, NO TIMEOUT)
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
  console.log('⏱️ [API] Sending request at', new Date().toISOString());

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include', // REQUIRED for your backend
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
  console.log(
    '📥 Content-Type:',
    response.headers.get('content-type')
  );

  let data: any;
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response format: ${text}`);
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

    // Preserve backend error codes
    (error as any).code = data?.error;
    (error as any).status = response.status;

    throw error;
  }

  return data;
}

/* ======================================================
   ANALYSIS API
====================================================== */

export async function analyzeImages(
  request: AnalysisRequest,
  token?: string
): Promise<DetectionResult> {
  console.log('\n🔬 [Analyze] ===========================================');
  console.log('🔬 Starting analysis');
  console.log('🔬 Category:', request.category);
  console.log('🔬 Timestamp:', request.timestamp);

  // ✅ Read token from localStorage if not provided
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
    files.forEach((file) => formData.append('images', file));

    formData.append('category', request.category);
    if (request.cropType) formData.append('cropType', request.cropType);
    if (request.description) formData.append('description', request.description);
  }

  const response = await apiFormRequest('/api/detect', formData, token);

  console.log('✅ [Analyze] Raw backend response:', response);

  return transformApiResponse(response);
}

/* ======================================================
   RESPONSE TRANSFORM
====================================================== */

function transformApiResponse(apiResponse: any): DetectionResult {
  console.log('\n🔄 [Transform] Normalizing backend response');

  const result =
    apiResponse.result ||
    apiResponse.data ||
    apiResponse.detection ||
    apiResponse;

  const status: DetectionResult['status'] =
    result.status ||
    (result.severity === 'high'
      ? 'critical'
      : result.severity === 'medium'
      ? 'infected'
      : 'healthy');

  const transformed: DetectionResult = {
    title:
      result.title ||
      result.disease ||
      result.condition ||
      'Analysis Result',
    status,
    confidence: Math.round(result.confidence || result.score || 0),
    recommendations:
      result.recommendations ||
      result.advice ||
      result.treatment ||
      [],
    backendResult: apiResponse,
  };

  console.log('🔄 [Transform] Result:', transformed);

  return transformed;
}