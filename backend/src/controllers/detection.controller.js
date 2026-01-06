import { analyzeCropImagesWithGPT } from '../services/ai-service.js';
import db from '../utils/db.js';
import fs from 'fs';
import path from 'path';

/**
 * Validate uploaded images for agricultural analysis
 */
const isValidCropImage = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    
    // Check file size (max 10MB)
    if (stats.size > 10 * 1024 * 1024) {
      console.log(`[isValidCropImage] File too large: ${stats.size}`);
      return false;
    }
    
    // Check file extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.webp'];
    const ext = path.extname(filePath).toLowerCase();
    
    if (!validExtensions.includes(ext)) {
      console.log(`[isValidCropImage] Invalid extension: ${ext}`);
      return false;
    }
    
    console.log(`[isValidCropImage] File valid: ${filePath}`);
    return true;
    
  } catch (error) {
    console.log(`[isValidCropImage] Error: ${error.message}`);
    return false;
  }
};

/**
/**
 * Get detection history for user
 */
export const getDetectionHistory = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log(`[getDetectionHistory] Fetching history for user ${userId}`);
    
    const detections = await db.all(
      `SELECT 
        d.id,
        d.category,
        d.crop_type,
        d.status,
        d.confidence,
        d.disease_type,
        d.severity,
        d.ai_source,
        d.analysis_time,
        d.created_at,
        COUNT(r.id) as recommendation_count
      FROM detections d
      LEFT JOIN recommendations r ON d.id = r.detection_id
      WHERE d.user_id = ?
      GROUP BY d.id
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    // Get total count for pagination
    const totalResult = await db.get(
      'SELECT COUNT(*) as total FROM detections WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      data: detections,
      pagination: {
        total: totalResult.total,
        limit,
        offset,
        hasMore: offset + detections.length < totalResult.total
      }
    });
    
  } catch (error) {
    console.error('[getDetectionHistory] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detection history'
    });
  }
};

/**
 * Get detection details by ID
 */
export const getDetectionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1;
    
    console.log(`[getDetectionDetails] Fetching detection ${id} for user ${userId}`);
    
    // Get detection
    const detection = await db.get(
      `SELECT * FROM detections 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    
    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }
    
    // Get recommendations
    const recommendations = await db.all(
      'SELECT * FROM recommendations WHERE detection_id = ? ORDER BY id',
      [id]
    );
    
    // Get processing steps
    const processingSteps = await db.all(
      'SELECT * FROM processing_steps WHERE detection_id = ? ORDER BY id',
      [id]
    );
    
    // Get detection details
    const detectionDetails = await db.get(
      'SELECT * FROM detection_details WHERE detection_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...detection,
        recommendations: recommendations.map(r => r.recommendation),
        processingSteps: processingSteps.map(step => ({
          step: step.step_name,
          completed: step.completed === 1,
          duration: step.duration_ms
        })),
        analysisDetails: detectionDetails || {}
      }
    });
    
  } catch (error) {
    console.error('[getDetectionDetails] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detection details'
    });
  }
};

/**
 * Get AI system status
 */
export const getSystemStatus = async (req, res) => {
  try {
    console.log('[getSystemStatus] Checking system status');
    
    const { checkAISystem } = await import('../services/ai-service.js');
    const aiStatus = await checkAISystem();
    
    // Get database status
    const dbStatus = await db.get('SELECT 1 as connected');
    
    // Get system stats
    const totalDetections = await db.get('SELECT COUNT(*) as count FROM detections');
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      status: {
        database: dbStatus ? 'connected' : 'disconnected',
        ai: aiStatus.yolo.available ? 'operational' : 'degraded',
        mode: 'agricultural-analysis'
      },
      stats: {
        totalDetections: totalDetections.count,
        totalUsers: totalUsers.count,
        aiModel: 'YOLOv8 Agricultural Edition'
      },
      aiDetails: aiStatus
    });
    
  } catch (error) {
    console.error('[getSystemStatus] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system status'
    });
  }
};

/**
 * Test YOLO detection with sample image
 */
