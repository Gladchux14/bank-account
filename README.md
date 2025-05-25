# 🏦 Finable - Secure Banking API

A modern, secure banking API built with security standards for financial transactions and data protection.

## ✨ Overview

Finable provides a robust REST API for banking operations with encryption, comprehensive validation, and secure account management. Designed to achieve high grade security requiring compliance with modern security protocols.

## 🔥 Key Features

### 🛡️ Security First
- **AES-256 encryption** for sensitive data (phone numbers, date of birth, card details)
- **Input validation** with express-validator
- **Data encryption** at rest and in transit
- **Secure key management** via environment variables

### 🏧 Banking Operations
- **Account Management**: 
  - Create accounts with encrypted sensitive data
  - Retrieve accounts with encrypted fields
  - List all accounts with pagination
- **Card Management**:
  - Generate virtual cards with encrypted details
  - Verify card details
  - Retrieve encrypted/decrypted card information
- **Data Protection**:
  - Encrypt sensitive fields (phone, DOB, card details)
  - Decrypt data only when authorized
  - Secure data transmission

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js + TypeScript** | Runtime & Type Safety |
| **Express.js** | Web Framework |
| **MongoDB** | Database |
| **bcryptjs** | Password Hashing |
| **crypto** | Data Encryption |
| **express-validator** | Input Validation |

## ⚡ Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- npm/yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/finable.git
cd finable

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Configuration

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/finable

# Security
JWT_SECRET=your-super-secure-jwt-secret-key
ENCRYPTION_KEY=your-32-byte-encryption-key

# Optional
BCRYPT_SALT_ROUNDS=12
```

## 📚 API Documentation

### Postman Collection
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/2250000081-2250000081?env%5BbaseUrl%5D=https%3A%2F%2Ffinable-account-service.onrender.com)

To use the Postman collection:
1. Import the collection from `postman_collection.json`
2. Set the environment variable `baseUrl` to `https://finable-account-service.onrender.com`
3. All endpoints are ready to use with example requests and responses

## 🔒 Security Implementation

### Data Protection
- **Phone Numbers**: Encrypted with AES-256
- **Date of Birth**: Encrypted with AES-256
- **Card Details**: 
  - Card Number: Encrypted
  - CVV: Encrypted
  - Expiry Date: Encrypted
- **Passwords**: Hashed with bcrypt

### Validation Rules
- **Account Numbers**: Exactly 10 digits, unique
- **Passwords**: Required field
- **Age Verification**: Must be 18+ years
- **Email**: Valid format, unique per account
- **Phone**: International format validation

## 🏗️ Project Structure

```
finable/
├── src/
│   ├── config/         # Environment & database config
│   ├── controller/     # Request handlers
│   ├── interface/      # TypeScript interfaces
│   ├── middleware/     # Validation middleware
│   ├── models/         # MongoDB schemas
│   ├── route/          # API routes
│   ├── service/        # Business logic
│   ├── utils/          # Helper functions
│   └── server.ts       # Server setup
└── package.json
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation**: [API Documentation](postman_collection.json)
- **Issues**: [GitHub Issues](https://github.com/yourusername/finable/issues)

---

**Built with ❤️ for secure financial technology**