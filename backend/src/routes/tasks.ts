import { Router } from 'express';
import { tasksController } from '@/controllers/TasksController';
import { telegramAuth } from '@/middleware/auth';

const router = Router();

router.use(telegramAuth);

// Получить все задачи
router.get('/', (req, res) => tasksController.getTasks(req, res));

// Получить статистику задач
router.get('/stats', (req, res) => tasksController.getStats(req, res));

// Получить задачу по ID
router.get('/:id', (req, res) => tasksController.getTask(req, res));

// Создать задачу
router.post('/', (req, res) => tasksController.createTask(req, res));

// Обновить задачу
router.put('/:id', (req, res) => tasksController.updateTask(req, res));

// Обновить статус задачи
router.patch('/:id/status', (req, res) => tasksController.updateStatus(req, res));

// Переключить элемент чек-листа
router.patch('/:id/checklist/:itemId', (req, res) => tasksController.toggleChecklistItem(req, res));

// Добавить элемент чек-листа
router.post('/:id/checklist', (req, res) => tasksController.addChecklistItem(req, res));

// Удалить задачу
router.delete('/:id', (req, res) => tasksController.deleteTask(req, res));

export default router;
