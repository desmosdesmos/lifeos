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
      logger.info('=== Telegram Auth Request ===');
      logger.info('Request body:', JSON.stringify(req.body, null, 2));
      
      const { initData } = req.body;

      if (!initData) {
        logger.error('No initData in request');
        res.status(400).json({ error: 'initData is required' });
        return;
      }

      logger.info('InitData received, length:', initData.length);

      // Парсим initData от Telegram
      const params = new URLSearchParams(initData);
      const data: Record<string, string> = {};
      params.forEach((value, key) => {
        data[key] = value;
        logger.info(`Param ${key}:`, value.substring(0, 50) + '...');
      });

      // Валидируем данные через Telegram Bot Token
      logger.info('Bot token:', config.telegram.botToken.substring(0, 20) + '...');
      const isValid = validateTelegramData(data, config.telegram.botToken);
      
      if (!isValid) {
        logger.error('Invalid Telegram data');
        res.status(401).json({ error: 'Invalid Telegram data' });
        return;
      }

      logger.info('Telegram data validated successfully');

      // Получаем данные пользователя
      const userString = data.user;
      if (!userString) {
        logger.error('No user data in Telegram initData');
        res.status(400).json({ error: 'User data not found' });
        return;
      }

      const userData = JSON.parse(decodeURIComponent(userString));
      logger.info('User data:', userData);

      // Авторизуем/регистрируем пользователя
      const result = await authService.authorize({
        id: userData.id.toString(),
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        language_code: userData.language_code,
      });

      logger.info(`User authorized: ${result.user.telegramId}`);
      logger.info('=== Auth Success ===');

      res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      logger.error('=== Telegram Auth Error ===');
      logger.error('Error:', error.message);
      logger.error('Stack:', error.stack);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
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
        username: username || 'dev_user',
        first_name: firstName || 'Dev',
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
