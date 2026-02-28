import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import { TrackingPage } from '@/pages/TrackingPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { TasksPage } from '@/pages/TasksPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { LoadingSpinner } from '@/components/ui';
import telegramService from '@/services/telegram';
import apiService from '@/services/api';
import { useAppStore } from '@/store/appStore';

// Страница авторизации
function AuthPage() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devTelegramId, setDevTelegramId] = useState('123456789');
  const { setUser, setToken } = useAppStore();

  useEffect(() => {
    console.log('[AuthPage] Initializing Telegram...');
    telegramService.init();
    
    // Проверяем есть ли initData от Telegram
    const initData = telegramService.getInitData();
    console.log('[AuthPage] initData:', initData ? 'Present' : 'Not present');
    
    // Если initData есть, пробуем авторизоваться автоматически
    if (initData) {
      console.log('[AuthPage] Auto-authenticating with Telegram...');
      handleTelegramAuth(initData);
    }
  }, []);

  const handleTelegramAuth = async (initData: string) => {
    console.log('[AuthPage] Starting Telegram auth...');
    setIsAuthenticating(true);
    setError(null);

    try {
      const response = await apiService.authTelegram(initData);
      console.log('[AuthPage] Auth response:', response);
      
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        console.log('[AuthPage] Auth successful!');
      }
    } catch (err: any) {
      console.error('[AuthPage] Auth error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.details || 'Failed to authenticate';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDevAuth = async () => {
    if (!devTelegramId) return;
    
    setIsAuthenticating(true);
    setError(null);

    try {
      const response = await apiService.authDev(devTelegramId, 'dev_user', 'Dev User');
      
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to authenticate');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      {/* Logo */}
      <div className="mb-8 text-center">
        <span className="text-[80px]">🚀</span>
        <h1 className="text-[32px] font-bold mt-4 mb-2">Life OS</h1>
        <p className="text-ios-gray text-[17px]">
          Система управления жизнью
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="w-full max-w-xs bg-ios-red/20 border border-ios-red/30 rounded-[12px] p-4 mb-6">
          <p className="text-ios-red text-[15px] text-center">{error}</p>
        </div>
      )}

      {/* Auth buttons */}
      <div className="w-full max-w-xs space-y-3">
        {!devMode ? (
          <>
            <button
              onClick={() => {
                const initData = telegramService.getInitData();
                if (initData) {
                  handleTelegramAuth(initData);
                } else {
                  setError('Telegram initData not available. Try opening from Telegram.');
                }
              }}
              disabled={isAuthenticating}
              className="w-full bg-ios-primary text-white font-semibold py-4 px-6 rounded-[14px] text-[17px] active:opacity-80 transition-opacity disabled:opacity-50"
            >
              {isAuthenticating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Вход...
                </span>
              ) : (
                'Войти через Telegram'
              )}
            </button>

            <button
              onClick={() => setDevMode(true)}
              className="w-full bg-ios-card-secondary text-ios-gray font-medium py-3 px-6 rounded-[12px] text-[15px] active:opacity-70 transition-opacity"
            >
              Режим разработчика
            </button>
          </>
        ) : (
          <>
            <div className="bg-ios-card-secondary rounded-[12px] p-4">
              <label className="block text-ios-gray text-[13px] mb-2">
                Telegram ID
              </label>
              <input
                type="text"
                value={devTelegramId}
                onChange={(e) => setDevTelegramId(e.target.value)}
                className="w-full bg-ios-card rounded-[10px] px-4 py-3 text-[17px] text-white focus:outline-none"
                placeholder="123456789"
              />
            </div>

            <button
              onClick={handleDevAuth}
              disabled={isAuthenticating || !devTelegramId}
              className="w-full bg-ios-primary text-white font-semibold py-4 px-6 rounded-[14px] text-[17px] active:opacity-80 transition-opacity disabled:opacity-50"
            >
              {isAuthenticating ? 'Вход...' : 'Войти (Dev)'}
            </button>

            <button
              onClick={() => setDevMode(false)}
              className="w-full text-ios-gray font-medium py-3 text-[15px]"
            >
              Назад
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-ios-gray text-[13px] text-center">
        Трекинг сфер жизни • Цели • Задачи • Аналитика
      </p>
    </div>
  );
}

// Защищённый роут
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Главный компонент приложения
function App() {
  const { setToken } = useAppStore();

  useEffect(() => {
    // Проверяем токен при загрузке
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
    }

    // Инициализируем Telegram
    telegramService.init();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tracking"
          element={
            <ProtectedRoute>
              <TrackingPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
