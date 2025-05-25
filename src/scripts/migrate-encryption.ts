import mongoose from 'mongoose';
import { config } from '../config/environment';
import Account from '../models/account.model';
import { encrypt } from '../utils/card.utils';

async function migrateEncryption() {
  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to database');

    // Get all accounts
    const accounts = await Account.find({});
    console.log(`Found ${accounts.length} accounts to migrate`);


    for (const account of accounts) {
      try {
     
        if (typeof account.phoneNumber === 'string') {
          console.log(`Encrypting phone number for account ${account.accountNumber}`);
          const encryptedPhone = encrypt(account.phoneNumber);
          account.phoneNumber = encryptedPhone;
        }

   
        if (account.dateOfBirth instanceof Date || typeof account.dateOfBirth === 'string') {
          console.log(`Encrypting date of birth for account ${account.accountNumber}`);
          const dateStr = account.dateOfBirth instanceof Date 
            ? account.dateOfBirth.toISOString() 
            : account.dateOfBirth;
          const encryptedDob = encrypt(dateStr);
          account.dateOfBirth = encryptedDob;
        }

 
        await account.save();
        console.log(`Successfully migrated account ${account.accountNumber}`);
      } catch (error) {
        console.error(`Error migrating account ${account.accountNumber}:`, error);
      }
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

migrateEncryption(); 