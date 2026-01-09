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
  console.log('\n🔍 [detectDisease] Pure GPT analysis request');
  
  try {
    const userId = req.user?.id;
    const { category = 'crops', cropType = '', description = '' } = req.body;
    
    console.log(`User: ${userId}, Category: ${category}, Crop: ${cropType}`);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image for analysis'
      });
    }
    
    // Validate user exists and has credits
    const user = await db.get('SELECT id, credits FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }
    
    if (user.credits < 1) {
      return res.status(402).json({
        success: false,
        error: 'INSUFFICIENT_CREDITS',
        message: 'Insufficient credits. Please purchase more credits.'
      });
    }
    
    console.log(`✅ User has credits: ${user.credits}`);
    
    // Validate images
    const validImages = [];
    
    for (const file of req.files) {
      try {
        const stats = fs.statSync(file.path);
        const validExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.webp'];
        const ext = path.extname(file.path).toLowerCase();
        
        if (stats.size > 10 * 1024 * 1024) {
          console.log(`File too large: ${file.originalname}`);
          fs.unlinkSync(file.path);
          continue;
        }
        
        if (!validExtensions.includes(ext)) {
          console.log(`Invalid extension: ${file.originalname}`);
          fs.unlinkSync(file.path);
          continue;
        }
        
        validImages.push(file.path);
        console.log(`✅ Valid image: ${file.originalname}`);
        
      } catch (error) {
        console.log(`Error processing file:`, error.message);
        try { fs.unlinkSync(file.path); } catch {}
      }
    }
    
    if (validImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid images uploaded. Please upload JPG, PNG, BMP, or WebP files (max 10MB).'
      });
    }
    
    console.log(`${validImages.length} valid images. Starting pure GPT analysis...`);
    
    // Start AI analysis with timeout
    const startTime = Date.now();
    
    let aiResult;
    try {
      const analysisPromise = analyzeCropImagesWithGPT(validImages, category, cropType);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI analysis timeout after 45 seconds')), 45000)
      );
      
      aiResult = await Promise.race([analysisPromise, timeoutPromise]);
      
    } catch (aiError) {
      console.error('❌ AI analysis error:', aiError);
      
      // Clean up files
      for (const filePath of validImages) {
        try { fs.unlinkSync(filePath); } catch {}
      }
      
      // Check for quota errors - DON'T charge for quota issues
      if (aiError.message.includes('This is on us') ||
          aiError.code === 'OPENAI_QUOTA_ERROR') {
        return res.status(503).json({
          success: false,
          error: 'OPENAI_QUOTA_ERROR',
          message: 'We are sorry for the inconvenience. AgriSeal\'s AI Model service is temporarily unavailable. This will not be charged to your account.',
          noCharge: true
        });
      }
      
      // For other AI errors, STILL charge the user since they used the service
      console.log('⚠️ AI failed but user will still be charged for service attempt');
      
      // Deduct credit even for failed AI analysis
      await db.run('UPDATE users SET credits = credits - 1 WHERE id = ?', [userId]);
      
      return res.status(500).json({
        success: false,
        error: 'AI_ANALYSIS_FAILED',
        message: 'AI analysis failed. Please try again with different images.',
        charged: true,
        creditsRemaining: user.credits - 1
      });
    }
    
    const analysisTime = Date.now() - startTime;
    
    console.log(`✅ Pure GPT analysis completed in ${analysisTime}ms`);
    console.log(`Status: ${aiResult.status}`);
    console.log(`Confidence: ${aiResult.confidence}%`);
    console.log(`Agricultural: ${aiResult.isAgricultural}`);
    console.log(`Clear: ${aiResult.isClear}`);
    
    // Begin database transaction - ALWAYS charge for using the service
    await db.run('BEGIN TRANSACTION');
    
    try {
      // ALWAYS deduct credit - user used the service regardless of image type
      console.log('💰 Deducting 1 credit for service usage');
      await db.run('UPDATE users SET credits = credits - 1 WHERE id = ?', [userId]);
      
      // Prepare detection data based on result type
      let detectionData = {
        userId,
        category,
        cropType: cropType || aiResult.identifiedCrop || null, // Use GPT-identified crop if available
        description: description || null,
        status: aiResult.status || 'unknown',
        confidence: aiResult.confidence || 0,
        diseaseType: aiResult.diseaseType || 'Not applicable',
        identifiedCrop: aiResult.identifiedCrop || null, // NEW: Store identified crop
        severity: aiResult.severity || 0,
        aiSource: 'openai-gpt-4o-mini',
        analysisTime,
        imagePaths: JSON.stringify(validImages.map(p => path.basename(p))),
        riskLevel: aiResult.riskLevel || 'unknown',
        additionalNotes: aiResult.additionalNotes || ''
      };
      
      // Update database insert to include identified_crop:
      const detectionResult = await db.run(
        `INSERT INTO detections (
          user_id, 
          category, 
          crop_type, 
          identified_crop,
          description,
          status, 
          confidence, 
          disease_type, 
          severity,
          ai_source,
          analysis_time,
          image_paths,
          risk_level,
          additional_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          detectionData.userId,
          detectionData.category,
          detectionData.cropType,
          detectionData.identifiedCrop,
          detectionData.description,
          detectionData.status,
          detectionData.confidence,
          detectionData.diseaseType,
          detectionData.severity,
          detectionData.aiSource,
          detectionData.analysisTime,
          detectionData.imagePaths,
          detectionData.riskLevel,
          detectionData.additionalNotes
        ]
      );
      
      const detectionId = detectionResult.lastID;
      
      // Log recommendations if available
      if (aiResult.recommendations && aiResult.recommendations.length > 0) {
        for (const recommendation of aiResult.recommendations) {
          await db.run(
            'INSERT INTO recommendations (detection_id, recommendation) VALUES (?, ?)',
            [detectionId, recommendation]
          );
        }
      } else if (aiResult.isAgricultural === false) {
        // Add default recommendation for non-agricultural images
        await db.run(
          'INSERT INTO recommendations (detection_id, recommendation) VALUES (?, ?)',
          [detectionId, 'Upload agricultural images (crops, livestock, or fishery)']
        );
        await db.run(
          'INSERT INTO recommendations (detection_id, recommendation) VALUES (?, ?)',
          [detectionId, 'Ensure image is clear and well-lit']
        );
      }
      
      await db.run('COMMIT');
      console.log('✅ Transaction committed - user charged');
      
      // Prepare image URLs for response
      const imageUrls = validImages.map(imgPath => {
        const filename = path.basename(imgPath);
        return `/uploads/${filename}`;
      });
      
      // Build response based on analysis result
      let responseData;
      
      if (aiResult.isAgricultural === false) {
        // Non-agricultural image response
        responseData = {
          success: true,
          data: {
            id: detectionId,
            timestamp: new Date().toISOString(),
            images: imageUrls,
            result: {
              status: 'rejected',
              title: 'Non-Agricultural Image',
              message: aiResult.message || 'This image does not appear to contain agricultural content. Please upload images of crops, livestock, or fishery subjects.',
              confidence: 0,
              color: 'gray',
              diseaseType: 'Non-agricultural',
              severity: 0,
              riskLevel: 'none',
              recommendations: [
                'Upload images of crops, livestock, or fish',
                'Ensure the subject is clearly visible',
                'Crop the image to focus on agricultural elements'
              ],
              additionalNotes: 'This analysis used 1 credit.',
              source: 'openai-gpt-4o-mini',
              analysisTime: analysisTime,
              isAgricultural: false,
              isClear: aiResult.isClear || false
            }
          },
          metadata: {
            category: category,
            cropType: cropType || null,
            imagesAnalyzed: validImages.length,
            creditsRemaining: user.credits - 1,
            aiModel: 'GPT-4 Vision',
            note: 'Credit deducted for service usage'
          }
        };
        
      } else if (aiResult.isClear === false) {
        // Unclear image response
        responseData = {
          success: true,
          data: {
            id: detectionId,
            timestamp: new Date().toISOString(),
            images: imageUrls,
            result: {
              status: 'unclear',
              title: 'Image Quality Issue',
              message: aiResult.message || 'The image quality is insufficient for reliable analysis. Please upload a clearer image.',
              confidence: aiResult.confidence || 30,
              color: 'yellow',
              diseaseType: aiResult.diseaseType || 'Cannot determine',
              severity: aiResult.severity || 0,
              riskLevel: aiResult.riskLevel || 'unknown',
              recommendations: aiResult.recommendations || [
                'Upload a clearer, well-lit image',
                'Ensure the subject is in focus',
                'Avoid blurry or distant shots'
              ],
              additionalNotes: aiResult.additionalNotes || 'This analysis used 1 credit.',
              source: 'openai-gpt-4o-mini',
              analysisTime: analysisTime,
              isAgricultural: true,
              isClear: false
            }
          },
          metadata: {
            category: category,
            cropType: cropType || null,
            imagesAnalyzed: validImages.length,
            creditsRemaining: user.credits - 1,
            aiModel: 'GPT-4 Vision',
            note: 'Credit deducted for service usage'
          }
        };
        
      } else {
        // SUCCESS: Valid agricultural image analyzed
        responseData = {
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
              color: getColorForStatus(aiResult.status),
              diseaseType: aiResult.diseaseType,
              severity: aiResult.severity,
              riskLevel: aiResult.riskLevel,
              recommendations: aiResult.recommendations || [],
              additionalNotes: aiResult.additionalNotes || '',
              source: aiResult.source,
              analysisTime: analysisTime,
              isAgricultural: true,
              isClear: true
            }
          },
          metadata: {
            category: category,
            cropType: cropType || null,
            imagesAnalyzed: validImages.length,
            creditsRemaining: user.credits - 1,
            aiModel: 'GPT-4 Vision',
            note: 'Pure AI analysis - no mock data used'
          }
        };
      }
      
      // Clean up files after success
      for (const filePath of validImages) {
        try { fs.unlinkSync(filePath); } catch {}
      }
      
      console.log('✅ Sending result to client (user charged)');
      res.json(responseData);
      
    } catch (dbError) {
      await db.run('ROLLBACK');
      console.error('Database error:', dbError);
      
      // Clean up files on error
      for (const filePath of validImages) {
        try { fs.unlinkSync(filePath); } catch {}
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to save analysis results'
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Agricultural analysis failed',
      error: error.message
    });
  }
};

// Helper function for status colors
function getColorForStatus(status) {
  switch(status?.toLowerCase()) {
    case 'healthy': return 'green';
    case 'infected': return 'yellow';
    case 'critical': return 'red';
    case 'unclear': return 'yellow';
    case 'rejected': return 'gray';
    default: return 'blue';
  }
}

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