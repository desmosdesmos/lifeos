import axios, { AxiosInstance } from 'axios';
import { localStore } from './localStore';

const API_URL = (import.meta as any).env.VITE_API_URL || 'https://life-os-seven-khaki.vercel.app/api';

const shouldFallback = (error: any) => {
  if (!error?.response) return true;
  const status = error.response.status;
  return status >= 400;
};

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.reload();
        }
        return Promise.reject(error);
      }
    );
  }

  async authTelegram(initData: string) {
    const response = await this.client.post('/auth', { initData });
    return response.data;
  }

  async authDev(telegramId: string, username?: string, firstName?: string) {
    const response = await this.client.post('/auth-simple', {
      telegramId,
      username,
      firstName,
    });
    return response.data;
  }

  async getMetrics(date: string) {
    try {
      const response = await this.client.get(`/metrics/${date}`);
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.getMetrics(date);
      throw error;
    }
  }

  async upsertMetrics(data: any) {
    try {
      const response = await this.client.post('/metrics', data);
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.upsertMetrics(data);
      throw error;
    }
  }

  async updateField(field: string, value: number) {
    try {
      const response = await this.client.patch('/metrics/field', { field, value });
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.updateField(field, value);
      throw error;
    }
  }

  async getGoals(status?: string) {
    try {
      const response = await this.client.get('/goals', { params: status ? { status } : undefined });
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.getGoals();
      throw error;
    }
  }

  async createGoal(data: any) {
    try {
      const response = await this.client.post('/goals', data);
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.createGoal(data);
      throw error;
    }
  }

  async updateProgress(id: number, currentValue: number) {
    try {
      const response = await this.client.patch(`/goals/${id}/progress`, { currentValue });
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.updateProgress(id, currentValue);
      throw error;
    }
  }

  async deleteGoal(id: number) {
    try {
      const response = await this.client.delete(`/goals/${id}`);
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.deleteGoal(id);
      throw error;
    }
  }

  async getTasks(status?: string) {
    try {
      const response = await this.client.get('/tasks', { params: status ? { status } : undefined });
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.getTasks();
      throw error;
    }
  }

  async createTask(data: any) {
    try {
      const response = await this.client.post('/tasks', data);
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.createTask(data);
      throw error;
    }
  }

  async updateStatus(id: number, status: string) {
    try {
      const response = await this.client.patch(`/tasks/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.updateStatus(id, status);
      throw error;
    }
  }

  async toggleChecklistItem(taskId: number, itemId: number) {
    try {
      const response = await this.client.patch(`/tasks/${taskId}/checklist/${itemId}`);
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.toggleChecklistItem(taskId, itemId);
      throw error;
    }
  }

  async deleteTask(id: number) {
    try {
      const response = await this.client.delete(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.deleteTask(id);
      throw error;
    }
  }

  async getDashboard() {
    try {
      const response = await this.client.get('/analytics/dashboard');
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.getDashboard();
      throw error;
    }
  }

  async getLifeWheel(days: number = 7) {
    try {
      const response = await this.client.get(`/analytics/wheel?days=${days}`);
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.getLifeWheel(days);
      throw error;
    }
  }

  async getCorrelations(days: number = 30) {
    try {
      const response = await this.client.get(`/analytics/correlations?days=${days}`);
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.getCorrelations();
      throw error;
    }
  }

  async getProgress(days: number = 30, sphere?: string) {
    try {
      const response = await this.client.get('/analytics/progress', {
        params: { days, sphere },
      });
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.getProgress(days);
      throw error;
    }
  }

  async exportReport(format: string, days: number) {
    try {
      const response = await this.client.get('/analytics/export', {
        params: { format, days },
        responseType: 'blob',
      });
      return response;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.exportReport(format, days);
      throw error;
    }
  }

  async getFullReport(days: number) {
    try {
      const response = await this.client.get('/analytics/report', { params: { days } });
      return response.data;
    } catch (error: any) {
      if (shouldFallback(error)) return localStore.getFullReport(days);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
