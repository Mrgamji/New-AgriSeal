// backend/src/services/ai-service.js - UPDATED WITH CROP IDENTIFICATION
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🤖 AI Service Initializing (Enhanced GPT Mode)...');

let openai;

if (!OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY environment variable is not set.');
  throw new Error('OpenAI API key not configured.');
} else {
  console.log('✅ OpenAI API key configured');
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
    console.error(`Error reading file:`, e.message);
    return null;
  }
};

/**
 * Get specialized prompt based on category
 */
const getSpecializedPrompt = (category, cropType) => {
  const categoryPrompts = {
    crops: `You are an expert agricultural scientist specializing in plant pathology and crop identification.

CRITICAL ANALYSIS STEPS:
1. FIRST, determine if this is an AGRICULTURAL image:
   - YES: Plants, crops, leaves, stems, fruits, vegetables, agricultural fields
   - NO: Buildings, cars, people, pets, furniture, random objects, non-agricultural scenes

2. IF AGRICULTURAL, identify the CROP TYPE if possible:
   - Examples: Tomato, Corn, Rice, Wheat, Potato, Apple, Grape, Lettuce, etc.
   - If unsure, say "Unidentified crop"

3. THEN assess image CLARITY:
   - Clear: Well-lit, focused, shows details
   - Unclear: Blurry, dark, too distant, poor quality

4. ONLY THEN analyze HEALTH STATUS

Return ONLY valid JSON with this EXACT structure:

{
  "isAgriculturalImage": true or false,
  "imageClear": true or false,
  "identifiedCrop": "Specific crop name or 'Unidentified'",
  "status": "healthy", "infected", "critical", or "unclear",
  "title": "Brief descriptive title",
  "message": "Clear 2-3 sentence analysis",
  "confidence": number between 0-100,
  "diseaseType": "Specific disease name or 'Healthy' or 'Not agricultural'",
  "severity": number between 0-10,
  "riskLevel": "low", "medium", "high", or "none",
  "recommendations": ["Practical action 1", "Action 2", "Action 3", "Action 4", "Action 5"],
  "additionalNotes": "Any important notes about crop type, image quality, or limitations"
}

IMPORTANT RULES:
1. If NOT agricultural: "isAgriculturalImage": false, "status": "rejected", "confidence": 0
2. If unclear: "imageClear": false, lower confidence
3. Be SPECIFIC about crop names: "Tomato plants", "Corn field", "Rice paddy"
4. NEVER guess or make up diseases - if unsure, say "Unclear" or "Cannot determine"`,

    livestock: `You are an expert veterinarian specializing in livestock health.

CRITICAL ANALYSIS STEPS:
1. FIRST, determine if this is LIVESTOCK:
   - YES: Cattle, sheep, goats, pigs, poultry, horses, other farm animals
   - NO: Pets, wild animals, people, buildings, non-livestock scenes

2. IF LIVESTOCK, identify the SPECIES if possible:
   - Examples: Dairy cow, Sheep, Goat, Pig, Chicken, Turkey
   - If unsure, say "Unidentified livestock"

3. THEN assess image CLARITY

4. ONLY THEN analyze HEALTH STATUS

Return ONLY valid JSON with this EXACT structure:

{
  "isAgriculturalImage": true or false,
  "imageClear": true or false,
  "identifiedSpecies": "Specific species or 'Unidentified'",
  "status": "healthy", "infected", "critical", or "unclear",
  "title": "Brief descriptive title",
  "message": "Clear 2-3 sentence analysis",
  "confidence": number between 0-100,
  "healthIssue": "Specific issue name or 'Healthy' or 'Not livestock'",
  "severity": number between 0-10,
  "riskLevel": "low", "medium", "high", or "none",
  "recommendations": ["Practical action 1", "Action 2", "Action 3", "Action 4", "Action 5"],
  "additionalNotes": "Any important notes"
}`,

    fishery: `You are an expert aquaculture specialist.

CRITICAL ANALYSIS STEPS:
1. FIRST, determine if this is FISHERY/AQUACULTURE:
   - YES: Fish, shrimp, aquaculture, aquatic species, fish farms
   - NO: Pets, wild animals, people, non-aquatic scenes

2. IF FISHERY, identify the SPECIES if possible:
   - Examples: Tilapia, Salmon, Trout, Shrimp, Carp, Catfish
   - If unsure, say "Unidentified aquatic species"

3. THEN assess image CLARITY

4. ONLY THEN analyze HEALTH STATUS

Return ONLY valid JSON with this EXACT structure:

{
  "isAgriculturalImage": true or false,
  "imageClear": true or false,
  "identifiedSpecies": "Specific species or 'Unidentified'",
  "status": "healthy", "infected", "critical", or "unclear",
  "title": "Brief descriptive title",
  "message": "Clear 2-3 sentence analysis",
  "confidence": number between 0-100,
  "issueType": "Specific issue name or 'Healthy' or 'Not fishery'",
  "severity": number between 0-10,
  "riskLevel": "low", "medium", "high", or "none",
  "recommendations": ["Practical action 1", "Action 2", "Action 3", "Action 4", "Action 5"],
  "additionalNotes": "Any important notes"
}`
  };

  const basePrompt = categoryPrompts[category] || categoryPrompts.crops;
  const userCrop = cropType ? `User reported crop type: ${cropType}. Please verify or identify the actual crop from the image.` : '';
  
  return `${basePrompt}\n\n${userCrop}\n\nReturn ONLY the JSON object, no other text.`;
};

/**
 * Main AI analysis function
 */
