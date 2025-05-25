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

// Validate account number format
router.get('/:accountNumber/validate', validateAccountNumber, accountController.validateAccountNumber);

// Verify and decrypt data
router.post('/:accountNumber/decrypt', validateAccountNumber, accountController.verifyAndDecryptData);

export default router;

