import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import menuRoutes from './routes/menu.routes';
import locationRoutes from './routes/location.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(morgan('dev')); // HTTP request logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant Service is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/menu`, menuRoutes);
app.use(`/api/${API_VERSION}/locations`, locationRoutes);
app.use(`/api/${API_VERSION}/restaurants`, locationRoutes); // Alias

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍽️  Restaurant Service running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

export default app;
