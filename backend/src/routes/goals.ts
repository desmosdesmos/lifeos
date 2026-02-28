import { Router } from 'express';
import { goalsController } from '@/controllers/GoalsController';
import { telegramAuth } from '@/middleware/auth';

const router = Router();

router.use(telegramAuth);

// Получить все цели
router.get('/', (req, res) => goalsController.getGoals(req, res));

// Получить сводку по целям
router.get('/summary', (req, res) => goalsController.getGoalsSummary(req, res));

// Получить цель по ID
router.get('/:id', (req, res) => goalsController.getGoal(req, res));

// Создать цель
router.post('/', (req, res) => goalsController.createGoal(req, res));

// Обновить цель
router.put('/:id', (req, res) => goalsController.updateGoal(req, res));

// Обновить прогресс цели
router.patch('/:id/progress', (req, res) => goalsController.updateProgress(req, res));

// Удалить цель
router.delete('/:id', (req, res) => goalsController.deleteGoal(req, res));

export default router;
