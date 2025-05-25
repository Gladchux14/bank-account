import crypto from 'crypto';

export const generateCardNumber = (): string => {
  // Generate 16 random digits
  const digits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10));
  
  // Apply Luhn algorithm to make it a valid card number
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
  
  // Calculate check digit
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

// Encryption utilities
export const encrypt = (text: string): { encryptedData: string; iv: string } => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex'),
    iv
  );
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return {
    encryptedData: encrypted.toString('hex'),
    iv: iv.toString('hex')
  };
};

export const decrypt = (encryptedData: string, iv: string): string => {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
}; 