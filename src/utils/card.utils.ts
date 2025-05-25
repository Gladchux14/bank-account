import crypto from 'crypto';
import { config } from '../config/environment';

export const generateCardNumber = (): string => {

  const digits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10));
  
 
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = digits[i];
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    sum += digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  digits[15] = checkDigit;
  
  return digits.join('');
};

export const generateCVV = (): string => {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
};

export const generateExpiryDate = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 3); // Set expiry to 3 years from now
  
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  
  return `${month}/${year}`;
};

export const generateCardDetails = (): { cardNumber: string; cvv: string; expiryDate: string } => {
  return {
    cardNumber: generateCardNumber(),
    cvv: generateCVV(),
    expiryDate: generateExpiryDate()
  };
};


export const encrypt = (text: string): { encryptedData: string; iv: string } => {
  console.log('Encrypting text:', text);
  
  if (!text) {
    throw new Error('Text to encrypt cannot be empty');
  }

  if (!config.ENCRYPTION_KEY) {
    throw new Error('Encryption key is not configured');
  }

  try {
    const iv = crypto.randomBytes(16);
  
    const key = crypto.scryptSync(config.ENCRYPTION_KEY, 'salt', 32);
    console.log('Generated key length:', key.length);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const result = {
      encryptedData: encrypted,
      iv: iv.toString('hex')
    };
    console.log('Encryption result:', result);
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decrypt = (encryptedData: string, iv: string): string => {
  console.log('Decrypting data:', { encryptedData, iv });

  if (!encryptedData || !iv) {
    throw new Error('Encrypted data and IV cannot be empty');
  }

  if (!config.ENCRYPTION_KEY) {
    throw new Error('Encryption key is not configured');
  }

  try {
  
    const key = crypto.scryptSync(config.ENCRYPTION_KEY, 'salt', 32);
    console.log('Generated key length:', key.length);

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      key,
      Buffer.from(iv, 'hex')
    );
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    console.log('Decryption result:', decrypted);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}; 