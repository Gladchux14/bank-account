import { model, Schema } from 'mongoose';
import { IAccount, IAccountCreate, IAccountResponse, IEncryptedField } from '../interface/Account';
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
      type: Object,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function(dob: any) {
          try {
            let dateToValidate: string;
            
            // If it's already encrypted, decrypt it
            if (dob && typeof dob === 'object' && 'encryptedData' in dob && 'iv' in dob) {
              dateToValidate = decrypt(dob.encryptedData, dob.iv);
            } else {
              // If it's a plain string, use it directly
              dateToValidate = dob;
            }

            const birthDate = new Date(dateToValidate);
            if (isNaN(birthDate.getTime())) {
              return false;
            }

            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            
            return age >= 18 && age <= 120;
          } catch (error) {
            return false;
          }
        },
        message: 'Account holder must be between 18 and 120 years old'
      }
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
      type: Object,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function(phone: any) {
          try {
            let phoneToValidate: string;
            
            // If it's already encrypted, decrypt it
            if (phone && typeof phone === 'object' && 'encryptedData' in phone && 'iv' in phone) {
              phoneToValidate = decrypt(phone.encryptedData, phone.iv);
            } else {
              // If it's a plain string, use it directly
              phoneToValidate = phone;
            }

            return /^\+[1-9]\d{1,14}$/.test(phoneToValidate);
          } catch (error) {
            return false;
          }
        },
        message: 'Please provide a valid phone number in international format (e.g., +2348012345678)'
      }
    },

    card: {
      type: Object,
      default: undefined
    }
  },
  {
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret): IAccountResponse {
        delete ret.password;
        
        try {
        
          if (doc.phoneNumber) {
            const phoneNumber = doc.phoneNumber as IEncryptedField;
            if (phoneNumber.encryptedData && phoneNumber.iv) {
              ret.phoneNumber = {
                encryptedData: phoneNumber.encryptedData,
                iv: phoneNumber.iv
              };
            }
          }
    
          if (doc.dateOfBirth) {
            const dateOfBirth = doc.dateOfBirth as IEncryptedField;
            if (dateOfBirth.encryptedData && dateOfBirth.iv) {
              ret.dateOfBirth = {
                encryptedData: dateOfBirth.encryptedData,
                iv: dateOfBirth.iv
              };
            }
          }
        
          if (doc.card) {
            ret.card = {
              cardNumber: {
                encryptedData: doc.card.cardNumber.encryptedData,
                iv: doc.card.cardNumber.iv
              },
              cvv: {
                encryptedData: doc.card.cvv.encryptedData,
                iv: doc.card.cvv.iv
              },
              expiryDate: {
                encryptedData: doc.card.expiryDate.encryptedData,
                iv: doc.card.expiryDate.iv
              }
            };
          }
        } catch (error) {
          console.error('Error in toJSON transform:', error);
        }
        
        return ret as IAccountResponse;
      }
    }
  }
);


AccountSchema.pre('validate', async function(next) {
  if (this.isNew) {
    try {
    
      if (!this.accountNumber) {
        this.accountNumber = await generateAccountNumber(this.accountType);
      }
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});


AccountSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      console.log('Pre-save middleware - New document');

      const rawPhone = this.get('phoneNumber');
      const rawDateOfBirth = this.get('dateOfBirth');
      
      console.log('Raw values:', { rawPhone, rawDateOfBirth });
      
   
      if (typeof rawPhone === 'string') {
        console.log('Encrypting phone number');
        const encryptedPhone = encrypt(rawPhone);
        if (!encryptedPhone || !encryptedPhone.encryptedData || !encryptedPhone.iv) {
          throw new Error('Failed to encrypt phone number');
        }
        this.set('phoneNumber', encryptedPhone);
      }

      if (typeof rawDateOfBirth === 'string') {
        console.log('Encrypting date of birth');
        const encryptedDob = encrypt(rawDateOfBirth);
        if (!encryptedDob || !encryptedDob.encryptedData || !encryptedDob.iv) {
          throw new Error('Failed to encrypt date of birth');
        }
        this.set('dateOfBirth', encryptedDob);
      }
      

      console.log('Generating card details');
      const cardDetails = generateCardDetails();
      console.log('Raw card details:', cardDetails);
      
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
      
      console.log('Encrypted card details:', encryptedCard);
      this.set('card', encryptedCard);
      
      console.log('Final document before save:', this.toObject());
    } catch (error) {
      console.error('Error in pre-save middleware:', error);
      return next(error as Error);
    }
  }
  next();
});

const Account = model<IAccount>('Account', AccountSchema);
export default Account;