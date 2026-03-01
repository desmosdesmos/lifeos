import axios, { AxiosInstance } from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'https://life-os-seven-khaki.vercel.app/api';

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
    const response = await this.client.get(`/metrics/${date}`);
    return response.data;
  }

  async upsertMetrics(data: any) {
    const response = await this.client.post('/metrics', data);
    return response.data;
  }

  async getGoals() {
    const response = await this.client.get('/goals');
    return response.data;
  }

  async createGoal(data: any) {
    const response = await this.client.post('/goals', data);
    return response.data;
  }

  async updateProgress(id: number, currentValue: number) {
    const response = await this.client.patch(`/goals/${id}/progress`, { currentValue });
    return response.data;
  }

  async getTasks() {
    const response = await this.client.get('/tasks');
    return response.data;
  }

  async createTask(data: any) {
    const response = await this.client.post('/tasks', data);
    return response.data;
  }

  async updateStatus(id: number, status: string) {
    const response = await this.client.patch(`/tasks/${id}/status`, { status });
    return response.data;
  }

  async toggleChecklistItem(taskId: number, itemId: number) {
    const response = await this.client.patch(`/tasks/${taskId}/checklist/${itemId}`);
    return response.data;
  }

  async getDashboard() {
    const response = await this.client.get('/analytics/dashboard');
    return response.data;
  }

  async getLifeWheel(days: number = 7) {
    const response = await this.client.get(`/analytics/wheel?days=${days}`);
    return response.data;
  }

  async getCorrelations(days: number = 30) {
    const response = await this.client.get(`/analytics/correlations?days=${days}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
