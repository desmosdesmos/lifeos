import { Response } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { AuthRequest, TaskInput, TaskResponse } from '@/types';

/**
 * Tasks Controller
 * Управление задачами
 */
export class TasksController {
  /**
   * Получить все задачи
   * GET /api/tasks
   */
  async getTasks(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { status, category, priority, limit = '50' } = req.query;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const where: any = { userId: user.id };

      if (status) {
        where.status = status;
      }

      if (category) {
        where.category = category;
      }

      if (priority) {
        where.priority = priority;
      }

      const tasks = await prisma.task.findMany({
        where,
        include: { checklist: true },
        orderBy: [
          { status: 'asc' },
          { priority: 'desc' },
          { dueDate: 'asc' },
        ],
        take: parseInt(limit as string, 10),
      });

      res.json({
        success: true,
        tasks,
      });
    } catch (error) {
      logger.error('Get tasks error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Получить задачу по ID
   * GET /api/tasks/:id
   */
  async getTask(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const task = await prisma.task.findFirst({
        where: {
          id: parseInt(id, 10),
          userId: user.id,
        },
        include: { checklist: true },
      });

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json({
        success: true,
        task,
      });
    } catch (error) {
      logger.error('Get task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Создать задачу
   * POST /api/tasks
   */
  async createTask(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const data: TaskInput = req.body;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const task = await prisma.task.create({
        data: {
          userId: user.id,
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          isRecurring: data.isRecurring || false,
          recurrencePattern: data.recurrencePattern,
          checklist: data.checklist?.length
            ? {
                create: data.checklist.map(item => ({
                  text: item.text,
                  isCompleted: false,
                })),
              }
            : undefined,
        },
        include: { checklist: true },
      });

      logger.info(`Task created for user ${telegramId}: ${data.title}`);

      res.json({
        success: true,
        task,
      });
    } catch (error) {
      logger.error('Create task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Обновить задачу
   * PUT /api/tasks/:id
   */
  async updateTask(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const updates = req.body;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const existing = await prisma.task.findFirst({
        where: {
          id: parseInt(id, 10),
          userId: user.id,
        },
      });

      if (!existing) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      const task = await prisma.task.update({
        where: { id: existing.id },
        data: {
          ...updates,
          dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        },
        include: { checklist: true },
      });

      logger.info(`Task updated for user ${telegramId}: ${id}`);

      res.json({
        success: true,
        task,
      });
    } catch (error) {
      logger.error('Update task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Обновить статус задачи
   * PATCH /api/tasks/:id/status
   */
  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const existing = await prisma.task.findFirst({
        where: {
          id: parseInt(id, 10),
          userId: user.id,
        },
      });

      if (!existing) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      const task = await prisma.task.update({
        where: { id: existing.id },
        data: {
          status,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
        include: { checklist: true },
      });

      res.json({
        success: true,
        task,
      });
    } catch (error) {
      logger.error('Update status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Переключить чек-лист элемент
   * PATCH /api/tasks/:id/checklist/:itemId
   */
  async toggleChecklistItem(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id, itemId } = req.params;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const item = await prisma.checklistItem.findFirst({
        where: {
          id: parseInt(itemId, 10),
          taskId: parseInt(id, 10),
          task: { userId: user.id },
        },
      });

      if (!item) {
        res.status(404).json({ error: 'Checklist item not found' });
        return;
      }

      const updated = await prisma.checklistItem.update({
        where: { id: item.id },
        data: { isCompleted: !item.isCompleted },
      });

      // Проверяем, все ли элементы выполнены
      const allItems = await prisma.checklistItem.findMany({
        where: { taskId: item.taskId },
      });

      const allCompleted = allItems.every(i => i.isCompleted);

      // Если все выполнено, обновляем статус задачи
      if (allCompleted) {
        await prisma.task.update({
          where: { id: item.taskId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });
      }

      res.json({
        success: true,
        item: updated,
        taskComplete: allCompleted,
      });
    } catch (error) {
      logger.error('Toggle checklist item error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Добавить элемент в чек-лист
   * POST /api/tasks/:id/checklist
   */
  async addChecklistItem(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { text } = req.body;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const task = await prisma.task.findFirst({
        where: {
          id: parseInt(id, 10),
          userId: user.id,
        },
      });

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      const item = await prisma.checklistItem.create({
        data: {
          taskId: task.id,
          text,
          isCompleted: false,
        },
      });

      res.json({
        success: true,
        item,
      });
    } catch (error) {
      logger.error('Add checklist item error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Удалить задачу
   * DELETE /api/tasks/:id
   */
  async deleteTask(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await prisma.task.deleteMany({
        where: {
          id: parseInt(id, 10),
          userId: user.id,
        },
      });

      logger.info(`Task deleted for user ${telegramId}: ${id}`);

      res.json({
        success: true,
      });
    } catch (error) {
      logger.error('Delete task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Получить статистику задач
   * GET /api/tasks/stats
   */
  async getStats(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const tasks = await prisma.task.findMany({
        where: { userId: user.id },
      });

      const stats = {
        total: tasks.length,
        byStatus: {
          pending: tasks.filter(t => t.status === 'PENDING').length,
          inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
          completed: tasks.filter(t => t.status === 'COMPLETED').length,
          cancelled: tasks.filter(t => t.status === 'CANCELLED').length,
        },
        byCategory: {
          health: tasks.filter(t => t.category === 'HEALTH').length,
          work: tasks.filter(t => t.category === 'WORK').length,
          finance: tasks.filter(t => t.category === 'FINANCE').length,
          learning: tasks.filter(t => t.category === 'LEARNING').length,
          personal: tasks.filter(t => t.category === 'PERSONAL').length,
          other: tasks.filter(t => t.category === 'OTHER').length,
        },
        byPriority: {
          low: tasks.filter(t => t.priority === 'LOW').length,
          medium: tasks.filter(t => t.priority === 'MEDIUM').length,
          high: tasks.filter(t => t.priority === 'HIGH').length,
          critical: tasks.filter(t => t.priority === 'CRITICAL').length,
        },
        overdue: tasks.filter(t => 
          t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
        ).length,
        completedToday: tasks.filter(t => 
          t.completedAt && 
          new Date(t.completedAt).toDateString() === new Date().toDateString()
        ).length,
      };

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      logger.error('Get tasks stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const tasksController = new TasksController();
export default tasksController;
