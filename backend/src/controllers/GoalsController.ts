import { Response } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { AuthRequest, GoalInput, GoalResponse, SphereType } from '@/types';

/**
 * Goals Controller
 * Управление целями
 */
export class GoalsController {
  /**
   * Получить все цели
   * GET /api/goals
   */
  async getGoals(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { status, sphere } = req.query;

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

      if (sphere) {
        where.sphere = sphere;
      }

      const goals = await prisma.goal.findMany({
        where,
        orderBy: [{ status: 'asc' }, { endDate: 'asc' }],
      });

      res.json({
        success: true,
        goals: goals as GoalResponse[],
      });
    } catch (error) {
      logger.error('Get goals error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Получить цель по ID
   * GET /api/goals/:id
   */
  async getGoal(req: AuthRequest, res: Response) {
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

      const goal = await prisma.goal.findFirst({
        where: {
          id: parseInt(id, 10),
          userId: user.id,
        },
      });

      if (!goal) {
        res.status(404).json({ error: 'Goal not found' });
        return;
      }

      res.json({
        success: true,
        goal,
      });
    } catch (error) {
      logger.error('Get goal error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Создать цель
   * POST /api/goals
   */
  async createGoal(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const data: GoalInput = req.body;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Валидация дат
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (endDate <= startDate) {
        res.status(400).json({ error: 'End date must be after start date' });
        return;
      }

      // Расчёт прогресса
      const progress = data.targetValue > 0
        ? Math.min(100, (data.currentValue || 0) / data.targetValue * 100)
        : 0;

      const goal = await prisma.goal.create({
        data: {
          userId: user.id,
          title: data.title,
          description: data.description,
          sphere: data.sphere as SphereType,
          targetValue: data.targetValue,
          currentValue: data.currentValue || 0,
          unit: data.unit,
          startDate,
          endDate,
          progress,
          status: progress >= 100 ? 'COMPLETED' : 'ACTIVE',
        },
      });

      logger.info(`Goal created for user ${telegramId}: ${data.title}`);

      res.json({
        success: true,
        goal,
      });
    } catch (error) {
      logger.error('Create goal error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Обновить цель
   * PUT /api/goals/:id
   */
  async updateGoal(req: AuthRequest, res: Response) {
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

      const existing = await prisma.goal.findFirst({
        where: {
          id: parseInt(id, 10),
          userId: user.id,
        },
      });

      if (!existing) {
        res.status(404).json({ error: 'Goal not found' });
        return;
      }

      // Расчёт нового прогресса
      const currentValue = updates.currentValue ?? existing.currentValue;
      const targetValue = updates.targetValue ?? existing.targetValue;
      const progress = targetValue > 0
        ? Math.min(100, currentValue / targetValue * 100)
        : existing.progress;

      const goal = await prisma.goal.update({
        where: { id: existing.id },
        data: {
          ...updates,
          currentValue,
          targetValue,
          progress,
          status: updates.status || (progress >= 100 ? 'COMPLETED' : existing.status),
        },
      });

      logger.info(`Goal updated for user ${telegramId}: ${id}`);

      res.json({
        success: true,
        goal,
      });
    } catch (error) {
      logger.error('Update goal error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Обновить прогресс цели
   * PATCH /api/goals/:id/progress
   */
  async updateProgress(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { currentValue, delta } = req.body;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const existing = await prisma.goal.findFirst({
        where: {
          id: parseInt(id, 10),
          userId: user.id,
        },
      });

      if (!existing) {
        res.status(404).json({ error: 'Goal not found' });
        return;
      }

      const newValue = delta !== undefined
        ? existing.currentValue + delta
        : currentValue;

      const progress = existing.targetValue > 0
        ? Math.min(100, newValue / existing.targetValue * 100)
        : existing.progress;

      const goal = await prisma.goal.update({
        where: { id: existing.id },
        data: {
          currentValue: newValue,
          progress,
          status: progress >= 100 ? 'COMPLETED' : existing.status,
        },
      });

      res.json({
        success: true,
        goal,
      });
    } catch (error) {
      logger.error('Update progress error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Удалить цель
   * DELETE /api/goals/:id
   */
  async deleteGoal(req: AuthRequest, res: Response) {
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

      await prisma.goal.deleteMany({
        where: {
          id: parseInt(id, 10),
          userId: user.id,
        },
      });

      logger.info(`Goal deleted for user ${telegramId}: ${id}`);

      res.json({
        success: true,
      });
    } catch (error) {
      logger.error('Delete goal error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Получить активные цели по сферам
   * GET /api/goals/summary
   */
  async getGoalsSummary(req: AuthRequest, res: Response) {
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

      const goals = await prisma.goal.findMany({
        where: {
          userId: user.id,
          status: 'ACTIVE',
        },
      });

      // Группировка по сферам
      const bySphere: Record<string, any[]> = {};
      for (const goal of goals) {
        if (!bySphere[goal.sphere]) {
          bySphere[goal.sphere] = [];
        }
        bySphere[goal.sphere].push(goal);
      }

      // Подсчёт статистики
      const summary = {
        total: goals.length,
        completed: goals.filter(g => g.progress >= 100).length,
        onTrack: goals.filter(g => g.progress >= 50).length,
        behind: goals.filter(g => g.progress < 50).length,
        bySphere: Object.fromEntries(
          Object.entries(bySphere).map(([sphere, sphereGoals]) => [
            sphere,
            {
              count: sphereGoals.length,
              avgProgress: sphereGoals.reduce((a, b) => a + b.progress, 0) / sphereGoals.length,
            },
          ])
        ),
      };

      res.json({
        success: true,
        summary,
        goals,
      });
    } catch (error) {
      logger.error('Get goals summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const goalsController = new GoalsController();
export default goalsController;
