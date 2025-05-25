import Account from '../models/account.model';
import { IAccount, IAccountCreate, IAccountResponse } from '../interface/Account';
import bcrypt from 'bcryptjs';
import { validateAccountNumber } from '../utils/accountNumber.utils';
import { decrypt } from '../utils/card.utils';

class AccountService {
  
  async createAccount(accountData: IAccountCreate): Promise<IAccountResponse> {
    try {
      // Hash password before saving
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(accountData.password, saltRounds);
      
      // Create new account
      const newAccount = new Account({
        ...accountData,
        password: hashedPassword
      });
      
      const savedAccount = await newAccount.save();
      
      // Return account without password
      return this.formatAccountResponse(savedAccount);
      
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Email already exists');
      }
      throw new Error(error.message || 'Failed to create account');
    }
  }
  
  async getAccountByNumber(accountNumber: string): Promise<IAccountResponse | null> {
    try {
      const account = await Account.findOne({ accountNumber });
      
      if (!account) {
        return null;
      }
      
      return this.formatAccountResponse(account);
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch account');
    }
  }
  
  async getAccountByEmail(email: string): Promise<IAccount | null> {
    try {
      const account = await Account.findOne({ email }).select('+password');
      return account;
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch account');
    }
  }
  
  async getAllAccounts(page: number = 1, limit: number = 10): Promise<{
    accounts: IAccountResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [accounts, total] = await Promise.all([
        Account.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
        Account.countDocuments()
      ]);
      
      const formattedAccounts = accounts.map(account => 
        this.formatAccountResponse(account)
      );
      
      return {
        accounts: formattedAccounts,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch accounts');
    }
  }
  
  async updateAccountStatus(
    accountNumber: string, 
    status: 'active' | 'suspended' | 'closed'
  ): Promise<IAccountResponse | null> {
    try {
      const updatedAccount = await Account.findOneAndUpdate(
        { accountNumber },
        { status },
        { new: true, runValidators: true }
      );
      
      if (!updatedAccount) {
        return null;
      }
      
      return this.formatAccountResponse(updatedAccount);
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update account status');
    }
  }
  
  async updateBalance(accountNumber: string, amount: number): Promise<IAccountResponse | null> {
    try {
      const account = await Account.findOne({ accountNumber });
      
      if (!account) {
        return null;
      }
      
      if (account.balance + amount < 0) {
        throw new Error('Insufficient balance');
      }
      
      account.balance += amount;
      const updatedAccount = await account.save();
      
      return this.formatAccountResponse(updatedAccount);
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update balance');
    }
  }
  
  async validateAccountNumber(accountNumber: string): Promise<boolean> {
    try {
      return validateAccountNumber(accountNumber);
    } catch (error) {
      return false;
    }
  }
  
  async verifyAndDecryptData(accountNumber: string, encryptedData: string, iv: string): Promise<string> {
    try {
      const account = await Account.findOne({ accountNumber });
      
      if (!account) {
        throw new Error('Account not found');
      }

      // Try to decrypt the data
      try {
        const decryptedData = decrypt(encryptedData, iv);
        return decryptedData;
      } catch (error) {
        throw new Error('Invalid encrypted data or IV');
      }
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify and decrypt data');
    }
  }
  
  async deleteAccount(accountNumber: string): Promise<boolean> {
    try {
      const deletedAccount = await Account.findOneAndDelete({ accountNumber });
      return !!deletedAccount;
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete account');
    }
  }
  
  private formatAccountResponse(account: IAccount): IAccountResponse {
    return {
      _id: account._id?.toString() || '',
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      status: account.status,
      phoneNumber: decrypt(account.phoneNumber.encryptedData, account.phoneNumber.iv).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      dateOfBirth: new Date(decrypt(account.dateOfBirth.encryptedData, account.dateOfBirth.iv)).toISOString(),
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }
}

export default new AccountService();