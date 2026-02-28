import { Response } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { AuthRequest, DailyMetricsInput, DailyMetricsResponse } from '@/types';
import { lifeScoreService } from '@/services/LifeScoreService';
import { ruleEngineService } from '@/services/RuleEngineService';

/**
 * Metrics Controller
 * Управление ежедневными метриками
 */
export class MetricsController {
  /**
   * Получить метрики за дату
   * GET /api/metrics/:date
   */
  async getMetrics(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { date } = req.params;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const metricDate = new Date(date);
      metricDate.setHours(0, 0, 0, 0);

      const metric = await prisma.dailyMetric.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: metricDate,
          },
        },
      });

      if (!metric) {
        res.json({
          success: true,
          metric: null,
        });
        return;
      }

      // Получаем LifeScore за этот день
      const lifeScore = await lifeScoreService.calculateLifeScore(
        telegramId,
        metricDate,
        new Date(metricDate.getTime() + 24 * 60 * 60 * 1000)
      );

      // Получаем статусы сфер
      const sphereStatuses = ruleEngineService['getSphereStatuses']([metric]);

      const response: DailyMetricsResponse = {
        id: metric.id,
        date: metric.date.toISOString(),
        sleepHours: metric.sleepHours || undefined,
        waterMl: metric.waterMl,
        calories: metric.calories || undefined,
        proteinGrams: metric.proteinGrams || undefined,
        workoutType: metric.workoutType || undefined,
        workoutMinutes: metric.workoutMinutes,
        workHours: metric.workHours || undefined,
        income: metric.income,
        expenses: metric.expenses,
        mood: metric.mood || undefined,
        selfDevMinutes: metric.selfDevMinutes,
        personalLifeScore: metric.personalLifeScore || undefined,
        notes: metric.notes || undefined,
        sphereStatuses,
        lifeScore: lifeScore.total,
      };

      res.json({
        success: true,
        metric: response,
      });
    } catch (error) {
      logger.error('Get metrics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Получить метрики за период
   * GET /api/metrics?from=YYYY-MM-DD&to=YYYY-MM-DD
   */
  async getMetricsRange(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { from, to, limit = '30' } = req.query;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const startDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = to ? new Date(to as string) : new Date();

      const metrics = await prisma.dailyMetric.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'desc' },
        take: parseInt(limit as string, 10),
      });

      res.json({
        success: true,
        metrics,
        count: metrics.length,
      });
    } catch (error) {
      logger.error('Get metrics range error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Создать или обновить метрики за дату
   * POST /api/metrics
   */
  async upsertMetrics(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const data: DailyMetricsInput = req.body;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const metricDate = new Date(data.date);
      metricDate.setHours(0, 0, 0, 0);

      // Проверяем существующую запись
      const existing = await prisma.dailyMetric.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: metricDate,
          },
        },
      });

      let metric;

      if (existing) {
        // Обновляем
        metric = await prisma.dailyMetric.update({
          where: { id: existing.id },
          data: {
            sleepHours: data.sleepHours ?? existing.sleepHours,
            waterMl: (existing.waterMl || 0) + (data.waterMl || 0),
            calories: data.calories ?? existing.calories,
            proteinGrams: data.proteinGrams ?? existing.proteinGrams,
            workoutType: data.workoutType ?? existing.workoutType,
            workoutMinutes: (existing.workoutMinutes || 0) + (data.workoutMinutes || 0),
            workHours: data.workHours ?? existing.workHours,
            income: (existing.income || 0) + (data.income || 0),
            expenses: (existing.expenses || 0) + (data.expenses || 0),
            mood: data.mood ?? existing.mood,
            selfDevMinutes: (existing.selfDevMinutes || 0) + (data.selfDevMinutes || 0),
            personalLifeScore: data.personalLifeScore ?? existing.personalLifeScore,
            notes: data.notes ?? existing.notes,
          },
        });
      } else {
        // Создаём
        metric = await prisma.dailyMetric.create({
          data: {
            userId: user.id,
            date: metricDate,
            sleepHours: data.sleepHours,
            waterMl: data.waterMl || 0,
            calories: data.calories,
            proteinGrams: data.proteinGrams,
            workoutType: data.workoutType,
            workoutMinutes: data.workoutMinutes || 0,
            workHours: data.workHours,
            income: data.income || 0,
            expenses: data.expenses || 0,
            mood: data.mood,
            selfDevMinutes: data.selfDevMinutes || 0,
            personalLifeScore: data.personalLifeScore,
            notes: data.notes,
          },
        });
      }

      // Получаем обновлённый LifeScore
      const lifeScore = await lifeScoreService.calculateLifeScore(
        telegramId,
        metricDate,
        new Date(metricDate.getTime() + 24 * 60 * 60 * 1000)
      );

      logger.info(`Metrics upserted for user ${telegramId} on ${metricDate.toISOString()}`);

      res.json({
        success: true,
        metric: {
          ...metric,
          lifeScore: lifeScore.total,
        },
      });
    } catch (error) {
      logger.error('Upsert metrics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Быстрое обновление отдельной метрики
   * PATCH /api/metrics/:field
   */
  async updateField(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { field } = req.params;
      const { value, date = new Date().toISOString() } = req.body;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const metricDate = new Date(date);
      metricDate.setHours(0, 0, 0, 0);

      // Проверяем допустимые поля
      const validFields = [
        'sleepHours', 'waterMl', 'calories', 'proteinGrams',
        'workoutType', 'workoutMinutes', 'workHours',
        'income', 'expenses', 'mood', 'selfDevMinutes',
        'personalLifeScore', 'notes',
      ];

      if (!validFields.includes(field)) {
        res.status(400).json({ error: `Invalid field: ${field}` });
        return;
      }

      let metric = await prisma.dailyMetric.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: metricDate,
          },
        },
      });

      if (!metric) {
        // Создаём новую запись
        metric = await prisma.dailyMetric.create({
          data: {
            userId: user.id,
            date: metricDate,
            [field]: value,
          },
        });
      } else {
        // Обновляем
        metric = await prisma.dailyMetric.update({
          where: { id: metric.id },
          data: {
            [field]: field === 'waterMl' || field === 'workoutMinutes' || 
                     field === 'selfDevMinutes' || field === 'income' || field === 'expenses'
              ? (metric as any)[field] + value
              : value,
          },
        });
      }

      res.json({
        success: true,
        metric,
      });
    } catch (error) {
      logger.error('Update field error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Удалить метрики за дату
   * DELETE /api/metrics/:date
   */
  async deleteMetrics(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { date } = req.params;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const metricDate = new Date(date);
      metricDate.setHours(0, 0, 0, 0);

      await prisma.dailyMetric.deleteMany({
        where: {
          userId: user.id,
          date: metricDate,
        },
      });

      logger.info(`Metrics deleted for user ${telegramId} on ${metricDate.toISOString()}`);

      res.json({
        success: true,
      });
    } catch (error) {
      logger.error('Delete metrics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Получить статистику за сегодня
   * GET /api/metrics/today/stats
   */
  async getTodayStats(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lifeScore = await lifeScoreService.calculateTodayLifeScore(telegramId);
      const ruleAnalysis = await ruleEngineService.analyze(telegramId, 1);

      res.json({
        success: true,
        today: {
          date: today.toISOString(),
          lifeScore: lifeScore.total,
          sphereBreakdown: lifeScore.spheres,
          sphereStatuses: ruleAnalysis.sphereStatuses,
          recommendations: ruleAnalysis.recommendations,
        },
      });
    } catch (error) {
      logger.error('Get today stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const metricsController = new MetricsController();
export default metricsController;
