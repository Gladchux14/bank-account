import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
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