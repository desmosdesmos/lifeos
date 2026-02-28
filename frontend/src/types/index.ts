// ============================================
// API Types
// ============================================

export interface User {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface SphereWeights {
  sleep: number;
  water: number;
  nutrition: number;
  fitness: number;
  work: number;
  finance: number;
  mood: number;
  selfDevelopment: number;
  personalLife: number;
}

// ============================================
// Metrics Types
// ============================================

export interface DailyMetric {
  id: number;
  date: string;
  sleepHours?: number;
  waterMl: number;
  calories?: number;
  proteinGrams?: number;
  workoutType?: string;
  workoutMinutes: number;
  workHours?: number;
  income: number;
  expenses: number;
  mood?: number;
  selfDevMinutes: number;
  personalLifeScore?: number;
  notes?: string;
}

export interface DailyMetricInput {
  date: string;
  sleepHours?: number;
  waterMl?: number;
  calories?: number;
  proteinGrams?: number;
  workoutType?: string;
  workoutMinutes?: number;
  workHours?: number;
  income?: number;
  expenses?: number;
  mood?: number;
  selfDevMinutes?: number;
  personalLifeScore?: number;
  notes?: string;
}

export interface SphereStatus {
  value: number;
  target: number;
  percentage: number;
  status: 'critical' | 'warning' | 'good' | 'excellent';
  color: 'red' | 'yellow' | 'green' | 'blue';
}

export interface DailyMetricsResponse {
  id: number;
  date: string;
  sleepHours?: number;
  waterMl: number;
  calories?: number;
  proteinGrams?: number;
  workoutType?: string;
  workoutMinutes: number;
  workHours?: number;
  income: number;
  expenses: number;
  mood?: number;
  selfDevMinutes: number;
  personalLifeScore?: number;
  notes?: string;
  sphereStatuses: Record<string, SphereStatus>;
  lifeScore: number;
}

// ============================================
// Goal Types
// ============================================

export type SphereType = 
  | 'SLEEP' | 'WATER' | 'NUTRITION' | 'FITNESS' | 'WORK'
  | 'FINANCE' | 'MOOD' | 'SELF_DEVELOPMENT' | 'PERSONAL_LIFE';

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export interface Goal {
  id: number;
  userId: number;
  title: string;
  description?: string;
  sphere: SphereType;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalInput {
  title: string;
  description?: string;
  sphere: SphereType;
  targetValue: number;
  currentValue?: number;
  unit: string;
  startDate: string;
  endDate: string;
}

// ============================================
// Task Types
// ============================================

export type TaskCategory = 'HEALTH' | 'WORK' | 'FINANCE' | 'LEARNING' | 'PERSONAL' | 'OTHER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ChecklistItem {
  id: number;
  taskId: number;
  text: string;
  isCompleted: boolean;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  checklist: ChecklistItem[];
  dueDate?: string;
  completedAt?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  dueDate?: string;
  checklist?: { text: string }[];
  isRecurring?: boolean;
  recurrencePattern?: string;
}

// ============================================
// Analytics Types
// ============================================

export interface LifeBalanceWheel {
  spheres: {
    name: string;
    value: number;
    max: number;
    percentage: number;
  }[];
  overallScore: number;
}

export interface CorrelationData {
  correlation: string;
  coefficient: number;
  interpretation: string;
}

export interface WeeklyStat {
  id: number;
  weekStart: string;
  weekEnd: string;
  avgSleepHours?: number;
  totalWaterMl: number;
  avgCalories?: number;
  totalWorkoutMinutes: number;
  avgWorkHours?: number;
  totalIncome: number;
  totalExpenses: number;
  avgMood?: number;
  totalSelfDevMinutes: number;
  avgPersonalLifeScore?: number;
  lifeScore: number;
  lifeScoreChange: number;
}

export interface LifeScoreBreakdown {
  total: number;
  spheres: Record<string, {
    score: number;
    weight: number;
    weightedScore: number;
  }>;
}

// ============================================
// Rule Engine Types
// ============================================

export type RuleSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface RuleRecommendation {
  ruleId: string;
  ruleName: string;
  severity: RuleSeverity;
  message: string;
  sphere: SphereType;
  suggestion: string;
}

export interface RuleEngineResponse {
  recommendations: RuleRecommendation[];
  lifeScore: number;
  sphereStatuses: Record<string, SphereStatus>;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardData {
  date: string;
  lifeScore: number;
  sphereBreakdown: Record<string, { score: number; weight: number; weightedScore: number }>;
  sphereStatuses: Record<string, SphereStatus>;
  todayMetrics: DailyMetric | null;
  recommendations: RuleRecommendation[];
  goals: {
    total: number;
    avgProgress: number;
  };
  tasks: {
    pending: number;
    critical: number;
  };
  wheel: {
    spheres: { name: string; percentage: number }[];
  } | null;
}

// ============================================
// Export Types
// ============================================

export interface ExportReport {
  generatedAt: string;
  period: {
    from: string;
    to: string;
  };
  user: {
    telegramId: string;
  };
  summary: {
    lifeScore: number;
    totalDays: number;
    completedGoals: number;
    completedTasks: number;
  };
  spheres: Record<string, {
    name: string;
    average: number;
    trend: 'up' | 'down' | 'stable';
    bestDay: string;
    worstDay: string;
    goalProgress?: number;
  }>;
  recommendations: RuleRecommendation[];
  rawText: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
