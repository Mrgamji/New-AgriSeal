// backend/src/routes/detection.routes.js
import express from 'express';
import console from 'console';
import req from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  detectDisease,
  getDetectionHistory,
  getDetectionDetails,
  getSystemStatus,
  testDetection,
  getRecentDetections,
  deleteDetection
} from '../controllers/detection.controller.js';

// Import real authentication middleware
import { authenticate, checkCredits } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter for agricultural images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|bmp|webp/i;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, JPG, PNG, BMP, WEBP)'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

// ====================
// DETECTION ROUTES
// ====================

/**
 * @route   POST /api/detections
 * @desc    Analyze agricultural images for diseases/issues
 * @access  Private (requires JWT token)
 * @body    category: crops/livestock/fishery (required)
 * @body    cropType: optional specific crop type
 * @files   images: array of image files (2-5 images)
 */
router.post(
  '/detect',
  authenticate,
  upload.array('images', 5),
  (req, res, next) => {
    console.log('\n📥 [API HIT] POST /api/detect route called');
    console.log('📦 Number of files received:', req.files ? req.files.length : 0);
    if (req.files) {
      req.files.forEach((file, idx) => {
        console.log(` - File ${idx + 1}: "${file.originalname}", Size: ${file.size} bytes, Type: ${file.mimetype}`);
      });
    }
    console.log('📝 Request Body:', req.body);
    if (req.user) {
      console.log('👤 User:', { id: req.user.id, email: req.user.email, credits: req.user.credits });
    }
    next();
  },
  detectDisease
);

/**
 * @route   GET /api/detections
 * @desc    Get user's detection history with pagination
 * @access  Private (requires JWT token)
 * @query   limit: number of results (default: 10, max: 50)
 * @query   offset: pagination offset (default: 0)
 * @query   category: filter by category (crops/livestock/fishery)
 * @query   status: filter by status (healthy/infected/critical)
 */
router.get(
  '/detections',
  authenticate,
  getDetectionHistory
);

/**
 * @route   GET /api/detections/recent
 * @desc    Get user's recent detections (last 5)
 * @access  Private (requires JWT token)
 */
router.get(
  '/detections/recent',
  authenticate,
  getRecentDetections
);

/**
 * @route   GET /api/detections/:id
 * @desc    Get detailed information about a specific detection
 * @access  Private (requires JWT token)
 * @param   id: detection ID (required)
 */
router.get(
  '/detections/:id',
  authenticate,
  getDetectionDetails
);

/**
 * @route   DELETE /api/detections/:id
 * @desc    Delete a specific detection
 * @access  Private (requires JWT token)
 * @param   id: detection ID (required)
 */
router.delete(
  '/detections/:id',
  authenticate,
  deleteDetection
);

/**
 * @route   GET /api/detections/stats/summary
 * @desc    Get user's detection statistics
 * @access  Private (requires JWT token)
 */
router.get(
  '/detections/stats/summary',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      const stats = await db.get(`
        SELECT 
          COUNT(*) as total_detections,
          SUM(CASE WHEN status = 'healthy' THEN 1 ELSE 0 END) as healthy_count,
          SUM(CASE WHEN status = 'infected' THEN 1 ELSE 0 END) as infected_count,
          SUM(CASE WHEN status = 'critical' THEN 1 ELSE 0 END) as critical_count,
          AVG(confidence) as avg_confidence,
          SUM(analysis_time) as total_analysis_time
        FROM detections 
        WHERE user_id = ?
      `, [userId]);
      
      res.json({
        success: true,
        stats: {
          totalDetections: stats.total_detections || 0,
          healthyCount: stats.healthy_count || 0,
          infectedCount: stats.infected_count || 0,
          criticalCount: stats.critical_count || 0,
          avgConfidence: Math.round(stats.avg_confidence || 0),
          totalAnalysisTime: stats.total_analysis_time || 0
        }
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  }
);

// ====================
// SYSTEM ROUTES
// ====================

/**
 * @route   GET /api/system/status
 * @desc    Get AI system status and statistics
 * @access  Public
 */
router.get('/system/status', getSystemStatus);

/**
 * @route   POST /api/system/test
 * @desc    Test the AI detection system with a sample image
 * @access  Private (admin only)
 */
router.post(
  '/system/test',
  authenticate,
  testDetection
);

// ====================
// UPLOAD TEST ROUTE
// ====================

/**
 * @route   POST /api/uploads/test
 * @desc    Test file upload functionality
 * @access  Public (for development/testing)
 */
router.post(
  '/uploads/test',
  upload.single('testImage'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      // Clean up file after 5 minutes for testing
      setTimeout(() => {
        try {
          fs.unlinkSync(req.file.path);
          console.log(`Cleaned up test file: ${req.file.filename}`);
        } catch (cleanupError) {
          console.log('Could not cleanup test file:', cleanupError.message);
        }
      }, 5 * 60 * 1000);
      
      res.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          originalname: req.file.originalname,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path,
          url: `/uploads/${req.file.filename}`
        }
      });
    } catch (error) {
      console.error('Upload test error:', error);
      res.status(500).json({
        success: false,
        error: 'Upload test failed'
      });
    }
  }
);

// ====================
// ERROR HANDLING
// ====================

/**
 * Multer error handling middleware
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'FILE_TOO_LARGE',
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'TOO_MANY_FILES',
        message: 'Too many files. Maximum 5 images allowed.'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_FILE_TYPE',
        message: 'Invalid file type. Only image files are allowed.'
      });
    }
    
    return res.status(400).json({
      success: false,
      error: 'UPLOAD_ERROR',
      message: 'File upload error: ' + error.message
    });
  }
  
  if (error) {
    console.error('Route error:', error);
    
    // Handle file type errors
    if (error.message.includes('Only image files')) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_FILE_TYPE',
        message: 'Only image files are allowed (JPEG, JPG, PNG, BMP, WEBP)'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    });
  }
  
  next();
});

export default router;