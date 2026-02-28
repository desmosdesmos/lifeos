import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from '@/config';
import { logger } from '@/config/logger';

// Роуты
import authRoutes from '@/routes/auth';
import metricsRoutes from '@/routes/metrics';
import goalsRoutes from '@/routes/goals';
import tasksRoutes from '@/routes/tasks';
import analyticsRoutes from '@/routes/analytics';

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Безопасность
app.use(helmet({
  contentSecurityPolicy: false, // Отключаем для Web App
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: [config.telegram.webAppUrl, 'https://web.telegram.org'],
  credentials: true,
}));

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API роуты
app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/analytics', analyticsRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    error: config.server.env === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📱 Environment: ${config.server.env}`);
  logger.info(`🌐 Web App URL: ${config.telegram.webAppUrl}`);
});

export default app;
