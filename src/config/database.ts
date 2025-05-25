import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:5000/finable';
    
    await mongoose.connect(mongoUri, {
    
    });
    
    console.log('✅ yah! Database connected successfully');
    

    mongoose.connection.on('error', (error) => {
      console.error('❌ Database connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Database disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Database connection closed.');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};