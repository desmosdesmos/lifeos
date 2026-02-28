import { useState, useEffect, useCallback } from 'react';
import apiService from '@/services/api';
import { DailyMetric, DashboardData, Goal, Task } from '@/types';

// ============================================
// Auth Hook
// ============================================

export function useAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticateWithTelegram = useCallback(async (initData: string) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const response = await apiService.authTelegram(initData);
      if (response.success) {
        localStorage.setItem('token', response.token);
        return response;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const authenticateDev = useCallback(async (telegramId: string) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const response = await apiService.authDev(telegramId);
      if (response.success) {
        localStorage.setItem('token', response.token);
        return response;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    window.location.reload();
  }, []);

  return {
    isAuthenticating,
    error,
    authenticateWithTelegram,
    authenticateDev,
    logout,
  };
}

// ============================================
// Metrics Hook
// ============================================

export function useMetrics() {
  const [metrics, setMetrics] = useState<DailyMetric | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiService.getMetrics(today);
      setMetrics(response.metric);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMetric = useCallback(async (data: Partial<DailyMetric> & { date: string }) => {
    try {
      const response = await apiService.upsertMetrics(data);
      setMetrics(response.metric);
      return response.metric;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update metric');
      throw err;
    }
  }, []);

  const addWater = useCallback(async (ml: number) => {
    try {
      const response = await apiService.updateField('waterMl', ml);
      setMetrics(response.metric);
      return response.metric;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add water');
      throw err;
    }
  }, []);

  return {
    metrics,
    loading,
    error,
    fetchTodayMetrics,
    updateMetric,
    addWater,
  };
}

// ============================================
// Dashboard Hook
// ============================================

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getDashboard();
      setDashboard(response.dashboard);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dashboard,
    loading,
    error,
    fetchDashboard,
  };
}

// ============================================
// Goals Hook
// ============================================

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const response = await apiService.getGoals(status);
      setGoals(response.goals);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(async (data: {
    title: string;
    sphere: string;
    targetValue: number;
    unit: string;
    startDate: string;
    endDate: string;
  }) => {
    try {
      const response = await apiService.createGoal(data);
      setGoals(prev => [...prev, response.goal]);
      return response.goal;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create goal');
      throw err;
    }
  }, []);

  const updateGoalProgress = useCallback(async (id: number, currentValue: number) => {
    try {
      const response = await apiService.updateProgress(id, currentValue);
      setGoals(prev => prev.map(g => g.id === id ? response.goal : g));
      return response.goal;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update progress');
      throw err;
    }
  }, []);

  const deleteGoal = useCallback(async (id: number) => {
    try {
      await apiService.deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete goal');
      throw err;
    }
  }, []);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoalProgress,
    deleteGoal,
  };
}

// ============================================
// Tasks Hook
// ============================================

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const response = await apiService.getTasks(status);
      setTasks(response.tasks);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: {
    title: string;
    category: string;
    priority: string;
    dueDate?: string;
  }) => {
    try {
      const response = await apiService.createTask(data);
      setTasks(prev => [...prev, response.task]);
      return response.task;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task');
      throw err;
    }
  }, []);

  const toggleTaskStatus = useCallback(async (id: number, status: string) => {
    try {
      const response = await apiService.updateStatus(id, status);
      setTasks(prev => prev.map(t => t.id === id ? response.task : t));
      return response.task;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update task');
      throw err;
    }
  }, []);

  const toggleChecklistItem = useCallback(async (taskId: number, itemId: number) => {
    try {
      const response = await apiService.toggleChecklistItem(taskId, itemId);
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            checklist: t.checklist.map(ci =>
              ci.id === itemId ? { ...ci, isCompleted: !ci.isCompleted } : ci
            ),
          };
        }
        return t;
      }));
      return response;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to toggle checklist item');
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    try {
      await apiService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete task');
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    toggleTaskStatus,
    toggleChecklistItem,
    deleteTask,
  };
}
