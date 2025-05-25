import { Document } from 'mongoose';

export interface IEncryptedField {
  encryptedData: string;
  iv: string;
}

export interface ICard {
  cardNumber: IEncryptedField;
  cvv: IEncryptedField;
  expiryDate: IEncryptedField;
}

export interface IAccountCreate {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  password: string;
  phoneNumber: string;
  accountType: 'savings' | 'current' | 'fixed deposit';
}

export interface IAccountResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountNumber: string;
  accountType: 'savings' | 'current' | 'fixed deposit';
  balance: number;
  status: 'active' | 'suspended' | 'closed';
  phoneNumber: IEncryptedField;
  dateOfBirth: IEncryptedField;
  card?: {
    cardNumber: IEncryptedField;
    cvv: IEncryptedField;
    expiryDate: IEncryptedField;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccount extends Omit<IAccountResponse, '_id'> {
  _id?: string;
  password: string;
}