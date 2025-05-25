import Account from '../models/account.model';

export const generateAccountNumber = async (
  accountType: 'current' | 'savings' | 'fixed deposit'
): Promise<string> => {
  const typeCode = {
    'current': '1',
    'savings': '2', 
    'fixed deposit': '3'
  };

  const year = new Date().getFullYear().toString().slice(-2);
  
  const count = await Account.countDocuments({ 
    accountType,
    createdAt: { 
      $gte: new Date(new Date().getFullYear(), 0, 1)
    }
  });
  
  const sequence = (count + 1).toString().padStart(6, '0');
  const baseNumber = typeCode[accountType] + year + sequence;
  const checkDigit = calculateLuhnCheckDigit(baseNumber);
  const accountNumber = baseNumber + checkDigit;
  
  const exists = await Account.findOne({ accountNumber });
  if (exists) {
    const random = Math.floor(Math.random() * 900000) + 100000;
    return typeCode[accountType] + year + random.toString() + 
           calculateLuhnCheckDigit(typeCode[accountType] + year + random.toString());
  }
  
  return accountNumber;
};

export const validateAccountNumber = (accountNumber: string): boolean => {
  if (accountNumber.length !== 10 || !/^\d{10}$/.test(accountNumber)) {
    return false;
  }
  
  const baseNumber = accountNumber.slice(0, 9);
  const checkDigit = accountNumber.slice(9);
  
  return calculateLuhnCheckDigit(baseNumber) === checkDigit;
};

// Helper function
function calculateLuhnCheckDigit(number: string): string {
  const digits = number.split('').map(Number);
  let sum = 0;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    
    if ((digits.length - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    
    sum += digit;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
} 