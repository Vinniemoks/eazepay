import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import { initDb } from './db';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8000', 10);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  exposedHeaders: ['X-Correlation-ID']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'identity-service', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`🚀 Identity Service (scaffold) running on http://localhost:${PORT}`);
  initDb().catch(err => console.error('DB init failed', err));
});