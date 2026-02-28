import { Response } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { AuthRequest, LifeBalanceWheel, CorrelationData, WeeklyStatResponse } from '@/types';
import { lifeScoreService } from '@/services/LifeScoreService';
import { ruleEngineService } from '@/services/RuleEngineService';
import { reportGeneratorService } from '@/services/ReportGeneratorService';

/**
 * Analytics Controller
 * Аналитика, графики, колесо баланса, корреляции
 */
export class AnalyticsController {
  /**
   * Получить колесо баланса жизни
   * GET /api/analytics/wheel
   */
  async getLifeWheel(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { days = '7' } = req.query;

      const user = await prisma.user.findUnique({
        where: { telegramId },
        include: { sphereWeights: true },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string, 10));

      const metrics = await prisma.dailyMetric.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Максимальные значения для нормализации
      const maxValues: Record<string, number> = {
        sleep: 10,        // часов
        water: 3000,      // мл
        nutrition: 3000,  // калории
        fitness: 120,     // минут
        work: 12,         // часов
        finance: 10000,   // доход
        mood: 10,         // балл
        selfDevelopment: 120, // минут
        personalLife: 10, // балл
      };

      // Средние значения
      const avg = (field: string) => {
        const values = metrics
          .map((m: any) => m[field as keyof typeof m])
          .filter((v: any) => v !== null && v !== undefined && v > 0);
        if (values.length === 0) return 0;
        return values.reduce((a: number, b: number) => a + b, 0) / values.length;
      };

      const spheres = [
        { name: 'Сон', key: 'sleep', value: avg('sleepHours') },
        { name: 'Вода', key: 'water', value: avg('waterMl') },
        { name: 'Питание', key: 'nutrition', value: avg('calories') },
        { name: 'Фитнес', key: 'fitness', value: avg('workoutMinutes') },
        { name: 'Работа', key: 'work', value: avg('workHours') },
        { name: 'Финансы', key: 'finance', value: avg('income') },
        { name: 'Настроение', key: 'mood', value: avg('mood') },
        { name: 'Развитие', key: 'selfDevelopment', value: avg('selfDevMinutes') },
        { name: 'Личное', key: 'personalLife', value: avg('personalLifeScore') },
      ];

      const wheelData: LifeBalanceWheel = {
        spheres: spheres.map(s => ({
          name: s.name,
          value: Math.round(s.value * 10) / 10,
          max: maxValues[s.key],
          percentage: Math.round((s.value / maxValues[s.key]) * 100),
        })),
        overallScore: spheres.reduce((acc, s) => {
          return acc + (s.value / maxValues[s.key]) * 100;
        }, 0) / spheres.length,
      };

      res.json({
        success: true,
        wheel: wheelData,
      });
    } catch (error) {
      logger.error('Get life wheel error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Получить корреляции между сферами
   * GET /api/analytics/correlations
   */
  async getCorrelations(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { days = '30' } = req.query;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string, 10));

      const metrics = await prisma.dailyMetric.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (metrics.length < 5) {
        res.json({
          success: true,
          correlations: [],
          message: 'Недостаточно данных для анализа корреляций',
        });
        return;
      }

      // Вычисляем корреляции
      const correlations: CorrelationData[] = [];

      // Сон ↔ Настроение
      correlations.push(this.calculateCorrelation(
        metrics, 'sleepHours', 'mood',
        'Сон ↔ Настроение',
        'Качество сна влияет на настроение'
      ));

      // Спорт ↔ Настроение
      correlations.push(this.calculateCorrelation(
        metrics, 'workoutMinutes', 'mood',
        'Спорт ↔ Настроение',
        'Физическая активность улучшает настроение'
      ));

      // Сон ↔ Продуктивность (workHours как прокси)
      correlations.push(this.calculateCorrelation(
        metrics, 'sleepHours', 'workHours',
        'Сон ↔ Продуктивность',
        'Отдых влияет на рабочую продуктивность'
      ));

      // Вода ↔ Настроение
      correlations.push(this.calculateCorrelation(
        metrics, 'waterMl', 'mood',
        'Вода ↔ Настроение',
        'Гидратация влияет на самочувствие'
      ));

      // Саморазвитие ↔ Настроение
      correlations.push(this.calculateCorrelation(
        metrics, 'selfDevMinutes', 'mood',
        'Развитие ↔ Настроение',
        'Личностный рост влияет на удовлетворённость'
      ));

      // Фильтруем только значимые корреляции
      const significant = correlations.filter(c => Math.abs(c.coefficient) > 0.3);

      res.json({
        success: true,
        correlations: significant,
        allCorrelations: correlations,
      });
    } catch (error) {
      logger.error('Get correlations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Расчёт корреляции Пирсона
   */
  private calculateCorrelation(
    metrics: any[],
    fieldX: string,
    fieldY: string,
    label: string,
    interpretation: string
  ): CorrelationData {
    const pairs = metrics
      .map((m: any) => ({
        x: m[fieldX as keyof typeof m],
        y: m[fieldY as keyof typeof m],
      }))
      .filter((p: any) => p.x !== null && p.x !== undefined && p.y !== null && p.y !== undefined);

    if (pairs.length < 3) {
      return {
        correlation: label,
        coefficient: 0,
        interpretation: 'Недостаточно данных',
      };
    }

    const n = pairs.length;
    const sumX = pairs.reduce((a: number, b: any) => a + b.x, 0);
    const sumY = pairs.reduce((a: number, b: any) => a + b.y, 0);
    const sumXY = pairs.reduce((a: number, b: any) => a + b.x * b.y, 0);
    const sumX2 = pairs.reduce((a: number, b: any) => a + b.x * b.x, 0);
    const sumY2 = pairs.reduce((a: number, b: any) => a + b.y * b.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    const coefficient = denominator === 0 ? 0 : numerator / denominator;
    const roundedCoeff = Math.round(coefficient * 100) / 100;

    let interp = '';
    if (Math.abs(roundedCoeff) < 0.3) {
      interp = 'Слабая или отсутствует';
    } else if (Math.abs(roundedCoeff) < 0.7) {
      interp = roundedCoeff > 0 ? 'Умеренная положительная' : 'Умеренная отрицательная';
    } else {
      interp = roundedCoeff > 0 ? 'Сильная положительная' : 'Сильная отрицательная';
    }

    return {
      correlation: label,
      coefficient: roundedCoeff,
      interpretation: `${interp}. ${interpretation}.`,
    };
  }

  /**
   * Получить недельную статистику
   * GET /api/analytics/weekly
   */
  async getWeeklyStats(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { weeks = '4' } = req.query;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const stats = await prisma.weeklyStat.findMany({
        where: { userId: user.id },
        orderBy: { weekStart: 'desc' },
        take: parseInt(weeks as string, 10),
      });

      // Конвертируем даты в строки
      const formattedStats = stats.map(s => ({
        ...s,
        weekStart: s.weekStart.toISOString(),
        weekEnd: s.weekEnd.toISOString(),
      }));

      res.json({
        success: true,
        stats: formattedStats,
      });
    } catch (error) {
      logger.error('Get weekly stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Получить прогресс по сферам
   * GET /api/analytics/progress
   */
  async getProgress(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { days = '30', sphere } = req.query;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string, 10));

      const metrics = await prisma.dailyMetric.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'asc' },
      });

      // Формируем данные для графика
      const fieldMap: Record<string, string> = {
        sleep: 'sleepHours',
        water: 'waterMl',
        nutrition: 'calories',
        fitness: 'workoutMinutes',
        work: 'workHours',
        finance: 'income',
        mood: 'mood',
        selfDevelopment: 'selfDevMinutes',
        personalLife: 'personalLifeScore',
      };

      const progressData: Record<string, any[]> = {};

      if (sphere) {
        // Одна сфера
        const field = fieldMap[sphere as string];
        if (field) {
          progressData[sphere as string] = metrics.map((m: any) => ({
            date: new Date(m.date).toISOString().split('T')[0],
            value: m[field as keyof typeof m] || 0,
          }));
        }
      } else {
        // Все сферы (агрегированные)
        for (const [key, field] of Object.entries(fieldMap)) {
          progressData[key] = metrics.map((m: any) => ({
            date: new Date(m.date).toISOString().split('T')[0],
            value: m[field as keyof typeof m] || 0,
          }));
        }
      }

      // LifeScore тренд
      const lifeScoreTrend = await Promise.all(
        metrics.map(async (m: any) => {
          const date = new Date(m.date);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          
          const score = await lifeScoreService.calculateLifeScore(
            telegramId,
            date,
            nextDate
          );
          
          return {
            date: date.toISOString().split('T')[0],
            score: score.total,
          };
        })
      );

      res.json({
        success: true,
        progress: progressData,
        lifeScoreTrend,
      });
    } catch (error) {
      logger.error('Get progress error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Получить дашборд (сводная аналитика)
   * GET /api/analytics/dashboard
   */
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Получаем данные за сегодня
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayMetrics = await prisma.dailyMetric.findFirst({
        where: {
          userId: user.id,
          date: today,
        },
      });

      // LifeScore за сегодня
      const lifeScore = await lifeScoreService.calculateLifeScore(
        telegramId,
        today,
        tomorrow
      );

      // Рекомендации
      const ruleAnalysis = await ruleEngineService.analyze(telegramId, 7);

      // Активные цели
      const activeGoals = await prisma.goal.findMany({
        where: {
          userId: user.id,
          status: 'ACTIVE',
        },
      });

      // Активные задачи
      const pendingTasks = await prisma.task.findMany({
        where: {
          userId: user.id,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
        take: 10,
      });

      // Колесо баланса
      const wheel = await this.getLifeWheelData(telegramId, 7);

      res.json({
        success: true,
        dashboard: {
          date: today.toISOString(),
          lifeScore: lifeScore.total,
          sphereBreakdown: lifeScore.spheres,
          sphereStatuses: ruleAnalysis.sphereStatuses,
          todayMetrics: todayMetrics || null,
          recommendations: ruleAnalysis.recommendations.slice(0, 5),
          goals: {
            total: activeGoals.length,
            avgProgress: activeGoals.length > 0
              ? activeGoals.reduce((a, b) => a + b.progress, 0) / activeGoals.length
              : 0,
          },
          tasks: {
            pending: pendingTasks.length,
            critical: pendingTasks.filter((t: any) => t.priority === 'CRITICAL').length,
          },
          wheel,
        },
      });
    } catch (error) {
      logger.error('Get dashboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Helper для получения данных колеса баланса
   */
  private async getLifeWheelData(telegramId: bigint, days: number) {
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) return null;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await prisma.dailyMetric.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const maxValues: Record<string, number> = {
      sleep: 10,
      water: 3000,
      nutrition: 3000,
      fitness: 120,
      work: 12,
      finance: 10000,
      mood: 10,
      selfDevelopment: 120,
      personalLife: 10,
    };

    const avg = (field: string) => {
      const values = metrics
        .map((m: any) => m[field as keyof typeof m])
        .filter((v: any) => v !== null && v !== undefined && v > 0);
      if (values.length === 0) return 0;
      return values.reduce((a: number, b: number) => a + b, 0) / values.length;
    };

    return {
      spheres: [
        { name: 'Сон', value: avg('sleepHours'), max: maxValues.sleep },
        { name: 'Вода', value: avg('waterMl'), max: maxValues.water },
        { name: 'Питание', value: avg('calories'), max: maxValues.nutrition },
        { name: 'Фитнес', value: avg('workoutMinutes'), max: maxValues.fitness },
        { name: 'Работа', value: avg('workHours'), max: maxValues.work },
        { name: 'Финансы', value: avg('income'), max: maxValues.finance },
        { name: 'Настроение', value: avg('mood'), max: maxValues.mood },
        { name: 'Развитие', value: avg('selfDevMinutes'), max: maxValues.selfDevelopment },
        { name: 'Личное', value: avg('personalLifeScore'), max: maxValues.personalLife },
      ].map(s => ({
        name: s.name,
        percentage: Math.round((s.value / s.max) * 100),
      })),
    };
  }

  /**
   * Экспорт отчёта
   * GET /api/analytics/export
   */
  async exportReport(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { format = 'txt', days = '30' } = req.query;

      let content: string;
      let contentType: string;
      let filename: string;

      switch (format) {
        case 'json':
          content = await reportGeneratorService.exportToJson(telegramId, parseInt(days as string, 10));
          contentType = 'application/json';
          filename = `life-os-report-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'csv':
          content = await reportGeneratorService.exportToCsv(telegramId, parseInt(days as string, 10));
          contentType = 'text/csv';
          filename = `life-os-data-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'txt':
        default:
          const report = await reportGeneratorService.generateFullReport(telegramId, parseInt(days as string, 10));
          content = report.rawText;
          contentType = 'text/plain';
          filename = `life-os-report-${new Date().toISOString().split('T')[0]}.txt`;
          break;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      logger.error('Export report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const analyticsController = new AnalyticsController();
export default analyticsController;
