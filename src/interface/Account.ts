import { Document } from 'mongoose';

interface IEncryptedField {
  encryptedData: string;
  iv: string;
}

export interface ICard {
  cardNumber: IEncryptedField;
  cvv: IEncryptedField;
  expiryDate: IEncryptedField;
}

export interface IAccount extends Document {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: IEncryptedField;
  password: string;
  accountNumber: string;
  accountType: 'current' | 'savings' | 'fixed deposit';
  balance: number;
  status: 'active' | 'suspended' | 'closed';
  phoneNumber: IEncryptedField;
  card?: ICard;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountCreate {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  password: string;
  accountType: 'current' | 'savings' | 'fixed deposit';
  phoneNumber: string;
}

export interface IAccountResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
  phoneNumber: string;  // Masked version
  dateOfBirth: string;  // Decrypted version
  card?: {
    cardNumber: string;  // Masked version
    cvv: string;        // Always "***"
    expiryDate: string; // Decrypted version
  };
  createdAt: Date;
  updatedAt: Date;
}