import { SphereIcon, Slider, Button, Card } from '@/components/ui';
import { SphereType } from '@/types';

interface SphereTrackerProps {
  sphere: SphereType;
  title: string;
  value: number | string;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function SphereTracker({
  sphere,
  title,
  value,
  unit,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
}: SphereTrackerProps) {
  return (
    <Card className={className}>
      <div className="flex items-center gap-3 mb-4">
        <SphereIcon sphere={sphere} size="md" />
        <div>
          <h3 className="text-[17px] font-semibold">{title}</h3>
          <p className="text-[13px] text-ios-gray">{unit}</p>
        </div>
      </div>

      <Slider
        value={typeof value === 'number' ? value : 0}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        showValue
      />
    </Card>
  );
}

interface WaterTrackerProps {
  value: number;
  target?: number;
  onAdd: (ml: number) => void;
  className?: string;
}

export function WaterTracker({ value, target = 2500, onAdd, className }: WaterTrackerProps) {
  const percentage = Math.min(100, (value / target) * 100);
  const quickAdd = [250, 500, 750];

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[32px]">💧</span>
          <div>
            <h3 className="text-[17px] font-semibold">Вода</h3>
            <p className="text-[13px] text-ios-gray">
              {value} / {target} мл
            </p>
          </div>
        </div>
        <div className="text-[24px] font-bold text-ios-blue">
          {Math.round(percentage)}%
        </div>
      </div>

      <div className="w-full h-3 bg-ios-card-secondary rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex gap-2">
        {quickAdd.map(ml => (
          <Button
            key={ml}
            variant="secondary"
            size="sm"
            onClick={() => onAdd(ml)}
            className="flex-1"
          >
            +{ml}
          </Button>
        ))}
      </div>
    </Card>
  );
}

interface MoodTrackerProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function MoodTracker({ value, onChange, className }: MoodTrackerProps) {
  const moods = [
    { value: 1, emoji: '😫', label: 'Ужасно' },
    { value: 2, emoji: '😔', label: 'Плохо' },
    { value: 3, emoji: '😕', label: 'Нормально' },
    { value: 4, emoji: '😐', label: 'Средне' },
    { value: 5, emoji: '😌', label: 'Хорошо' },
    { value: 6, emoji: '🙂', label: 'Очень хорошо' },
    { value: 7, emoji: '😊', label: 'Отлично' },
    { value: 8, emoji: '😄', label: 'Превосходно' },
    { value: 9, emoji: '🤩', label: 'Восхитительно' },
    { value: 10, emoji: '🌟', label: 'Лучше некуда' },
  ];

