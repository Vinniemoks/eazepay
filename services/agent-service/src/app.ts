import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { AgentDataSource } from './config/database';
import { agentRoutes } from './routes/agentRoutes';
import { terminalRoutes } from './routes/terminalRoutes';
import { errorHandler } from './middleware/errorHandler';
import { httpLogger, logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8005;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'agent-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/agents', agentRoutes);
app.use('/api/terminals', terminalRoutes);

app.use(errorHandler);

// ...existing code...

if (process.env.NODE_ENV !== 'test') {
  AgentDataSource.initialize()
    .then(() => {
      logger.info('Agent service connected to database');
      app.listen(PORT, () => {
        logger.info(`Agent Service listening on port ${PORT}`);
      });
    })
    .catch((error) => {
      logger.error('Failed to initialise data source', error);
      process.exit(1);
    });
}

export default app;