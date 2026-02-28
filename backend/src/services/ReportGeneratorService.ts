import { prisma } from '@/config/database';
import { ExportReport, SphereReport, RuleRecommendation } from '@/types';
import { ruleEngineService } from './RuleEngineService';
import { lifeScoreService } from './LifeScoreService';

/**
 * Report Generator Service
 * 
 * Генерирует структурированные отчёты для экспорта в AI-системы.
 * Формат оптимизирован для анализа в ChatGPT, Qwen и других LLM.
 */
export class ReportGeneratorService {
  /**
   * Генерация полного отчёта для анализа в AI
   */
  async generateFullReport(
    telegramId: bigint,
    days: number = 30
  ): Promise<ExportReport> {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: { sphereWeights: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Получаем метрики
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

    // Получаем цели
    const goals = await prisma.goal.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    // Получаем задачи
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
      },
      include: { checklist: true },
    });

    // Получаем рекомендации Rule Engine
    const ruleAnalysis = await ruleEngineService.analyze(telegramId, days);

    // Получаем LifeScore
    const lifeScoreBreakdown = await lifeScoreService.calculateLifeScore(
      telegramId,
      startDate,
      endDate
    );

    // Генерируем отчёты по сферам
    const sphereReports = this.generateSphereReports(metrics, goals);

    // Формируем итоговый отчёт
    const report: ExportReport = {
      generatedAt: new Date().toISOString(),
      period: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      },
      user: {
        telegramId: telegramId.toString(),
      },
      summary: {
        lifeScore: lifeScoreBreakdown.total,
        totalDays: metrics.length,
        completedGoals: goals.filter(g => g.status === 'COMPLETED').length,
        completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
      },
      spheres: sphereReports,
      recommendations: ruleAnalysis.recommendations,
      rawText: this.generateRawTextReport({
        user,
        period: { from: startDate, to: endDate },
        metrics,
        goals,
        tasks,
        lifeScore: lifeScoreBreakdown,
        recommendations: ruleAnalysis.recommendations,
        sphereReports,
      }),
    };

    return report;
  }

  /**
   * Генерация отчёта по одной сфере
   */
  async generateSphereReport(
    telegramId: bigint,
    sphere: string,
    days: number = 30
  ): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new Error('User not found');
    }

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
      orderBy: { date: 'asc' },
    });

    const sphereDataMap: Record<string, { field: string; unit: string }> = {
      SLEEP: { field: 'sleepHours', unit: 'часов' },
      WATER: { field: 'waterMl', unit: 'мл' },
      NUTRITION: { field: 'calories', unit: 'ккал' },
      FITNESS: { field: 'workoutMinutes', unit: 'минут' },
      WORK: { field: 'workHours', unit: 'часов' },
      FINANCE: { field: 'income', unit: 'руб' },
      MOOD: { field: 'mood', unit: 'баллов' },
      SELF_DEVELOPMENT: { field: 'selfDevMinutes', unit: 'минут' },
      PERSONAL_LIFE: { field: 'personalLifeScore', unit: 'баллов' },
    };

    const sphereConfig = sphereDataMap[sphere];
    if (!sphereConfig) {
      throw new Error(`Unknown sphere: ${sphere}`);
    }

    return this.generateSphereTextReport(
      sphere,
      sphereConfig.field,
      sphereConfig.unit,
      metrics,
      days
    );
  }

  /**
   * Генерация текстового отчёта (для копирования в AI)
   */
  private generateRawTextReport(data: {
    user: any;
    period: { from: Date; to: Date };
    metrics: any[];
    goals: any[];
    tasks: any[];
    lifeScore: any;
    recommendations: RuleRecommendation[];
    sphereReports: Record<string, SphereReport>;
  }): string {
    const { user, period, metrics, goals, tasks, lifeScore, recommendations, sphereReports } = data;

    const lines: string[] = [];

    // Заголовок
    lines.push('═'.repeat(60));
    lines.push('📊 LIFE OS — ПОЛНЫЙ ОТЧЁТ ДЛЯ АНАЛИЗА В AI');
    lines.push('═'.repeat(60));
    lines.push('');
    lines.push(`🆔 User ID: ${user.telegramId}`);
    lines.push(`📅 Период: ${period.from.toISOString().split('T')[0]} — ${period.to.toISOString().split('T')[0]}`);
    lines.push(`📈 LifeScore: ${lifeScore.total}/100`);
    lines.push('');

    // Секция 1: Сферы жизни
    lines.push('━'.repeat(60));
    lines.push('🎯 СФЕРЫ ЖИЗНИ');
    lines.push('━'.repeat(60));
    lines.push('');

    const sphereLabels: Record<string, string> = {
      sleep: '😴 Сон',
      water: '💧 Вода',
      nutrition: '🍎 Питание',
      fitness: '💪 Фитнес',
      work: '💼 Работа',
      finance: '💰 Финансы',
      mood: '😊 Настроение',
      selfDevelopment: '📚 Саморазвитие',
      personalLife: '❤️ Личная жизнь',
    };

    for (const [key, report] of Object.entries(sphereReports)) {
      const label = sphereLabels[key] || key;
      lines.push(`${label}: ${report.average.toFixed(1)} (тренд: ${this.getTrendEmoji(report.trend)} ${report.trend})`);
    }
    lines.push('');

    // Секция 2: Рекомендации Rule Engine
    lines.push('━'.repeat(60));
    lines.push('🤖 РЕКОМЕНДАЦИИ СИСТЕМЫ');
    lines.push('━'.repeat(60));
    lines.push('');

    if (recommendations.length === 0) {
      lines.push('✅ Нет критических рекомендаций. Всё в порядке!');
    } else {
      for (const rec of recommendations) {
        const severityIcon = rec.severity === 'CRITICAL' ? '🔴' : rec.severity === 'WARNING' ? '🟡' : '🟢';
        lines.push(`${severityIcon} [${rec.severity}] ${rec.ruleName}`);
        lines.push(`   ${rec.message}`);
        lines.push(`   💡 ${rec.suggestion}`);
        lines.push('');
      }
    }

    // Секция 3: Цели
    lines.push('━'.repeat(60));
    lines.push('🎯 АКТИВНЫЕ ЦЕЛИ');
    lines.push('━'.repeat(60));
    lines.push('');

    const activeGoals = goals.filter(g => g.status === 'ACTIVE');
    if (activeGoals.length === 0) {
      lines.push('Нет активных целей');
    } else {
      for (const goal of activeGoals) {
        const progress = goal.progress || 0;
        const progressBar = this.createProgressBar(progress);
        lines.push(`• ${goal.title}`);
        lines.push(`  Сфера: ${goal.sphere} | Прогресс: ${progress.toFixed(1)}% ${progressBar}`);
        lines.push(`  Цель: ${goal.currentValue}/${goal.targetValue} ${goal.unit}`);
        lines.push(`  Дедлайн: ${new Date(goal.endDate).toISOString().split('T')[0]}`);
        lines.push('');
      }
    }

    // Секция 4: Задачи
    lines.push('━'.repeat(60));
    lines.push('✅ ЗАДАЧИ');
    lines.push('━'.repeat(60));
    lines.push('');

    const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

    lines.push(`Всего задач: ${tasks.length} | Выполнено: ${completedTasks.length} | В ожидании: ${pendingTasks.length}`);
    lines.push('');

    if (pendingTasks.length > 0) {
      lines.push('Актуальные задачи:');
      for (const task of pendingTasks.slice(0, 10)) {
        const priorityIcon = task.priority === 'CRITICAL' ? '🔴' : task.priority === 'HIGH' ? '🟠' : task.priority === 'MEDIUM' ? '🟡' : '🟢';
        const dueDate = task.dueDate ? ` (до: ${new Date(task.dueDate).toISOString().split('T')[0]})` : '';
        lines.push(`  ${priorityIcon} [${task.category}] ${task.title}${dueDate}`);
      }
      lines.push('');
    }

    // Секция 5: Детальные данные по метрикам
    lines.push('━'.repeat(60));
    lines.push('📈 ДЕТАЛЬНЫЕ ДАННЫЕ (последние 7 дней)');
    lines.push('━'.repeat(60));
    lines.push('');

    const last7Days = metrics.slice(-7);
    for (const metric of last7Days) {
      const date = new Date(metric.date).toISOString().split('T')[0];
      lines.push(`📅 ${date}:`);
      if (metric.sleepHours) lines.push(`   Сон: ${metric.sleepHours}ч`);
      if (metric.waterMl) lines.push(`   Вода: ${metric.waterMl}мл`);
      if (metric.calories) lines.push(`   Калории: ${metric.calories}`);
      if (metric.workoutMinutes) lines.push(`   Спорт: ${metric.workoutMinutes}мин`);
      if (metric.workHours) lines.push(`   Работа: ${metric.workHours}ч`);
      if (metric.mood) lines.push(`   Настроение: ${metric.mood}/10`);
      if (metric.selfDevMinutes) lines.push(`   Саморазвитие: ${metric.selfDevMinutes}мин`);
      lines.push('');
    }

    // Завершение
    lines.push('═'.repeat(60));
    lines.push('КОНЕЦ ОТЧЁТА');
    lines.push('═'.repeat(60));
    lines.push('');
    lines.push('💡 Совет: Скопируйте этот отчёт и отправьте в ChatGPT/Qwen для получения персонализированных рекомендаций.');

    return lines.join('\n');
  }

  /**
   * Генерация отчёта по одной сфере (текст)
   */
  private generateSphereTextReport(
    sphere: string,
    field: string,
    unit: string,
    metrics: any[],
    days: number
  ): string {
    const lines: string[] = [];

    const sphereLabels: Record<string, string> = {
      SLEEP: '😴 Сон',
      WATER: '💧 Вода',
      NUTRITION: '🍎 Питание',
      FITNESS: '💪 Фитнес',
      WORK: '💼 Работа',
      FINANCE: '💰 Финансы',
      MOOD: '😊 Настроение',
      SELF_DEVELOPMENT: '📚 Саморазвитие',
      PERSONAL_LIFE: '❤️ Личная жизнь',
    };

    lines.push('═'.repeat(50));
    lines.push(`📊 ОТЧЁТ ПО СФЕРЕ: ${sphereLabels[sphere] || sphere}`);
    lines.push('═'.repeat(50));
    lines.push('');

    // Агрегация данных
    const values = metrics
      .map(m => m[field])
      .filter(v => v !== null && v !== undefined && v > 0);

    if (values.length === 0) {
      lines.push('⚠️ Нет данных по этой сфере за выбранный период.');
      lines.push('');
      lines.push('💡 Начните отслеживать эту сферу для получения аналитики.');
      return lines.join('\n');
    }

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const total = values.reduce((a, b) => a + b, 0);

    lines.push(`📅 Период: ${days} дн.`);
    lines.push(`📊 Записей: ${values.length}`);
    lines.push('');
    lines.push('📈 СТАТИСТИКА:');
    lines.push(`   Среднее: ${avg.toFixed(1)} ${unit}`);
    lines.push(`   Минимум: ${min.toFixed(1)} ${unit}`);
    lines.push(`   Максимум: ${max.toFixed(1)} ${unit}`);
    lines.push(`   Сумма: ${total.toFixed(1)} ${unit}`);
    lines.push('');

    // Динамика по дням
    lines.push('📅 ДИНАМИКА ПО ДНЯМ:');
    lines.push('');

    const last14Days = metrics.slice(-14);
    for (const metric of last14Days) {
      const value = metric[field];
      if (value !== null && value !== undefined) {
        const date = new Date(metric.date).toISOString().split('T')[0];
        const bar = '█'.repeat(Math.min(20, Math.round((value / max) * 20)));
        lines.push(`   ${date}: ${bar} ${value.toFixed(1)}`);
      }
    }

    lines.push('');
    lines.push('═'.repeat(50));
    lines.push('💡 Скопируйте этот отчёт в AI для получения рекомендаций.');
    lines.push('═'.repeat(50));

    return lines.join('\n');
  }

  /**
   * Генерация отчётов по сферам
   */
  private generateSphereReports(metrics: any[], goals: any[]): Record<string, SphereReport> {
    const spheres = [
      { key: 'sleep', field: 'sleepHours' },
      { key: 'water', field: 'waterMl' },
      { key: 'nutrition', field: 'calories' },
      { key: 'fitness', field: 'workoutMinutes' },
      { key: 'work', field: 'workHours' },
      { key: 'finance', field: 'income' },
      { key: 'mood', field: 'mood' },
      { key: 'selfDevelopment', field: 'selfDevMinutes' },
      { key: 'personalLife', field: 'personalLifeScore' },
    ];

    const reports: Record<string, SphereReport> = {};

    for (const { key, field } of spheres) {
      const values = metrics
        .map((m, i) => ({ value: m[field], date: m.date, index: i }))
        .filter(m => m.value !== null && m.value !== undefined && m.value > 0);

      if (values.length === 0) {
        reports[key] = {
          name: key,
          average: 0,
          trend: 'stable',
          bestDay: '',
          worstDay: '',
          goalProgress: undefined,
        };
        continue;
      }

      const avg = values.reduce((a, b) => a + b.value, 0) / values.length;
      
      // Определяем тренд (сравниваем первую и вторую половину периода)
      const mid = Math.floor(values.length / 2);
      const firstHalf = values.slice(0, mid);
      const secondHalf = values.slice(mid);
      const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b.value, 0) / firstHalf.length : 0;
      const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b.value, 0) / secondHalf.length : 0;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (secondAvg > firstAvg * 1.1) trend = 'up';
      else if (secondAvg < firstAvg * 0.9) trend = 'down';

      // Находим лучший и худший день
      const best = values.reduce((a, b) => a.value > b.value ? a : b);
      const worst = values.reduce((a, b) => a.value < b.value ? a : b);

      // Прогресс цели
      const sphereGoal = goals.find(g => g.sphere.toUpperCase() === key.toUpperCase());
      const goalProgress = sphereGoal ? sphereGoal.progress : undefined;

      reports[key] = {
        name: key,
        average: avg,
        trend,
        bestDay: new Date(best.date).toISOString().split('T')[0],
        worstDay: new Date(worst.date).toISOString().split('T')[0],
        goalProgress,
      };
    }

    return reports;
  }

  /**
   * Эмодзи для тренда
   */
  private getTrendEmoji(trend: string): string {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  }

  /**
   * Прогресс-бар
   */
  private createProgressBar(progress: number): string {
    const filled = Math.round(progress / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Экспорт в JSON (для программного использования)
   */
  async exportToJson(telegramId: bigint, days: number = 30): Promise<string> {
    const report = await this.generateFullReport(telegramId, days);
    return JSON.stringify(report, null, 2);
  }

  /**
   * Экспорт в CSV (для Excel/Google Sheets)
   */
  async exportToCsv(telegramId: bigint, days: number = 30): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new Error('User not found');
    }

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
      orderBy: { date: 'asc' },
    });

    const headers = [
      'date',
      'sleep_hours',
      'water_ml',
      'calories',
      'protein_grams',
      'workout_minutes',
      'workout_type',
      'work_hours',
      'income',
      'expenses',
      'mood',
      'self_dev_minutes',
      'personal_life_score',
      'notes',
    ];

    const rows = metrics.map(m => [
      new Date(m.date).toISOString().split('T')[0],
      m.sleepHours || '',
      m.waterMl || '',
      m.calories || '',
      m.proteinGrams || '',
      m.workoutMinutes || '',
      m.workoutType || '',
      m.workHours || '',
      m.income || '',
      m.expenses || '',
      m.mood || '',
      m.selfDevMinutes || '',
      m.personalLifeScore || '',
      m.notes || '',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const reportGeneratorService = new ReportGeneratorService();
export default reportGeneratorService;
