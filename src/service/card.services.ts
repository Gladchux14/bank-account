import { ICard, ICardDetails, ICardResponse } from '../interface/Card';
import { generateCardDetails, encrypt, decrypt } from '../utils/card.utils';
import Account from '../models/account.model';

class CardService {
  generateNewCard(): ICardResponse {
    try {
      const cardDetails = generateCardDetails();
      
      const encryptedCard = {
        cardNumber: encrypt(cardDetails.cardNumber),
        cvv: encrypt(cardDetails.cvv),
        expiryDate: encrypt(cardDetails.expiryDate)
      };

  
      if (!encryptedCard.cardNumber?.encryptedData || !encryptedCard.cardNumber?.iv ||
          !encryptedCard.cvv?.encryptedData || !encryptedCard.cvv?.iv ||
          !encryptedCard.expiryDate?.encryptedData || !encryptedCard.expiryDate?.iv) {
        throw new Error('Failed to encrypt card details');
      }

      return encryptedCard;
    } catch (error) {
      console.error('Error generating new card:', error);
      throw new Error('Failed to generate new card');
    }
  }

  verifyCardDetails(card: ICard): boolean {
    try {
      // Verify card number
      const decryptedCardNumber = decrypt(card.cardNumber.encryptedData, card.cardNumber.iv);
      if (!/^\d{16}$/.test(decryptedCardNumber)) {
        return false;
      }

      // Verify CVV
      const decryptedCvv = decrypt(card.cvv.encryptedData, card.cvv.iv);
      if (!/^\d{3}$/.test(decryptedCvv)) {
        return false;
      }

      // Verify expiry date
      const decryptedExpiry = decrypt(card.expiryDate.encryptedData, card.expiryDate.iv);
      const [month, year] = decryptedExpiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const currentDate = new Date();
      
      return expiryDate > currentDate;
    } catch (error) {
      console.error('Error verifying card details:', error);
      return false;
    }
  }

  decryptCardDetails(card: ICard): ICardDetails {
    try {
      return {
        cardNumber: decrypt(card.cardNumber.encryptedData, card.cardNumber.iv),
        cvv: decrypt(card.cvv.encryptedData, card.cvv.iv),
        expiryDate: decrypt(card.expiryDate.encryptedData, card.expiryDate.iv)
      };
    } catch (error) {
      console.error('Error decrypting card details:', error);
      throw new Error('Failed to decrypt card details');
    }
  }

  async getDecryptedCardDetails(accountNumber: string): Promise<ICardDetails | null> {
    try {
      const account = await Account.findOne({ accountNumber });
      
      if (!account || !account.card) {
        return null;
      }

      return this.decryptCardDetails(account.card);
    } catch (error) {
      console.error('Error getting decrypted card details:', error);
      throw new Error('Failed to get decrypted card details');
    }
  }

  async getEncryptedCardDetails(accountNumber: string): Promise<ICard | null> {
    try {
      const account = await Account.findOne({ accountNumber });
      
      if (!account || !account.card) {
        return null;
      }

      return account.card;
    } catch (error) {
      console.error('Error getting encrypted card details:', error);
      throw new Error('Failed to get encrypted card details');
    }
  }
}

export default new CardService(); 