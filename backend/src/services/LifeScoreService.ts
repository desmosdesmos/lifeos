import { prisma } from '@/config/database';
import { LifeScoreBreakdown, SphereStatus } from '@/types';

/**
 * Сервис для расчёта LifeScore - общего показателя качества жизни
 * 
 * Формула:
 * LifeScore = Σ(sphereScore * sphereWeight) / Σ(weights)
 * 
 * Где sphereScore нормализуется от 0 до 100 для каждой сферы
 */
export class LifeScoreService {
  // Конфигурация нормализации для каждой сферы
  private sphereConfigs = {
    sleep: { min: 0, max: 10, target: 8 }, // часы
    water: { min: 0, max: 5000, target: 2500 }, // мл
    nutrition: { min: 0, max: 4000, target: 2200 }, // калории
    fitness: { min: 0, max: 180, target: 45 }, // минуты в день
    work: { min: 0, max: 14, target: 8 }, // часы
    finance: { min: 0, max: 100000, target: 50000 }, // доход (условно)
    mood: { min: 1, max: 10, target: 8 }, // оценка 1-10
    selfDevelopment: { min: 0, max: 180, target: 60 }, // минуты
    personalLife: { min: 1, max: 10, target: 8 }, // оценка 1-10
  };

  /**
   * Расчёт LifeScore за период
   */
  async calculateLifeScore(
    telegramId: bigint,
    startDate: Date,
    endDate: Date
  ): Promise<LifeScoreBreakdown> {
    // Получаем веса сфер пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: { sphereWeights: true },
    });

    const weights = user?.sphereWeights || {
      sleep: 15,
      water: 10,
      nutrition: 10,
      fitness: 15,
      work: 15,
      finance: 15,
      mood: 10,
      selfDevelopment: 5,
      personalLife: 5,
    };

    // Получаем метрики за период
    const metrics = await prisma.dailyMetric.findMany({
      where: {
        userId: user?.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (metrics.length === 0) {
      return this.getEmptyLifeScore(weights);
    }

    // Рассчитываем средние значения по сферам
    const sphereScores = this.calculateSphereScores(metrics);

    // Рассчитываем взвешенный LifeScore
    const spheres: Record<string, { score: number; weight: number; weightedScore: number }> = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    const sphereKeys = Object.keys(this.sphereConfigs) as Array<keyof typeof this.sphereConfigs>;

    for (const key of sphereKeys) {
      const weight = weights[key] || 10;
      const score = sphereScores[key] || 0;
      const weightedScore = (score * weight) / 100;

      spheres[key] = {
        score: Math.round(score * 10) / 10,
        weight,
        weightedScore: Math.round(weightedScore * 10) / 10,
      };

      totalWeightedScore += weightedScore;
      totalWeight += weight;
    }

    // Нормализуем к шкале 0-100
    const normalizedScore = totalWeight > 0 
      ? (totalWeightedScore / totalWeight) * 100 
      : 0;

    return {
      total: Math.round(normalizedScore * 10) / 10,
      spheres,
    };
  }

  /**
   * Расчёт scores по каждой сфере
   */
  private calculateSphereScores(metrics: any[]): Record<string, number> {
    const configs = this.sphereConfigs;

    // Агрегируем данные
    const aggregates = {
      sleep: this.avg(metrics, 'sleepHours'),
      water: this.avg(metrics, 'waterMl'),
      nutrition: this.avg(metrics, 'calories'),
      fitness: this.avg(metrics, 'workoutMinutes'),
      work: this.avg(metrics, 'workHours'),
      finance: this.avg(metrics, 'income'),
      mood: this.avg(metrics, 'mood'),
      selfDevelopment: this.avg(metrics, 'selfDevMinutes'),
      personalLife: this.avg(metrics, 'personalLifeScore'),
    };

    // Нормализуем каждое значение к шкале 0-100
    return {
      sleep: this.normalizeScore(aggregates.sleep, configs.sleep),
      water: this.normalizeScore(aggregates.water, configs.water),
      nutrition: this.normalizeScore(aggregates.nutrition, configs.nutrition),
      fitness: this.normalizeScore(aggregates.fitness, configs.fitness),
      work: this.normalizeScore(aggregates.work, configs.work, true), // work имеет оптимум
      finance: aggregates.finance ? Math.min(100, (aggregates.finance / configs.finance.target) * 100) : 0,
      mood: aggregates.mood ? ((aggregates.mood - 1) / 9) * 100 : 0,
      selfDevelopment: this.normalizeScore(aggregates.selfDevelopment, configs.selfDevelopment),
      personalLife: aggregates.personalLife ? ((aggregates.personalLife - 1) / 9) * 100 : 0,
    };
  }

  /**
   * Нормализация значения к шкале 0-100
   * @param value - текущее значение
   * @param config - конфигурация сферы
   * @param hasOptimum - true если есть оптимальное значение (не просто "чем больше тем лучше")
   */
  private normalizeScore(
    value: number | null,
    config: { min: number; max: number; target: number },
    hasOptimum: boolean = false
  ): number {
    if (value === null || value === undefined) return 0;

    if (hasOptimum) {
      // Для сфер с оптимумом (работа) - чем ближе к target, тем лучше
      const deviation = Math.abs(value - config.target);
      const maxDeviation = Math.max(config.target - config.min, config.max - config.target);
      return Math.max(0, (1 - deviation / maxDeviation) * 100);
    }

    // Для сфер "чем больше тем лучше" (но с потолком)
    return Math.min(100, ((value - config.min) / (config.target - config.min)) * 100);
  }

  /**
   * Среднее значение поля в массиве
   */
  private avg(arr: any[], field: string): number | null {
    const values = arr.map((m: any) => m[field]).filter((v: any) => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return values.reduce((a: number, b: number) => a + b, 0) / values.length;
  }

  /**
   * Пустой LifeScore (когда нет данных)
   */
  private getEmptyLifeScore(weights: any): LifeScoreBreakdown {
    const spheres: Record<string, { score: number; weight: number; weightedScore: number }> = {};
    
    Object.keys(this.sphereConfigs).forEach(key => {
      spheres[key] = { score: 0, weight: weights[key] || 10, weightedScore: 0 };
    });

    return { total: 0, spheres };
  }

  /**
   * Определение статуса сферы по значению
   */
  getSphereStatus(value: number, target: number): SphereStatus {
    const percentage = target > 0 ? (value / target) * 100 : 0;
    
    let status: 'critical' | 'warning' | 'good' | 'excellent';
    let color: 'red' | 'yellow' | 'green' | 'blue';

    if (percentage >= 90) {
      status = 'excellent';
      color = 'blue';
    } else if (percentage >= 70) {
      status = 'good';
      color = 'green';
    } else if (percentage >= 40) {
      status = 'warning';
      color = 'yellow';
    } else {
      status = 'critical';
      color = 'red';
    }

    return {
      value: Math.round(value * 10) / 10,
      target,
      percentage: Math.round(percentage),
      status,
      color,
    };
  }

  /**
   * Расчёт LifeScore за сегодня
   */
  async calculateTodayLifeScore(telegramId: bigint): Promise<LifeScoreBreakdown> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.calculateLifeScore(telegramId, today, tomorrow);
  }

  /**
   * Расчёт LifeScore за неделю
   */
  async calculateWeekLifeScore(telegramId: bigint): Promise<LifeScoreBreakdown> {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = воскресенье
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Понедельник
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return this.calculateLifeScore(telegramId, weekStart, weekEnd);
  }
}

export const lifeScoreService = new LifeScoreService();
export default lifeScoreService;
