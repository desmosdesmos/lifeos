import { Request, Response } from 'express';
import { authService } from '@/services/AuthService';
import { validateTelegramData } from '@/middleware/auth';
import { config } from '@/config';
import { logger } from '@/config/logger';
import { AuthRequest } from '@/types';

/**
 * Auth Controller
 * Обработка авторизации через Telegram WebApp
 */
export class AuthController {
  /**
   * Авторизация через Telegram WebApp данные
   * POST /api/auth/telegram
   */
  async authorizeTelegram(req: Request, res: Response) {
    try {
      const { initData } = req.body;

      if (!initData) {
        res.status(400).json({ error: 'initData is required' });
        return;
      }

      // Парсим initData от Telegram
      const params = new URLSearchParams(initData);
      const data: Record<string, string> = {};
      params.forEach((value, key) => {
        data[key] = value;
      });

      // Валидируем данные через Telegram Bot Token
      const isValid = validateTelegramData(data, config.telegram.botToken);
      
      if (!isValid) {
        logger.warn('Invalid Telegram data received');
        res.status(401).json({ error: 'Invalid Telegram data' });
        return;
      }

      // Получаем данные пользователя
      const userString = data.user;
      if (!userString) {
        res.status(400).json({ error: 'User data not found' });
        return;
      }

      const userData = JSON.parse(decodeURIComponent(userString));

      // Авторизуем/регистрируем пользователя
      const result = await authService.authorize({
        id: userData.id.toString(),
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        language_code: userData.language_code,
      });

      logger.info(`User authorized: ${result.user.telegramId}`);

      res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      logger.error('Telegram auth error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Обновление весов сфер
   * PUT /api/auth/weights
   */
  async updateWeights(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { weights } = req.body;

      if (!weights || typeof weights !== 'object') {
        res.status(400).json({ error: 'Weights object is required' });
        return;
      }

      const updated = await authService.updateSphereWeights(telegramId, weights);

      res.json({
        success: true,
        weights: updated,
      });
    } catch (error) {
      logger.error('Update weights error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Получение весов сфер
   * GET /api/auth/weights
   */
  async getWeights(req: AuthRequest, res: Response) {
    try {
      const { telegramId } = req;
      if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const weights = await authService.getSphereWeights(telegramId);

      res.json({
        success: true,
        weights,
      });
    } catch (error) {
      logger.error('Get weights error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Dev: авторизация без проверки Telegram (для тестирования)
   * POST /api/auth/dev
   */
  async devAuth(req: Request, res: Response) {
    try {
      const { telegramId, username, firstName, lastName } = req.body;

      if (!telegramId) {
        res.status(400).json({ error: 'telegramId is required' });
        return;
      }

      const result = await authService.authorize({
        id: telegramId.toString(),
        username: username || 'test_user',
        first_name: firstName || 'Test',
        last_name: lastName || 'User',
        language_code: 'ru',
      });

      res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      logger.error('Dev auth error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const authController = new AuthController();
export default authController;
