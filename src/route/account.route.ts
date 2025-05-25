import { Router } from 'express';
import accountController from '../controller/account.controller';
import { validateAccountCreation, validateAccountNumber } from '../middleware/accountValidation';

const router = Router();

// Create new account
router.post('/', validateAccountCreation, accountController.createAccount);

// Get all accounts with pagination
router.get('/', accountController.getAllAccounts);

// Get account by account number
router.get('/:accountNumber', validateAccountNumber, accountController.getAccount);

// Update account status
router.patch('/:accountNumber/status', validateAccountNumber, accountController.updateAccountStatus);

// Update account balance (credit/debit)
router.patch('/:accountNumber/balance', validateAccountNumber, accountController.updateBalance);

// Validate account number format
router.get('/:accountNumber/validate', validateAccountNumber, accountController.validateAccountNumber);

// // Delete account
// router.delete('/:accountNumber([0-9]{10})', accountController.deleteAccount);



// Add this middleware function
// const validateAccountNumber = (req, res, next) => {
//     const { accountNumber } = req.params;
    
//     // Check if account number is exactly 10 digits
//     if (!/^\d{10}$/.test(accountNumber)) {
//       return res.status(400).json({ 
//         error: 'Invalid account number format',
//         message: 'Account number must be exactly 10 digits'
//       });
//     }
    
//     next();
//   };  


 
  
  // Apply middleware to routes that need it
//   router.get('/:accountNumber', validateAccountNumber, accountController.getAccount);
//   router.patch('/:accountNumber/status', validateAccountNumber, accountController.updateAccountStatus);
//   router.patch('/:accountNumber/balance', validateAccountNumber, accountController.updateBalance);
//   router.get('/:accountNumber/validate', validateAccountNumber, accountController.validateAccountNumber);
//   router.delete('/:accountNumber', validateAccountNumber, accountController.deleteAccount);

export default router;