  return (
    <Card className={className}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[32px]">😊</span>
        <div>
          <h3 className="text-[17px] font-semibold">Настроение</h3>
          <p className="text-[13px] text-ios-gray">
            {moods.find(m => m.value === value)?.label || 'Выберите'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {moods.map(mood => (
          <button
            key={mood.value}
            onClick={() => onChange(mood.value)}
            className={`flex flex-col items-center p-2 rounded-[12px] transition-all ${
              value === mood.value
                ? 'bg-ios-primary/20 ring-2 ring-ios-primary'
                : 'bg-ios-card-secondary active:scale-95'
            }`}
          >
            <span className="text-[28px]">{mood.emoji}</span>
            <span className="text-[10px] text-ios-gray mt-1">{mood.value}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

interface WorkoutTrackerProps {
  minutes: number;
  type?: string;
  onMinutesChange: (value: number) => void;
  onTypeChange: (type: string) => void;
  className?: string;
}

export function WorkoutTracker({
  minutes,
  type,
  onMinutesChange,
  onTypeChange,
  className,
}: WorkoutTrackerProps) {
  const workoutTypes = [
    { id: 'cardio', name: 'Кардио', icon: '🏃' },
    { id: 'strength', name: 'Силовая', icon: '💪' },
    { id: 'yoga', name: 'Йога', icon: '🧘' },
    { id: 'stretching', name: 'Растяжка', icon: '🤸' },
    { id: 'sports', name: 'Спорт', icon: '⚽' },
    { id: 'walk', name: 'Прогулка', icon: '🚶' },
  ];

  return (
    <Card className={className}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[32px]">💪</span>
        <div>
          <h3 className="text-[17px] font-semibold">Тренировка</h3>
          <p className="text-[13px] text-ios-gray">
            {minutes} минут
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {workoutTypes.map(workout => (
          <button
            key={workout.id}
            onClick={() => onTypeChange(workout.id)}
            className={`flex flex-col items-center p-3 rounded-[12px] transition-all ${
              type === workout.id
                ? 'bg-ios-green/20 ring-2 ring-ios-green'
                : 'bg-ios-card-secondary active:scale-95'
            }`}
          >
            <span className="text-[24px]">{workout.icon}</span>
            <span className="text-[11px] text-ios-gray mt-1">{workout.name}</span>
          </button>
        ))}
      </div>

      <Slider
        value={minutes}
        onChange={onMinutesChange}
        min={0}
        max={180}
        step={5}
        label="Длительность (мин)"
        showValue
      />
    </Card>
  );
}

interface FinanceTrackerProps {
  income: number;
  expenses: number;
  onIncomeChange: (value: number) => void;
  onExpensesChange: (value: number) => void;
  className?: string;
}

export function FinanceTracker({
  income,
  expenses,
  onIncomeChange,
  onExpensesChange,
  className,
}: FinanceTrackerProps) {
  const balance = income - expenses;

  return (
    <Card className={className}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[32px]">💰</span>
        <div>
          <h3 className="text-[17px] font-semibold">Финансы</h3>
          <p className={`text-[13px] ${balance >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
            Баланс: {balance >= 0 ? '+' : ''}{balance}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-ios-gray text-[13px] mb-1.5 ml-1">
            Доход
          </label>
          <input
            type="number"
            value={income || ''}
            onChange={(e) => onIncomeChange(Number(e.target.value) || 0)}
            className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[17px] text-white focus:outline-none"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-ios-gray text-[13px] mb-1.5 ml-1">
            Расход
          </label>
          <input
            type="number"
            value={expenses || ''}
            onChange={(e) => onExpensesChange(Number(e.target.value) || 0)}
            className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[17px] text-white focus:outline-none"
            placeholder="0"
          />
        </div>
      </div>
    </Card>
  );
}

interface SleepTrackerProps {
  hours: number;
  onChange: (value: number) => void;
  className?: string;
}

export function SleepTracker({ hours, onChange, className }: SleepTrackerProps) {
  const getSleepQuality = (hours: number) => {
    if (hours >= 7 && hours <= 9) return { text: 'Отлично', color: 'text-ios-green' };
    if (hours >= 6 && hours < 7) return { text: 'Нормально', color: 'text-ios-yellow' };
    if (hours < 6) return { text: 'Мало', color: 'text-ios-red' };
    return { text: 'Много', color: 'text-ios-yellow' };
  };

  const quality = getSleepQuality(hours);

  return (
    <Card className={className}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[32px]">😴</span>
        <div>
          <h3 className="text-[17px] font-semibold">Сон</h3>
          <p className={`text-[13px] ${quality.color}`}>{quality.text}</p>
        </div>
      </div>

      <Slider
        value={hours}
        onChange={onChange}
        min={0}
        max={14}
        step={0.5}
        label={`Часов сна: ${hours}`}
        showValue
      />

      <div className="mt-4 p-3 bg-ios-card-secondary rounded-[10px]">
        <p className="text-[13px] text-ios-gray">
          {hours < 6 && '⚠️ Рекомендуется спать 7-9 часов для оптимального восстановления.'}
          {hours >= 6 && hours < 7 && '💡 Попробуйте лечь на 30-60 минут раньше.'}
          {hours >= 7 && hours <= 9 && '✅ Отличная продолжительность сна!'}
          {hours > 9 && '💤 Возможно, вы спите больше необходимого.'}
        </p>
      </div>
    </Card>
  );
}
