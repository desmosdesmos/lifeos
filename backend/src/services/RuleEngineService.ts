import { prisma } from '@/config/database';
import { RuleRecommendation, SphereStatus } from '@/types';
import { lifeScoreService } from './LifeScoreService';

/**
 * Rule Engine - система алгоритмических рекомендаций
 * 
 * Анализирует метрики пользователя и выдаёт рекомендации на основе правил.
 * Не использует AI API, работает на детерминированной логике.
 */
export class RuleEngineService {
  // ============================================
  // КОНФИГУРАЦИЯ ПРАВИЛ
  // ============================================
  
  private rules = {
    // === СОН ===
    SLEEP_CRITICAL: {
      id: 'SLEEP_CRITICAL',
      name: 'Критический недосып',
      condition: (metrics: any[]) => {
        const avgSleep = this.avg(metrics, 'sleepHours');
        return avgSleep !== null && avgSleep < 5;
      },
      severity: 'CRITICAL' as const,
      sphere: 'SLEEP' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'sleepHours');
        return `Вы спите в среднем ${avg?.toFixed(1)} часов. Это критически мало!`;
      },
      getSuggestion: () => 'Срочно нормализуйте режим сна. Недосып ведёт к серьёзным проблемам со здоровьем.',
    },
    
    SLEEP_WARNING: {
      id: 'SLEEP_WARNING',
      name: 'Недостаток сна',
      condition: (metrics: any[]) => {
        const avgSleep = this.avg(metrics, 'sleepHours');
        return avgSleep !== null && avgSleep >= 5 && avgSleep < 7;
      },
      severity: 'WARNING' as const,
      sphere: 'SLEEP' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'sleepHours');
        return `Вы спите в среднем ${avg?.toFixed(1)} часов. Рекомендуется 7-8 часов.`;
      },
      getSuggestion: () => 'Попробуйте ложиться на 30-60 минут раньше. Избегайте экранов перед сном.',
    },
    
    SLEEP_EXCELLENT: {
      id: 'SLEEP_EXCELLENT',
      name: 'Отличный сон',
      condition: (metrics: any[]) => {
        const avgSleep = this.avg(metrics, 'sleepHours');
        return avgSleep !== null && avgSleep >= 7 && avgSleep <= 9;
      },
      severity: 'INFO' as const,
      sphere: 'SLEEP' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'sleepHours');
        return `Отлично! Вы спите в среднем ${avg?.toFixed(1)} часов.`;
      },
      getSuggestion: () => 'Продолжайте в том же духе! Качественный сон — основа продуктивности.',
    },
    
    // === ВОДА ===
    WATER_CRITICAL: {
      id: 'WATER_CRITICAL',
      name: 'Обезвоживание',
      condition: (metrics: any[]) => {
        const avgWater = this.avg(metrics, 'waterMl');
        return avgWater !== null && avgWater < 1000;
      },
      severity: 'CRITICAL' as const,
      sphere: 'WATER' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'waterMl');
        return `Вы пьёте всего ${avg?.toFixed(0)} мл воды в день. Это опасно мало!`;
      },
      getSuggestion: () => 'Начните пить воду сразу после пробуждения. Поставьте бутылку воды на рабочий стол.',
    },
    
    WATER_WARNING: {
      id: 'WATER_WARNING',
      name: 'Недостаток воды',
      condition: (metrics: any[]) => {
        const avgWater = this.avg(metrics, 'waterMl');
        return avgWater !== null && avgWater >= 1000 && avgWater < 2000;
      },
      severity: 'WARNING' as const,
      sphere: 'WATER' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'waterMl');
        return `Вы пьёте ${avg?.toFixed(0)} мл воды. Норма — 2000+ мл.`;
      },
      getSuggestion: () => 'Увеличьте потребление воды. Пейте стакан воды перед каждым приёмом пищи.',
    },
    
    WATER_EXCELLENT: {
      id: 'WATER_EXCELLENT',
      name: 'Отличный водный баланс',
      condition: (metrics: any[]) => {
        const avgWater = this.avg(metrics, 'waterMl');
        return avgWater !== null && avgWater >= 2000;
      },
      severity: 'INFO' as const,
      sphere: 'WATER' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'waterMl');
        return `Превосходно! Вы пьёте ${avg?.toFixed(0)} мл воды в день.`;
      },
      getSuggestion: () => 'Поддерживайте отличный водный баланс!',
    },
    
    // === ФИТНЕС ===
    FITNESS_NONE: {
      id: 'FITNESS_NONE',
      name: 'Отсутствие активности',
      condition: (metrics: any[]) => {
        const totalMinutes = this.sum(metrics, 'workoutMinutes');
        return totalMinutes === 0;
      },
      severity: 'WARNING' as const,
      sphere: 'FITNESS' as const,
      getMessage: () => 'На этой неделе не было ни одной тренировки.',
      getSuggestion: () => 'Начните с 15-минутной прогулки или лёгкой растяжки. Главное — начать!',
    },
    
    FITNESS_LOW: {
      id: 'FITNESS_LOW',
      name: 'Низкая активность',
      condition: (metrics: any[]) => {
        const totalMinutes = this.sum(metrics, 'workoutMinutes');
        return totalMinutes > 0 && totalMinutes < 90;
      },
      severity: 'WARNING' as const,
      sphere: 'FITNESS' as const,
      getMessage: (metrics: any[]) => {
        const total = this.sum(metrics, 'workoutMinutes');
        return `На этой неделе вы потренировались всего ${total} минут. Рекомендуется 150+ минут.`;
      },
      getSuggestion: () => 'Добавьте ещё 2-3 тренировки по 30 минут в неделю.',
    },
    
    FITNESS_GOOD: {
      id: 'FITNESS_GOOD',
      name: 'Хорошая активность',
      condition: (metrics: any[]) => {
        const totalMinutes = this.sum(metrics, 'workoutMinutes');
        return totalMinutes >= 90 && totalMinutes < 150;
      },
      severity: 'INFO' as const,
      sphere: 'FITNESS' as const,
      getMessage: (metrics: any[]) => {
        const total = this.sum(metrics, 'workoutMinutes');
        return `Хорошо! ${total} минут активности на этой неделе.`;
      },
      getSuggestion: () => 'Отличный результат! Попробуйте добавить ещё одну короткую тренировку.',
    },
    
    FITNESS_EXCELLENT: {
      id: 'FITNESS_EXCELLENT',
      name: 'Отличная форма',
      condition: (metrics: any[]) => {
        const totalMinutes = this.sum(metrics, 'workoutMinutes');
        return totalMinutes >= 150;
      },
      severity: 'INFO' as const,
      sphere: 'FITNESS' as const,
      getMessage: (metrics: any[]) => {
        const total = this.sum(metrics, 'workoutMinutes');
        return `Великолепно! ${total} минут активности — вы в отличной форме!`;
      },
      getSuggestion: () => 'Так держать! Не забывайте про дни восстановления.',
    },
    
    // === РАБОТА ===
    WORK_OVERWORK: {
      id: 'WORK_OVERWORK',
      name: 'Риск выгорания',
      condition: (metrics: any[]) => {
        const avgWork = this.avg(metrics, 'workHours');
        return avgWork !== null && avgWork > 10;
      },
      severity: 'CRITICAL' as const,
      sphere: 'WORK' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'workHours');
        return `Вы работаете в среднем ${avg?.toFixed(1)} часов в день. Высокий риск выгорания!`;
      },
      getSuggestion: () => 'Срочно сократите рабочее время. Делегируйте задачи. Отдых — это инвестиция в продуктивность.',
    },
    
    WORK_WARNING: {
      id: 'WORK_WARNING',
      name: 'Переработка',
      condition: (metrics: any[]) => {
        const avgWork = this.avg(metrics, 'workHours');
        return avgWork !== null && avgWork > 8 && avgWork <= 10;
      },
      severity: 'WARNING' as const,
      sphere: 'WORK' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'workHours');
        return `Вы работаете в среднем ${avg?.toFixed(1)} часов в день. Это выше нормы.`;
      },
      getSuggestion: () => 'Попробуйте оптимизировать задачи. Используйте технику Pomodoro.',
    },
    
    WORK_BALANCED: {
      id: 'WORK_BALANCED',
      name: 'Баланс работы',
      condition: (metrics: any[]) => {
        const avgWork = this.avg(metrics, 'workHours');
        return avgWork !== null && avgWork >= 6 && avgWork <= 8;
      },
      severity: 'INFO' as const,
      sphere: 'WORK' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'workHours');
        return `Хороший баланс! Вы работаете в среднем ${avg?.toFixed(1)} часов в день.`;
      },
      getSuggestion: () => 'Продолжайте поддерживать здоровый баланс работы и отдыха.',
    },
    
    // === ФИНАНСЫ ===
    FINANCE_NEGATIVE: {
      id: 'FINANCE_NEGATIVE',
      name: 'Отрицательный баланс',
      condition: (metrics: any[]) => {
        const totalIncome = this.sum(metrics, 'income');
        const totalExpenses = this.sum(metrics, 'expenses');
        return totalIncome > 0 && totalExpenses > totalIncome;
      },
      severity: 'CRITICAL' as const,
      sphere: 'FINANCE' as const,
      getMessage: (metrics: any[]) => {
        const income = this.sum(metrics, 'income');
        const expenses = this.sum(metrics, 'expenses');
        return `Расходы (${expenses.toFixed(0)}) превышают доходы (${income.toFixed(0)}).`;
      },
      getSuggestion: () => 'Срочно пересмотрите бюджет. Сократите необязательные расходы.',
    },
    
    FINANCE_LOW_INCOME: {
      id: 'FINANCE_LOW_INCOME',
      name: 'Низкий доход',
      condition: (metrics: any[]) => {
        const totalIncome = this.sum(metrics, 'income');
        return totalIncome === 0;
      },
      severity: 'WARNING' as const,
      sphere: 'FINANCE' as const,
      getMessage: () => 'За этот период не зафиксировано доходов.',
      getSuggestion: () => 'Подумайте о дополнительных источниках дохода или развитии навыков.',
    },
    
    FINANCE_POSITIVE: {
      id: 'FINANCE_POSITIVE',
      name: 'Положительный баланс',
      condition: (metrics: any[]) => {
        const totalIncome = this.sum(metrics, 'income');
        const totalExpenses = this.sum(metrics, 'expenses');
        return totalIncome > 0 && totalExpenses <= totalIncome * 0.8;
      },
      severity: 'INFO' as const,
      sphere: 'FINANCE' as const,
      getMessage: (metrics: any[]) => {
        const income = this.sum(metrics, 'income');
        const expenses = this.sum(metrics, 'expenses');
        const saved = income - expenses;
        return `Отлично! Вы откладываете ${(saved / income * 100).toFixed(0)}% дохода (${saved.toFixed(0)}).`;
      },
      getSuggestion: () => 'Рассмотрите возможность инвестиций или создания финансовой подушки.',
    },
    
    // === НАСТРОЕНИЕ ===
    MOOD_LOW: {
      id: 'MOOD_LOW',
      name: 'Низкое настроение',
      condition: (metrics: any[]) => {
        const avgMood = this.avg(metrics, 'mood');
        return avgMood !== null && avgMood < 5;
      },
      severity: 'WARNING' as const,
      sphere: 'MOOD' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'mood');
        return `Ваше среднее настроение — ${avg?.toFixed(1)}/10. Это ниже нормы.`;
      },
      getSuggestion: () => 'Обратите внимание на сферы, которые могут влиять на настроение: сон, спорт, общение.',
    },
    
    MOOD_GOOD: {
      id: 'MOOD_GOOD',
      name: 'Хорошее настроение',
      condition: (metrics: any[]) => {
        const avgMood = this.avg(metrics, 'mood');
        return avgMood !== null && avgMood >= 5 && avgMood < 8;
      },
      severity: 'INFO' as const,
      sphere: 'MOOD' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'mood');
        return `Ваше настроение в норме — ${avg?.toFixed(1)}/10.`;
      },
      getSuggestion: () => 'Продолжайте заботиться о ментальном здоровье.',
    },
    
    MOOD_EXCELLENT: {
      id: 'MOOD_EXCELLENT',
      name: 'Отличное настроение',
      condition: (metrics: any[]) => {
        const avgMood = this.avg(metrics, 'mood');
        return avgMood !== null && avgMood >= 8;
      },
      severity: 'INFO' as const,
      sphere: 'MOOD' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'mood');
        return `Превосходное настроение — ${avg?.toFixed(1)}/10!`;
      },
      getSuggestion: () => 'Делитесь позитивом с окружающими!',
    },
    
    // === САМОРАЗВИТИЕ ===
    SELF_DEV_NONE: {
      id: 'SELF_DEV_NONE',
      name: 'Нет саморазвития',
      condition: (metrics: any[]) => {
        const avgMinutes = this.avg(metrics, 'selfDevMinutes');
        return avgMinutes === 0 || avgMinutes === null;
      },
      severity: 'WARNING' as const,
      sphere: 'SELF_DEVELOPMENT' as const,
      getMessage: () => 'Вы не уделяете время саморазвитию.',
      getSuggestion: () => 'Начните с 15 минут в день: чтение, курсы, подкасты.',
    },
    
    SELF_DEV_GOOD: {
      id: 'SELF_DEV_GOOD',
      name: 'Хорошее саморазвитие',
      condition: (metrics: any[]) => {
        const avgMinutes = this.avg(metrics, 'selfDevMinutes');
        return avgMinutes !== null && avgMinutes >= 30;
      },
      severity: 'INFO' as const,
      sphere: 'SELF_DEVELOPMENT' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'selfDevMinutes');
        return `Отлично! Вы уделяете саморазвитию ${avg?.toFixed(0)} минут в день.`;
      },
      getSuggestion: () => 'Продолжайте развиваться! Рассмотрите возможность углубления знаний.',
    },
    
    // === ЛИЧНАЯ ЖИЗНЬ ===
    PERSONAL_LOW: {
      id: 'PERSONAL_LOW',
      name: 'Низкая оценка личной жизни',
      condition: (metrics: any[]) => {
        const avgScore = this.avg(metrics, 'personalLifeScore');
        return avgScore !== null && avgScore < 6;
      },
      severity: 'WARNING' as const,
      sphere: 'PERSONAL_LIFE' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'personalLifeScore');
        return `Оценка личной жизни — ${avg?.toFixed(1)}/10. Есть куда расти.`;
      },
      getSuggestion: () => 'Уделяйте больше времени близким и качественному общению.',
    },
    
    PERSONAL_GOOD: {
      id: 'PERSONAL_GOOD',
      name: 'Хорошая личная жизнь',
      condition: (metrics: any[]) => {
        const avgScore = this.avg(metrics, 'personalLifeScore');
        return avgScore !== null && avgScore >= 6;
      },
      severity: 'INFO' as const,
      sphere: 'PERSONAL_LIFE' as const,
      getMessage: (metrics: any[]) => {
        const avg = this.avg(metrics, 'personalLifeScore');
        return `Хорошая оценка личной жизни — ${avg?.toFixed(1)}/10.`;
      },
      getSuggestion: () => 'Поддерживайте баланс между работой и личной жизнью.',
    },
  };

  /**
   * Анализ метрик и генерация рекомендаций
   */
  async analyze(telegramId: bigint, days: number = 7): Promise<{
    recommendations: RuleRecommendation[];
    lifeScore: number;
    sphereStatuses: Record<string, SphereStatus>;
  }> {
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Получаем метрики за период
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

    // Получаем LifeScore
    const lifeScoreBreakdown = await lifeScoreService.calculateLifeScore(
      telegramId,
      startDate,
      endDate
    );

    // Применяем правила
    const recommendations: RuleRecommendation[] = [];
    const triggeredRules = new Set<string>();

    for (const ruleKey of Object.keys(this.rules) as Array<keyof typeof this.rules>) {
      const rule = this.rules[ruleKey];
      
      // Проверяем, не сработало ли уже правило из этой сферы с более высоким приоритетом
      if (triggeredRules.has(rule.sphere)) {
        continue;
      }

      try {
        if (rule.condition(metrics)) {
          recommendations.push({
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            message: rule.getMessage(metrics),
            sphere: rule.sphere,
            suggestion: rule.getSuggestion(),
          });
          
          // Помечаем сферу как обработанную (чтобы не дублировать рекомендации)
          // Исключение — INFO правила, они могут дополнять
          if (rule.severity !== 'INFO') {
            triggeredRules.add(rule.sphere);
          }
        }
      } catch (error) {
        // Игнорируем ошибки в отдельных правилах
        console.error(`Error in rule ${rule.id}:`, error);
      }
    }

    // Сортируем: CRITICAL → WARNING → INFO
    const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    recommendations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Получаем статусы сфер
    const sphereStatuses = this.getSphereStatuses(metrics);

    return {
      recommendations,
      lifeScore: lifeScoreBreakdown.total,
      sphereStatuses,
    };
  }

  /**
   * Получение статусов по сферам
   */
  private getSphereStatuses(metrics: any[]): Record<string, SphereStatus> {
    const targets = {
      sleep: 8,
      water: 2500,
      nutrition: 2200,
      fitness: 45,
      work: 8,
      finance: 50000,
      mood: 8,
      selfDevelopment: 60,
      personalLife: 8,
    };

    const values = {
      sleep: this.avg(metrics, 'sleepHours') || 0,
      water: this.avg(metrics, 'waterMl') || 0,
      nutrition: this.avg(metrics, 'calories') || 0,
      fitness: this.avg(metrics, 'workoutMinutes') || 0,
      work: this.avg(metrics, 'workHours') || 0,
      finance: this.sum(metrics, 'income') || 0,
      mood: (this.avg(metrics, 'mood') || 1),
      selfDevelopment: this.avg(metrics, 'selfDevMinutes') || 0,
      personalLife: (this.avg(metrics, 'personalLifeScore') || 1),
    };

    return {
      SLEEP: lifeScoreService.getSphereStatus(values.sleep, targets.sleep),
      WATER: lifeScoreService.getSphereStatus(values.water, targets.water),
      NUTRITION: lifeScoreService.getSphereStatus(values.nutrition, targets.nutrition),
      FITNESS: lifeScoreService.getSphereStatus(values.fitness, targets.fitness),
      WORK: lifeScoreService.getSphereStatus(values.work, targets.work),
      FINANCE: lifeScoreService.getSphereStatus(values.finance / 7, targets.finance / 7),
      MOOD: lifeScoreService.getSphereStatus(values.mood, targets.mood),
      SELF_DEVELOPMENT: lifeScoreService.getSphereStatus(values.selfDevelopment, targets.selfDevelopment),
      PERSONAL_LIFE: lifeScoreService.getSphereStatus(values.personalLife, targets.personalLife),
    };
  }

  // ============================================
  // УТИЛИТЫ
  // ============================================

  private avg(arr: any[], field: string): number | null {
    const values = arr.map(m => m[field]).filter(v => v !== null && v !== undefined && v > 0);
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private sum(arr: any[], field: string): number {
    const values = arr.map(m => m[field] || 0);
    return values.reduce((a, b) => a + b, 0);
  }

  /**
   * Получить все доступные правила (для админки/документации)
   */
  getAllRules() {
    return Object.values(this.rules).map(rule => ({
      id: rule.id,
      name: rule.name,
      severity: rule.severity,
      sphere: rule.sphere,
    }));
  }
}

export const ruleEngineService = new RuleEngineService();
export default ruleEngineService;
