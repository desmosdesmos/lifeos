import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, SphereWeights, DailyMetric, Goal, Task, DashboardData } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Data
  sphereWeights: SphereWeights | null;
  todayMetrics: DailyMetric | null;
  dashboard: DashboardData | null;
  goals: Goal[];
  tasks: Task[];

  // UI
  activeTab: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setSphereWeights: (weights: SphereWeights) => void;
  setTodayMetrics: (metrics: DailyMetric | null) => void;
  setDashboard: (data: DashboardData | null) => void;
  setGoals: (goals: Goal[]) => void;
  setTasks: (tasks: Task[]) => void;
  setActiveTab: (tab: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      sphereWeights: null,
      todayMetrics: null,
      dashboard: null,
      goals: [],
      tasks: [],
      activeTab: 'dashboard',
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('token', token);
        }
      },
      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          sphereWeights: null,
          todayMetrics: null,
          dashboard: null,
          goals: [],
          tasks: [],
        });
      },
      setSphereWeights: (weights) => set({ sphereWeights: weights }),
      setTodayMetrics: (metrics) => set({ todayMetrics: metrics }),
      setDashboard: (data) => set({ dashboard: data }),
      setGoals: (goals) => set({ goals }),
      setTasks: (tasks) => set({ tasks }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'life-os-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        sphereWeights: state.sphereWeights,
      }),
    }
  )
);

export default useAppStore;
