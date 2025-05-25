import { Router } from 'express';
import accountController from '../controller/account.controller';
import { validateAccountNumber, validateAccountCreation } from '../middleware/accountValidation';

const router = Router();

// Create finable account
router.post('/', validateAccountCreation, accountController.createAccount);

// Get a particular account by number
router.get('/:accountNumber', validateAccountNumber, accountController.getAccount);

// Get all accounts listing
router.get('/', accountController.getAllAccounts);

// Verify and decrypt data
router.post('/:accountNumber/decrypt', validateAccountNumber, accountController.verifyAndDecryptData);

export default router;

