import { Request } from 'express';

export interface AuthRequest extends Request {
  telegramId?: bigint;
}

export interface JwtPayload {
  telegramId: string;
  iat?: number;
  exp?: number;
}

// ============================================
// Sphere Types
// ============================================
export type SphereType = 
  | 'SLEEP'
  | 'WATER'
  | 'NUTRITION'
  | 'FITNESS'
  | 'WORK'
  | 'FINANCE'
  | 'MOOD'
  | 'SELF_DEVELOPMENT'
  | 'PERSONAL_LIFE';

export const SPHERE_TYPES: SphereType[] = [
  'SLEEP', 'WATER', 'NUTRITION', 'FITNESS', 'WORK',
  'FINANCE', 'MOOD', 'SELF_DEVELOPMENT', 'PERSONAL_LIFE'
];

// ============================================
// Daily Metrics
// ============================================
export interface DailyMetricsInput {
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
// Sphere Status
// ============================================
export interface SphereStatus {
  value: number;
  target: number;
  percentage: number;
  status: 'critical' | 'warning' | 'good' | 'excellent';
  color: 'red' | 'yellow' | 'green' | 'blue';
}

// ============================================
// Goals
// ============================================
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

export interface GoalResponse {
  id: number;
  title: string;
  description?: string;
  sphere: SphereType;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  progress: number;
}

// ============================================
// Tasks
// ============================================
export interface TaskInput {
  title: string;
  description?: string;
  category: 'HEALTH' | 'WORK' | 'FINANCE' | 'LEARNING' | 'PERSONAL' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate?: string;
  checklist?: { text: string }[];
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export interface ChecklistItemResponse {
  id: number;
  text: string;
  isCompleted: boolean;
}

export interface TaskResponse {
  id: number;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  checklist: ChecklistItemResponse[];
  dueDate?: string;
  completedAt?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
}

// ============================================
// Analytics
// ============================================
export interface WeeklyStatResponse {
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

// ============================================
// Rule Engine
// ============================================
export interface RuleRecommendation {
  ruleId: string;
  ruleName: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
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
// Export
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
  spheres: Record<string, SphereReport>;
  recommendations: RuleRecommendation[];
  rawText: string;
}

export interface SphereReport {
  name: string;
  average: number;
  trend: 'up' | 'down' | 'stable';
  bestDay: string;
  worstDay: string;
  goalProgress?: number;
}

// ============================================
// LifeScore
// ============================================
export interface LifeScoreBreakdown {
  total: number;
  spheres: Record<string, {
    score: number;
    weight: number;
    weightedScore: number;
  }>;
}
