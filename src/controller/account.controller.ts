import { Request, Response } from 'express';
import accountService from '../service/account.services';
import { IAccountCreate } from '../interface/Account';

class AccountController {
  
  async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const accountData: IAccountCreate = req.body;
      
      const requiredFields = ['firstName', 'lastName', 'email', 'dateOfBirth', 'password', 'phoneNumber'];
      const missingFields = requiredFields.filter(field => !accountData[field as keyof IAccountCreate]);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
        return;
      }
      
      const newAccount = await accountService.createAccount(accountData);
      
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: newAccount
      });
      
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message, "error");
        res.status(500).json({
          success: false,
          message: error.message || "Failed to create account"
        });
      } else {
        console.log("Unknown error", "error");
        res.status(500).json({
          success: false,
          message: "An unknown error occurred"
        });
      }
    }
  }
  
  async getAccount(req: Request, res: Response): Promise<void> {
    try {
      const { accountNumber } = req.params;
      
      if (!accountNumber) {
        res.status(400).json({
          success: false,
          message: 'Account number is required'
        });
        return;
      }
      
      const account = await accountService.getAccountByNumber(accountNumber);
      
      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Account not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: account
      });
      
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message, "error");
        res.status(500).json({
          success: false,
          message: error.message || "Failed to fetch account"
        });
      } else {
        console.log("Unknown error", "error");
        res.status(500).json({
          success: false,
          message: "An unknown error occurred"
        });
      }
    }
  }
  
  async getAllAccounts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await accountService.getAllAccounts(page, limit);
      
      res.status(200).json({
        success: true,
        data: result
      });
      
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message, "error");
        res.status(500).json({
          success: false,
          message: error.message || "Failed to fetch accounts"
        });
      } else {
        console.log("Unknown error", "error");
        res.status(500).json({
          success: false,
          message: "An unknown error occurred"
        });
      }
    }
  }
  
  async verifyAndDecryptData(req: Request, res: Response): Promise<void> {
    try {
      const { accountNumber } = req.params;
      const { encryptedData, iv } = req.body;

      if (!encryptedData || !iv) {
        res.status(400).json({
          success: false,
          message: 'Encrypted data and IV are required'
        });
        return;
      }

      const result = await accountService.verifyAndDecryptData(accountNumber, encryptedData, iv);
      
      res.status(200).json({
        success: true,
        data: {
          accountNumber,
          fieldType: result.fieldType,
          decryptedData: result.decryptedData
        }
      });
      
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error verifying and decrypting data:', error);
        res.status(500).json({
          success: false,
          message: error.message || "Failed to verify and decrypt data"
        });
      } else {
        res.status(500).json({
          success: false,
          message: "An unknown error occurred"
        });
      }
    }
  }
}

export default new AccountController();