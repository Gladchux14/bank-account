import app from './app';
import { connectDatabase } from './config/database';
import { config } from './config/environment';

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📊 Health check: http://localhost:${config.PORT}/health`);
      console.log(`🏦 Accounts API: http://localhost:${config.PORT}/api/accounts`);
    });
    
  } catch (error) {
    console.error('Finable server could not start:', error);
    process.exit(1);
  }
};

startServer();