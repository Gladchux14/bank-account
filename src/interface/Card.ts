import { IEncryptedField } from './Account';

export interface ICard {
  cardNumber: IEncryptedField;
  cvv: IEncryptedField;
  expiryDate: IEncryptedField;
}

export interface ICardDetails {
  cardNumber: string;
  cvv: string;
  expiryDate: string;
}

export interface ICardResponse {
  cardNumber: IEncryptedField;
  cvv: IEncryptedField;
  expiryDate: IEncryptedField;
} 