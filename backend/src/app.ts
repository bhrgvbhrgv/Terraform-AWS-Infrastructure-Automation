import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { logger } from './utils/logger.js';
import { config } from './config/env.js';
import { errorHandler } from './middleware/error.js';

import { authRouter } from './modules/auth/auth.router.js';
import { dashboardRouter } from './modules/dashboard/dashboard.router.js';
import { ec2Router } from './modules/ec2/ec2.router.js';
import { cloudwatchRouter } from './modules/cloudwatch/cloudwatch.router.js';
import { logsRouter } from './modules/logs/logs.router.js';
import { settingsRouter } from './modules/settings/settings.router.js';

export const app = express();

app.use(helmet());
app.use(cors({
  origin: config.FRONTEND_ORIGIN === '*' ? true : [config.FRONTEND_ORIGIN, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

if (config.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }));
}

// Health check endpoint (spec: /api/v1/health)
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    mode: config.CLOUD_PROVIDER,
    timestamp: new Date().toISOString()
  });
});

// Also keep legacy /api/health for backwards compatibility
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    mode: config.CLOUD_PROVIDER,
    timestamp: new Date().toISOString()
  });
});

// Mount modules
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/ec2', ec2Router);
app.use('/api/v1/cloudwatch', cloudwatchRouter);
app.use('/api/v1/logs', logsRouter);
app.use('/api/v1/settings', settingsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Centralized error handler
app.use(errorHandler);
