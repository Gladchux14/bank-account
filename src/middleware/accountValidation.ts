import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { param } from 'express-validator';


declare global {
  var accountCreationAttempts: Map<string, number[]>;
}


export const validateAccountCreation = [
  body('firstName')
    .isString()
    .withMessage('First name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .isString()
    .withMessage('Last name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('dateOfBirth')
    .isString()
    .withMessage('Date of birth must be a string')
    .custom((value) => {
      const birthDate = new Date(value);
      if (isNaN(birthDate.getTime())) {
        throw new Error('Invalid date format');
      }
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18 || age > 120) {
        throw new Error('Account holder must be between 18 and 120 years old');
      }
      return true;
    }),

  body('password')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),

  body('phoneNumber')
    .isString()
    .withMessage('Phone number must be a string')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number in international format (e.g., +2348012345678)'),

  body('accountType')
    .isIn(['savings', 'current', 'fixed deposit'])
    .withMessage('Account type must be either savings, current, or fixed deposit'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Account validation failed',
        errors: errors.array()
      });
      return;
    }
    next();
  }
];

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

export const validateAccountNumber = (req: Request, res: Response, next: NextFunction): void => {
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

export const rateLimitAccountCreation = (req: Request, res: Response, next: NextFunction) => {
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