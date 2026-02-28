import { Router } from 'express';
import { analyticsController } from '@/controllers/AnalyticsController';
import { telegramAuth } from '@/middleware/auth';

const router = Router();

router.use(telegramAuth);

// Дашборд
router.get('/dashboard', (req, res) => analyticsController.getDashboard(req, res));

// Колесо баланса
router.get('/wheel', (req, res) => analyticsController.getLifeWheel(req, res));

// Корреляции
router.get('/correlations', (req, res) => analyticsController.getCorrelations(req, res));

// Недельная статистика
router.get('/weekly', (req, res) => analyticsController.getWeeklyStats(req, res));

// Прогресс по сферам
router.get('/progress', (req, res) => analyticsController.getProgress(req, res));

// Экспорт отчёта
router.get('/export', (req, res) => analyticsController.exportReport(req, res));

export default router;