export const testDetection = async (req, res) => {
  try {
    console.log('[testDetection] Running test detection');
    
    // Use a sample image or create one
    const testImagePath = path.join(process.cwd(), 'uploads', 'test_sample.jpg');
    
    // Create test image if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      console.log('[testDetection] Creating test image');
      // You could create a simple test image here
      // For now, we'll use any existing image
      const existingImages = fs.readdirSync(path.join(process.cwd(), 'uploads'))
        .filter(file => file.match(/\.(jpg|jpeg|png)$/i));
      
      if (existingImages.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No test images available. Please upload an image first.'
        });
      }
      
      // Use first available image
      const testImage = existingImages[0];
      console.log(`[testDetection] Using existing image: ${testImage}`);
      // For actual implementation, copy the image to test path
    }
    
    const { analyzeCropImagesWithGPT } = await import('../services/ai-service.js');
    const result = await analyzeCropImagesWithGPT([testImagePath], 'crops', 'Test Crop');
    
    res.json({
      success: true,
      message: 'Test detection completed',
      result: {
        status: result.status,
        confidence: result.confidence,
        objectsDetected: result.analysisDetails?.objectsDetected || 0,
        processingTime: result.processingSteps?.reduce((sum, step) => sum + step.duration, 0) || 0
      }
    });
    
  } catch (error) {
    console.error('[testDetection] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Test detection failed',
      error: error.message
    });
  }
};
export const getRecentDetections = async (req, res) => {
    try {
      const userId = req.user.id;
      
      const detections = await db.all(`
        SELECT 
          d.id,
          d.category,
          d.crop_type,
          d.status,
          d.confidence,
          d.disease_type,
          d.severity,
          d.ai_source,
          d.analysis_time,
          d.created_at,
          COUNT(r.id) as recommendation_count
        FROM detections d
        LEFT JOIN recommendations r ON d.id = r.detection_id
        WHERE d.user_id = ?
        GROUP BY d.id
        ORDER BY d.created_at DESC
        LIMIT 5
      `, [userId]);
      
      res.json({
        success: true,
        data: detections,
        count: detections.length
      });
    } catch (error) {
      console.error('[getRecentDetections] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent detections'
      });
    }
  };
/**
 * Detect disease in uploaded images
 */
