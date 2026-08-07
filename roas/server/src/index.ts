import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import config from './config/config';
import connectDatabase from './config/database';
import { errorMiddleware } from './middleware/error.middleware';
import logger from './utils/logger';

import authRoutes from './features/auth/auth.routes';
import usersRoutes from './features/users/users.routes';
import configRoutes from './features/config/config.routes';
import vendorsRoutes from './features/vendors/vendors.routes';
import campaignsRoutes from './features/campaigns/campaigns.routes';
import uploadRoutes from './features/upload/upload.routes';
import integrationsRoutes from './features/integrations/integrations.routes';
import productsRoutes from './features/products/products.routes';
import postcardsRoutes from './features/postcards/postcards.routes';
import clientsRoutes from './features/clients/clients.routes';
import dashboardRoutes from './features/dashboard/dashboard.routes';
import jobsRoutes from './features/jobs/jobs.routes';
import invoicesRoutes from './features/invoices/invoices.routes';
import { startSyncCron } from './features/integrations/sync.cron';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/config', configRoutes);
app.use('/api/v1/vendors', vendorsRoutes);
app.use('/api/v1/campaigns', campaignsRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/integrations', integrationsRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/postcards', postcardsRoutes);
app.use('/api/v1/clients', clientsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/invoices', invoicesRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handling (must be last)
app.use(errorMiddleware);

// Start server
const startServer = async (): Promise<void> => {
  await connectDatabase();

  // Start integration sync cron
  startSyncCron();

  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