export async function analyzeCropImagesWithGPT(imagePaths, category = 'crops', cropType = '') {
  console.log(`🔍 Starting enhanced GPT analysis for ${category}, user crop: ${cropType}`);
  
  try {
    // Validate we have API key
    if (!OPENAI_API_KEY) {
      throw new Error('This is on us, we will not charge you.');
    }

    // Process images
    const imageContents = [];
    
    for (const imagePath of imagePaths) {
      const b64 = imageToBase64(imagePath);
      if (!b64) {
        console.warn(`Skipping image ${imagePath}: Could not encode`);
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

    // Prepare messages
    const promptText = getSpecializedPrompt(category, cropType);
    
    const messages = [
      {
        role: "system",
        content: "You are an agricultural expert. You MUST return ONLY valid JSON. Never include any other text. Be honest about what you see."
      },
      {
        role: "user",
        content: [
          { type: "text", text: promptText },
          ...imageContents
        ],
      }
    ];

    console.log(`📤 Sending ${imageContents.length} image(s) to OpenAI`);
    
    // Call OpenAI with error handling
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    // Get and parse response
    const rawContent = response.choices?.[0]?.message?.content || "{}";
    console.log('📥 Received GPT response');
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawContent);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ GPT returned invalid JSON:', rawContent.substring(0, 200));
      throw new Error('AI analysis failed - invalid response format');
    }

    // Validate GPT response structure
    if (typeof parsedResult !== 'object' || parsedResult === null) {
      throw new Error('AI returned invalid response structure');
    }

    // Log what GPT returned
    console.log('🤔 GPT Analysis Results:', {
      isAgricultural: parsedResult.isAgriculturalImage,
      imageClear: parsedResult.imageClear,
      identifiedCrop: parsedResult.identifiedCrop || parsedResult.identifiedSpecies,
      status: parsedResult.status,
      confidence: parsedResult.confidence
    });

    // If GPT says it's not agricultural, handle accordingly
    if (parsedResult.isAgriculturalImage === false) {
      console.log('🚫 GPT detected NON-AGRICULTURAL image');
      return {
        isAgricultural: false,
        isClear: parsedResult.imageClear !== false,
        identifiedCrop: 'Not applicable',
        message: parsedResult.message || "This image doesn't appear to contain agricultural/livestock/fishery content. Please upload relevant images.",
        confidence: 0,
        status: 'rejected',
        title: 'Non-Agricultural Image',
        diseaseType: 'Not agricultural',
        source: 'openai-gpt-4o-mini',
        rawAnalysis: parsedResult
      };
    }

    // If image is unclear
    if (parsedResult.imageClear === false) {
      console.log('⚠️ GPT detected UNCLEAR image');
      return {
        isClear: false,
        isAgricultural: true,
        identifiedCrop: parsedResult.identifiedCrop || parsedResult.identifiedSpecies || 'Unidentified',
        message: parsedResult.message || "The image quality is insufficient for reliable analysis.",
        confidence: parsedResult.confidence || 30,
        status: 'unclear',
        title: 'Image Quality Issue',
        diseaseType: parsedResult.diseaseType || parsedResult.healthIssue || parsedResult.issueType || 'Cannot determine',
        recommendations: parsedResult.recommendations || ['Upload clearer image'],
        additionalNotes: parsedResult.additionalNotes || '',
        source: 'openai-gpt-4o-mini',
        rawAnalysis: parsedResult
      };
    }

    // Successfully analyzed agricultural image
    console.log(`✅ GPT analysis complete: ${parsedResult.status}, ${parsedResult.confidence}% confidence`);
    console.log(`🌱 Identified crop/species: ${parsedResult.identifiedCrop || parsedResult.identifiedSpecies || 'Unidentified'}`);
    
    return {
      status: parsedResult.status || 'unknown',
      title: parsedResult.title || `${category} Analysis`,
      message: parsedResult.message || 'Analysis completed',
      confidence: Math.max(0, Math.min(100, parsedResult.confidence || 50)),
      diseaseType: parsedResult.diseaseType || parsedResult.healthIssue || parsedResult.issueType || 'Unknown',
      identifiedCrop: parsedResult.identifiedCrop || parsedResult.identifiedSpecies || 'Unidentified',
      severity: Math.max(0, Math.min(10, parsedResult.severity || 0)),
      riskLevel: parsedResult.riskLevel || 'medium',
      recommendations: Array.isArray(parsedResult.recommendations) ? 
        parsedResult.recommendations.slice(0, 5) : [],
      additionalNotes: parsedResult.additionalNotes || '',
      source: 'openai-gpt-4o-mini',
      isAgricultural: true,
      isClear: true,
      rawAnalysis: parsedResult
    };
    
  } catch (error) {
    console.error('❌ AI Service Error:', error.message);
    
    // Handle OpenAI-specific errors
    if (error.code === 'insufficient_quota' || 
        error.code === 'rate_limit_exceeded' ||
        error.message?.includes('quota') ||
        error.message?.includes('rate limit')) {
      throw new Error('This is on us, we will not charge you.');
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Simple system check
 */
export async function checkAISystem() {
  try {
    await openai.models.list();
    return {
      available: true,
      model: 'GPT-4 Vision',
      status: 'operational',
      supports: ['crops', 'livestock', 'fishery'],
      note: 'Enhanced GPT with crop identification'
    };
  } catch (error) {
    console.error('AI System check failed:', error.message);
    throw new Error('This is on us, we will not charge you.');
  }
}

console.log('✅ Enhanced GPT AI Service Ready\n');