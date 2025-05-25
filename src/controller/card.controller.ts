import { Request, Response } from 'express';
import cardService from '../service/card.services';
import accountService from '../service/account.services';

class CardController {
  async generateCard(req: Request, res: Response): Promise<void> {
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

      // creates a new card
      const newCard = cardService.generateNewCard();

      // Updates an account with a new card
      const updatedAccount = await accountService.updateAccountCard(accountNumber, newCard);

      res.status(200).json({
        success: true,
        message: 'Card generated successfully',
        data: {
          accountNumber,
          card: newCard
        }
      });

    } catch (error) {
      if (error instanceof Error) {
        console.error('Error generating card:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Failed to generate card'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'An unknown error occurred'
        });
      }
    }
  }

  async verifyCard(req: Request, res: Response): Promise<void> {
    try {
      const { accountNumber } = req.params;
      const { card } = req.body;

      if (!accountNumber || !card) {
        res.status(400).json({
          success: false,
          message: 'Account number and card details are required'
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


      const isValid = cardService.verifyCardDetails(card);

      res.status(200).json({
        success: true,
        data: {
          accountNumber,
          isValid
        }
      });

    } catch (error) {
      if (error instanceof Error) {
        console.error('Error verifying card:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Failed to verify card'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'An unknown error occurred'
        });
      }
    }
  }

  async getDecryptedCardDetails(req: Request, res: Response): Promise<void> {
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

      const decryptedCard = await cardService.getDecryptedCardDetails(accountNumber);
      
      if (!decryptedCard) {
        res.status(404).json({
          success: false,
          message: 'Card not found for this account'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          accountNumber,
          card: decryptedCard
        }
      });

    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting decrypted card details:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Failed to get decrypted card details'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'An unknown error occurred'
        });
      }
    }
  }

  async getEncryptedCardDetails(req: Request, res: Response): Promise<void> {
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

      const encryptedCard = await cardService.getEncryptedCardDetails(accountNumber);
      
      if (!encryptedCard) {
        res.status(404).json({
          success: false,
          message: 'Card not found for this account'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          accountNumber,
          card: encryptedCard
        }
      });

    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting encrypted card details:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Failed to get encrypted card details'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'An unknown error occurred'
        });
      }
    }
  }
}

export default new CardController(); 