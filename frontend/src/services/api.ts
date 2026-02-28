import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Интерцептор для добавления токена
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Интерцептор для обработки ошибок
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

  // ============================================
  // AUTH
  // ============================================

  async authTelegram(initData: string) {
    const response = await this.client.post('/auth/telegram', { initData });
    return response.data;
  }

  async authDev(telegramId: string, username?: string, firstName?: string) {
    const response = await this.client.post('/auth/dev', {
      telegramId,
      username,
      firstName,
    });
    return response.data;
  }

  async getWeights() {
    const response = await this.client.get('/auth/weights');
    return response.data;
  }

  async updateWeights(weights: Record<string, number>) {
    const response = await this.client.put('/auth/weights', { weights });
    return response.data;
  }

  // ============================================
  // METRICS
  // ============================================

  async getMetrics(date: string) {
    const response = await this.client.get(`/metrics/${date}`);
    return response.data;
  }

  async getMetricsRange(from?: string, to?: string, limit?: number) {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (limit) params.append('limit', limit.toString());
    
    const response = await this.client.get(`/metrics?${params}`);
    return response.data;
  }

  async upsertMetrics(data: {
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
  }) {
    const response = await this.client.post('/metrics', data);
    return response.data;
  }

  async updateField(field: string, value: number | string, date?: string) {
    const response = await this.client.patch(`/metrics/${field}`, { value, date });
    return response.data;
  }

  async deleteMetrics(date: string) {
    const response = await this.client.delete(`/metrics/${date}`);
    return response.data;
  }

  async getTodayStats() {
    const response = await this.client.get('/metrics/today/stats');
    return response.data;
  }

  // ============================================
  // GOALS
  // ============================================

  async getGoals(status?: string, sphere?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (sphere) params.append('sphere', sphere);
    
    const response = await this.client.get(`/goals?${params}`);
    return response.data;
  }

  async getGoal(id: number) {
    const response = await this.client.get(`/goals/${id}`);
    return response.data;
  }

  async createGoal(data: {
    title: string;
    description?: string;
    sphere: string;
    targetValue: number;
    currentValue?: number;
    unit: string;
    startDate: string;
    endDate: string;
  }) {
    const response = await this.client.post('/goals', data);
    return response.data;
  }

  async updateGoal(id: number, data: Partial<{
    title: string;
    description?: string;
    sphere: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    startDate: string;
    endDate: string;
    status: string;
  }>) {
    const response = await this.client.put(`/goals/${id}`, data);
    return response.data;
  }

  async updateProgress(id: number, currentValue?: number, delta?: number) {
    const response = await this.client.patch(`/goals/${id}/progress`, { currentValue, delta });
    return response.data;
  }

  async deleteGoal(id: number) {
    const response = await this.client.delete(`/goals/${id}`);
    return response.data;
  }

  async getGoalsSummary() {
    const response = await this.client.get('/goals/summary');
    return response.data;
  }

  // ============================================
  // TASKS
  // ============================================

  async getTasks(status?: string, category?: string, priority?: string, limit?: number) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);
    if (limit) params.append('limit', limit.toString());
    
    const response = await this.client.get(`/tasks?${params}`);
    return response.data;
  }

  async getTask(id: number) {
    const response = await this.client.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: {
    title: string;
    description?: string;
    category: string;
    priority: string;
    dueDate?: string;
    checklist?: { text: string }[];
    isRecurring?: boolean;
    recurrencePattern?: string;
  }) {
    const response = await this.client.post('/tasks', data);
    return response.data;
  }

  async updateTask(id: number, data: Partial<{
    title: string;
    description?: string;
    category: string;
    priority: string;
    status: string;
    dueDate: string;
    isRecurring: boolean;
    recurrencePattern: string;
  }>) {
    const response = await this.client.put(`/tasks/${id}`, data);
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

  async addChecklistItem(taskId: number, text: string) {
    const response = await this.client.post(`/tasks/${taskId}/checklist`, { text });
    return response.data;
  }

  async deleteTask(id: number) {
    const response = await this.client.delete(`/tasks/${id}`);
    return response.data;
  }

  async getTasksStats() {
    const response = await this.client.get('/tasks/stats');
    return response.data;
  }

  // ============================================
  // ANALYTICS
  // ============================================

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

  async getWeeklyStats(weeks: number = 4) {
    const response = await this.client.get(`/analytics/weekly?weeks=${weeks}`);
    return response.data;
  }

  async getProgress(days: number = 30, sphere?: string) {
    const params = new URLSearchParams();
    params.append('days', days.toString());
    if (sphere) params.append('sphere', sphere);
    
    const response = await this.client.get(`/analytics/progress?${params}`);
    return response.data;
  }

  async exportReport(format: string = 'txt', days: number = 30) {
    const response = await this.client.get(`/analytics/export?format=${format}&days=${days}`, {
      responseType: 'blob',
    });
    return response;
  }

  async getFullReport(days: number = 30) {
    const response = await this.client.get(`/analytics/export?format=json&days=${days}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
