import Account from '../models/account.model';
import { IAccount, IAccountCreate, IAccountResponse, IEncryptedField } from '../interface/Account';
import { ICard } from '../interface/Card';
import bcrypt from 'bcryptjs';
import { validateAccountNumber } from '../utils/accountNumber.utils';
import { decrypt } from '../utils/card.utils';

class AccountService {
  
  async createAccount(accountData: IAccountCreate): Promise<IAccountResponse> {
    try {
   
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(accountData.password, saltRounds);
      

      const newAccount = new Account({
        ...accountData,
        password: hashedPassword
      });
      
      const savedAccount = await newAccount.save();
   
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
  
  async verifyAndDecryptData(accountNumber: string, encryptedData: string, iv: string): Promise<{
    decryptedData: string;
    fieldType: 'phoneNumber' | 'dateOfBirth' | 'cardNumber' | 'cvv' | 'expiryDate';
  }> {
    try {
      const account = await Account.findOne({ accountNumber });
      
      if (!account) {
        throw new Error('Account not found');
      }

 
      try {
        const decryptedData = decrypt(encryptedData, iv);
        
     
        let fieldType: 'phoneNumber' | 'dateOfBirth' | 'cardNumber' | 'cvv' | 'expiryDate' = 'phoneNumber';
  
        const phoneNumber = account.phoneNumber as IEncryptedField;
        if (phoneNumber?.encryptedData === encryptedData && phoneNumber?.iv === iv) {
          fieldType = 'phoneNumber';
        }
        
        else if (account.dateOfBirth && typeof account.dateOfBirth === 'object' && 'encryptedData' in account.dateOfBirth) {
          const dob = account.dateOfBirth as IEncryptedField;
          if (dob.encryptedData === encryptedData && dob.iv === iv) {
            fieldType = 'dateOfBirth';
          }
        }
     
        else if (account.card) {
          const card = account.card as ICard;
          if (card.cardNumber.encryptedData === encryptedData && card.cardNumber.iv === iv) {
            fieldType = 'cardNumber';
          } else if (card.cvv.encryptedData === encryptedData && card.cvv.iv === iv) {
            fieldType = 'cvv';
          } else if (card.expiryDate.encryptedData === encryptedData && card.expiryDate.iv === iv) {
            fieldType = 'expiryDate';
          } else {
            throw new Error('Encrypted data does not match any field in the account');
          }
        } else {
          throw new Error('Encrypted data does not match any field in the account');
        }

        return {
          decryptedData,
          fieldType
        };
      } catch (error) {
        throw new Error('Invalid encrypted data or IV');
      }
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify and decrypt data');
    }
  }
  
  async updateAccountCard(accountNumber: string, card: ICard): Promise<IAccountResponse> {
    try {
      const account = await Account.findOneAndUpdate(
        { accountNumber },
        { $set: { card } },
        { new: true }
      );

      if (!account) {
        throw new Error('Account not found');
      }

      return this.formatAccountResponse(account);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update account card');
    }
  }
  
  private formatAccountResponse(account: IAccount): IAccountResponse {
    try {
      return {
        _id: account._id?.toString() || '',
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        status: account.status,
        phoneNumber: account.phoneNumber as IEncryptedField,
        dateOfBirth: account.dateOfBirth as IEncryptedField,
        card: account.card ? {
          cardNumber: account.card.cardNumber,
          cvv: account.card.cvv,
          expiryDate: account.card.expiryDate
        } : undefined,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      };
    } catch (error) {
      console.error('Error formatting account response:', error);
      throw new Error('Failed to format account response');
    }
  }
}

export default new AccountService();