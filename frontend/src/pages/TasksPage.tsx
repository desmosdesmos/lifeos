import React, { useState, useEffect } from 'react';
import { Header, TabBar, Modal, ActionSheet } from '@/components/navigation';
import { Button, Card, Input, LoadingSpinner, EmptyState, Toggle } from '@/components/ui';
import { useTasks } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { Task, TaskCategory, Priority } from '@/types';

export function TasksPage() {
  const navigate = useNavigate();
  const { tasks, loading, fetchTasks, createTask, toggleTaskStatus, toggleChecklistItem, deleteTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    category: 'OTHER' as TaskCategory,
    priority: 'MEDIUM' as Priority,
    dueDate: '',
    description: '',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async () => {
    if (!newTask.title) return;

    try {
      await createTask(newTask);
      setNewTask({
        title: '',
        category: 'OTHER',
        priority: 'MEDIUM',
        dueDate: '',
        description: '',
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await toggleTaskStatus(task.id, newStatus);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await deleteTask(selectedTask.id);
      setIsDeleteSheetOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const categoryIcons: Record<TaskCategory, string> = {
    HEALTH: '💚',
    WORK: '💼',
    FINANCE: '💰',
    LEARNING: '📚',
    PERSONAL: '👤',
    OTHER: '📌',
  };

  const categoryNames: Record<TaskCategory, string> = {
    HEALTH: 'Здоровье',
    WORK: 'Работа',
    FINANCE: 'Финансы',
    LEARNING: 'Обучение',
    PERSONAL: 'Личное',
    OTHER: 'Другое',
  };

  const priorityColors: Record<Priority, string> = {
    LOW: 'text-ios-gray',
    MEDIUM: 'text-ios-yellow',
    HIGH: 'text-ios-orange',
    CRITICAL: 'text-ios-red',
  };

  const priorityLabels: Record<Priority, string> = {
    LOW: 'Низкий',
    MEDIUM: 'Средний',
    HIGH: 'Высокий',
    CRITICAL: 'Критичный',
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.status !== 'COMPLETED';
    if (filter === 'completed') return task.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="min-h-screen pb-24 safe-top safe-bottom">
      <Header
        title="Задачи"
        subtitle="Управляйте своими задачами"
        rightAction={
          <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)}>
            + Задача
          </Button>
        }
      />

      {/* Filters */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        {(['all', 'pending', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[15px] font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-ios-primary text-white'
                : 'bg-ios-card-secondary text-ios-gray'
            }`}
          >
            {f === 'all' ? 'Все' : f === 'pending' ? 'Активные' : 'Готовые'}
          </button>
        ))}
      </div>

      <main className="px-4 py-2 space-y-3">
        {loading && !tasks.length ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon="✅"
            title="Нет задач"
            description={
              filter === 'all'
                ? 'Создайте свою первую задачу'
                : filter === 'pending'
                ? 'Все задачи выполнены!'
                : 'Нет завершённых задач'
            }
            action={
              filter === 'all' && (
                <Button onClick={() => setIsModalOpen(true)}>
                  Создать задачу
                </Button>
              )
            }
          />
        ) : (
          filteredTasks.map(task => (
            <Card
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={task.status === 'COMPLETED' ? 'opacity-60' : ''}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTask(task);
                  }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    task.status === 'COMPLETED'
                      ? 'bg-ios-green border-ios-green'
                      : 'border-ios-gray'
                  }`}
                >
                  {task.status === 'COMPLETED' && (
                    <span className="text-white text-[14px]">✓</span>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-[17px] font-semibold truncate ${
                      task.status === 'COMPLETED' ? 'line-through text-ios-gray' : ''
                    }`}>
                      {task.title}
                    </h3>
                    <span className={`text-[12px] font-medium ${priorityColors[task.priority]}`}>
                      ●
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[13px] text-ios-gray">
                    <span>{categoryIcons[task.category]}</span>
                    <span>{categoryNames[task.category]}</span>
                    {task.dueDate && (
                      <>
                        <span>•</span>
                        <span>
                          {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Checklist preview */}
                  {task.checklist.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-ios-card-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-ios-primary rounded-full"
                          style={{
                            width: `${(task.checklist.filter(c => c.isCompleted).length / task.checklist.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-ios-gray">
                        {task.checklist.filter(c => c.isCompleted).length}/{task.checklist.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </main>

      {/* Create Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Новая задача"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button fullWidth onClick={handleCreateTask}>
              Создать
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Название"
            value={newTask.title}
            onChange={(value) => setNewTask(prev => ({ ...prev, title: value }))}
            placeholder="Что нужно сделать?"
          />

          <div>
            <label className="block text-ios-gray text-[13px] mb-1.5 ml-1">
              Категория
            </label>
            <select
              value={newTask.category}
              onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
              className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[17px] text-white focus:outline-none"
            >
              {Object.entries(categoryNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-ios-gray text-[13px] mb-1.5 ml-1">
              Приоритет
            </label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Priority }))}
              className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[17px] text-white focus:outline-none"
            >
              {Object.entries(priorityLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Дедлайн (необязательно)"
            type="date"
            value={newTask.dueDate}
            onChange={(value) => setNewTask(prev => ({ ...prev, dueDate: value }))}
          />

          <div>
            <label className="block text-ios-gray text-[13px] mb-1.5 ml-1">
              Описание
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Детали задачи..."
              rows={3}
              className="w-full bg-ios-card-secondary rounded-[10px] px-4 py-3 text-[17px] text-white focus:outline-none resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title="Задача"
          footer={
            <div className="flex gap-3">
              <Button
                variant="danger"
                fullWidth
                onClick={() => setIsDeleteSheetOpen(true)}
              >
                Удалить
              </Button>
              <Button
                variant={selectedTask.status === 'COMPLETED' ? 'secondary' : 'primary'}
                fullWidth
                onClick={() => {
                  handleToggleTask(selectedTask);
                  setSelectedTask(null);
                }}
              >
                {selectedTask.status === 'COMPLETED' ? 'Вернуть' : 'Выполнить'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-[20px] font-semibold mb-2">{selectedTask.title}</h3>
              <div className="flex items-center gap-2 text-[14px] text-ios-gray">
                <span>{categoryIcons[selectedTask.category]}</span>
                <span>{categoryNames[selectedTask.category]}</span>
                <span>•</span>
                <span className={priorityColors[selectedTask.priority]}>
                  {priorityLabels[selectedTask.priority]}
                </span>
              </div>
            </div>

            {selectedTask.description && (
              <p className="text-[15px] text-ios-gray">{selectedTask.description}</p>
            )}

            {selectedTask.dueDate && (
              <div className="ios-card">
                <p className="text-[13px] text-ios-gray mb-1">Дедлайн</p>
                <p className="text-[17px]">
                  {new Date(selectedTask.dueDate).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* Checklist */}
            <div>
              <h4 className="text-[17px] font-semibold mb-3">Чек-лист</h4>
              <div className="space-y-2">
                {selectedTask.checklist.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleChecklistItem(selectedTask.id, item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-[10px] transition-colors ${
                      item.isCompleted ? 'bg-ios-card-secondary/50' : 'bg-ios-card-secondary'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        item.isCompleted
                          ? 'bg-ios-green border-ios-green'
                          : 'border-ios-gray'
                      }`}
                    >
                      {item.isCompleted && <span className="text-white text-[12px]">✓</span>}
                    </div>
                    <span
                      className={`text-[15px] ${
                        item.isCompleted ? 'line-through text-ios-gray' : ''
                      }`}
                    >
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Action Sheet */}
      <ActionSheet
        isOpen={isDeleteSheetOpen}
        onClose={() => setIsDeleteSheetOpen(false)}
        title="Удаление задачи"
        actions={[
          {
            label: 'Удалить',
            onClick: handleDeleteTask,
            style: 'destructive',
          },
          {
            label: 'Отмена',
            onClick: () => setIsDeleteSheetOpen(false),
            style: 'cancel',
          },
        ]}
      />

      <TabBar activeTab="tasks" onTabChange={(tab) => navigate(`/${tab}`)} />
    </div>
  );
}
