import React, { useEffect, useState } from 'react';
import { Header, TabBar } from '@/components/navigation';
import { LifeScoreRing, SphereCard, RecommendationCard, WheelChart } from '@/components/dashboard';
import { EmptyState, Button, Card } from '@/components/ui';
import { useDashboard, useMetrics } from '@/hooks';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const navigate = useNavigate();
  const { dashboard, loading, fetchDashboard } = useDashboard();
  const { metrics, fetchTodayMetrics, addWater, updateMetric } = useMetrics();
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setMounted(true);
    fetchDashboard();
    fetchTodayMetrics();
    const stored = Number(localStorage.getItem('lifeos_streak') || 0);
    setStreak(stored);
  }, []);

  useEffect(() => {
    if (metrics) {
      fetchDashboard();
    }
  }, [metrics]);

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="ios-spinner mx-auto mb-4"></div>
          <p className="text-ios-gray">Загрузка Life OS...</p>
        </div>
      </div>
    );
  }

  const sphereIcons: Record<string, string> = {
    sleep: '😴',
    water: '💧',
    nutrition: '🍎',
    fitness: '💪',
    work: '💼',
    finance: '💰',
    mood: '😊',
    selfDevelopment: '📚',
    personalLife: '❤️',
  };

  const sphereNames: Record<string, string> = {
    sleep: 'Сон',
    water: 'Вода',
    nutrition: 'Питание',
    fitness: 'Фитнес',
    work: 'Работа',
    finance: 'Финансы',
    mood: 'Настроение',
    selfDevelopment: 'Развитие',
    personalLife: 'Личное',
  };

  const waterValue = metrics?.waterMl || dashboard?.todayMetrics?.waterMl || 0;
  const waterTarget = 2500;
  const waterProgress = Math.min(100, (waterValue / waterTarget) * 100);

  const handleQuickMood = async (value: number) => {
    try {
      await updateMetric({
        date: new Date().toISOString().split('T')[0],
        mood: value,
      });
    } catch (error) {
      console.error('Failed to update mood:', error);
    }
  };

  const handleQuickWater = async (ml: number) => {
    try {
      await addWater(ml);
    } catch (error) {
      console.error('Failed to add water:', error);
    }
  };

  return (
    <div className="min-h-screen pb-24 safe-top safe-bottom">
      <Header
        title="Life OS"
        subtitle={new Date().toLocaleDateString('ru-RU', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
        rightAction={
          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="text-[24px] active:opacity-70 transition-opacity"
          >
            ⚙️
          </button>
        }
      />

      <main className="px-4 py-4 space-y-4">
        <div className={`ios-card-large bg-gradient-blue glow-blue animate-fade-in-up ${mounted ? '' : 'opacity-0'}`}>
          <div className="flex flex-col items-center">
            <LifeScoreRing score={dashboard?.lifeScore || 0} size="xl" showLabel className="animate-float" />
            <p className="text-ios-gray text-[15px] mt-4 text-center">
              Ваш показатель качества жизни
            </p>
            <div className="flex gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/tracking')}
                className="ios-button-gradient"
              >
                📊 Трекинг
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/goals')}
              >
                🎯 Цели
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 animate-fade-in-up delay-100">
          <Card className="bg-ios-card-secondary/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-ios-gray">Серия дней</p>
                <p className="text-[22px] font-bold text-gradient">{streak}</p>
              </div>
              <span className="text-[28px]">🔥</span>
            </div>
          </Card>
          <Card className="bg-ios-card-secondary/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-ios-gray">Вода сегодня</p>
                <p className="text-[18px] font-semibold">{waterValue} мл</p>
              </div>
              <span className="text-[26px]">💧</span>
            </div>
            <div className="mt-2 w-full h-2 bg-ios-card rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-blue rounded-full transition-all"
                style={{ width: `${waterProgress}%` }}
              />
            </div>
          </Card>
        </div>

        <Card className="animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[17px] font-semibold">Быстрые действия</h3>
            <span className="ios-badge ios-badge-blue">Сегодня</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[250, 500, 750].map(ml => (
              <Button
                key={ml}
                variant="secondary"
                size="sm"
                onClick={() => handleQuickWater(ml)}
              >
                +{ml} мл
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {[2, 4, 6, 8, 10].map(score => (
              <button
                key={score}
                onClick={() => handleQuickMood(score)}
                className="flex-1 py-2 rounded-[12px] bg-ios-card-secondary text-[16px] font-semibold active:scale-95 transition-transform"
              >
                {score <= 2 ? '😕' : score <= 4 ? '😐' : score <= 6 ? '🙂' : score <= 8 ? '😊' : '🤩'}
              </button>
            ))}
          </div>
        </Card>

        {dashboard?.recommendations && dashboard.recommendations.length > 0 && (
          <div className="animate-fade-in-up delay-300">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[20px] font-bold text-gradient">Рекомендации</h2>
              <span className="ios-badge ios-badge-red">
                {dashboard.recommendations.length}
              </span>
            </div>
            <div className="space-y-3">
              {dashboard.recommendations.slice(0, 3).map((rec, index) => (
                <RecommendationCard
                  key={index}
                  severity={rec.severity}
                  title={rec.ruleName}
                  message={rec.message}
                  suggestion={rec.suggestion}
                  className={`delay-${(index + 1) * 100}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="animate-fade-in-up delay-400">
          <h2 className="text-[20px] font-bold mb-3 text-gradient-green">Сферы жизни</h2>
          <div className="grid gap-3">
            {dashboard?.sphereStatuses &&
              Object.entries(dashboard.sphereStatuses).map(([key, status], index) => (
                <SphereCard
                  key={key}
                  name={sphereNames[key] || key}
                  icon={sphereIcons[key] || '📊'}
                  value={status.value}
                  target={status.target}
                  status={status.status}
                  onClick={() => navigate('/tracking')}
                  className={`animate-slide-in-right delay-${300 + index * 100}`}
                />
              ))}
          </div>
        </div>

        {dashboard?.wheel && (
          <div className="ios-card-large animate-fade-in-up delay-500">
            <h3 className="text-[18px] font-bold mb-4 text-center text-gradient-gold">
              🎯 Колесо баланса
            </h3>
            <WheelChart data={dashboard.wheel.spheres} size={250} />
          </div>
        )}

        {dashboard?.goals && (
          <div className="ios-card animate-fade-in-up delay-600">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[17px] font-semibold">🎯 Цели</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/goals')}
                className="text-ios-blue"
              >
                Все →
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[28px] font-bold text-gradient">{dashboard.goals.total}</p>
                <p className="text-[12px] text-ios-gray">активных</p>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-ios-gray">Прогресс</span>
                  <span className="font-semibold text-ios-blue">
                    {Math.round(dashboard.goals.avgProgress)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-ios-card-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-blue rounded-full transition-all duration-500"
                    style={{ width: `${dashboard.goals.avgProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {dashboard?.tasks && (
          <div className="ios-card animate-fade-in-up delay-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[17px] font-semibold">✅ Задачи</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tasks')}
                className="text-ios-blue"
              >
                Все →
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-ios-card-secondary rounded-lg">
                <p className="text-[24px] font-bold text-ios-yellow">{dashboard.tasks.pending}</p>
                <p className="text-[12px] text-ios-gray mt-1">в ожидании</p>
              </div>
              <div className="text-center p-3 bg-ios-card-secondary rounded-lg">
                <p className="text-[24px] font-bold text-ios-red">{dashboard.tasks.critical}</p>
                <p className="text-[12px] text-ios-gray mt-1">критичных</p>
              </div>
            </div>
          </div>
        )}

        {!dashboard && !loading && (
          <EmptyState
            icon="📊"
            title="Нет данных"
            description="Начните отслеживать свои метрики, чтобы видеть прогресс"
            action={
              <Button onClick={() => navigate('/tracking')}>
                Начать трекинг
              </Button>
            }
          />
        )}
      </main>

      <TabBar activeTab="dashboard" onTabChange={(tab) => navigate(`/${tab}`)} />
    </div>
  );
}