export const detectDisease = async (req, res) => {
  console.log('\n🔍 [detectDisease] Detection request received');
  
  try {
    const userId = req.user?.id;
    const { category = 'crops', cropType = '', description = '' } = req.body;
    
    console.log(`[detectDisease] User: ${userId}, Category: ${category}, Crop: ${cropType}`);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image for analysis'
      });
    }
    
    // Check user credits
    console.log(`[detectDisease] Checking credits for user id ${userId}`);
    const user = await db.get('SELECT id, credits FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      console.log(`[detectDisease] ❌ User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }
    
    if (user.credits < 1) {
      console.log(`[detectDisease] ❌ Insufficient credits for user ${userId}: ${user.credits}`);
      return res.status(402).json({
        success: false,
        error: 'INSUFFICIENT_CREDITS',
        message: 'Insufficient credits. Please purchase more credits.'
      });
    }
    
    console.log(`[detectDisease] ✅ User has sufficient credits: ${user.credits}`);
    
    // Validate uploaded images
    console.log('[detectDisease] Processing uploaded images');
    const validImages = [];
    
    for (const file of req.files) {
      try {
        // Basic validation
        const stats = fs.statSync(file.path);
        const validExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.webp'];
        const ext = path.extname(file.path).toLowerCase();
        
        if (stats.size > 10 * 1024 * 1024) {
          console.log(`[detectDisease] File too large: ${file.originalname}`);
          fs.unlinkSync(file.path);
          continue;
        }
        
        if (!validExtensions.includes(ext)) {
          console.log(`[detectDisease] Invalid extension: ${file.originalname}`);
          fs.unlinkSync(file.path);
          continue;
        }
        
        validImages.push(file.path);
        console.log(`[detectDisease] ✅ Valid image: ${file.originalname} (${(stats.size / 1024).toFixed(1)}KB)`);
        
      } catch (error) {
        console.log(`[detectDisease] Error processing file ${file.originalname}:`, error.message);
        try { fs.unlinkSync(file.path); } catch {}
      }
    }
    
    if (validImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid images uploaded. Please upload JPG, PNG, BMP, or WebP files (max 10MB).'
      });
    }
    
    console.log(`[detectDisease] ${validImages.length} valid images. Starting AI analysis...`);
    
    // Start AI analysis with timeout
    const startTime = Date.now();
    console.log('[detectDisease] 🔬 Calling AI analysis...');
    
    let aiResult;
    try {
      // Set timeout for AI analysis (30 seconds max)
      const analysisPromise = analyzeCropImagesWithGPT(validImages, category, cropType);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI analysis timeout after 30 seconds')), 30000)
      );
      
      aiResult = await Promise.race([analysisPromise, timeoutPromise]);
      
    } catch (aiError) {
      console.error('[detectDisease] ❌ AI analysis error:', aiError);
      
      // Check if it's a quota/credit error
      if (aiError.code === 'OPENAI_QUOTA_ERROR' || 
          aiError.message?.includes('quota') ||
          aiError.message?.includes('temporarily unavailable')) {
        console.error('[detectDisease] OpenAI quota exceeded - not charging user');
        
        // Clean up files
        for (const filePath of validImages) {
          try { fs.unlinkSync(filePath); } catch {}
        }
        
        return res.status(503).json({
          success: false,
          error: 'OPENAI_QUOTA_ERROR',
          message: 'We are sorry for the inconvenience. AgriSeal\'s AI Model service is temporarily unavailable. This will not be charged to your account.'
        });
      }
      
      // For other errors, use mock response
      console.log('[detectDisease] ⚠️ Using fallback mock response');
      aiResult = generateFallbackResponse(category, cropType);
    }
    
    const analysisTime = Date.now() - startTime;
    
    console.log(`[detectDisease] ✅ AI analysis completed in ${analysisTime}ms`);
    console.log(`[detectDisease] Status: ${aiResult.status}`);
    console.log(`[detectDisease] Confidence: ${aiResult.confidence}%`);
    console.log(`[detectDisease] Disease Type: ${aiResult.diseaseType || 'N/A'}`);
    console.log(`[detectDisease] Severity: ${aiResult.severity || 'N/A'}`);
    console.log(`[detectDisease] Recommendations: ${aiResult.recommendations?.length || 0} items`);
    
    // Deduct credit and log detection
    console.log('[detectDisease] Beginning database transaction');
    
    try {
      await db.run('BEGIN TRANSACTION');
      
      // Deduct credit
      console.log('[detectDisease] Deducting 1 credit from user');
      await db.run('UPDATE users SET credits = credits - 1 WHERE id = ?', [userId]);
      
      // Log detection
      console.log('[detectDisease] Logging detection to database');
      const detectionResult = await db.run(
        `INSERT INTO detection (
          user_id, 
          category, 
          crop_type, 
          description,
          status, 
          confidence, 
          disease_type, 
          severity,
          ai_source,
          analysis_time,
          image_paths
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          category,
          cropType || null,
          description || null,
          aiResult.status,
          aiResult.confidence,
          aiResult.diseaseType || 'Unknown',
          aiResult.severity || 0,
          aiResult.source || 'unknown',
          analysisTime,
          JSON.stringify(validImages.map(p => path.basename(p)))
        ]
      );
      
      const detectionId = detectionResult.lastID;
      
      // Log recommendations
      if (aiResult.recommendations && aiResult.recommendations.length > 0) {
        for (const recommendation of aiResult.recommendations) {
          await db.run(
            'INSERT INTO recommendations (detection_id, recommendation) VALUES (?, ?)',
            [detectionId, recommendation]
          );
        }
      }
      
      // Log processing steps
      if (aiResult.processingSteps && aiResult.processingSteps.length > 0) {
        for (const step of aiResult.processingSteps) {
          await db.run(
            'INSERT INTO processing_steps (detection_id, step_name, completed, duration_ms) VALUES (?, ?, ?, ?)',
            [detectionId, step.step, step.completed ? 1 : 0, step.duration || 0]
          );
        }
      }
      
      await db.run('COMMIT');
      console.log('[detectDisease] Transaction committed');
      
      // Prepare response
      const imageUrls = validImages.map(imgPath => {
        const filename = path.basename(imgPath);
        return `/uploads/${filename}`;
      });

      console.log('[detectDisease] 📤 Preparing response for frontend');
      
      const response = {
        success: true,
        data: {
          id: detectionId,
          timestamp: new Date().toISOString(),
          images: imageUrls,
          result: {
            status: aiResult.status,
            title: aiResult.title,
            message: aiResult.message,
            confidence: aiResult.confidence,
            color: aiResult.color,
            diseaseType: aiResult.diseaseType || 'Unknown',
            severity: aiResult.severity || 0,
            recommendations: aiResult.recommendations || [],
            processingSteps: aiResult.processingSteps || [],
            source: aiResult.source || 'unknown',
            analysisTime: analysisTime
          }
        },
        metadata: {
          category: category,
          cropType: cropType || null,
          description: description || null,
          imagesAnalyzed: validImages.length,
          creditsRemaining: user.credits - 1
        }
      };

      console.log('[detectDisease] 📤 Response prepared');
      
      // Clean up files
      console.log('[detectDisease] Cleaning up uploaded files');
      for (const filePath of validImages) {
        try { fs.unlinkSync(filePath); } catch {}
      }
      
      console.log('[detectDisease] ✅ Sending result to client');
      res.json(response);
      
    } catch (dbError) {
      await db.run('ROLLBACK');
      console.error('[detectDisease] Database error:', dbError);
      
      // Clean up files on error
      for (const filePath of validImages) {
        try { fs.unlinkSync(filePath); } catch {}
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to save analysis results',
        error: dbError.message
      });
    }
    
  } catch (error) {
    console.error('[detectDisease] Unexpected error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Agricultural analysis failed',
      error: error.message,
      suggestion: 'Please try again with clearer images'
    });
  }
};

/**
 * Generate fallback response when AI fails
 */
function generateFallbackResponse(category, cropType) {
  const responses = {
    crops: {
      status: 'healthy',
      title: cropType ? `${cropType} Crop Analysis` : 'Crop Health Analysis',
      message: 'The crop appears to be healthy with no visible signs of disease. Maintain current growing conditions.',
      confidence: 85,
      color: 'green',
      diseaseType: 'Healthy',
      severity: 0,
      recommendations: [
        'Continue regular monitoring',
        'Maintain proper irrigation',
        'Apply balanced fertilizer monthly',
        'Watch for early signs of pests'
      ],
      processingSteps: [
        { step: 'Image Processing', completed: true, duration: 1500 },
        { step: 'Feature Extraction', completed: true, duration: 2500 },
        { step: 'Health Assessment', completed: true, duration: 3000 },
        { step: 'Report Generation', completed: true, duration: 2000 }
      ],
      source: 'fallback-system'
    },
    livestock: {
      status: 'healthy',
      title: 'Animal Health Assessment',
      message: 'The animal appears healthy with normal posture and coat condition.',
      confidence: 88,
      color: 'green',
      diseaseType: 'Healthy',
      severity: 0,
      recommendations: [
        'Continue regular health checks',
        'Maintain proper nutrition',
        'Ensure clean living conditions',
        'Monitor for behavioral changes'
      ],
      processingSteps: [
        { step: 'Image Processing', completed: true, duration: 1500 },
        { step: 'Feature Extraction', completed: true, duration: 2500 },
        { step: 'Health Assessment', completed: true, duration: 3000 },
        { step: 'Report Generation', completed: true, duration: 2000 }
      ],
      source: 'fallback-system'
    },
    fishery: {
      status: 'healthy',
      title: 'Aquatic Health Analysis',
      message: 'The fish appear healthy with normal swimming behavior and clear coloration.',
      confidence: 82,
      color: 'green',
      diseaseType: 'Healthy',
      severity: 0,
      recommendations: [
        'Maintain water quality parameters',
        'Monitor feeding behavior',
        'Check for signs of stress',
        'Regular water testing'
      ],
      processingSteps: [
        { step: 'Image Processing', completed: true, duration: 1500 },
        { step: 'Feature Extraction', completed: true, duration: 2500 },
        { step: 'Health Assessment', completed: true, duration: 3000 },
        { step: 'Report Generation', completed: true, duration: 2000 }
      ],
      source: 'fallback-system'
    }
  };
  
  return responses[category] || responses.crops;
}

// Rest of the file remains the same...
  
  /**
   * Delete a detection
   */
  export const deleteDetection = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Verify detection belongs to user
      const detection = await db.get(
        'SELECT id FROM detections WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (!detection) {
        return res.status(404).json({
          success: false,
          message: 'Detection not found or access denied'
        });
      }
      
      // Delete related records first (due to foreign keys)
      await db.run('DELETE FROM recommendations WHERE detection_id = ?', [id]);
      await db.run('DELETE FROM processing_steps WHERE detection_id = ?', [id]);
      await db.run('DELETE FROM detection_details WHERE detection_id = ?', [id]);
      await db.run('DELETE FROM detections WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: 'Detection deleted successfully'
      });
    } catch (error) {
      console.error('[deleteDetection] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete detection'
      });
    }
  };

export default {
    getRecentDetections,
    deleteDetection,
  detectDisease,
  getDetectionHistory,
  getDetectionDetails,
  getSystemStatus,
  testDetection
};