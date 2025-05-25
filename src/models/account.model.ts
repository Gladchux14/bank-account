import { model, Schema } from 'mongoose';
import { IAccount } from '../interface/Account';
import { generateAccountNumber } from '../utils/accountNumber.utils';
import { generateCardDetails, encrypt, decrypt } from '../utils/card.utils';

const AccountSchema = new Schema<IAccount>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function(email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please provide a valid email address'
      }
    },

    dateOfBirth: {
      encryptedData: { type: String, required: true },
      iv: { type: String, required: true }
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },

    accountNumber: {
      type: String,
      unique: true,
      required: true,
      length: [10, 'Account number must be exactly 10 digits']
    },

    accountType: {
      type: String,
      enum: ['current', 'savings', 'fixed deposit'],
      required: [true, 'Account type is required'],
      default: 'current'
    },

    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative']
    },

    status: {
      type: String,
      enum: ['active', 'suspended', 'closed'],
      default: 'active'
    },

    phoneNumber: {
      encryptedData: { type: String, required: true },
      iv: { type: String, required: true }
    },

    card: {
      cardNumber: {
        encryptedData: { type: String, required: true },
        iv: { type: String, required: true }
      },
      cvv: {
        encryptedData: { type: String, required: true },
        iv: { type: String, required: true }
      },
      expiryDate: {
        encryptedData: { type: String, required: true },
        iv: { type: String, required: true }
      }
    }
  },
  {
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret) {
        delete ret.password;
        
        // Decrypt and mask phone number
        if (doc.phoneNumber) {
          const decryptedPhone = decrypt(doc.phoneNumber.encryptedData, doc.phoneNumber.iv);
          ret.phoneNumber = decryptedPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        }
        
        // Decrypt date of birth
        if (doc.dateOfBirth) {
          const decryptedDate = decrypt(doc.dateOfBirth.encryptedData, doc.dateOfBirth.iv);
          ret.dateOfBirth = new Date(decryptedDate).toISOString();
        }
        
        // Handle card details
        if (ret.card && doc.card) {
          const cardNumber = decrypt(doc.card.cardNumber.encryptedData, doc.card.cardNumber.iv);
          ret.card = {
            cardNumber: '**** **** **** ' + cardNumber.slice(-4),
            cvv: '***',
            expiryDate: decrypt(doc.card.expiryDate.encryptedData, doc.card.expiryDate.iv)
          };
        }
        return ret;
      }
    }
  }
);

// Indexes
AccountSchema.index({ accountNumber: 1 });
AccountSchema.index({ email: 1 });
AccountSchema.index({ accountType: 1 });

// Pre-save middleware
AccountSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Generate account number if not exists
      if (!this.accountNumber) {
        this.accountNumber = await generateAccountNumber(this.accountType);
      }
      
      // Get raw values before encryption
      const rawPhone = (this.get('phoneNumber') as unknown) as string;
      const rawDateOfBirth = (this.get('dateOfBirth') as unknown) as Date;
      
      // Encrypt sensitive data
      this.set('phoneNumber', encrypt(rawPhone));
      this.set('dateOfBirth', encrypt(rawDateOfBirth.toISOString()));
      
      // Generate and encrypt card details
      const cardDetails = generateCardDetails();
      this.card = {
        cardNumber: encrypt(cardDetails.cardNumber),
        cvv: encrypt(cardDetails.cvv),
        expiryDate: encrypt(cardDetails.expiryDate)
      };
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Pre-validate middleware
AccountSchema.pre('validate', function(next) {
  const rawPhone = (this as any).phoneNumber;
  if (rawPhone && !/^\+?[\d\s-()]{10,15}$/.test(rawPhone)) {
    this.invalidate('phoneNumber', 'Please provide a valid phone number');
  }
  
  const rawDob = (this as any).dateOfBirth;
  if (rawDob) {
    const age = new Date().getFullYear() - new Date(rawDob).getFullYear();
    if (age < 18 || age > 120) {
      this.invalidate('dateOfBirth', 'Account holder must be between 18 and 120 years old');
    }
  }
  
  next();
});

const Account = model<IAccount>('Account', AccountSchema);
export default Account;