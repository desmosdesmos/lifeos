import React, { useState, useEffect } from 'react';
import { Header, TabBar } from '@/components/navigation';
import { Card, Button, LoadingSpinner, EmptyState, WheelChart } from '@/components/ui';
import { LifeScoreRing, RecommendationCard } from '@/components/dashboard';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/api';

interface Correlation {
  correlation: string;
  coefficient: number;
  interpretation: string;
}

interface ProgressData {
  date: string;
  value: number;
}

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wheelData, setWheelData] = useState<any>(null);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [lifeScoreTrend, setLifeScoreTrend] = useState<ProgressData[]>([]);
  const [selectedSphere, setSelectedSphere] = useState<string>('all');

  const spheres = [
    { id: 'all', name: 'Все', icon: '📊' },
    { id: 'sleep', name: 'Сон', icon: '😴' },
    { id: 'water', name: 'Вода', icon: '💧' },
    { id: 'fitness', name: 'Фитнес', icon: '💪' },
    { id: 'work', name: 'Работа', icon: '💼' },
    { id: 'mood', name: 'Настроение', icon: '😊' },
  ];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [wheelRes, correlationsRes, progressRes] = await Promise.all([
        apiService.getLifeWheel(7),
        apiService.getCorrelations(30),
        apiService.getProgress(30, selectedSphere !== 'all' ? selectedSphere : undefined),
      ]);

      setWheelData(wheelRes.wheel);
      setCorrelations(correlationsRes.correlations || []);
      setLifeScoreTrend(progressRes.lifeScoreTrend || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const response = await apiService.exportReport(format, 30);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `life-os-report.${format === 'txt' ? 'txt' : format === 'csv' ? 'csv' : 'json'}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const handleCopyReport = async () => {
    try {
      const response = await apiService.getFullReport(30);
      await navigator.clipboard.writeText(response.rawText);
      alert('Отчёт скопирован в буфер обмена!');
    } catch (error) {
      console.error('Failed to copy report:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 safe-top safe-bottom">
      <Header
        title="Аналитика"
        subtitle="Анализируйте свой прогресс"
        rightAction={
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleExport('txt')}>
              TXT
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport('csv')}>
              CSV
            </Button>
          </div>
        }
      />

      <main className="px-4 py-4 space-y-4">
        {/* Export for AI */}
        <Card large className="bg-gradient-to-br from-ios-primary/20 to-ios-purple/20">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[32px]">🤖</span>
            <div>
              <h3 className="text-[17px] font-semibold">Экспорт в нейросеть</h3>
              <p className="text-[13px] text-ios-gray">
                Получите AI-рекомендации
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={handleCopyReport}
            >
              📋 Копировать отчёт
            </Button>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => handleExport('txt')}
            >
              📥 Скачать .txt
            </Button>
          </div>
        </Card>

        {/* LifeScore Trend */}
        <Card>
          <h3 className="text-[17px] font-semibold mb-4">Динамика LifeScore</h3>
          {lifeScoreTrend.length > 0 ? (
            <div className="h-40 flex items-end gap-1">
              {lifeScoreTrend.map((point, index) => (
                <div
                  key={index}
                  className="flex-1 bg-ios-primary/20 rounded-t transition-all hover:bg-ios-primary/40"
                  style={{ height: `${point.score}%` }}
                  title={`${point.date}: ${point.score}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📈"
              title="Нет данных"
              description="Начните отслеживать метрики для построения графика"
            />
          )}
        </Card>

        {/* Sphere Selector */}
        <div className="flex gap-2 overflow-x-auto py-2">
          {spheres.map(sphere => (
            <button
              key={sphere.id}
              onClick={() => {
                setSelectedSphere(sphere.id);
                fetchAnalytics();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-colors ${
                selectedSphere === sphere.id
                  ? 'bg-ios-primary text-white'
                  : 'bg-ios-card-secondary text-ios-gray'
              }`}
            >
              <span>{sphere.icon}</span>
              <span className="text-[15px] font-medium">{sphere.name}</span>
            </button>
          ))}
        </div>

        {/* Wheel Chart */}
        {wheelData && (
          <Card large>
            <h3 className="text-[18px] font-semibold mb-4 text-center">
              Колесо баланса (7 дней)
            </h3>
            <WheelChart data={wheelData.spheres} size={280} />
          </Card>
        )}

        {/* Correlations */}
        <div>
          <h3 className="text-[17px] font-semibold mb-3">Корреляции</h3>
          {correlations.length > 0 ? (
            <div className="space-y-3">
              {correlations.map((corr, index) => (
                <Card key={index}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[15px] font-medium">{corr.correlation}</span>
                    <span
                      className={`text-[14px] font-semibold ${
                        corr.coefficient > 0.5
                          ? 'text-ios-green'
                          : corr.coefficient < -0.5
                          ? 'text-ios-red'
                          : 'text-ios-yellow'
                      }`}
                    >
                      {corr.coefficient > 0 ? '+' : ''}
                      {corr.coefficient.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[13px] text-ios-gray">{corr.interpretation}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon="📊"
                title="Нет корреляций"
                description="Нужно больше данных для анализа взаимосвязей"
              />
            </Card>
          )}
        </div>

        {/* Weekly Stats */}
        <Card>
          <h3 className="text-[17px] font-semibold mb-4">Советы по анализу</h3>
          <div className="space-y-3 text-[15px] text-ios-gray">
            <div className="flex items-start gap-3">
              <span className="text-[20px]">💡</span>
              <p>
                Положительная корреляция между сном и настроением означает, 
                что качественный сон улучшает ваше эмоциональное состояние.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[20px]">📈</span>
              <p>
                Следите за трендом LifeScore — рост показателя говорит 
                о гармоничном развитии всех сфер жизни.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[20px]">🎯</span>
              <p>
                Колесо баланса показывает, какие сферы требуют большего внимания. 
                Стремитесь к равномерному развитию.
              </p>
            </div>
          </div>
        </Card>

        {/* AI Export Info */}
        <Card className="border border-ios-primary/30">
          <h3 className="text-[17px] font-semibold mb-3 text-ios-primary">
            🚀 Экспорт для AI-анализа
          </h3>
          <p className="text-[14px] text-ios-gray mb-3">
            Скопируйте отчёт и вставьте в ChatGPT, Qwen или другую AI-систему 
            для получения персонализированных рекомендаций.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={handleCopyReport}
            >
              📋 Копировать
            </Button>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => handleExport('txt')}
            >
              📥 Скачать
            </Button>
          </div>
        </Card>
      </main>

      <TabBar activeTab="analytics" onTabChange={(tab) => navigate(`/${tab}`)} />
    </div>
  );
}
