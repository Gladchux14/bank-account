import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

// Define global type for account creation attempts
declare global {
  var accountCreationAttempts: Map<string, number[]>;
}

// Validation rules for account creation
export const validateAccountCreation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('dateOfBirth')
    .isDate()
    .withMessage('Please provide a valid date of birth')
    .custom((value: string) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18 || age > 120) {
        throw new Error('Account holder must be between 18 and 120 years old');
      }
      
      return true;
    }),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('accountType')
    .isIn(['current', 'savings', 'fixed deposit'])
    .withMessage('Account type must be checking, savings, or business'),


  body('phoneNumber')
    .matches(/^\+?[\d\s-()]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
];

// Separate middleware for handling validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error: any) => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg
      }))
    });
    return;
  }
  
  next();
};

// Middleware for validating account number format
export const validateAccountNumber = (req: Request, res: Response, next: NextFunction) => {
  const { accountNumber } = req.params;
  
  if (!accountNumber) {
    res.status(400).json({
      success: false,
      message: 'Account number is required'
    });
    return;
  }
  
  if (!/^\d{10}$/.test(accountNumber)) {
    res.status(400).json({
      success: false,
      message: 'Account number must be exactly 10 digits'
    });
    return;
  }
  
  next();
};

// Middleware for validating balance updates  
export const validateBalanceUpdate = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value: number) => {
      if (value === 0) {
        throw new Error('Amount cannot be zero');
      }
      return true;
    }),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }
    
    next();
  }
];

// Middleware for validating status updates
export const validateStatusUpdate = [
  body('status')
    .isIn(['active', 'suspended', 'closed'])
    .withMessage('Status must be active, suspended, or closed'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }
    
    next();
  }
];

// Rate limiting middleware for account creation
export const rateLimitAccountCreation = (req: Request, res: Response, next: NextFunction) => {
  // This is a basic example - in production, use redis or similar
  const ip = req.ip;
  if (!ip) {
    res.status(400).json({
      success: false,
      message: 'IP address is required'
    });
    return;
  }

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  // In production, store this in Redis or database
  if (!globalThis.accountCreationAttempts) {
    globalThis.accountCreationAttempts = new Map<string, number[]>();
  }
  
  const attempts = globalThis.accountCreationAttempts.get(ip) || [];
  const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    res.status(429).json({
      success: false,
      message: 'Too many account creation attempts. Please try again later.'
    });
    return;
  }
  
  recentAttempts.push(now);
  globalThis.accountCreationAttempts.set(ip, recentAttempts);
  
  next();
};