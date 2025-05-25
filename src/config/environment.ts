export const config = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:5000/finable',
    JWT_SECRET: process.env.JWT_SECRET || 'Finable-secret-key',
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    NODE_ENV: process.env.NODE_ENV || 'development'
  };