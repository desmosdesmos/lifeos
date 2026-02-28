import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { AuthRequest } from '@/types';
import { logger } from '@/config/logger';

/**
 * Проверка данных от Telegram WebApp
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function validateTelegramData(data: Record<string, string>, botToken: string): boolean {
  logger.info('Validating Telegram data:', { hasData: !!data, hasBotToken: !!botToken });
  
  const { hash, ...restData } = data;
  
  if (!hash) {
    logger.error('No hash in Telegram data');
    return false;
  }
  
  // Сортируем параметры по ключам
  const sortedKeys = Object.keys(restData).sort();
  const dataCheckString = sortedKeys
    .map(key => `${key}=${restData[key]}`)
    .join('\n');
  
  logger.info('Data check string:', dataCheckString.substring(0, 100) + '...');
  
  // Создаем ключ для HMAC
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  
  // Вычисляем HMAC-SHA256
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  logger.info('Computed hash:', computedHash);
  logger.info('Received hash:', hash);
  
  const isValid = computedHash === hash;
  logger.info('Validation result:', isValid);
  
  return isValid;
}

/**
 * Middleware для авторизации через Telegram
 */
export function telegramAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { telegramId: string };
      (req as AuthRequest).telegramId = BigInt(decoded.telegramId);
      next();
    } catch (jwtError) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware для опциональной авторизации
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { telegramId: string };
      (req as AuthRequest).telegramId = BigInt(decoded.telegramId);
    } catch {
      // Токен невалиден, но продолжаем без авторизации
    }
  }
  
  next();
}
