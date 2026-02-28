import { useState, useEffect } from 'react';
import { Header, TabBar, Modal } from '@/components/navigation';
import { Button, Card, Input, ProgressBar, LoadingSpinner, EmptyState } from '@/components/ui';
import { useGoals } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { Goal, SphereType } from '@/types';

export function GoalsPage() {
  const navigate = useNavigate();
  const { goals, loading, fetchGoals, createGoal, updateGoalProgress } = useGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const [newGoal, setNewGoal] = useState({
    title: '',
    sphere: 'FITNESS' as SphereType,
    targetValue: 100,
    unit: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.unit) return;

    try {
      await createGoal(newGoal);
      setNewGoal({
        title: '',
        sphere: 'FITNESS',
        targetValue: 100,
        unit: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleUpdateProgress = async (goal: Goal, delta: number) => {
    try {
      await updateGoalProgress(goal.id, Math.max(0, goal.currentValue + delta));
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const sphereIcons: Record<string, string> = {
    SLEEP: '😴',
    WATER: '💧',
    NUTRITION: '🍎',
    FITNESS: '💪',
    WORK: '💼',
    FINANCE: '💰',
    MOOD: '😊',
    SELF_DEVELOPMENT: '📚',
    PERSONAL_LIFE: '❤️',
  };

  const sphereNames: Record<string, string> = {
    SLEEP: 'Сон',
    WATER: 'Вода',
    NUTRITION: 'Питание',
    FITNESS: 'Фитнес',
    WORK: 'Работа',
    FINANCE: 'Финансы',
    MOOD: 'Настроение',
    SELF_DEVELOPMENT: 'Развитие',
    PERSONAL_LIFE: 'Личное',
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'active') return goal.status === 'ACTIVE';
    if (filter === 'completed') return goal.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="min-h-screen pb-24 safe-top safe-bottom">
      <Header
        title="Цели"
        subtitle="Достигайте поставленных целей"
        rightAction={
          <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)}>
            + Цель
          </Button>
        }
      />

      {/* Filters */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[15px] font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-ios-primary text-white'
                : 'bg-ios-card-secondary text-ios-gray'
            }`}
          >
            {f === 'all' ? 'Все' : f === 'active' ? 'Активные' : 'Завершённые'}
          </button>
        ))}
      </div>

      <main className="px-4 py-2 space-y-3">
        {loading && !goals.length ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredGoals.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="Нет целей"
            description={
              filter === 'all'
                ? 'Создайте свою первую цель'
                : filter === 'active'
                ? 'Нет активных целей'
                : 'Нет завершённых целей'
            }
            action={
              filter === 'all' && (
                <Button onClick={() => setIsModalOpen(true)}>
                  Создать цель
                </Button>
              )
            }
          />
        ) : (
          filteredGoals.map(goal => (
            <Card key={goal.id} large>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-ios-card-secondary flex items-center justify-center text-[24px]">
                    {sphereIcons[goal.sphere]}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold">{goal.title}</h3>
                    <p className="text-[13px] text-ios-gray">
                      {sphereNames[goal.sphere]} • до {new Date(goal.endDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[12px] font-medium ${
                    goal.status === 'COMPLETED'
                      ? 'bg-ios-green/20 text-ios-green'
                      : 'bg-ios-primary/20 text-ios-primary'
                  }`}
                >
                  {goal.status === 'COMPLETED' ? '✓' : `${Math.round(goal.progress)}%`}
                </span>
              </div>

              {/* Progress */}
              <ProgressBar
                value={goal.progress}
                color={goal.progress >= 100 ? 'green' : goal.progress >= 50 ? 'blue' : 'yellow'}
                showLabel={false}
                className="mb-3"
              />

              {/* Value controls */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] text-ios-gray">
                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                </span>
                {goal.status === 'ACTIVE' && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateProgress(goal, -10)}
                    >
                      -10
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateProgress(goal, 10)}
                    >
                      +10
                    </Button>
                  </div>
                )}
              </div>

              {/* Description */}
              {goal.description && (
                <p className="text-[14px] text-ios-gray mt-3">{goal.description}</p>
              )}
            </Card>
          ))
        )}
      </main>

      {/* Create Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Новая цель"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button fullWidth onClick={handleCreateGoal}>
              Создать
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Название"
            value={newGoal.title}
            onChange={(value) => setNewGoal(prev => ({ ...prev, title: value }))}
            placeholder="Например: Похудеть на 5 кг"
          />

          <div>
            <label className="block text-ios-gray text-[13px] mb-1.5 ml-1">
              Сфера
            </label>
            <select
              value={newGoal.sphere}
              onChange={(e) => setNewGoal(prev => ({ ...prev, sphere: e.target.value as SphereType }))}
              className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[17px] text-white focus:outline-none"
            >
              {Object.entries(sphereNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Цель"
              type="number"
              value={newGoal.targetValue}
              onChange={(value) => setNewGoal(prev => ({ ...prev, targetValue: Number(value) }))}
              placeholder="100"
            />
            <Input
              label="Ед. измерения"
              value={newGoal.unit}
              onChange={(value) => setNewGoal(prev => ({ ...prev, unit: value }))}
              placeholder="кг"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Дата начала"
              type="date"
              value={newGoal.startDate}
              onChange={(value) => setNewGoal(prev => ({ ...prev, startDate: value }))}
            />
            <Input
              label="Дата окончания"
              type="date"
              value={newGoal.endDate}
              onChange={(value) => setNewGoal(prev => ({ ...prev, endDate: value }))}
            />
          </div>
        </div>
      </Modal>

      <TabBar activeTab="goals" onTabChange={(tab) => navigate(`/${tab}`)} />
    </div>
  );
}
