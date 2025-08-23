import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppDataSource } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'identity-service',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(errorHandler);

// Database connection and server start
AppDataSource.initialize()
  .then(() => {
    logger.info('✅ Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`🚀 Identity Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  });

export default app;
