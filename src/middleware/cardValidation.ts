import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ICard } from '../interface/Card';
import cardService from '../service/card.services';

export const validateCardGeneration = [
  param('accountNumber')
    .isString()
    .withMessage('Account number must be a string')
    .isLength({ min: 10, max: 10 })
    .withMessage('Account number must be exactly 10 digits')
    .matches(/^\d+$/)
    .withMessage('Account number must contain only digits'),
  
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateCardVerification = [
  param('accountNumber')
    .isString()
    .withMessage('Account number must be a string')
    .isLength({ min: 10, max: 10 })
    .withMessage('Account number must be exactly 10 digits')
    .matches(/^\d+$/)
    .withMessage('Account number must contain only digits'),
  
  body('card')
    .isObject()
    .withMessage('Card details must be an object')
    .custom((value: ICard) => {
      if (!value.cardNumber?.encryptedData || !value.cardNumber?.iv ||
          !value.cvv?.encryptedData || !value.cvv?.iv ||
          !value.expiryDate?.encryptedData || !value.expiryDate?.iv) {
        throw new Error('Invalid card details structure');
      }
      return true;
    }),
  
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateGetCardDetails = [
  param('accountNumber')
    .isString()
    .withMessage('Account number must be a string')
    .isLength({ min: 10, max: 10 })
    .withMessage('Account number must be exactly 10 digits')
    .matches(/^\d+$/)
    .withMessage('Account number must contain only digits'),
  
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
]; 