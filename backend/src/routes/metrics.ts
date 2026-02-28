import { Router } from 'express';
import { metricsController } from '@/controllers/MetricsController';
import { telegramAuth } from '@/middleware/auth';

const router = Router();

// Все роуты защищены
router.use(telegramAuth);

// Получить метрики за дату
router.get('/:date', (req, res) => metricsController.getMetrics(req, res));

// Получить метрики за период
router.get('/', (req, res) => metricsController.getMetricsRange(req, res));

// Создать/обновить метрики
router.post('/', (req, res) => metricsController.upsertMetrics(req, res));

// Обновить отдельное поле
router.patch('/:field', (req, res) => metricsController.updateField(req, res));

// Удалить метрики за дату
router.delete('/:date', (req, res) => metricsController.deleteMetrics(req, res));

// Статистика за сегодня
router.get('/today/stats', (req, res) => metricsController.getTodayStats(req, res));

export default router;
