import { Router } from 'express';
import { authController } from '@/controllers/AuthController';
import { telegramAuth } from '@/middleware/auth';

const router = Router();

// Авторизация через Telegram
router.post('/telegram', (req, res) => authController.authorizeTelegram(req, res));

// Dev авторизация (для тестирования)
router.post('/dev', (req, res) => authController.devAuth(req, res));

// Защищённые роуты
router.get('/weights', telegramAuth, (req, res) => authController.getWeights(req, res));
router.put('/weights', telegramAuth, (req, res) => authController.updateWeights(req, res));

export default router;
