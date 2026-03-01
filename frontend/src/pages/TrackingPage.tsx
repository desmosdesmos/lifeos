import { useState, useEffect } from 'react';
import { Header, TabBar } from '@/components/navigation';
import {
  SleepTracker,
  WaterTracker,
  MoodTracker,
  WorkoutTracker,
  FinanceTracker,
} from '@/components/tracking';
import { Button, Card, LoadingSpinner } from '@/components/ui';
import { useMetrics } from '@/hooks';
import { useNavigate } from 'react-router-dom';

export function TrackingPage() {
  const navigate = useNavigate();
  const { metrics, loading, fetchTodayMetrics, updateMetric, addWater } = useMetrics();

  const [localMetrics, setLocalMetrics] = useState({
    sleepHours: 7,
    waterMl: 0,
    calories: 2000,
    workoutMinutes: 0,
    workoutType: '',
    workHours: 8,
    income: 0,
    expenses: 0,
    mood: 5,
    selfDevMinutes: 30,
    personalLifeScore: 7,
    notes: '',
  });

  useEffect(() => {
    fetchTodayMetrics();
  }, []);

  useEffect(() => {
    if (metrics) {
      setLocalMetrics({
        sleepHours: metrics.sleepHours || 7,
        waterMl: metrics.waterMl || 0,
        calories: metrics.calories || 2000,
        workoutMinutes: metrics.workoutMinutes || 0,
        workoutType: metrics.workoutType || '',
        workHours: metrics.workHours || 8,
        income: metrics.income || 0,
        expenses: metrics.expenses || 0,
        mood: metrics.mood || 5,
        selfDevMinutes: metrics.selfDevMinutes || 30,
        personalLifeScore: metrics.personalLifeScore || 7,
        notes: metrics.notes || '',
      });
    }
  }, [metrics]);

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastTracked = localStorage.getItem('lifeos_last_tracked');
    let streak = Number(localStorage.getItem('lifeos_streak') || 0);

    if (lastTracked === today) return;

    if (!lastTracked) {
      streak = 1;
    } else {
      const diff = Math.floor(
        (new Date(today).getTime() - new Date(lastTracked).getTime()) / (24 * 60 * 60 * 1000)
      );
      streak = diff === 1 ? streak + 1 : 1;
    }

    localStorage.setItem('lifeos_last_tracked', today);
    localStorage.setItem('lifeos_streak', String(streak));
  };

  const handleSave = async () => {
    try {
      await updateMetric({
        date: new Date().toISOString().split('T')[0],
        ...localMetrics,
      });
      updateStreak();
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  };

  const handleAddWater = async (ml: number) => {
    try {
      await addWater(ml);
      setLocalMetrics(prev => ({ ...prev, waterMl: prev.waterMl + ml }));
    } catch (error) {
      console.error('Failed to add water:', error);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 safe-top safe-bottom">
      <Header
        title="Трекинг"
        subtitle="Отслеживайте ключевые сферы жизни"
        rightAction={
          <Button variant="ghost" size="sm" onClick={handleSave}>
            Сохранить
          </Button>
        }
      />

      <main className="px-4 py-4 space-y-4">
        <SleepTracker
          hours={localMetrics.sleepHours}
          onChange={(value) => setLocalMetrics(prev => ({ ...prev, sleepHours: value }))}
        />

        <WaterTracker
          value={localMetrics.waterMl}
          onAdd={handleAddWater}
        />

        <MoodTracker
          value={localMetrics.mood}
          onChange={(value) => setLocalMetrics(prev => ({ ...prev, mood: value }))}
        />

        <WorkoutTracker
          minutes={localMetrics.workoutMinutes}
          type={localMetrics.workoutType}
          onMinutesChange={(value) => setLocalMetrics(prev => ({ ...prev, workoutMinutes: value }))}
          onTypeChange={(value) => setLocalMetrics(prev => ({ ...prev, workoutType: value }))}
        />

        <FinanceTracker
          income={localMetrics.income}
          expenses={localMetrics.expenses}
          onIncomeChange={(value) => setLocalMetrics(prev => ({ ...prev, income: value }))}
          onExpensesChange={(value) => setLocalMetrics(prev => ({ ...prev, expenses: value }))}
        />

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[32px]">💼</span>
            <div>
              <h3 className="text-[17px] font-semibold">Работа</h3>
              <p className="text-[13px] text-ios-gray">Часов сегодня</p>
            </div>
          </div>
          <input
            type="number"
            value={localMetrics.workHours}
            onChange={(e) => setLocalMetrics(prev => ({ ...prev, workHours: Number(e.target.value) }))}
            className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[17px] text-white focus:outline-none"
            placeholder="0"
          />
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[32px]">📚</span>
            <div>
              <h3 className="text-[17px] font-semibold">Саморазвитие</h3>
              <p className="text-[13px] text-ios-gray">Минут сегодня</p>
            </div>
          </div>
          <input
            type="number"
            value={localMetrics.selfDevMinutes}
            onChange={(e) => setLocalMetrics(prev => ({ ...prev, selfDevMinutes: Number(e.target.value) }))}
            className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[17px] text-white focus:outline-none"
            placeholder="0"
          />
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[32px]">❤️</span>
            <div>
              <h3 className="text-[17px] font-semibold">Личная жизнь</h3>
              <p className="text-[13px] text-ios-gray">Оценка 1-10</p>
            </div>
          </div>
          <input
            type="number"
            min="1"
            max="10"
            value={localMetrics.personalLifeScore}
            onChange={(e) => setLocalMetrics(prev => ({ ...prev, personalLifeScore: Number(e.target.value) }))}
            className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[17px] text-white focus:outline-none"
            placeholder="1-10"
          />
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[32px]">🍎</span>
            <div>
              <h3 className="text-[17px] font-semibold">Питание</h3>
              <p className="text-[13px] text-ios-gray">Калории сегодня</p>
            </div>
          </div>
          <input
            type="number"
            value={localMetrics.calories}
            onChange={(e) => setLocalMetrics(prev => ({ ...prev, calories: Number(e.target.value) }))}
            className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[17px] text-white focus:outline-none"
            placeholder="0"
          />
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[32px]">📝</span>
            <div>
              <h3 className="text-[17px] font-semibold">Заметка дня</h3>
              <p className="text-[13px] text-ios-gray">Краткое отражение</p>
            </div>
          </div>
          <textarea
            value={localMetrics.notes}
            onChange={(e) => setLocalMetrics(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[16px] text-white focus:outline-none resize-none"
            placeholder="Что было важного сегодня?"
          />
        </Card>
      </main>

      <TabBar activeTab="tracking" onTabChange={(tab) => navigate(`/${tab}`)} />
    </div>
  );
}
