// backend/src/middleware/validation.middleware.js
/**
 * Registration Validation Middleware
 */
export const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;
    
    const errors = [];
    
    if (!name || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errors.push('Valid email is required');
    }
    
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }
    
    // Trim values before passing to controller
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    
    next();
  };
  
  /**
   * Login Validation Middleware
   */
  export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    const errors = [];
    
    if (!email || !email.trim()) {
      errors.push('Email is required');
    }
    
    if (!password) {
      errors.push('Password is required');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }
    
    // Trim and normalize email
    req.body.email = email.trim().toLowerCase();
    
    next();
  };
  
  /**
   * Detection Request Validation
   */
  export const validateDetectionRequest = (req, res, next) => {
    const { category, cropType } = req.body;
    
    const errors = [];
    
    // Validate category
    const validCategories = ['crops', 'livestock', 'fishery'];
    if (!category || !validCategories.includes(category)) {
      errors.push(`Category must be one of: ${validCategories.join(', ')}`);
    }
    
    // Validate cropType if provided
    if (cropType && cropType.trim().length < 2) {
      errors.push('Crop type must be at least 2 characters if provided');
    }
    
    // Validate files
    if (!req.files || req.files.length === 0) {
      errors.push('At least one image is required');
    } else if (req.files.length > 5) {
      errors.push('Maximum 5 images allowed');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }
    
    // Clean up data
    if (cropType) {
      req.body.cropType = cropType.trim();
    }
    
    next();
  };
  
  /**
   * Credit Purchase Validation
   */
  export const validateCreditPurchase = (req, res, next) => {
    const { amount } = req.body;
    
    const errors = [];
    
    if (!amount || isNaN(amount) || amount <= 0) {
      errors.push('Valid credit amount is required (minimum 1)');
    }
    
    if (amount > 1000) {
      errors.push('Maximum 1000 credits per purchase');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }
    
    req.body.amount = parseInt(amount);
    
    next();
  };
  
  /**
   * Profile Update Validation
   */
  export const validateProfileUpdate = (req, res, next) => {
    const { name } = req.body;
    
    if (name && (name.trim().length < 2 || name.trim().length > 50)) {
      return res.status(400).json({
        success: false,
        error: 'Name must be between 2 and 50 characters'
      });
    }
    
    if (name) {
      req.body.name = name.trim();
    }
    
    next();
  };