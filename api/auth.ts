import { VercelRequest, VercelResponse } from 'vercel';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Проверка данных от Telegram WebApp
 */
function validateTelegramData(data: Record<string, string>, botToken: string): boolean {
  const { hash, ...restData } = data;
  
  if (!hash) return false;
  
  const sortedKeys = Object.keys(restData).sort();
  const dataCheckString = sortedKeys
    .map(key => `${key}=${restData[key]}`)
    .join('\n');
  
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return computedHash === hash;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'initData is required' });
    }

    // Парсим initData
    const params = new URLSearchParams(initData);
    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    // Валидируем через Telegram Bot Token
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    const isValid = validateTelegramData(data, botToken);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid Telegram data' });
    }

    // Получаем данные пользователя
    const userString = data.user;
    if (!userString) {
      return res.status(400).json({ error: 'User data not found' });
    }

    const userData = JSON.parse(decodeURIComponent(userString));

    // Находим или создаем пользователя
    const telegramId = BigInt(userData.id);
    
    let user = await prisma.user.findUnique({
      where: { telegramId },
      include: { sphereWeights: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          username: userData.username || null,
          firstName: userData.first_name || null,
          lastName: userData.last_name || null,
          languageCode: userData.language_code || 'ru',
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
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { telegramId: telegramId.toString() },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        languageCode: user.languageCode,
      },
      token,
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
