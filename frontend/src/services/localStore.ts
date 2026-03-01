import {
  DailyMetric,
  Goal,
  GoalInput,
  Task,
  TaskInput,
  DashboardData,
  SphereStatus,
  RuleRecommendation,
} from '@/types';

const STORAGE_KEYS = {
  metrics: 'lifeos_metrics',
  goals: 'lifeos_goals',
  tasks: 'lifeos_tasks',
};

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const todayIso = () => new Date().toISOString().split('T')[0];

const defaultMetric = (date: string): DailyMetric => ({
  id: Number(date.replace(/-/g, '')),
  date,
  sleepHours: 7,
  waterMl: 0,
  calories: 2000,
  workoutMinutes: 0,
  workoutType: '',
  workHours: 8,
  income: 0,
  expenses: 0,
  mood: 5,
  selfDevMinutes: 30,
  personalLifeScore: 7,
  notes: '',
});

const emptyMetric = (date: string): DailyMetric => ({
  id: 0,
  date,
  sleepHours: 0,
  waterMl: 0,
  calories: 0,
  workoutMinutes: 0,
  workoutType: '',
  workHours: 0,
  income: 0,
  expenses: 0,
  mood: 0,
  selfDevMinutes: 0,
  personalLifeScore: 0,
  notes: '',
});

const sphereWeights = {
  sleep: 0.15,
  fitness: 0.15,
  work: 0.15,
  finance: 0.15,
  water: 0.1,
  nutrition: 0.1,
  mood: 0.1,
  selfDevelopment: 0.05,
  personalLife: 0.05,
};

