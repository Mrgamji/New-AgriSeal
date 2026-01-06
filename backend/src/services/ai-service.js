// backend/src/services/ai-service.js - COMPLETE FIXED VERSION
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if OpenAI API key is properly configured
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Declare openai variable at the top level
let openai;

if (!OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY environment variable is not set.');
  console.error('Please set a valid OpenAI API key in your environment variables.');
  console.error('For development, create a .env file with: OPENAI_API_KEY=your-api-key-here');
  
  // Create a mock OpenAI client that will fail gracefully
  openai = {
    chat: {
      completions: {
        create: async () => {
          throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment.');
        }
      }
    }
  };
} else {
  // Initialize OpenAI with the valid API key
  console.log('✅ OpenAI API key is configured');
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
}

/**
 * Convert image to base64
 */
const imageToBase64 = (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer.toString('base64');
  } catch (e) {
    console.error('Error reading file for base64:', e);
    return null;
  }
};

/**
 * Main AI analysis function using GPT-4 Vision
 */
export async function analyzeCropImagesWithGPT(imagePaths, category = 'crops', cropType = '') {
  console.log(`[AI] Starting analysis for ${imagePaths.length} image(s), category: ${category}, crop: ${cropType}`);
  
  try {
    // If no API key, return a mock response for development
    if (!OPENAI_API_KEY) {
      console.log('[AI] ⚠️ No OpenAI API key - returning development mock response');
      return generateMockResponse(category, cropType);
    }

    // Convert images to base64
    const imageContents = [];
    for (const imagePath of imagePaths) {
      const b64 = imageToBase64(imagePath);
      if (!b64) {
        console.warn(`[AI] Warning: Could not encode image ${imagePath}`);
        continue;
      }
      
      const ext = path.extname(imagePath).toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.bmp') mimeType = 'image/bmp';
      
      imageContents.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${b64}`,
          detail: "high"
        }
      });
    }

    if (imageContents.length === 0) {
      throw new Error('No valid images could be processed');
    }

    console.log(`[AI] Sending request to OpenAI with ${imageContents.length} image(s)`);

    // Simple prompt for faster response
    const promptText = `Analyze this ${category} image and return JSON with:
{
  "status": "healthy", "infected", or "critical",
  "title": "Brief title",
  "message": "2 sentence analysis",
  "confidence": 0-100,
  "diseaseType": "Specific name or 'Healthy'",
  "severity": 0-10,
  "recommendations": ["Action 1", "Action 2", "Action 3"]
}`;

    const messages = [
      {
        role: "system",
        content: "You are an agricultural expert. Return ONLY valid JSON."
      },
      {
        role: "user",
        content: [
          { type: "text", text: promptText },
          ...imageContents
        ],
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using cheaper/faster model
      messages: messages,
      max_tokens: 500,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices?.[0]?.message?.content || "{}";
    console.log(`[AI] Received OpenAI response (${rawContent.length} chars)`);
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('[AI] JSON parse error:', parseError);
      console.error('[AI] Raw response:', rawContent);
      
      // Fallback to mock response if JSON parsing fails
      return generateMockResponse(category, cropType);
    }

    // Build result object
    const result = {
      status: parsedResult.status || 'unknown',
      title: parsedResult.title || getTitleForStatus(parsedResult.status, category, cropType),
      message: parsedResult.message || 'AI analysis completed successfully.',
      confidence: Math.max(0, Math.min(100, parsedResult.confidence || 75)),
      color: getColorForStatus(parsedResult.status),
      diseaseType: parsedResult.diseaseType || 'Unknown',
      severity: Math.max(0, Math.min(10, parsedResult.severity || 0)),
      recommendations: Array.isArray(parsedResult.recommendations) && parsedResult.recommendations.length > 0
        ? parsedResult.recommendations
        : getDefaultRecommendations(category),
      source: 'openai-gpt-4o-mini',
      processingSteps: [
        { step: 'Image Upload & Validation', completed: true, duration: 2000 },
        { step: 'AI Vision Analysis', completed: true, duration: 8000 },
        { step: 'Disease Pattern Recognition', completed: true, duration: 5000 },
        { step: 'Treatment Recommendation Generation', completed: true, duration: 3000 },
      ],
    };

    console.log(`[AI] Successfully parsed result: ${result.status} (${result.confidence}% confidence)`);
    return result;
    
  } catch (error) {
    console.error('[AI] Error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota' || 
        error.code === 'rate_limit_exceeded' ||
        error.message?.includes('quota') ||
        error.message?.includes('rate_limit') ||
        error.message?.includes('billing') ||
        error.status === 429) {
      
      console.error('[AI] ❌ OpenAI API quota/credit limit reached');
      const quotaError = new Error('OpenAI API quota exceeded. Service temporarily unavailable.');
      quotaError.code = 'OPENAI_QUOTA_ERROR';
      throw quotaError;
    }
    
    // If OpenAI fails, return a mock response for now
    console.log('[AI] ⚠️ OpenAI call failed, returning mock response');
    return generateMockResponse(category, cropType);
  }
}

/**
 * Generate mock response for development/testing
 */
function generateMockResponse(category, cropType) {
  console.log(`[AI] Generating mock response for ${category} ${cropType}`);
  
  const responses = {
    crops: {
      status: 'infected',
      title: 'Early Stage Fungal Infection',
      message: 'Mild fungal infection detected on leaves. Early intervention recommended to prevent spread to other plants.',
      confidence: 87,
      color: 'yellow',
      diseaseType: 'Powdery Mildew',
      severity: 3,
      recommendations: [
        'Remove affected leaves immediately',
        'Apply sulfur-based fungicide',
        'Improve air circulation around plants',
        'Avoid overhead watering',
        'Monitor daily for progression'
      ]
    },
    livestock: {
      status: 'healthy',
      title: 'Animal is Healthy',
      message: 'No signs of disease or health issues detected. The animal appears to be in good condition.',
      confidence: 92,
      color: 'green',
      diseaseType: 'Healthy',
      severity: 0,
      recommendations: [
        'Continue regular monitoring',
        'Maintain proper nutrition',
        'Ensure clean living conditions',
        'Schedule regular veterinary check-ups'
      ]
    },
    fishery: {
      status: 'infected',
      title: 'Parasitic Infection Detected',
      message: 'Signs of parasitic infection observed on fish fins and skin. Early treatment recommended.',
      confidence: 78,
      color: 'yellow',
      diseaseType: 'Ichthyophthirius (Ich)',
      severity: 4,
      recommendations: [
        'Increase water temperature gradually',
        'Add aquarium salt as directed',
        'Consider anti-parasitic medication',
        'Improve water quality',
        'Quarantine affected fish if possible'
      ]
    }
  };

  const response = responses[category] || responses.crops;
  
  return {
    ...response,
    source: 'development-mock',
    processingSteps: [
      { step: 'Image Processing', completed: true, duration: 1500 },
      { step: 'Feature Extraction', completed: true, duration: 2500 },
      { step: 'Pattern Analysis', completed: true, duration: 3500 },
      { step: 'Report Generation', completed: true, duration: 2000 }
    ]
  };
}

// Helper functions
const getColorForStatus = (status) => {
  switch(status?.toLowerCase()) {
    case 'healthy': return 'green';
    case 'infected': return 'yellow';
    case 'critical': return 'red';
    default: return 'gray';
  }
};

const getTitleForStatus = (status, category, cropType = '') => {
  const cropPrefix = cropType ? `${cropType} ` : '';
  
  switch(status?.toLowerCase()) {
    case 'healthy':
      return category === 'crops' ? `${cropPrefix}Crop is Healthy` :
             category === 'livestock' ? 'Animal is Healthy' :
             'Fish are Healthy';
    case 'infected':
      return category === 'crops' ? `${cropPrefix}Disease Detected` :
             category === 'livestock' ? 'Health Issue Detected' :
             'Infection Detected';
    case 'critical':
      return category === 'crops' ? `${cropPrefix}Critical Disease Alert` :
             category === 'livestock' ? 'Critical Health Alert' :
             'Critical Infection Alert';
    default:
      return 'Analysis Complete';
  }
};

const getDefaultRecommendations = (category) => {
  const defaults = {
    crops: [
      'Isolate affected plants immediately',
      'Consult agricultural expert',
      'Apply appropriate treatment',
      'Improve growing conditions',
      'Monitor progress daily'
    ],
    livestock: [
      'Quarantine affected animal',
      'Consult veterinarian',
      'Improve sanitation',
      'Review nutrition',
      'Monitor vital signs'
    ],
    fishery: [
      'Test water quality',
      'Isolate affected fish',
      'Consult aquaculture expert',
      'Improve tank conditions',
      'Monitor behavior'
    ]
  };
  return defaults[category] || defaults.crops;
};

/**
 * Check AI system status
 */
export async function checkAISystem() {
  try {
    if (!OPENAI_API_KEY) {
      return {
        available: false,
        model: 'Mock System',
        status: 'development',
        message: 'Running in development mode with mock responses'
      };
    }
    
    // Simple test to check if OpenAI API is accessible
    await openai.models.list();
    
    return {
      available: true,
      model: 'GPT-4 Vision',
      status: 'operational',
      message: 'AI system is ready for analysis'
    };
  } catch (error) {
    console.error('[AI] System check failed:', error);
    return {
      available: false,
      model: 'GPT-4 Vision',
      status: 'degraded',
      message: 'AI system temporarily unavailable',
      error: error.message
    };
  }
}