import { Request, Response } from 'express';
import accountService from '../service/account.services';
import { IAccountCreate } from '../interface/Account';

class AccountController {
  
  async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const accountData: IAccountCreate = req.body;
      
      // Basic validation
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
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create account'
      });
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
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch account'
      });
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
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch accounts'
      });
    }
  }
  
  async updateAccountStatus(req: Request, res: Response): Promise<void> {
    try {
      const { accountNumber } = req.params;
      const { status } = req.body;
      
      if (!accountNumber || !status) {
        res.status(400).json({
          success: false,
          message: 'Account number and status are required'
        });
        return;
      }
      
      if (!['active', 'suspended', 'closed'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active, suspended, or closed'
        });
        return;
      }
      
      const updatedAccount = await accountService.updateAccountStatus(accountNumber, status);
      
      if (!updatedAccount) {
        res.status(404).json({
          success: false,
          message: 'Account not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Account status updated successfully',
        data: updatedAccount
      });
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update account status'
      });
    }
  }
  
  async updateBalance(req: Request, res: Response): Promise<void> {
    try {
      const { accountNumber } = req.params;
      const { amount } = req.body;
      
      if (!accountNumber || amount === undefined) {
        res.status(400).json({
          success: false,
          message: 'Account number and amount are required'
        });
        return;
      }
      
      if (typeof amount !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Amount must be a number'
        });
        return;
      }
      
      const updatedAccount = await accountService.updateBalance(accountNumber, amount);
      
      if (!updatedAccount) {
        res.status(404).json({
          success: false,
          message: 'Account not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Balance updated successfully',
        data: updatedAccount
      });
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update balance'
      });
    }
  }
  
  async validateAccountNumber(req: Request, res: Response): Promise<void> {
    try {
      const { accountNumber } = req.params;
      
      if (!accountNumber) {
        res.status(400).json({
          success: false,
          message: 'Account number is required'
        });
        return;
      }
      
      const isValid = await accountService.validateAccountNumber(accountNumber);
      
      res.status(200).json({
        success: true,
        data: {
          accountNumber,
          isValid
        }
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to validate account number'
      });
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
        data: result
      });
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to verify and decrypt data'
      });
    }
  }
  
  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const { accountNumber } = req.params;
      
      if (!accountNumber) {
        res.status(400).json({
          success: false,
          message: 'Account number is required'
        });
        return;
      }
      
      const deleted = await accountService.deleteAccount(accountNumber);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Account not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete account'
      });
    }
  }
}

export default new AccountController();