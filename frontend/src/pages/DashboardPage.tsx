import React, { useEffect } from 'react';
import { Header, TabBar } from '@/components/navigation';
import { LifeScoreRing, SphereCard, RecommendationCard, WheelChart } from '@/components/dashboard';
import { LoadingSpinner, EmptyState, Button } from '@/components/ui';
import { useDashboard, useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const navigate = useNavigate();
  const { dashboard, loading, fetchDashboard } = useDashboard();
  const { logout } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
            onClick={logout}
            className="text-[24px] active:opacity-70"
          >
            ⚙️
          </button>
        }
      />

      <main className="px-4 py-4 space-y-4">
        {/* LifeScore */}
        <div className="ios-card-large flex flex-col items-center">
          <LifeScoreRing
            score={dashboard?.lifeScore || 0}
            size="xl"
            showLabel
          />
          <p className="text-ios-gray text-[15px] mt-4 text-center">
            Ваш общий показатель качества жизни
          </p>
        </div>

        {/* Recommendations */}
        {dashboard?.recommendations && dashboard.recommendations.length > 0 && (
          <div>
            <h2 className="text-[20px] font-semibold mb-3">Рекомендации</h2>
            <div className="space-y-3">
              {dashboard.recommendations.slice(0, 3).map((rec, index) => (
                <RecommendationCard
                  key={index}
                  severity={rec.severity}
                  title={rec.ruleName}
                  message={rec.message}
                  suggestion={rec.suggestion}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sphere Statuses */}
        <div>
          <h2 className="text-[20px] font-semibold mb-3">Сферы жизни</h2>
          <div className="grid gap-3">
            {dashboard?.sphereStatuses &&
              Object.entries(dashboard.sphereStatuses).map(([key, status]) => (
                <SphereCard
                  key={key}
                  name={sphereNames[key] || key}
                  icon={sphereIcons[key] || '📊'}
                  value={status.value}
                  target={status.target}
                  status={status.status}
                  onClick={() => navigate('/tracking')}
                />
              ))}
          </div>
        </div>

        {/* Wheel Chart */}
        {dashboard?.wheel && (
          <div className="ios-card-large">
            <h3 className="text-[18px] font-semibold mb-4 text-center">
              Колесо баланса
            </h3>
            <WheelChart data={dashboard.wheel.spheres} size={250} />
          </div>
        )}

        {/* Goals Summary */}
        {dashboard?.goals && (
          <div className="ios-card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[17px] font-semibold">Цели</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/goals')}
              >
                Все →
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[24px] font-bold text-ios-primary">
                  {dashboard.goals.total}
                </p>
                <p className="text-[12px] text-ios-gray">активных</p>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-ios-gray">Прогресс</span>
                  <span className="font-medium">
                    {Math.round(dashboard.goals.avgProgress)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-ios-card-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ios-primary rounded-full"
                    style={{ width: `${dashboard.goals.avgProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Summary */}
        {dashboard?.tasks && (
          <div className="ios-card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[17px] font-semibold">Задачи</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tasks')}
              >
                Все →
              </Button>
            </div>
            <div className="flex gap-4">
              <div className="text-center flex-1">
                <p className="text-[24px] font-bold text-ios-yellow">
                  {dashboard.tasks.pending}
                </p>
                <p className="text-[12px] text-ios-gray">в ожидании</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-[24px] font-bold text-ios-red">
                  {dashboard.tasks.critical}
                </p>
                <p className="text-[12px] text-ios-gray">критичных</p>
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