const targets = {
  sleep: 8,
  water: 2500,
  nutrition: 2000,
  fitness: 30,
  work: 8,
  mood: 10,
  selfDevelopment: 30,
  personalLife: 10,
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const scoreFromValue = (value: number, target: number) => {
  if (!target) return 0;
  return clamp((value / target) * 100);
};

const workScore = (hours: number) => {
  if (hours <= 8) return scoreFromValue(hours, 8);
  return clamp(100 - (hours - 8) * 12);
};

const financeScore = (income: number, expenses: number) => {
  const balance = income - expenses;
  if (income === 0 && expenses === 0) return 50;
  if (balance >= 0) return clamp(60 + (balance / 1000) * 40);
  return clamp(60 - (Math.abs(balance) / 1000) * 60);
};

const statusFromScore = (score: number): SphereStatus['status'] => {
  if (score < 40) return 'critical';
  if (score < 60) return 'warning';
  if (score < 80) return 'good';
  return 'excellent';
};

const colorFromStatus = (status: SphereStatus['status']): SphereStatus['color'] => {
  switch (status) {
    case 'critical':
      return 'red';
    case 'warning':
      return 'yellow';
    case 'good':
      return 'green';
    default:
      return 'blue';
  }
};

const computeSphereStatuses = (metric: DailyMetric) => {
  const sleepScore = scoreFromValue(metric.sleepHours || 0, targets.sleep);
  const waterScore = scoreFromValue(metric.waterMl || 0, targets.water);
  const nutritionScore = scoreFromValue(metric.calories || 0, targets.nutrition);
  const fitnessScore = scoreFromValue(metric.workoutMinutes || 0, targets.fitness);
  const workScoreValue = workScore(metric.workHours || 0);
  const financeScoreValue = financeScore(metric.income || 0, metric.expenses || 0);
  const moodScore = scoreFromValue(metric.mood || 0, targets.mood);
  const selfDevScore = scoreFromValue(metric.selfDevMinutes || 0, targets.selfDevelopment);
  const personalScore = scoreFromValue(metric.personalLifeScore || 0, targets.personalLife);

  const scores = {
    sleep: sleepScore,
    water: waterScore,
    nutrition: nutritionScore,
    fitness: fitnessScore,
    work: workScoreValue,
    finance: financeScoreValue,
    mood: moodScore,
    selfDevelopment: selfDevScore,
    personalLife: personalScore,
  };

  const statuses: Record<string, SphereStatus> = {
    sleep: {
      value: metric.sleepHours || 0,
      target: targets.sleep,
      percentage: sleepScore,
      status: statusFromScore(sleepScore),
      color: colorFromStatus(statusFromScore(sleepScore)),
    },
    water: {
      value: metric.waterMl || 0,
      target: targets.water,
      percentage: waterScore,
      status: statusFromScore(waterScore),
      color: colorFromStatus(statusFromScore(waterScore)),
    },
    nutrition: {
      value: metric.calories || 0,
      target: targets.nutrition,
      percentage: nutritionScore,
      status: statusFromScore(nutritionScore),
      color: colorFromStatus(statusFromScore(nutritionScore)),
    },
    fitness: {
      value: metric.workoutMinutes || 0,
      target: targets.fitness,
      percentage: fitnessScore,
      status: statusFromScore(fitnessScore),
      color: colorFromStatus(statusFromScore(fitnessScore)),
    },
    work: {
      value: metric.workHours || 0,
      target: targets.work,
      percentage: workScoreValue,
      status: statusFromScore(workScoreValue),
      color: colorFromStatus(statusFromScore(workScoreValue)),
    },
    finance: {
      value: (metric.income || 0) - (metric.expenses || 0),
      target: 1000,
      percentage: financeScoreValue,
      status: statusFromScore(financeScoreValue),
      color: colorFromStatus(statusFromScore(financeScoreValue)),
    },
    mood: {
      value: metric.mood || 0,
      target: targets.mood,
      percentage: moodScore,
      status: statusFromScore(moodScore),
      color: colorFromStatus(statusFromScore(moodScore)),
    },
    selfDevelopment: {
      value: metric.selfDevMinutes || 0,
      target: targets.selfDevelopment,
      percentage: selfDevScore,
      status: statusFromScore(selfDevScore),
      color: colorFromStatus(statusFromScore(selfDevScore)),
    },
    personalLife: {
      value: metric.personalLifeScore || 0,
      target: targets.personalLife,
      percentage: personalScore,
      status: statusFromScore(personalScore),
      color: colorFromStatus(statusFromScore(personalScore)),
    },
  };

  return { scores, statuses };
};

const computeLifeScore = (scores: Record<string, number>) => {
  const total =
    scores.sleep * sphereWeights.sleep +
    scores.water * sphereWeights.water +
    scores.nutrition * sphereWeights.nutrition +
    scores.fitness * sphereWeights.fitness +
    scores.work * sphereWeights.work +
    scores.finance * sphereWeights.finance +
    scores.mood * sphereWeights.mood +
    scores.selfDevelopment * sphereWeights.selfDevelopment +
    scores.personalLife * sphereWeights.personalLife;

  return Math.round(total);
};

const buildRecommendations = (metric: DailyMetric): RuleRecommendation[] => {
  const recs: RuleRecommendation[] = [];

  if ((metric.sleepHours || 0) < 6) {
    recs.push({
      ruleId: 'sleep_low',
      ruleName: 'Мало сна',
      severity: 'CRITICAL',
      message: 'Вы спали меньше 6 часов.',
      sphere: 'SLEEP',
      suggestion: 'Постарайтесь лечь раньше и выделить 7-9 часов на сон.',
    });
  }
  if ((metric.waterMl || 0) < 1000) {
    recs.push({
      ruleId: 'water_low',
      ruleName: 'Недостаток воды',
      severity: 'CRITICAL',
      message: 'Сегодня мало воды.',
      sphere: 'WATER',
      suggestion: 'Добавьте хотя бы 1-2 стакана воды.',
    });
  }
  if ((metric.workHours || 0) > 10) {
    recs.push({
      ruleId: 'work_high',
      ruleName: 'Переработка',
      severity: 'WARNING',
      message: 'Работы больше 10 часов.',
      sphere: 'WORK',
      suggestion: 'Сделайте короткую прогулку и восстановитесь.',
    });
  }

  return recs;
};

const getAllMetrics = () => read<Record<string, DailyMetric>>(STORAGE_KEYS.metrics, {});
const saveAllMetrics = (data: Record<string, DailyMetric>) => write(STORAGE_KEYS.metrics, data);

const getAllGoals = () => read<Goal[]>(STORAGE_KEYS.goals, []);
const saveAllGoals = (data: Goal[]) => write(STORAGE_KEYS.goals, data);

const getAllTasks = () => read<Task[]>(STORAGE_KEYS.tasks, []);
const saveAllTasks = (data: Task[]) => write(STORAGE_KEYS.tasks, data);

export const localStore = {
  getMetrics: (date: string) => {
    const metrics = getAllMetrics();
    const metric = metrics[date] || defaultMetric(date);
    return { metric };
  },
  upsertMetrics: (data: Partial<DailyMetric> & { date: string }) => {
    const metrics = getAllMetrics();
    const existing = metrics[data.date] || defaultMetric(data.date);
    const merged = { ...existing, ...data };
    metrics[data.date] = merged;
    saveAllMetrics(metrics);
    return { metric: merged };
  },
  updateField: (field: string, value: number) => {
    const date = todayIso();
    const metrics = getAllMetrics();
    const existing = metrics[date] || defaultMetric(date);
    const nextValue = (existing as any)[field] || 0;
    const merged = { ...existing, [field]: nextValue + value };
    metrics[date] = merged;
    saveAllMetrics(metrics);
    return { metric: merged };
  },
  getGoals: () => {
    return { goals: getAllGoals() };
  },
  createGoal: (data: GoalInput) => {
    const goals = getAllGoals();
    const nextId = goals.length ? Math.max(...goals.map(g => g.id)) + 1 : 1;
    const now = new Date().toISOString();
    const goal: Goal = {
      id: nextId,
      userId: 1,
      title: data.title,
      description: data.description,
      sphere: data.sphere,
      targetValue: data.targetValue,
      currentValue: data.currentValue || 0,
      unit: data.unit,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'ACTIVE',
      progress: data.targetValue ? Math.min(100, ((data.currentValue || 0) / data.targetValue) * 100) : 0,
      createdAt: now,
      updatedAt: now,
    };
    goals.push(goal);
    saveAllGoals(goals);
    return { goal };
  },
  updateProgress: (id: number, currentValue: number) => {
    const goals = getAllGoals();
    const updated = goals.map(goal => {
      if (goal.id !== id) return goal;
      const progress = goal.targetValue ? Math.min(100, (currentValue / goal.targetValue) * 100) : 0;
      return {
        ...goal,
        currentValue,
        progress,
        status: progress >= 100 ? 'COMPLETED' : 'ACTIVE',
        updatedAt: new Date().toISOString(),
      };
    });
    saveAllGoals(updated);
    return { goal: updated.find(g => g.id === id) };
  },
  deleteGoal: (id: number) => {
    const goals = getAllGoals().filter(goal => goal.id !== id);
    saveAllGoals(goals);
    return { success: true };
  },
  getTasks: () => {
    return { tasks: getAllTasks() };
  },
  createTask: (data: TaskInput) => {
    const tasks = getAllTasks();
    const nextId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    const now = new Date().toISOString();
    const task: Task = {
      id: nextId,
      userId: 1,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'PENDING',
      checklist: (data.checklist || []).map((item, index) => ({
        id: nextId * 100 + index + 1,
        taskId: nextId,
        text: item.text,
        isCompleted: false,
      })),
      dueDate: data.dueDate,
      completedAt: undefined,
      isRecurring: data.isRecurring || false,
      recurrencePattern: data.recurrencePattern,
      createdAt: now,
      updatedAt: now,
    };
    tasks.push(task);
    saveAllTasks(tasks);
    return { task };
  },
  updateStatus: (id: number, status: string) => {
    const tasks = getAllTasks();
    const updated = tasks.map(task => {
      if (task.id !== id) return task;
      return {
        ...task,
        status: status as Task['status'],
        completedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };
    });
    saveAllTasks(updated);
    return { task: updated.find(t => t.id === id) };
  },
  toggleChecklistItem: (taskId: number, itemId: number) => {
    const tasks = getAllTasks();
    const updated = tasks.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        checklist: task.checklist.map(item =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        ),
        updatedAt: new Date().toISOString(),
      };
    });
    saveAllTasks(updated);
    return { success: true };
  },
  deleteTask: (id: number) => {
    const tasks = getAllTasks().filter(task => task.id !== id);
    saveAllTasks(tasks);
    return { success: true };
  },
  getDashboard: () => {
    const date = todayIso();
    const metrics = getAllMetrics();
    const metric = metrics[date] || defaultMetric(date);
    const { scores, statuses } = computeSphereStatuses(metric);
    const lifeScore = computeLifeScore(scores);

    const goals = getAllGoals();
    const tasks = getAllTasks();

    const wheel = {
      spheres: [
        { name: 'Сон', percentage: scores.sleep },
        { name: 'Вода', percentage: scores.water },
        { name: 'Питание', percentage: scores.nutrition },
        { name: 'Фитнес', percentage: scores.fitness },
        { name: 'Работа', percentage: scores.work },
        { name: 'Финансы', percentage: scores.finance },
        { name: 'Настроение', percentage: scores.mood },
        { name: 'Развитие', percentage: scores.selfDevelopment },
        { name: 'Личное', percentage: scores.personalLife },
      ],
    };

    const sphereBreakdown = {
      sleep: { score: scores.sleep, weight: sphereWeights.sleep, weightedScore: scores.sleep * sphereWeights.sleep },
      water: { score: scores.water, weight: sphereWeights.water, weightedScore: scores.water * sphereWeights.water },
      nutrition: { score: scores.nutrition, weight: sphereWeights.nutrition, weightedScore: scores.nutrition * sphereWeights.nutrition },
      fitness: { score: scores.fitness, weight: sphereWeights.fitness, weightedScore: scores.fitness * sphereWeights.fitness },
      work: { score: scores.work, weight: sphereWeights.work, weightedScore: scores.work * sphereWeights.work },
      finance: { score: scores.finance, weight: sphereWeights.finance, weightedScore: scores.finance * sphereWeights.finance },
      mood: { score: scores.mood, weight: sphereWeights.mood, weightedScore: scores.mood * sphereWeights.mood },
      selfDevelopment: { score: scores.selfDevelopment, weight: sphereWeights.selfDevelopment, weightedScore: scores.selfDevelopment * sphereWeights.selfDevelopment },
      personalLife: { score: scores.personalLife, weight: sphereWeights.personalLife, weightedScore: scores.personalLife * sphereWeights.personalLife },
    };

    const dashboard: DashboardData = {
      date,
      lifeScore,
      sphereBreakdown,
      sphereStatuses: statuses,
      todayMetrics: metric,
      recommendations: buildRecommendations(metric),
      goals: {
        total: goals.filter(g => g.status === 'ACTIVE').length,
        avgProgress: goals.length
          ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
          : 0,
      },
      tasks: {
        pending: tasks.filter(t => t.status !== 'COMPLETED').length,
        critical: tasks.filter(t => t.status !== 'COMPLETED' && t.priority === 'CRITICAL').length,
      },
      wheel,
    };

    return { dashboard };
  },
  getLifeWheel: (days: number) => {
    const metrics = getAllMetrics();
    const entries = Object.values(metrics).sort((a, b) => a.date.localeCompare(b.date)).slice(-days);
    const avgMetric = entries.length
      ? entries.reduce((acc, metric) => ({
        ...acc,
        sleepHours: (acc.sleepHours || 0) + (metric.sleepHours || 0),
        waterMl: (acc.waterMl || 0) + (metric.waterMl || 0),
        calories: (acc.calories || 0) + (metric.calories || 0),
        workoutMinutes: (acc.workoutMinutes || 0) + (metric.workoutMinutes || 0),
        workHours: (acc.workHours || 0) + (metric.workHours || 0),
        income: (acc.income || 0) + (metric.income || 0),
        expenses: (acc.expenses || 0) + (metric.expenses || 0),
        mood: (acc.mood || 0) + (metric.mood || 0),
        selfDevMinutes: (acc.selfDevMinutes || 0) + (metric.selfDevMinutes || 0),
        personalLifeScore: (acc.personalLifeScore || 0) + (metric.personalLifeScore || 0),
      } as DailyMetric), emptyMetric('avg'))
      : defaultMetric(todayIso());

    const divisor = Math.max(1, entries.length);
    const normalized: DailyMetric = {
      ...avgMetric,
      sleepHours: (avgMetric.sleepHours || 0) / divisor,
      waterMl: (avgMetric.waterMl || 0) / divisor,
      calories: (avgMetric.calories || 0) / divisor,
      workoutMinutes: (avgMetric.workoutMinutes || 0) / divisor,
      workHours: (avgMetric.workHours || 0) / divisor,
      income: (avgMetric.income || 0) / divisor,
      expenses: (avgMetric.expenses || 0) / divisor,
      mood: (avgMetric.mood || 0) / divisor,
      selfDevMinutes: (avgMetric.selfDevMinutes || 0) / divisor,
      personalLifeScore: (avgMetric.personalLifeScore || 0) / divisor,
    };

    const { scores } = computeSphereStatuses(normalized);
    const wheel = {
      spheres: [
        { name: 'Сон', percentage: scores.sleep },
        { name: 'Вода', percentage: scores.water },
        { name: 'Питание', percentage: scores.nutrition },
        { name: 'Фитнес', percentage: scores.fitness },
        { name: 'Работа', percentage: scores.work },
        { name: 'Финансы', percentage: scores.finance },
        { name: 'Настроение', percentage: scores.mood },
        { name: 'Развитие', percentage: scores.selfDevelopment },
        { name: 'Личное', percentage: scores.personalLife },
      ],
    };
    return { wheel };
  },
  getCorrelations: () => {
    return { correlations: [] };
  },
  getProgress: (days: number) => {
    const metrics = getAllMetrics();
    const entries = Object.values(metrics).sort((a, b) => a.date.localeCompare(b.date)).slice(-days);
    const lifeScoreTrend = entries.map(metric => {
      const { scores } = computeSphereStatuses(metric);
      return {
        date: metric.date,
        score: computeLifeScore(scores),
      };
    });
    return { lifeScoreTrend };
  },
  exportReport: (format: string, days: number) => {
    const dashboard = localStore.getDashboard().dashboard;
    const goals = getAllGoals();
    const tasks = getAllTasks();
    const periodTo = todayIso();
    const periodFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const report = {
      generatedAt: new Date().toISOString(),
      period: { from: periodFrom, to: periodTo },
      summary: {
        lifeScore: dashboard.lifeScore,
        totalDays: days,
        completedGoals: goals.filter(g => g.status === 'COMPLETED').length,
        completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
      },
      rawText: `Life OS Report (${periodFrom} - ${periodTo})\nLifeScore: ${dashboard.lifeScore}`,
    };

    let data = '';
    let contentType = 'text/plain';
    if (format === 'json') {
      data = JSON.stringify(report, null, 2);
      contentType = 'application/json';
    } else if (format === 'csv') {
      data = 'metric,value\nlifeScore,' + dashboard.lifeScore;
      contentType = 'text/csv';
    } else {
      data = report.rawText;
      contentType = 'text/plain';
    }

    return { data, headers: { 'content-type': contentType } };
  },
  getFullReport: (days: number) => {
    const periodTo = todayIso();
    const periodFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      rawText: `Life OS Report\nПериод: ${periodFrom} - ${periodTo}\n`,
    };
  },
};
