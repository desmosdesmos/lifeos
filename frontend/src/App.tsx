import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import { TrackingPage } from '@/pages/TrackingPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { TasksPage } from '@/pages/TasksPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import telegramService from '@/services/telegram';
import apiService from '@/services/api';

function AuthPage({ onAuth }: { onAuth: (token: string) => void }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devTelegramId, setDevTelegramId] = useState('123456789');

  useEffect(() => {
    telegramService.init();
  }, []);

  const handleAuthSuccess = (response: any) => {
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      onAuth(response.token);
    }
  };

  const handleTelegramAuth = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const initData = telegramService.getInitData();
      if (!initData) {
        setError('Telegram initData недоступен');
        setIsAuthenticating(false);
        return;
      }
      const response = await apiService.authTelegram(initData);
      handleAuthSuccess(response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка авторизации');
      setIsAuthenticating(false);
    }
  };

  const handleDevAuth = async () => {
    if (!devTelegramId) return;
    setIsAuthenticating(true);
    setError(null);
    try {
      const response = await apiService.authDev(devTelegramId, 'dev_user', 'Dev User');
      handleAuthSuccess(response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка авторизации');
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="mb-8 text-center">
        <span className="text-[80px]">🚀</span>
        <h1 className="text-[32px] font-bold mt-4 mb-2">Life OS</h1>
        <p className="text-ios-gray text-[17px]">Система управления жизнью</p>
      </div>

      {error && (
        <div className="w-full max-w-xs bg-ios-red/20 border border-ios-red/30 rounded-[12px] p-4 mb-6">
          <p className="text-ios-red text-[15px] text-center">{error}</p>
        </div>
      )}

      <div className="w-full max-w-xs space-y-3">
        {!devMode ? (
          <>
            <button
              onClick={handleTelegramAuth}
              disabled={isAuthenticating}
              className="w-full bg-ios-primary text-white font-semibold py-4 px-6 rounded-[14px] text-[17px] active:opacity-80 transition-opacity disabled:opacity-50"
            >
              {isAuthenticating ? 'Вход...' : 'Войти через Telegram'}
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
              <label className="block text-ios-gray text-[13px] mb-2">Telegram ID</label>
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
            <button onClick={() => setDevMode(false)} className="w-full text-ios-gray font-medium py-3 text-[15px]">
              Назад
            </button>
          </>
        )}
      </div>

      <p className="mt-8 text-ios-gray text-[13px] text-center">
        Трекинг сфер жизни • Цели • Задачи • Аналитика
      </p>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
    telegramService.init();
  }, []);

  const handleAuth = () => {
    setIsAuthenticated(true);
  };

  if (isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return <AuthPage onAuth={handleAuth} />;
}

export default App;
