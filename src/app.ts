import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import cron from 'node-cron';
import { config } from './config/environment';
import accountRoutes from './route/account.route';

const app = express();


app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use(morgan('combined'));

// API routes
app.use('/api/accounts', accountRoutes);

//server check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Finable Server is up and running!',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Finable Banking API',
    documentation: 'https://app.getpostman.com/run-collection/2250000081-2250000081',
    endpoints: {
      accounts: '/api/accounts',
      health: '/health'
    }
  });
});


// Self-pinging function
const startPinging = () => {
  // Use the Render-provided URL or fallback to localhost for development
  const appUrl = process.env.APP_URL || process.env.RENDER_EXTERNAL_URL|| `http://localhost:${config.PORT}`;
  
  // Schedule ping every 10 seconds
  cron.schedule('*/10 * * * *', async () => {
    try {
      const response = await axios.get(`${appUrl}/health`);
      console.log(`Ping successful at ${new Date().toISOString()}: ${response.status}`);
    } catch (error:any) {
      console.error(`Ping failed at ${new Date().toISOString()}: ${error.message}`);
    }
  });
};



app.all('/{*any}', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Ouch! Route not found'
  });
})


app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default app;