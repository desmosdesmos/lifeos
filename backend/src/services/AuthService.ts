import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { config } from '@/config';
import { logger } from '@/config/logger';

export class AuthService {
  /**
   * Авторизация пользователя через Telegram WebApp данные
   */
  async authorize(telegramData: {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    language_code?: string;
  }) {
    const telegramId = BigInt(telegramData.id);
    
    // Находим или создаем пользователя
    let user = await prisma.user.findUnique({
      where: { telegramId },
      include: { sphereWeights: true },
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          username: telegramData.username || null,
          firstName: telegramData.first_name || null,
          lastName: telegramData.last_name || null,
          languageCode: telegramData.language_code || 'ru',
          // Создаем веса сфер по умолчанию
          sphereWeights: {
            create: {
              sleep: 15.0,
              water: 10.0,
              nutrition: 10.0,
              fitness: 15.0,
              work: 15.0,
              finance: 15.0,
              mood: 10.0,
              selfDevelopment: 5.0,
              personalLife: 5.0,
            },
          },
        },
        include: { sphereWeights: true },
      });
      
      logger.info(`Created new user with telegramId: ${telegramId}`);
    } else {
      // Обновляем данные пользователя
      await prisma.user.update({
        where: { id: user.id },
        data: {
          username: telegramData.username || user.username,
          firstName: telegramData.first_name || user.firstName,
          lastName: telegramData.last_name || user.lastName,
          languageCode: telegramData.language_code || user.languageCode,
        },
      });
    }
    
    // Генерируем JWT токен
    const token = jwt.sign(
      { telegramId: telegramId.toString() },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );
    
    return {
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        languageCode: user.languageCode,
      },
      token,
    };
  }
  
  /**
   * Обновление весов сфер жизни
   */
  async updateSphereWeights(telegramId: bigint, weights: Record<string, number>) {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: { sphereWeights: true },
    });
    
    if (!user || !user.sphereWeights) {
      throw new Error('User not found');
    }
    
    const updated = await prisma.sphereWeights.update({
      where: { userId: user.id },
      data: {
        sleep: weights.sleep ?? user.sphereWeights.sleep,
        water: weights.water ?? user.sphereWeights.water,
        nutrition: weights.nutrition ?? user.sphereWeights.nutrition,
        fitness: weights.fitness ?? user.sphereWeights.fitness,
        work: weights.work ?? user.sphereWeights.work,
        finance: weights.finance ?? user.sphereWeights.finance,
        mood: weights.mood ?? user.sphereWeights.mood,
        selfDevelopment: weights.selfDevelopment ?? user.sphereWeights.selfDevelopment,
        personalLife: weights.personalLife ?? user.sphereWeights.personalLife,
      },
    });
    
    return updated;
  }
  
  /**
   * Получение весов сфер
   */
  async getSphereWeights(telegramId: bigint) {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: { sphereWeights: true },
    });
    
    if (!user || !user.sphereWeights) {
      // Возвращаем веса по умолчанию
      return {
        sleep: 15.0,
        water: 10.0,
        nutrition: 10.0,
        fitness: 15.0,
        work: 15.0,
        finance: 15.0,
        mood: 10.0,
        selfDevelopment: 5.0,
        personalLife: 5.0,
      };
    }
    
    return user.sphereWeights;
  }
}

export const authService = new AuthService();
export default authService;
