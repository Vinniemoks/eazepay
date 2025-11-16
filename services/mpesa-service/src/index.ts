import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mpesaRoutes from './routes/mpesa';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mpesa-service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/mpesa', mpesaRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ M-Pesa Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
